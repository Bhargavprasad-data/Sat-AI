import os
import json
import numpy as np
from PIL import Image

BASE_DIR = os.path.join(os.getcwd(), "demo-data")
os.makedirs(os.path.join(BASE_DIR, "single"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "change"), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, "optical_sar"), exist_ok=True)

WIDTH, HEIGHT = 768, 768

def create_procedural_landscape(seed=42):
    """Generate realistic multispectral-like base terrain."""
    np.random.seed(seed)
    y, x = np.mgrid[0:HEIGHT, 0:WIDTH]
    
    # 1. Meandering river/water body
    river_center = 260 + 80 * np.sin(y / 90.0) + 40 * np.cos(x / 140.0)
    dist_to_river = np.abs(x - river_center)
    river_mask = dist_to_river < 28
    
    # 2. Agricultural parcels (checkerboard-like Voronoi / block layout)
    grid_x = (x // 48) % 2
    grid_y = (y // 48) % 2
    parcels = (grid_x ^ grid_y).astype(float)
    
    # 3. Forest / vegetation zones
    noise_smooth = np.sin(x / 60.0) * np.cos(y / 60.0)
    vegetation_zone = noise_smooth > 0.1
    
    # 4. Urban built-up zone (south-west quadrant)
    urban_zone = (x < 240) & (y > 450)
    
    r = np.clip(70 + parcels * 35 + urban_zone * 80 + np.random.normal(0, 5, (HEIGHT, WIDTH)), 20, 230)
    g = np.clip(110 + vegetation_zone * 65 + parcels * 25 - urban_zone * 20 + np.random.normal(0, 5, (HEIGHT, WIDTH)), 30, 240)
    b = np.clip(60 + urban_zone * 60 + np.random.normal(0, 4, (HEIGHT, WIDTH)), 20, 210)
    
    # Water reflectance
    r[river_mask] = 22
    g[river_mask] = 58
    b[river_mask] = 95
    
    rgb = np.stack([r, g, b], axis=-1).astype(np.uint8)
    return rgb, river_mask

# 1. SCENARIO A: SINGLE OPTICAL
rgb_single, _ = create_procedural_landscape(seed=101)
img_single = Image.fromarray(rgb_single)
img_single.save(os.path.join(BASE_DIR, "single", "area_preview.png"))
img_single.save(os.path.join(BASE_DIR, "single", "area.tif"))

meta_single = {
    "scenario_id": "scenario_a_vqa",
    "title": "Scenario A — Land Cover VQA",
    "modality": "Optical",
    "crs": "EPSG:32643",
    "crs_name": "WGS 84 / UTM Zone 43N",
    "resolution": "10.0m / pixel",
    "bounds": [77.1025, 28.5200, 77.1812, 28.5985],
    "acquisition_date": "2025-03-15",
    "sensor": "Sentinel-2 MSI (Level-2A BOA Reflectance)",
    "suggested_queries": [
        "What land cover types are visible in this region?",
        "Is there a water body in this region?",
        "What is the predominant land cover in the south-west sector?"
    ],
    "baseline_response": {
        "answer": "Visible land-cover patterns in this scene include dense riparian vegetation, cultivated agricultural plots, a meandering river system, and an emerging built-up settlement in the south-west quadrant.",
        "confidence_available": False,
        "classes_detected": ["Vegetation / Farmland (52.4%)", "Water Body / River (8.1%)", "Urban / Built-up (18.6%)", "Fallow / Bare Soil (20.9%)"]
    }
}
with open(os.path.join(BASE_DIR, "single", "metadata.json"), "w") as f:
    json.dump(meta_single, f, indent=2)

# 2. SCENARIO B: BI-TEMPORAL CHANGE (2024 vs 2026)
rgb_2024, river_mask_2024 = create_procedural_landscape(seed=2024)

rgb_2026 = rgb_2024.copy()
y, x = np.mgrid[0:HEIGHT, 0:WIDTH]

# Inundation / water expansion in North-East riparian zone
change_zone = ((x > 380) & (y < 350) & (np.abs(x - (260 + 80 * np.sin(y / 90.0) + 40 * np.cos(x / 140.0))) < 130))
urban_expansion = (x > 500) & (y > 520) & ((x + y) % 18 < 14)

rgb_2026[change_zone, 0] = 30
rgb_2026[change_zone, 1] = 68
rgb_2026[change_zone, 2] = 110

rgb_2026[urban_expansion, 0] = 185
rgb_2026[urban_expansion, 1] = 160
rgb_2026[urban_expansion, 2] = 140

img_2024 = Image.fromarray(rgb_2024)
img_2026 = Image.fromarray(rgb_2026)

img_2024.save(os.path.join(BASE_DIR, "change", "area_2024_preview.png"))
img_2024.save(os.path.join(BASE_DIR, "change", "area_2024.tif"))
img_2026.save(os.path.join(BASE_DIR, "change", "area_2026_preview.png"))
img_2026.save(os.path.join(BASE_DIR, "change", "area_2026.tif"))

# Compute baseline pixel difference change mask
diff = np.mean(np.abs(rgb_2026.astype(float) - rgb_2024.astype(float)), axis=-1)
threshold = 30.0
change_mask = (diff > threshold).astype(np.uint8) * 255
heatmap = np.zeros((HEIGHT, WIDTH, 4), dtype=np.uint8)
heatmap[change_mask > 0] = [239, 68, 68, 210]  # Vibrant semi-transparent red
img_mask = Image.fromarray(change_mask)
img_mask.save(os.path.join(BASE_DIR, "change", "change_mask_baseline.png"))
img_heatmap = Image.fromarray(heatmap, mode="RGBA")
img_heatmap.save(os.path.join(BASE_DIR, "change", "change_heatmap_overlay.png"))

meta_change = {
    "scenario_id": "scenario_b_change",
    "title": "Scenario B — Bi-temporal Change (2024 vs 2026)",
    "modality": "Optical",
    "crs": "EPSG:32643",
    "crs_name": "WGS 84 / UTM Zone 43N",
    "resolution": "10.0m / pixel",
    "bounds": [77.1025, 28.5200, 77.1812, 28.5985],
    "dates": ["2024-04-10", "2026-04-14"],
    "sensor": "Sentinel-2 MSI",
    "suggested_queries": [
        "What significant changes occurred between these two dates?",
        "Where has significant surface change occurred?",
        "Quantify the area affected by surface reflectance changes."
    ],
    "baseline_metrics": {
        "total_pixels": HEIGHT * WIDTH,
        "changed_pixels": int(np.sum(change_mask > 0)),
        "percentage_change": round(float(np.sum(change_mask > 0)) / (HEIGHT * WIDTH) * 100.0, 2),
        "gsd_m": 10.0,
        "changed_area_km2": round(float(np.sum(change_mask > 0)) * (10.0 * 10.0) / 1e6, 2)
    }
}
with open(os.path.join(BASE_DIR, "change", "metadata.json"), "w") as f:
    json.dump(meta_change, f, indent=2)

# 3. SCENARIO C: OPTICAL + SAR JOINT ANALYSIS
rgb_opt, river_m = create_procedural_landscape(seed=303)
img_opt = Image.fromarray(rgb_opt)
img_opt.save(os.path.join(BASE_DIR, "optical_sar", "area_optical_preview.png"))
img_opt.save(os.path.join(BASE_DIR, "optical_sar", "area_optical.tif"))

y, x = np.mgrid[0:HEIGHT, 0:WIDTH]
urban_z = (x < 240) & (y > 450)
speckle = np.random.gamma(4, 1.0, (HEIGHT, WIDTH)) / 4.0
sar_val = np.clip((85 + urban_z * 135) * speckle, 15, 255)
sar_val[river_m] = np.clip(12 + np.random.normal(0, 3, int(np.sum(river_m))), 5, 25)

sar_gray = sar_val.astype(np.uint8)
img_sar = Image.fromarray(sar_gray)
img_sar.save(os.path.join(BASE_DIR, "optical_sar", "area_sar_preview.png"))
img_sar.save(os.path.join(BASE_DIR, "optical_sar", "area_sar.tif"))

joint_comp = np.stack([rgb_opt[:, :, 0], rgb_opt[:, :, 1], sar_gray], axis=-1)
img_joint = Image.fromarray(joint_comp)
img_joint.save(os.path.join(BASE_DIR, "optical_sar", "joint_fusion_preview.png"))

meta_opt_sar = {
    "scenario_id": "scenario_c_optical_sar",
    "title": "Scenario C — Optical + SAR Joint Analysis",
    "modality": "Optical + SAR",
    "crs": "EPSG:32643",
    "crs_name": "WGS 84 / UTM Zone 43N",
    "resolution": "10.0m / pixel",
    "bounds": [77.1025, 28.5200, 77.1812, 28.5985],
    "optical_sensor": "Sentinel-2 MSI",
    "sar_sensor": "Sentinel-1 C-Band SAR (VV Polarisation, IW)",
    "suggested_queries": [
        "Analyze this region using both optical and SAR imagery.",
        "What areas show consistent information across optical and SAR imagery?",
        "Compare surface water detection between optical reflectance and SAR backscatter."
    ]
}
with open(os.path.join(BASE_DIR, "optical_sar", "metadata.json"), "w") as f:
    json.dump(meta_opt_sar, f, indent=2)

print("All demo data created successfully in /demo-data directory!")
