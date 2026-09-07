import { useState, useEffect } from 'react';
import type { FC, ChangeEvent } from 'react';
import {
  Play,
  AlertCircle,
  UploadCloud,
  Layers,
  Ruler,
  Calendar,
  Radio,
  Satellite,
  RefreshCw,
  X
} from 'lucide-react';
import type { DemoScenario, AnalysisResult, GeospatialMetadata, UploadResponse, ResultTab } from '../types';
import { HowItWorkedModal } from './HowItWorkedModal';
import { SkeletonLoader } from './SkeletonLoader';
import { ResultsView } from './ResultsView';
import { PipelineGraphLoader } from './PipelineGraphLoader';
import { SatelliteSearchSection } from './SatelliteSearchSection';

export interface ScenarioModeInfo {
  modeName: string;
  icon: typeof Satellite;
  iconColor: string;
  badgeBg: string;
}

export const SCENARIO_MODE_MAP: Record<string, ScenarioModeInfo> = {
  scenario_b_change: {
    modeName: 'Bi-temporal (T1 + T2)',
    icon: RefreshCw,
    iconColor: 'var(--accent-emerald)',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
  },
  scenario_a_vqa: {
    modeName: 'Single Optical',
    icon: Satellite,
    iconColor: 'var(--accent-sky)',
    badgeBg: 'rgba(2, 132, 199, 0.12)',
  },
  scenario_c_optical_sar: {
    modeName: 'Optical + SAR Pair',
    icon: Layers,
    iconColor: 'var(--accent-purple)',
    badgeBg: 'rgba(124, 58, 237, 0.12)',
  },
  scenario_d_sar: {
    modeName: 'Single SAR',
    icon: Radio,
    iconColor: 'var(--accent-amber)',
    badgeBg: 'rgba(217, 119, 6, 0.12)',
  },
};

interface WorkspaceProps {
  initialScenarioId?: string;
  isBackendOffline?: boolean;
  onRetryHandshake?: () => void;
  activeView?: 'config' | 'results' | 'satellite_search';
  onViewChange?: (view: 'config' | 'results' | 'satellite_search') => void;
  activeResultTab?: ResultTab;
  onSelectResultTab?: (tab: ResultTab) => void;
  onResultGenerated?: (result: AnalysisResult) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

export const Workspace: FC<WorkspaceProps> = ({
  initialScenarioId = 'scenario_b_change',
  isBackendOffline = false,
  onRetryHandshake,
  activeView: controlledActiveView,
  onViewChange,
  activeResultTab,
  onSelectResultTab,
  onResultGenerated,
  onProcessingChange,
}) => {
  const [scenarios, setScenarios] = useState<DemoScenario[]>([]);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState<boolean>(true);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialScenarioId);
  const [modality, setModality] = useState<'Optical' | 'SAR' | 'Optical + SAR'>('Optical');
  const [image1Preview, setImage1Preview] = useState<string>('');
  const [image2Preview, setImage2Preview] = useState<string | null>('');
  const [query, setQuery] = useState<string>('What significant changes occurred between these two dates?');

  // Geospatial metadata for slot 1 and slot 2 (empty until user uploads)
  const [meta1, setMeta1] = useState<GeospatialMetadata | null>(null);
  const [meta2, setMeta2] = useState<GeospatialMetadata | null>(null);

  // View state: 'config' (input fields), 'results' (overall output view), or 'satellite_search'
  const [internalActiveView, setInternalActiveView] = useState<'config' | 'results' | 'satellite_search'>('config');
  const activeView = controlledActiveView !== undefined ? controlledActiveView : internalActiveView;

  const setActiveView = (view: 'config' | 'results' | 'satellite_search') => {
    setInternalActiveView(view);
    onViewChange?.(view);
  };

  // Execution states
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [historyRuns, setHistoryRuns] = useState<AnalysisResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Upload feedback state
  const [uploadFeedback, setUploadFeedback] = useState<{ isError: boolean; message: string; suggestion?: string } | null>(null);

  // Check if current mode requires dual images
  const isDualImageMode = selectedScenarioId === 'scenario_b_change' || selectedScenarioId === 'scenario_c_optical_sar' || modality === 'Optical + SAR';

