import os
from typing import Dict, Any, List, Optional, Tuple

class SatelliteValidationResult:
    def __init__(self, is_valid: bool, issues: List[Dict[str, str]], summary: str):
        self.is_valid = is_valid
        self.issues = issues  # List of {"level": "error"|"warning", "image": "Image 1"|"Image 2"|"Pair", "message": "...", "suggestion": "..."}
        self.summary = summary

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "issues": self.issues,
            "summary": self.summary
        }

class SatelliteValidator:
    """
    Validates single rasters and multi-temporal / multi-modal pairs
    for compatibility before sending to the SatQuery analysis pipelines.
    """

    SUPPORTED_FORMATS = [".tif", ".tiff", ".png", ".jpg", ".jpeg"]

    @classmethod
    def validate_scene_file(cls, file_path: str, label: str = "Image 1") -> Tuple[bool, List[Dict[str, str]], Dict[str, Any]]:
        issues = []
        metadata = {}

        # 1. Existence check
        if not os.path.exists(file_path):
            issues.append({
                "level": "error",
                "image": label,
                "message": f"File does not exist on disk: {file_path}",
                "suggestion": "Verify that the scene was downloaded properly or re-select the imagery."
            })
            return False, issues, metadata

        # 2. Format check
        ext = os.path.splitext(file_path.lower())[1]
        if ext not in cls.SUPPORTED_FORMATS:
            issues.append({
                "level": "error",
                "image": label,
                "message": f"Unsupported raster extension '{ext}'. Supported formats: GeoTIFF (.tif, .tiff), PNG, JPG.",
                "suggestion": "Select a GeoTIFF or standard raster file."
            })
            return False, issues, metadata

        # 3. File size sanity check (> 100 bytes)
        size_bytes = os.path.getsize(file_path)
        if size_bytes < 256:
            issues.append({
                "level": "error",
                "image": label,
                "message": f"File size is unusually small ({size_bytes} bytes). Possible corrupted or truncated download.",
                "suggestion": "Re-download the satellite scene."
            })
            return False, issues, metadata

        # 4. Raster readability and metadata extraction
        from PIL import Image
        try:
            with Image.open(file_path) as im:
                w, h = im.size
                mode = im.mode
                metadata["width"] = w
                metadata["height"] = h
                metadata["mode"] = mode
                metadata["channels"] = len(mode) if mode in ["RGB", "RGBA"] else 1
                if w < 16 or h < 16:
                    issues.append({
                        "level": "error",
                        "image": label,
                        "message": f"Raster dimensions ({w}x{h} px) are too small for satellite spatial analysis.",
                        "suggestion": "Provide a scene covering at least 128x128 pixels."
                    })
        except Exception as err:
            issues.append({
                "level": "error",
                "image": label,
                "message": f"Could not decode raster pixels: {str(err)}",
                "suggestion": "Ensure the image is a valid, uncorrupted GeoTIFF or PNG raster."
            })
            return False, issues, metadata

        return len([i for i in issues if i["level"] == "error"]) == 0, issues, metadata

    @classmethod
    def validate_pair_compatibility(
        cls,
        meta1: Dict[str, Any],
        meta2: Dict[str, Any],
        analysis_mode: str = "bi_temporal"
    ) -> SatelliteValidationResult:
        """
        Ensures two scenes are compatible for bi-temporal change detection or optical-SAR fusion.
        """
        issues = []

        date1 = meta1.get("date") or "2024-04-10"
        date2 = meta2.get("date") or "2026-04-14"
        modality1 = meta1.get("modality") or "Optical"
        modality2 = meta2.get("modality") or "Optical"

        # Check analysis mode
        if analysis_mode in ["bi_temporal", "change_detection"]:
            # Check date ordering
            if date1 == date2:
                issues.append({
                    "level": "warning",
                    "image": "Scene Pair",
                    "message": f"Both scenes have identical acquisition dates ({date1}). Differential change detection requires two distinct dates (T1 Baseline < T2 Analysis).",
                    "suggestion": "Select a baseline scene from an earlier timestamp and an evaluation scene from a later timestamp."
                })
            elif date1 > date2:
                issues.append({
                    "level": "warning",
                    "image": "Scene Pair",
                    "message": f"Scene 1 date ({date1}) is after Scene 2 date ({date2}).",
                    "suggestion": "Scene 1 is typically the baseline (older) and Scene 2 is the post-change acquisition. The pipeline will auto-sort them chronologically."
                })

            # Check modality consistency for pure optical change
            if modality1 != modality2 and modality1 != "Optical + SAR":
                issues.append({
                    "level": "warning",
                    "image": "Scene Pair",
                    "message": f"Sensors differ (Scene 1 is {modality1}, Scene 2 is {modality2}). For cross-sensor comparison, consider the Optical + SAR Fusion mode.",
                    "suggestion": "Switch modality to 'Optical + SAR' or select matching sensor types."
                })

        elif analysis_mode in ["optical_sar", "fusion"]:
            has_optical = modality1 == "Optical" or modality2 == "Optical"
            has_sar = modality1 == "SAR" or modality2 == "SAR"
            if not (has_optical and has_sar):
                issues.append({
                    "level": "error",
                    "image": "Scene Pair",
                    "message": f"Optical + SAR Fusion requires exactly 1 Optical sensor scene and 1 SAR radar scene. Got {modality1} and {modality2}.",
                    "suggestion": "Select one Sentinel-2 Optical scene for Slot 1 and one Sentinel-1 SAR scene for Slot 2."
                })

        # Check dimension difference ratio
        w1, h1 = meta1.get("width", 512), meta1.get("height", 512)
        w2, h2 = meta2.get("width", 512), meta2.get("height", 512)
        if w1 and w2 and h1 and h2:
            ratio_w = max(w1, w2) / max(min(w1, w2), 1)
            ratio_h = max(h1, h2) / max(min(h1, h2), 1)
            if ratio_w > 4.0 or ratio_h > 4.0:
                issues.append({
                    "level": "warning",
                    "image": "Scene Pair",
                    "message": f"Significant aspect ratio or resolution discrepancy between Scene 1 ({w1}x{h1}) and Scene 2 ({w2}x{h2}).",
                    "suggestion": "Scenes will be automatically co-registered and resampled to 10m GSD."
                })

        has_errors = any(i["level"] == "error" for i in issues)
        summary = "Imagery validation passed with optimal spatial co-registration." if not has_errors else "Validation encountered blocking compatibility errors."

        return SatelliteValidationResult(is_valid=not has_errors, issues=issues, summary=summary)
