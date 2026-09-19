export type SupportedInputFormat = 'image/jpeg' | 'image/png' | 'image/webp';
export type SupportedOutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export type OutputFormatExtension = 'jpg' | 'png' | 'webp';

export type IntentPresetId =
  | 'website'
  | 'document'
  | 'email'
  | 'social'
  | 'printing'
  | 'smaller'
  | 'custom';

export type AspectRatioPreset = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '9:16';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface CompressionSettings {
  mode: 'target-size' | 'quality';
  targetSizeValue: number; // in KB or MB numeric
  targetSizeUnit: 'KB' | 'MB';
  qualityPercent: number; // 1-100
}

export interface ResizeSettings {
  mode: 'pixels' | 'percentage';
  width: number;
  height: number;
  percentage: number;
  maintainAspectRatio: boolean;
  aspectRatio: number; // width / height
}

export interface ProcessingSettings {
  outputFormat: SupportedOutputFormat;
  resize: ResizeSettings;
  compression: CompressionSettings;
  crop: CropArea | null;
  cropApplied: boolean;
}

export interface SourceImageMeta {
  id: string;
  file: File;
  name: string;
  size: number; // bytes
  format: string;
  width: number;
  height: number;
  aspectRatio: number;
  dataUrl: string;
}

export interface ProcessedImageResult {
  id: string;
  sourceId: string;
  name: string;
  blob: Blob;
  dataUrl: string;
  size: number; // bytes
  width: number;
  height: number;
  format: SupportedOutputFormat;
  processingTimeMs: number;
  sizeReductionPercent: number;
  sizeReductionBytes: number;
  targetMet: boolean;
  targetExplanation?: string;
  warnings?: string[];
}

export interface BatchItem {
  id: string;
  source: SourceImageMeta;
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number; // 0 - 100
  result: ProcessedImageResult | null;
  error?: string;
}

export interface PresetConfig {
  id: IntentPresetId;
  label: string;
  tagline: string;
  description: string;
  suggestedSettings: Partial<ProcessingSettings>;
}