  // Check whether required images are selected
  const hasImage1 = Boolean(image1Preview && image1Preview.trim().length > 0);
  const hasImage2 = Boolean(image2Preview && image2Preview.trim().length > 0);
  const areImagesSelected = isDualImageMode ? (hasImage1 && hasImage2) : hasImage1;
  const isReadyToAnalyze = areImagesSelected && !isProcessing;

  // Fetch scenarios on mount or when backend becomes connected
  useEffect(() => {
    if (isBackendOffline) {
      setIsLoadingScenarios(true);
      return;
    }

    setIsLoadingScenarios(true);
    fetch('/api/demo/scenarios')
      .then((res) => {
        if (!res.ok) throw new Error('Backend unavailable');
        return res.json();
      })
      .then((data: DemoScenario[]) => {
        setScenarios(data);
        const current = data.find((s) => s.id === initialScenarioId);
        if (current) {
          // Initialize scenario metadata and query template, but keep slots empty so user must upload
          setSelectedScenarioId(current.id);
          setModality(current.modality);
          setQuery(current.suggested_queries[0] || '');
          setImage1Preview('');
          setImage2Preview(current.modality === 'Optical + SAR' || current.id === 'scenario_b_change' ? '' : null);
          setMeta1(null);
          setMeta2(null);
        }
        setIsLoadingScenarios(false);
      })
      .catch((err) => {
        console.error('Failed to load scenarios:', err);
        setIsLoadingScenarios(false);
      });
  }, [initialScenarioId, isBackendOffline]);

  const applyScenario = (sc: DemoScenario, loadSampleImages = false) => {
    setSelectedScenarioId(sc.id);
    setModality(sc.modality);
    setQuery(sc.suggested_queries[0] || '');
    setUploadFeedback(null);
    setErrorMsg(null);
    setResult(null); // Clear previous result
    setActiveView('config'); // Reset to input view

    if (loadSampleImages) {
      setImage1Preview(sc.image_1_preview);
      setImage2Preview(sc.image_2_preview);

      if (sc.id === 'scenario_b_change') {
        setMeta1({
          crs: 'EPSG:32643 • WGS 84 / UTM 43N',
          resolution: '10.0m / pixel (Sentinel-2 MSI)',
          date: '2024-04-10',
          bands: '3 Bands (R, G, B)',
          modality: 'Optical',
          format: 'GeoTIFF'
        });
        setMeta2({
          crs: 'EPSG:32643 • WGS 84 / UTM 43N',
          resolution: '10.0m / pixel (Sentinel-2 MSI)',
          date: '2026-04-14',
          bands: '3 Bands (R, G, B)',
          modality: 'Optical',
          format: 'GeoTIFF'
        });
      } else if (sc.id === 'scenario_c_optical_sar') {
        setMeta1({
          crs: 'EPSG:32643 • WGS 84 / UTM 43N',
          resolution: '10.0m / pixel (Sentinel-2 MSI)',
          date: '2025-02-18',
          bands: '3 Bands (Optical RGB)',
          modality: 'Optical',
          format: 'GeoTIFF'
        });
        setMeta2({
          crs: 'EPSG:32643 • WGS 84 / UTM 43N',
          resolution: '10.0m / pixel (Sentinel-1 IW)',
          date: '2025-02-18',
          bands: '1 Band (SAR C-Band VV)',
          modality: 'SAR',
          format: 'GeoTIFF'
        });
      } else if (sc.id === 'scenario_d_sar') {
        setMeta1({
          crs: 'EPSG:32643 • WGS 84 / UTM 43N',
          resolution: '10.0m / pixel (Sentinel-1 GRD)',
          date: '2025-02-18',
          bands: '1 Band (SAR C-Band VV)',
          modality: 'SAR',
          format: 'GeoTIFF'
        });
        setMeta2(null);
      } else {
        // Scenario A: VQA
        setMeta1({
          crs: 'EPSG:32643 • WGS 84 / UTM 43N',
          resolution: '10.0m / pixel (Sentinel-2 MSI)',
          date: '2025-03-15',
          bands: '3 Bands (R, G, B)',
          modality: 'Optical',
          format: 'GeoTIFF'
        });
        setMeta2(null);
      }
    } else {
      // Clear image previews and metadata: user MUST upload images
      setImage1Preview('');
      setImage2Preview(sc.modality === 'Optical + SAR' || sc.id === 'scenario_b_change' ? '' : null);
      setMeta1(null);
      setMeta2(null);
    }
  };

