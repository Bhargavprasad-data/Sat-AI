import abc
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    west: float = Field(..., description="Min longitude")
    south: float = Field(..., description="Min latitude")
    east: float = Field(..., description="Max longitude")
    north: float = Field(..., description="Max latitude")

    def to_bbox_list(self) -> List[float]:
        return [self.west, self.south, self.east, self.north]

class SceneAsset(BaseModel):
    name: str
    href: str
    media_type: Optional[str] = None
    title: Optional[str] = None
    roles: Optional[List[str]] = None

class SceneMetadata(BaseModel):
    id: str
    provider: str
    collection: str
    platform: str
    instrument: str
    modality: str  # "Optical" or "SAR"
    acquisition_date: str  # YYYY-MM-DD
    cloud_cover: Optional[float] = None
    resolution_gsd: float = 10.0  # Meters
    crs: str = "EPSG:4326"
    bbox: List[float]
    thumbnail_url: Optional[str] = None
    processing_level: str = "L2A"
    assets: Dict[str, SceneAsset] = Field(default_factory=dict)
    summary: Optional[str] = None
    is_sample_fallback: bool = False

class SearchFilter(BaseModel):
    bbox: BoundingBox
    start_date: str  # YYYY-MM-DD
    end_date: str  # YYYY-MM-DD
    source: str = "sentinel-2"  # "sentinel-2", "sentinel-1", "all"
    max_cloud_cover: float = 20.0
    limit: int = 12

class DownloadResult(BaseModel):
    success: bool
    scene_id: str
    file_path: str
    preview_url: str
    geospatial_metadata: Dict[str, Any]
    error_message: Optional[str] = None

class SatelliteProvider(abc.ABC):
    """Abstract Base Class for Satellite Imagery Data Providers."""

    @property
    @abc.abstractmethod
    def provider_name(self) -> str:
        """Name of the data provider (e.g. AWS Earth Search, Microsoft Planetary Computer)."""
        pass

    @abc.abstractmethod
    def list_collections(self) -> List[Dict[str, Any]]:
        """List supported collections (e.g. Sentinel-2 L2A, Sentinel-1 GRD)."""
        pass

    @abc.abstractmethod
    def search(self, filters: SearchFilter) -> List[SceneMetadata]:
        """Search available satellite scenes matching the spatial and temporal filters."""
        pass

    @abc.abstractmethod
    def get_scene(self, scene_id: str) -> Optional[SceneMetadata]:
        """Fetch metadata for a single scene by ID."""
        pass

    @abc.abstractmethod
    def download(self, scene_id: str, output_dir: str, prefer_cog: bool = True) -> DownloadResult:
        """Download or cache raster data for the given scene and return the local path."""
        pass
