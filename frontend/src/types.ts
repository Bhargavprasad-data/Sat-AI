export interface DemoScenario {
  id: string;
  title: string;
  short_name: string;
  is_primary: boolean;
  modality: 'Optical' | 'SAR' | 'Optical + SAR';
  tag: string;
  description: string;
  dates: string[];
  image_1_preview: string;
  image_2_preview: string | null;
  suggested_queries: string[];
}

export interface SpatialValidationCheck {
  check: string;
  result: string;
  status: 'ok' | 'warning' | 'info';
}

export interface ExecutionTraceStep {
  step: string;
  detail: string;
}

export interface HowItWorkedStage {
  stage: string;
  summary: string;
}

export interface GeospatialMetadata {
  crs: string;
  crs_name?: string;
  resolution: string;
  date: string;
  bands: string;
  modality: 'Optical' | 'SAR' | 'Bi-temporal' | 'Optical + SAR';
  format?: string;
  dimensions?: string;
}

export interface UploadResponse {
  success: boolean;
  filename?: string;
  file_id?: string;
  preview_url?: string;
  geospatial_metadata?: GeospatialMetadata;
  message?: string;
  error_type?: string;
  suggestion?: string;
}

export interface AnalysisEvidence {
  before_image?: string;
  after_image?: string;
  change_map?: string;
  heatmap_overlay?: string;
  optical_image?: string;
  sar_image?: string;
  fusion_image?: string;
  optical_contribution?: string;
  sar_contribution?: string;
  image?: string;
  segmentation_mask?: string;
  is_custom?: boolean;
  geospatial_metadata_1?: GeospatialMetadata;
  geospatial_metadata_2?: GeospatialMetadata;
  classes_detected?: Array<{ name: string; share: string; color: string }>;
  qa_metrics?: {
    sift_rmse?: number;
    cloud_contamination?: number;
    decision_margin?: number;
    lower_km2?: number;
    upper_km2?: number;
    temporal_interval?: string;
  };
  spatial_validation: SpatialValidationCheck[];
}

export interface AnalysisStatistics {
  area_km2?: string;
  percentage_change?: string;
  changed_pixels?: number;
  total_pixels?: number;
  resolution?: string;
  predominant_class?: string;
  river_length_in_roi?: string;
  built_up_sector?: string;
  high_backscatter_area?: string;
  low_backscatter_area?: string;
  optical_resolution?: string;
  sar_resolution?: string;
  confidence_available: boolean;
  confidence_score?: string;
  confidence_note?: string;
  spatial_dimensions?: string;
}

export interface AnalysisReliability {
  level: string;
  basis: string;
}

export interface AnalysisResult {
  job_id: string;
  query: string;
  scenario_id?: string;
  answer: string;
  task: 'change_detection' | 'visual_question_answering' | 'optical_sar_joint' | 'sar_structural_mapping';
  modality: string;
  method: string;
  status: 'demo_result' | 'live_result';
  evidence: AnalysisEvidence;
  statistics: AnalysisStatistics;
  reliability: AnalysisReliability;
  limitations: string[];
  execution_trace: ExecutionTraceStep[];
  how_it_worked: HowItWorkedStage[];
}

export type ResultTab = 'region' | 'mask' | 'charts' | 'report' | 'trace';