  const handleScenarioClick = (scId: string, loadSampleImages = false) => {
    const sc = scenarios.find((s) => s.id === scId);
    if (sc) applyScenario(sc, loadSampleImages);
  };


  // Run Analysis Pipeline
  const handleRunAnalysis = async () => {
    if (!areImagesSelected || isProcessing) return;

    setActiveView('results'); // Switch immediately to overall output view full screen
    setIsProcessing(true);
    onProcessingChange?.(true);
    setProgressPercent(15);
    setProcessingStage('1. Input & Spatial Alignment Validation');
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch('/api/demo/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: selectedScenarioId,
          modality: modality,
          query: query?.trim() || 'Analyze significant geospatial features and surface changes in this satellite scene.',
          custom_image_1: image1Preview,
          custom_image_2: image2Preview,
        }),
      });

      if (!res.ok) throw new Error('API run request failed');
      const data = await res.json();
      const jobId = data.job_id;

      // Poll job progress
      const pollInterval = setInterval(async () => {
        try {
          const jobRes = await fetch(`/api/demo/jobs/${jobId}`);
          const jobData = await jobRes.json();

          setProcessingStage(jobData.current_stage);
          setProgressPercent(jobData.progress);

          if (jobData.status === 'completed') {
            clearInterval(pollInterval);
            const resultRes = await fetch(`/api/demo/results/${jobId}`);
            const finalResult = await resultRes.json();
            setResult(finalResult);
            onResultGenerated?.(finalResult);
            setHistoryRuns((prev) => [finalResult, ...prev.filter((r) => r.job_id !== finalResult.job_id)]);
            setIsProcessing(false);
            onProcessingChange?.(false);
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setIsProcessing(false);
          onProcessingChange?.(false);
          setErrorMsg('Error retrieving execution result');
        }
      }, 500);

    } catch (err: any) {
      setIsProcessing(false);
      onProcessingChange?.(false);
      setErrorMsg(err.message || 'Failed to complete analysis pipeline');
    }
  };

  // Dedicated single file uploader
  const uploadSingleFile = async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/demo/upload', {
      method: 'POST',
      body: formData,
    });

    return await res.json();
  };

  // Handle Drag & Drop / File Input
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, targetSlot: 'auto' | 'image1' | 'image2' = 'auto') => {
    const inputRef = e.target;
    const files = inputRef.files;
    if (!files || files.length === 0) return;

    setUploadFeedback(null);

    try {
      // Multiple files uploaded (2 files selected)
      if (files.length >= 2) {
        setUploadFeedback({
          isError: false,
          message: `Ingesting "${files[0].name}" (T1) and "${files[1].name}" (T2)...`,
        });

        const [data1, data2] = await Promise.all([
          uploadSingleFile(files[0]),
          uploadSingleFile(files[1]),
        ]);

        if (data1.success && data2.success && data1.preview_url && data2.preview_url) {
          setImage1Preview(data1.preview_url);
          setImage2Preview(data2.preview_url);
          if (data1.geospatial_metadata) setMeta1(data1.geospatial_metadata);
          if (data2.geospatial_metadata) setMeta2(data2.geospatial_metadata);

          // Auto-detect modality if one is SAR and one is Optical
          if (data1.geospatial_metadata?.modality === 'Optical' && data2.geospatial_metadata?.modality === 'SAR') {
            setModality('Optical + SAR');
            setSelectedScenarioId('scenario_c_optical_sar');
          } else {
            setModality('Optical');
            setSelectedScenarioId('scenario_b_change');
          }

          setUploadFeedback({
            isError: false,
            message: `Ingested ${files[0].name} (T1: ${data1.geospatial_metadata?.format}) & ${files[1].name} (T2: ${data2.geospatial_metadata?.format}). Ready for analysis.`,
          });
        } else {
          setUploadFeedback({
            isError: true,
            message: data1.message || data2.message || 'Batch upload verification failed.',
            suggestion: data1.suggestion || data2.suggestion,
          });
        }
        inputRef.value = '';
        return;
      }

      // Single file uploaded
      const file = files[0];
      setUploadFeedback({
        isError: false,
        message: `Ingesting "${file.name}"...`,
      });

      const data = await uploadSingleFile(file);

      if (data.success && data.preview_url) {
        if (targetSlot === 'image2') {
          setImage2Preview(data.preview_url);
          if (data.geospatial_metadata) setMeta2(data.geospatial_metadata);
          setUploadFeedback({
            isError: false,
            message: `Image 2 (T2) "${data.filename}" accepted (${data.geospatial_metadata?.format}, ${data.geospatial_metadata?.bands}). Both scenes ready for evaluation.`,
          });
        } else if (targetSlot === 'image1') {
          setImage1Preview(data.preview_url);
          if (data.geospatial_metadata) setMeta1(data.geospatial_metadata);
          if (data.geospatial_metadata?.modality === 'SAR') {
            setModality('SAR');
          }
          setUploadFeedback({
            isError: false,
            message: `Image 1 (T1) "${data.filename}" accepted (${data.geospatial_metadata?.format}, ${data.geospatial_metadata?.bands}). Ready for evaluation.`,
          });
        } else {
          // Auto slot assignment:
          // If Image 1 is already custom, auto-assign this new upload to Image 2!
          if (image1Preview.includes('/custom_uploads/') && (!image2Preview || !image2Preview.includes('/custom_uploads/'))) {
            setImage2Preview(data.preview_url);
            if (data.geospatial_metadata) setMeta2(data.geospatial_metadata);
            setUploadFeedback({
              isError: false,
              message: `Image 2 (T2) "${data.filename}" accepted. Both custom scenes are now loaded and ready for evaluation!`,
            });
          } else {
            setImage1Preview(data.preview_url);
            if (data.geospatial_metadata) setMeta1(data.geospatial_metadata);
            if (data.geospatial_metadata?.modality === 'SAR') {
              setModality('SAR');
            }
            setUploadFeedback({
              isError: false,
              message: `Image 1 (T1) "${data.filename}" accepted. Click "Upload T2" on Image 2 to provide the second scene, or run analysis.`,
            });
          }
        }
      } else {
        setUploadFeedback({
          isError: true,
          message: data.message || 'Upload validation failed.',
          suggestion: data.suggestion,
        });
      }
    } catch (err) {
      setUploadFeedback({
        isError: true,
        message: 'Could not communicate with local backend upload processor.',
        suggestion: 'Ensure the local backend is running on port 8000.',
      });
    }

    inputRef.value = '';
  };

  // Derive left and right images for SwipeViewer from result.evidence
  const getViewerConfig = (res: AnalysisResult) => {
    if (res.task === 'change_detection' || res.evidence.before_image) {
      return {
        leftImage: res.evidence.before_image || image1Preview,
        rightImage: res.evidence.after_image || image2Preview || image1Preview,
        leftLabel: res.evidence.is_custom ? 'Baseline T1 (Custom)' : 'Baseline Scene (2024)',
        rightLabel: res.evidence.is_custom ? 'Analysis T2 (Custom)' : 'Comparison Scene (2026)',
        heatmapOverlay: res.evidence.heatmap_overlay || '/demo-data/change/change_heatmap_overlay.png',
        changeMask: res.evidence.change_map || '/demo-data/change/change_mask_binary.png',
        isMultimodal: false,
        segmentationOverlay: undefined as string | undefined,
      };
    } else if (res.task === 'optical_sar_joint' || res.evidence.optical_image) {
      return {
        leftImage: res.evidence.optical_image || image1Preview,
        rightImage: res.evidence.sar_image || image2Preview || image1Preview,
        leftLabel: 'Optical RGB (Surface)',
        rightLabel: 'SAR C-Band (Structure)',
        heatmapOverlay: res.evidence.heatmap_overlay || '/demo-data/optical_sar/optical_sar_heatmap_overlay.png',
        changeMask: res.evidence.change_map || '/demo-data/optical_sar/optical_sar_diff_mask.png',
        isMultimodal: true,
        segmentationOverlay: undefined as string | undefined,
      };
    } else if (res.task === 'sar_structural_mapping' || res.evidence.sar_image) {
      return {
        leftImage: res.evidence.sar_image || res.evidence.image || image1Preview,
        rightImage: res.evidence.sar_image || res.evidence.image || image1Preview,
        leftLabel: 'Raw SAR Amplitude (C-Band)',
        rightLabel: 'Structural Radar Backscatter',
        heatmapOverlay: res.evidence.heatmap_overlay || '/demo-data/optical_sar/optical_sar_heatmap_overlay.png',
        changeMask: res.evidence.change_map || '/demo-data/optical_sar/optical_sar_diff_mask.png',
        isMultimodal: false,
        segmentationOverlay: undefined as string | undefined,
      };
    } else {
      // Land cover VQA
      return {
        leftImage: res.evidence.image || image1Preview,
        rightImage: res.evidence.image || image1Preview,
        leftLabel: 'Original Satellite Scene',
        rightLabel: 'Detected Feature Highlights',
        heatmapOverlay: res.evidence.heatmap_overlay || '/demo-data/single/vqa_heatmap_overlay.png',
        changeMask: res.evidence.change_map || res.evidence.segmentation_mask || '/demo-data/single/vqa_feature_mask.png',
        isMultimodal: false,
        segmentationOverlay: res.evidence.segmentation_mask,
      };
    }
  };

  if (isBackendOffline || (isLoadingScenarios && scenarios.length === 0)) {
    return <SkeletonLoader isBackendOffline={isBackendOffline} onRetry={onRetryHandshake} />;
  }

  // =====================================================================
  // 0. SATELLITE SEARCH VIEW
  // =====================================================================
  if (activeView === 'satellite_search') {
    return (
      <div className="workspace-config-view" style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%' }}>
        <SatelliteSearchSection onProceedToAnalysis={(data) => {
           setImage1Preview(data.image1);
           setImage2Preview(data.image2);
           setMeta1(data.meta1);
           setMeta2(data.meta2);
           setModality(data.modality as any);
           setSelectedScenarioId(data.scenarioId);
           setActiveView('config');
        }} />
      </div>
    );
  }

  // =====================================================================
  // 1. INPUT CONFIGURATION VIEW (Shown until user clicks Analyze)
  // =====================================================================
  if (activeView === 'config') {
    return (
      <div className="workspace-config-view">
        <div className="panel-card">
          <div className="panel-header">
            <div className="panel-title">
              <span>Analysis Configuration</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sentinel-2 MSI • 10m GSD</span>
          </div>

          <div className="config-grid-layout">
            {/* Left Column: Satellite Scenarios & Ingestion Modes */}
            <div className="config-col-left">
              {/* Prepared Scenarios Section */}
              <div className="scenarios-box">
                <div className="section-label">
                  <span>Satellite Scenarios & Modes</span>
                  <span style={{ color: 'var(--accent-sky)', fontSize: '0.68rem' }}>Supports GeoTIFF, PNG, JPG</span>
                </div>
                <div className="scenarios-list">
                  {scenarios.map((sc) => {
                    const modeInfo = SCENARIO_MODE_MAP[sc.id] || {
                      modeName: sc.modality,
                      icon: Satellite,
                      iconColor: 'var(--accent-sky)',
                      badgeBg: 'rgba(56, 189, 248, 0.14)',
                    };
                    const ModeIcon = modeInfo.icon;
                    return (
                      <button
                        key={sc.id}
                        className={`scenario-btn ${selectedScenarioId === sc.id ? 'active' : ''}`}
                        onClick={() => handleScenarioClick(sc.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '0.75rem 0.9rem' }}
                      >
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: modeInfo.badgeBg,
                            border: `1px solid ${modeInfo.iconColor}44`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: modeInfo.iconColor,
                            flexShrink: 0,
                          }}
                        >
                          <ModeIcon size={17} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                            <div className="scenario-btn-name" style={{ fontSize: '0.84rem' }}>{sc.title}</div>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: modeInfo.badgeBg,
                                color: modeInfo.iconColor,
                                border: `1px solid ${modeInfo.iconColor}44`,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                letterSpacing: '0.2px',
                              }}
                            >
                              {modeInfo.modeName}
                            </span>
                          </div>
                          <div className="scenario-btn-meta">
                            Modality: {sc.modality} • {sc.dates.join(' vs ')}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Input Imagery, Upload, Query & Analyze Button */}
            <div className="config-col-right">
              {/* Input Satellite Imagery with Authenticated GeoTIFF Metadata */}
              <div className="imagery-input-container">
                <div className="section-label">
                  <span>Input Satellite Imagery & Geospatial Metadata</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>GeoTIFF Tags Auto-Parsed</span>
                </div>

                <div className={`imagery-grid ${isDualImageMode ? '' : 'single'}`}>
                  {/* Slot 1 */}
                  {hasImage1 ? (
                    <div className="image-slot-card has-image">
                      <div className="slot-label">
                        <span>
                          {selectedScenarioId === 'scenario_c_optical_sar'
                            ? 'Optical Scene (Surface)'
                            : selectedScenarioId === 'scenario_d_sar'
                            ? 'SAR C-Band (Structure)'
                            : 'Scene 1 (T1 Baseline)'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <label className="slot-upload-chip" title="Replace Scene 1 (GeoTIFF / PNG / JPG)">
                            <UploadCloud size={11} />
                            <span>Replace</span>
                            <input
                              type="file"
                              style={{ display: 'none' }}
                              accept=".tif,.tiff,.png,.jpg,.jpeg"
                              onChange={(e) => handleFileUpload(e, 'image1')}
                            />
                          </label>
                          <button
                            type="button"
                            className="slot-clear-chip"
                            onClick={() => {
                              setImage1Preview('');
                              setMeta1(null);
                            }}
                            title="Clear Scene 1"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                      <img src={image1Preview} alt="Scene 1 preview" className="slot-img-preview" />
                      
                      {/* Geospatial Metadata Badges: GSD & Date */}
                      <div className="slot-geo-meta-container">
                        <div className="slot-geo-meta-row">
                          <span className="slot-geo-pill" title="Ground Sample Distance">
                            <Ruler size={11} color="var(--accent-emerald)" />
                            <strong>GSD:</strong> {meta1?.resolution || '10.0m / pixel'}
                          </span>
                          <span className="slot-geo-pill" title="Acquisition Date">
                            <Calendar size={11} color="var(--accent-amber)" />
                            <strong>Date:</strong> {meta1?.date || '2024-04-10'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="image-slot-card empty-slot">
                      <label className="empty-slot-label" title="Click to upload Scene 1">
                        <UploadCloud size={24} color="var(--accent-emerald)" />
                        <span className="empty-slot-title">
                          {selectedScenarioId === 'scenario_c_optical_sar'
                            ? 'Select Optical Scene'
                            : selectedScenarioId === 'scenario_d_sar'
                            ? 'Select SAR C-Band'
                            : 'Select Scene 1 (T1 Baseline)'}
                        </span>
                        <span className="empty-slot-subtext">Click to upload GeoTIFF / PNG / JPG</span>
                        <input
                          type="file"
                          style={{ display: 'none' }}
                          accept=".tif,.tiff,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileUpload(e, 'image1')}
                        />
                      </label>
                    </div>
                  )}

                  {/* Slot 2 (if dual image mode) */}
                  {isDualImageMode && (
                    hasImage2 ? (
                      <div className="image-slot-card has-image">
                        <div className="slot-label">
                          <span>
                            {selectedScenarioId === 'scenario_c_optical_sar'
                              ? 'SAR Microwave Backscatter'
                              : 'Scene 2 (T2 Comparison)'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <label className="slot-upload-chip" title="Replace Scene 2 (GeoTIFF / PNG / JPG)">
                              <UploadCloud size={11} />
                              <span>Replace</span>
                              <input
                                type="file"
                                style={{ display: 'none' }}
                                accept=".tif,.tiff,.png,.jpg,.jpeg"
                                onChange={(e) => handleFileUpload(e, 'image2')}
                              />
                            </label>
                            <button
                              type="button"
                              className="slot-clear-chip"
                              onClick={() => {
                                setImage2Preview(null);
                                setMeta2(null);
                              }}
                              title="Clear Scene 2"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        </div>
                        <img src={image2Preview!} alt="Scene 2 preview" className="slot-img-preview" />
                        
                        {/* Geospatial Metadata Badges: GSD & Date */}
                        <div className="slot-geo-meta-container">
                          <div className="slot-geo-meta-row">
                            <span className="slot-geo-pill" title="Ground Sample Distance">
                              <Ruler size={11} color="var(--accent-emerald)" />
                              <strong>GSD:</strong> {meta2?.resolution || '10.0m / pixel'}
                            </span>
                            <span className="slot-geo-pill" title="Acquisition Date">
                              <Calendar size={11} color="var(--accent-amber)" />
                              <strong>Date:</strong> {meta2?.date || '2026-04-14'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="image-slot-card empty-slot">
                        <label className="empty-slot-label" title="Click to upload Scene 2">
                          <UploadCloud size={24} color="var(--accent-emerald)" />
                          <span className="empty-slot-title">
                            {selectedScenarioId === 'scenario_c_optical_sar'
                              ? 'Select SAR Scene'
                              : 'Select Scene 2 (T2 Comparison)'}
                          </span>
                          <span className="empty-slot-subtext">Click to upload GeoTIFF / PNG / JPG</span>
                          <input
                            type="file"
                            style={{ display: 'none' }}
                            accept=".tif,.tiff,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileUpload(e, 'image2')}
                          />
                        </label>
                      </div>
                    )
                  )}
                </div>

                {/* Upload Feedback Guardrail Banner (only rendered on error) */}
                {uploadFeedback && uploadFeedback.isError && (
                  <div
                    style={{
                      padding: '0.65rem 0.8rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      marginBottom: '1rem',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid #ef4444',
                      color: '#fca5a5',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                      Upload Diagnostics
                    </div>
                    <div>{uploadFeedback.message}</div>
                    {uploadFeedback.suggestion && (
                      <div style={{ marginTop: '4px', color: '#cbd5e1', fontStyle: 'italic' }}>
                        Recommendation: {uploadFeedback.suggestion}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Show Analyze button directly AFTER uploading images */}
              {areImagesSelected && (
                <div style={{ animation: 'fadeIn 0.25s ease', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-analyze"
                    onClick={() => handleRunAnalysis()}
                    disabled={!isReadyToAnalyze}
                    title="Run Satellite AI Analysis"
                  >
                    {isProcessing ? (
                      <>
                        <span className="badge-pulse-dot" style={{ width: '8px', height: '8px', background: '#fff' }}></span>
                        <span>Analyzing Satellite Data...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} fill="currentColor" />
                        <span>Analyze Satellite Data</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================================
  // 2. OVERALL OUTPUT VIEW (Entire Screen - Shown after clicking Analyze)
  // =====================================================================
  return (
    <div className="workspace-results-view">
      {/* Error notification if any */}
      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '1rem', borderRadius: '8px', color: '#fca5a5', fontSize: '0.84rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <AlertCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
            {errorMsg}
          </div>
          <button className="btn-secondary" onClick={() => setActiveView('config')}>
            Return to Inputs
          </button>
        </div>
      )}

      {/* 2. Interactive Computational Graph Pipeline Loader */}
      {isProcessing && (
        <PipelineGraphLoader
          progressPercent={progressPercent}
          processingStage={processingStage}
          scenarioTitle={scenarios.find((s) => s.id === selectedScenarioId)?.title}
        />
      )}

      {/* 3. Completed Live Analysis Result (Entire Screen) */}
      {!isProcessing && result && (
        <ResultsView
          result={result}
          viewerConfig={getViewerConfig(result)}
          historyRuns={historyRuns.length > 0 ? historyRuns : [result]}
          onSelectRun={(selectedRun) => setResult(selectedRun)}
          onBackToConfig={() => setActiveView('config')}
          activeTab={activeResultTab}
          onSelectTab={onSelectResultTab}
        />
      )}

      {/* "How Did SatQuery AI Get This Answer?" Modal */}
      {result && (
        <HowItWorkedModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          stages={result.how_it_worked || []}
          query={result.query}
          method={result.method}
        />
      )}
    </div>
  );
};
