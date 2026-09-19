import { PresetConfig, SupportedInputFormat, SupportedOutputFormat } from '../types';

export interface AppConfig {
  appName: string;
  version: string;
  adsEnabled: boolean;
  analyticsEnabled: boolean;
  batchProcessingEnabled: boolean;
  supportedInputFormats: SupportedInputFormat[];
  supportedOutputFormats: SupportedOutputFormat[];
  maximumPracticalFileSize: number; // bytes (e.g. 50 MB)
  warningFileSize: number; // bytes (e.g. 20 MB)
  availablePresets: PresetConfig[];
}

export const APP_CONFIG: AppConfig = {
  appName: 'ImageFit',
  version: '1.2.0',
  // Future advertising slot toggle - disabled by default
  adsEnabled: false,
  // Future analytics integration toggle - disabled by default
  analyticsEnabled: false,
  batchProcessingEnabled: true,
  supportedInputFormats: ['image/jpeg', 'image/png', 'image/webp'],
  supportedOutputFormats: ['image/jpeg', 'image/png', 'image/webp'],
  // 50 MB maximum recommended practical file size for in-browser canvas processing
  maximumPracticalFileSize: 50 * 1024 * 1024,
  warningFileSize: 20 * 1024 * 1024,
  availablePresets: [
    {
      id: 'website',
      label: 'Website upload',
      tagline: 'Fast web loading & modern WebP/JPEG',
      description: 'Compresses under 200 KB with max 1600px width for fast web page load times.',
      suggestedSettings: {
        outputFormat: 'image/webp',
        compression: {
          mode: 'target-size',
          targetSizeValue: 200,
          targetSizeUnit: 'KB',
          qualityPercent: 82,
        },
      },
    },
    {
      id: 'document',
      label: 'Document upload',
      tagline: 'Portals, job applications & forms',
      description: 'Optimized for portals requiring files under 500 KB while retaining crisp text clarity.',
      suggestedSettings: {
        outputFormat: 'image/jpeg',
        compression: {
          mode: 'target-size',
          targetSizeValue: 500,
          targetSizeUnit: 'KB',
          qualityPercent: 85,
        },
      },
    },
    {
      id: 'email',
      label: 'Email attachment',
      tagline: 'Inbox-friendly file size',
      description: 'Resizes to 1280px max dimension and limits file size to under 500 KB to avoid inbox bounces.',
      suggestedSettings: {
        outputFormat: 'image/jpeg',
        compression: {
          mode: 'target-size',
          targetSizeValue: 500,
          targetSizeUnit: 'KB',
          qualityPercent: 80,
        },
      },
    },
    {
      id: 'social',
      label: 'Social media',
      tagline: 'Standard social post dimensions',
      description: 'Generates high-fidelity images tuned for feed posts (e.g. 1200px width) under 1 MB.',
      suggestedSettings: {
        outputFormat: 'image/jpeg',
        compression: {
          mode: 'target-size',
          targetSizeValue: 1,
          targetSizeUnit: 'MB',
          qualityPercent: 90,
        },
      },
    },
    {
      id: 'printing',
      label: 'Printing',
      tagline: 'Maximum fidelity & uncompressed details',
      description: 'Preserves full original resolution and uses high quality (or lossless PNG) without aggressive downscaling.',
      suggestedSettings: {
        outputFormat: 'image/png',
        compression: {
          mode: 'quality',
          targetSizeValue: 2,
          targetSizeUnit: 'MB',
          qualityPercent: 100,
        },
      },
    },
    {
      id: 'smaller',
      label: 'Make file smaller',
      tagline: 'Strict 100 KB target compression',
      description: 'Aggressively compresses and scales image so it fits strict upload caps (100 KB target).',
      suggestedSettings: {
        outputFormat: 'image/webp',
        compression: {
          mode: 'target-size',
          targetSizeValue: 100,
          targetSizeUnit: 'KB',
          qualityPercent: 75,
        },
      },
    },
    {
      id: 'custom',
      label: 'Custom settings',
      tagline: 'Full manual control',
      description: 'Fine-tune exact pixel dimensions, cropping, target file size, and output formats.',
      suggestedSettings: {},
    },
  ],
};
