import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Search,
  Map as MapIcon,
  Calendar,
  CloudLightning,
  Download,
  CheckCircle,
  AlertCircle,
  Satellite,
  Zap,
  MapPin
} from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues with Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface SceneMetadata {
  id: string;
  provider: string;
  collection: string;
  platform: string;
  instrument: string;
  modality: string;
  acquisition_date: string;
  cloud_cover: number | null;
  resolution_gsd: number;
  crs: string;
  bbox: number[];
  thumbnail_url: string | null;
  processing_level: string;
  assets: Record<string, any>;
  summary: string | null;
  is_sample_fallback: boolean;
}

interface SatelliteSearchSectionProps {
  onProceedToAnalysis: (selectedImages: { image1: string; image2: string | null; meta1: any; meta2: any; modality: string; scenarioId: string }) => void;
}

// Helper to center map
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 10);
  }, [center, map]);
  return null;
}

export const SatelliteSearchSection: FC<SatelliteSearchSectionProps> = ({ onProceedToAnalysis }) => {
  const [aoiPreset, setAoiPreset] = useState<string>('mumbai');
  const [locationQuery, setLocationQuery] = useState<string>('Mumbai, India');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  const [mapCenter, setMapCenter] = useState<[number, number]>([19.076, 72.8777]);
  const [bbox, setBbox] = useState<number[]>([72.7, 18.9, 73.0, 19.2]); // [west, south, east, north]
  
  const [startDate, setStartDate] = useState('2024-04-01');
  const [endDate, setEndDate] = useState('2024-04-30');
  const [source, setSource] = useState('sentinel-2');
  const [maxCloud, setMaxCloud] = useState(20);
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SceneMetadata[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<SceneMetadata[]>([]);
  
  const [downloadStatus, setDownloadStatus] = useState<any>(null);

  const presets: Record<string, { name: string, center: [number, number], bbox: number[] }> = {
    mumbai:    { name: 'Mumbai, India',    center: [19.076,  72.8777], bbox: [72.7,  18.9,  73.0,  19.2] },
    delhi:     { name: 'Delhi, India',     center: [28.6139, 77.2090], bbox: [77.0,  28.4,  77.4,  28.8] },
    bangalore: { name: 'Bengaluru, India', center: [12.9716, 77.5946], bbox: [77.4,  12.8,  77.75, 13.1] },
    kolkata:   { name: 'Kolkata, India',   center: [22.5726, 88.3639], bbox: [88.2,  22.4,  88.5,  22.7] },
    chennai:   { name: 'Chennai, India',   center: [13.0827, 80.2707], bbox: [80.1,  12.9,  80.4,  13.2] },
    hyderabad: { name: 'Hyderabad, India', center: [17.3850, 78.4867], bbox: [78.3,  17.2,  78.6,  17.5] },
    pune:      { name: 'Pune, India',      center: [18.5204, 73.8567], bbox: [73.7,  18.4,  74.0,  18.7] },
    ahmedabad: { name: 'Ahmedabad, India', center: [23.0225, 72.5714], bbox: [72.4,  22.9,  72.7,  23.2] },
    jaipur:    { name: 'Jaipur, India',    center: [26.9124, 75.7873], bbox: [75.6,  26.7,  76.0,  27.1] },
    surat:     { name: 'Surat, India',     center: [21.1702, 72.8311], bbox: [72.7,  21.0,  73.0,  21.3] },
    lucknow:   { name: 'Lucknow, India',   center: [26.8467, 80.9462], bbox: [80.8,  26.7,  81.1,  27.0] },
    kochi:     { name: 'Kochi, India',     center: [9.9312,  76.2673], bbox: [76.1,  9.8,   76.4,  10.1] },
    goa:       { name: 'Goa, India',       center: [15.2993, 74.1240], bbox: [73.7,  14.9,  74.4,  15.8] },
  };

  const handlePresetChange = (key: string) => {
    setAoiPreset(key);
    setGeocodingError(null);
    if (key !== 'custom' && presets[key]) {
      setLocationQuery(presets[key].name);
      setMapCenter(presets[key].center);
      setBbox(presets[key].bbox);
    }
  };

  const handleLocationSubmit = async (query: string) => {
    const q = query.trim();
    if (!q) return;
    setGeocodingError(null);

    // 1. Direct coordinate format: "west, south, east, north" or "lat, lon"
    const nums = q.split(/[\s,]+/).map(n => parseFloat(n)).filter(n => !isNaN(n));
    if (nums.length === 4) {
      // bbox: [west, south, east, north]
      setBbox(nums);
      setMapCenter([(nums[1] + nums[3]) / 2, (nums[0] + nums[2]) / 2]);
      setAoiPreset('custom');
      return;
    } else if (nums.length === 2) {
      // lat, lon
      const lat = nums[0];
      const lon = nums[1];
      const newBbox = [
        Number((lon - 0.15).toFixed(4)), 
        Number((lat - 0.15).toFixed(4)), 
        Number((lon + 0.15).toFixed(4)), 
        Number((lat + 0.15).toFixed(4))
      ];
      setBbox(newBbox);
      setMapCenter([lat, lon]);
      setAoiPreset('custom');
      return;
    }

    // 2. Check local presets dictionary (case-insensitive)
    const lower = q.toLowerCase();
    const matchedKey = Object.keys(presets).find(k => 
      presets[k].name.toLowerCase().includes(lower) || k.toLowerCase().includes(lower)
    );
    if (matchedKey) {
      setAoiPreset(matchedKey);
      setLocationQuery(presets[matchedKey].name);
      setMapCenter(presets[matchedKey].center);
      setBbox(presets[matchedKey].bbox);
      return;
    }

    // 3. Geocode with OpenStreetMap Nominatim
    setIsGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          let newBbox: number[];
          if (item.boundingbox && item.boundingbox.length === 4) {
            // Nominatim boundingbox: [south, north, west, east]
            const south = parseFloat(item.boundingbox[0]);
            const north = parseFloat(item.boundingbox[1]);
            const west = parseFloat(item.boundingbox[2]);
            const east = parseFloat(item.boundingbox[3]);
            newBbox = [
              Number(west.toFixed(4)),
              Number(south.toFixed(4)),
              Number(east.toFixed(4)),
              Number(north.toFixed(4))
            ];
          } else {
            newBbox = [
              Number((lon - 0.15).toFixed(4)),
              Number((lat - 0.15).toFixed(4)),
              Number((lon + 0.15).toFixed(4)),
              Number((lat + 0.15).toFixed(4))
            ];
          }
          setMapCenter([lat, lon]);
          setBbox(newBbox);
          setAoiPreset('custom');
          const shortName = item.display_name.split(',').slice(0, 2).join(', ');
          setLocationQuery(shortName);
        } else {
          setGeocodingError("Location not found. Please try another name or coordinates.");
        }
      } else {
        setGeocodingError("Geocoding service unavailable.");
      }
    } catch (err) {
      setGeocodingError("Network error locating place.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleCustomBboxChange = (index: number, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const newBbox = [...bbox];
    newBbox[index] = num;
    setBbox(newBbox);
    // Recalculate center from bbox [west, south, east, north]
    const centerLat = (newBbox[1] + newBbox[3]) / 2;
    const centerLon = (newBbox[0] + newBbox[2]) / 2;
    setMapCenter([centerLat, centerLon]);
    setAoiPreset('custom');
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchResults([]);
    setSelectedScenes([]);
    try {
      const res = await fetch('/api/satellite/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bbox,
          start_date: startDate,
          end_date: endDate,
          source,
          max_cloud_cover: maxCloud,
          limit: 12
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.scenes);
      }
    } catch (err) {
      console.error(err);
    }
    setIsSearching(false);
  };

  const loadSamplePreset = () => {
    // Simulated instant search response for fallback
    const mockScenes: SceneMetadata[] = [
      {
        id: 'S2B_MSIL2A_20240410_FALLBACK',
        provider: 'AWS Earth Search',
        collection: 'sentinel-2-l2a',
        platform: 'sentinel-2',
        instrument: 'msi',
        modality: 'Optical',
        acquisition_date: '2024-04-10T10:30:00Z',
        cloud_cover: 0.5,
        resolution_gsd: 10,
        crs: 'EPSG:32643',
        bbox: [55.1, 25.0, 55.4, 25.3],
        thumbnail_url: '/demo-data/change/area_2024_preview.png',
        processing_level: 'L2A',
        assets: {},
        summary: 'Demo Scene',
        is_sample_fallback: true
      },
      {
        id: 'S2A_MSIL2A_20260414_FALLBACK',
        provider: 'AWS Earth Search',
        collection: 'sentinel-2-l2a',
        platform: 'sentinel-2',
        instrument: 'msi',
        modality: 'Optical',
        acquisition_date: '2026-04-14T10:30:00Z',
        cloud_cover: 1.2,
        resolution_gsd: 10,
        crs: 'EPSG:32643',
        bbox: [55.1, 25.0, 55.4, 25.3],
        thumbnail_url: '/demo-data/change/area_2026_preview.png',
        processing_level: 'L2A',
        assets: {},
        summary: 'Demo Scene',
        is_sample_fallback: true
      }
    ];
    setSearchResults(mockScenes);
  };

  const toggleSelection = (scene: SceneMetadata) => {
    if (selectedScenes.find(s => s.id === scene.id)) {
      setSelectedScenes(selectedScenes.filter(s => s.id !== scene.id));
    } else {
      if (selectedScenes.length >= 2) {
        alert("Maximum 2 scenes can be selected for analysis.");
        return;
      }
      setSelectedScenes([...selectedScenes, scene]);
    }
  };

  const handleDownloadAndProceed = async () => {
    if (selectedScenes.length === 0) return;
    
    // For sample fallbacks, skip download and proceed directly
    if (selectedScenes[0].is_sample_fallback) {
       const img1 = selectedScenes[0].thumbnail_url!;
       const img2 = selectedScenes.length > 1 ? selectedScenes[1].thumbnail_url! : null;
       
       let modality = selectedScenes[0].modality;
       if (selectedScenes.length > 1 && selectedScenes[0].modality !== selectedScenes[1].modality) {
         modality = 'Optical + SAR';
       }

       let scenarioId = 'scenario_a_vqa';
       if (selectedScenes.length === 2) {
          if (modality === 'Optical + SAR') scenarioId = 'scenario_c_optical_sar';
          else scenarioId = 'scenario_b_change';
       } else if (modality === 'SAR') {
          scenarioId = 'scenario_d_sar';
       }

       onProceedToAnalysis({
         image1: img1,
         image2: img2,
         meta1: {
           crs: selectedScenes[0].crs,
           resolution: `${selectedScenes[0].resolution_gsd}m / pixel`,
           date: selectedScenes[0].acquisition_date.split('T')[0],
           bands: selectedScenes[0].modality === 'Optical' ? '3 Bands (RGB)' : '1 Band (SAR)',
           modality: selectedScenes[0].modality,
           format: 'GeoTIFF'
         },
         meta2: selectedScenes.length > 1 ? {
           crs: selectedScenes[1].crs,
           resolution: `${selectedScenes[1].resolution_gsd}m / pixel`,
           date: selectedScenes[1].acquisition_date.split('T')[0],
           bands: selectedScenes[1].modality === 'Optical' ? '3 Bands (RGB)' : '1 Band (SAR)',
           modality: selectedScenes[1].modality,
           format: 'GeoTIFF'
         } : null,
         modality,
         scenarioId
       });
       return;
    }

    // For real STAC data, trigger download for each selected scene
    // Note: For a robust demo, we assume the backend handles concurrent downloads or we download one by one.
    // Here we'll start the first one to show the flow, but in production we'd do Promise.all
    try {
      setDownloadStatus({ status: 'downloading', message: `Initiating download for ${selectedScenes.length} scenes...` });
      
      const reqs = selectedScenes.map(sc => fetch('/api/satellite/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scene_id: sc.id })
      }));
      
      const responses = await Promise.all(reqs);
      const data = await Promise.all(responses.map(r => r.json()));
      
      const jobIds = data.map(d => d.job_id);
      
      // Poll jobs
      const interval = setInterval(async () => {
        const statuses = await Promise.all(jobIds.map(id => fetch(`/api/satellite/jobs/${id}`).then(r => r.json())));
        
        const allCompleted = statuses.every(s => s.status === 'completed' || s.status === 'failed');
        if (allCompleted) {
          clearInterval(interval);
          const failed = statuses.find(s => s.status === 'failed');
          if (failed) {
            setDownloadStatus({ status: 'error', message: 'Download failed: ' + failed.error });
            return;
          }
          
          setDownloadStatus({ status: 'success', message: 'Downloaded successfully!' });
          
          // Proceed
          const res1 = statuses[0].result;
          const res2 = statuses.length > 1 ? statuses[1].result : null;

          let modality = selectedScenes[0].modality;
          if (selectedScenes.length > 1 && selectedScenes[0].modality !== selectedScenes[1].modality) {
            modality = 'Optical + SAR';
          }

          let scenarioId = 'scenario_a_vqa';
          if (selectedScenes.length === 2) {
            if (modality === 'Optical + SAR') scenarioId = 'scenario_c_optical_sar';
            else scenarioId = 'scenario_b_change';
          } else if (modality === 'SAR') {
            scenarioId = 'scenario_d_sar';
          }

          onProceedToAnalysis({
             image1: res1.preview_url,
             image2: res2 ? res2.preview_url : null,
             meta1: res1.metadata,
             meta2: res2 ? res2.metadata : null,
             modality,
             scenarioId
          });
        } else {
          setDownloadStatus({ status: 'downloading', message: 'Downloading and validating scenes...' });
        }
      }, 1000);
      
    } catch (err) {
      setDownloadStatus({ status: 'error', message: 'Network error triggering download.' });
    }
  };

  return (
    <div className="satellite-search-view" style={{ width: '100%', maxWidth: '100%', padding: '0.25rem 0 2rem 0', color: 'var(--text-primary)', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          <Satellite color="var(--accent-sky)" />
          Automatic Satellite Data Retrieval
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>Query live STAC catalogs (AWS Earth Search) to dynamically download Sentinel-1 and Sentinel-2 scenes into the workspace.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.75rem', alignItems: 'start', width: '100%' }}>
        {/* Left Col: Filters */}
        <div className="satellite-card-box" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem', margin: 0 }}>Area of Interest</label>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dropdown & Custom Input</span>
            </div>

            {/* 1. Quick Presets Dropdown */}
            <div style={{ marginBottom: '0.6rem' }}>
              <select 
                value={aoiPreset} 
                onChange={(e) => handlePresetChange(e.target.value)} 
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', fontSize: '0.88rem' }}
              >
                <option value="" disabled>-- Select Preset City / Region --</option>
                {Object.entries(presets).map(([k, v]) => (
                  <option key={k} value={k}>{v.name}</option>
                ))}
                <option value="custom">✏️ Custom Coordinates / Place</option>
              </select>
            </div>

            {/* 2. Direct Input Field to Enter Any Location */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <input 
                type="text" 
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  if (aoiPreset !== 'custom') setAoiPreset('custom');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLocationSubmit(locationQuery);
                  }
                }}
                placeholder="Type any city, area or lat,lon..."
                style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.86rem' }}
              />
              <button 
                type="button"
                onClick={() => handleLocationSubmit(locationQuery)}
                disabled={isGeocoding}
                style={{
                  padding: '0.5rem 0.85rem',
                  background: 'var(--accent-sky)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  cursor: isGeocoding ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0
                }}
                title="Locate area on map"
              >
                <MapPin size={14} />
                {isGeocoding ? 'Locating...' : 'Locate'}
              </button>
            </div>

            {geocodingError && (
              <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '4px' }}>
                {geocodingError}
              </div>
            )}

            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '5px', display: 'block' }}>
              Select preset above or enter any place & click Locate.
            </span>

            {/* 3. Bounding Box Coordinates (Always accessible) */}
            <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bounding Box Coordinates:</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-sky)', fontFamily: 'var(--font-mono)' }}>
                  {mapCenter[0].toFixed(2)}°N, {mapCenter[1].toFixed(2)}°E
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1px' }}>West (Lon)</label>
                  <input type="number" step="0.01" value={bbox[0]} onChange={e => handleCustomBboxChange(0, e.target.value)} style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '5px', fontSize: '0.8rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1px' }}>South (Lat)</label>
                  <input type="number" step="0.01" value={bbox[1]} onChange={e => handleCustomBboxChange(1, e.target.value)} style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '5px', fontSize: '0.8rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1px' }}>East (Lon)</label>
                  <input type="number" step="0.01" value={bbox[2]} onChange={e => handleCustomBboxChange(2, e.target.value)} style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '5px', fontSize: '0.8rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1px' }}>North (Lat)</label>
                  <input type="number" step="0.01" value={bbox[3]} onChange={e => handleCustomBboxChange(3, e.target.value)} style={{ width: '100%', padding: '0.35rem 0.5rem', borderRadius: '5px', fontSize: '0.8rem' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>Date Range</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ flex: 1, padding: '0.55rem 0.65rem', borderRadius: '8px', fontSize: '0.85rem' }} />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ flex: 1, padding: '0.55rem 0.65rem', borderRadius: '8px', fontSize: '0.85rem' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>Data Source</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              <option value="sentinel-2">Sentinel-2 (Optical L2A)</option>
              <option value="sentinel-1">Sentinel-1 (SAR GRD)</option>
            </select>
          </div>

          {source === 'sentinel-2' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>Max Cloud Cover ({maxCloud}%)</label>
              <input type="range" min="0" max="100" value={maxCloud} onChange={(e) => setMaxCloud(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button onClick={handleSearch} disabled={isSearching} style={{ width: '100%', padding: '0.75rem', background: 'var(--accent-sky)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: isSearching ? 'not-allowed' : 'pointer', opacity: isSearching ? 0.7 : 1 }}>
              {isSearching ? <span className="badge-pulse-dot" style={{ background: '#ffffff' }}></span> : <Search size={16} />}
              {isSearching ? 'Querying STAC...' : 'Search Satellite Data'}
            </button>

            <button onClick={loadSamplePreset} className="sample-preset-btn" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Zap size={16} color="var(--accent-amber)" />
              Load Sample Preset
            </button>
          </div>
        </div>

        {/* Right Col: Map & Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', width: '100%' }}>
          <div style={{ height: '350px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <MapContainer center={mapCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController center={mapCenter} />
            </MapContainer>
          </div>

          <div className="satellite-card-box" style={{ padding: '1.5rem', borderRadius: '12px', flex: 1, width: '100%' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600 }}>
              <span>Search Results ({searchResults.length})</span>
              {selectedScenes.length > 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>{selectedScenes.length} Selected</span>
              )}
            </h3>

            {searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <MapIcon size={48} style={{ opacity: 0.35, margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Run a search to discover available satellite imagery for this area.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', width: '100%' }}>
                {searchResults.map(scene => {
                  const isSelected = !!selectedScenes.find(s => s.id === scene.id);
                  return (
                    <div 
                      key={scene.id} 
                      onClick={() => toggleSelection(scene)}
                      className={`scene-card-item ${isSelected ? 'selected' : ''}`}
                      style={{ 
                        border: `2px solid ${isSelected ? 'var(--accent-sky)' : 'var(--border-color)'}`, 
                        borderRadius: '8px', 
                        padding: '1rem',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(2, 132, 199, 0.08)' : 'var(--bg-tertiary)',
                        position: 'relative'
                      }}
                    >
                      {isSelected && <div style={{ position: 'absolute', top: 10, right: 10, color: 'var(--accent-sky)' }}><CheckCircle size={20} /></div>}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>{scene.platform.toUpperCase()} • {scene.modality}</div>
                      <div className="scene-id" style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{scene.id}</div>
                      
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12}/> {scene.acquisition_date.split('T')[0]}</span>
                        {scene.cloud_cover !== null && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CloudLightning size={12}/> {scene.cloud_cover.toFixed(1)}% Cloud</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedScenes.length > 0 && (
              <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)', fontWeight: 600 }}>Ready to ingest</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedScenes.length} scene(s) selected for analysis.</p>
                  </div>
                  <button 
                    onClick={handleDownloadAndProceed}
                    disabled={downloadStatus?.status === 'downloading'}
                    style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-emerald)', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {downloadStatus?.status === 'downloading' ? <span className="badge-pulse-dot" style={{ background: '#ffffff' }}></span> : <Download size={16} />}
                    {downloadStatus?.status === 'downloading' ? 'Downloading...' : 'Use Selected Data'}
                  </button>
                </div>
                
                {downloadStatus && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: downloadStatus.status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: downloadStatus.status === 'error' ? '#ef4444' : '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
                    {downloadStatus.status === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    {downloadStatus.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
