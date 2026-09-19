import {
  ProcessedImageResult,
  ProcessingSettings,
  SourceImageMeta,
  SupportedInputFormat,
} from '../types';
import { APP_CONFIG } from '../config/appConfig';

class CompressionEngine {
  private worker: Worker | null = null;
  private workerSupported = typeof Worker !== 'undefined';

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    if (!this.workerSupported) return;
    try {
      this.worker = new Worker(new URL('../workers/imageWorker.ts', import.meta.url), {
        type: 'module',
      });
    } catch {
      // Graceful fallback to main-thread canvas
      this.worker = null;
    }
  }

  /**
   * Validates file format and size limits according to configuration
   */
  public validateFile(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file was provided.' };
    }

    const type = file.type as SupportedInputFormat;
    if (!APP_CONFIG.supportedInputFormats.includes(type)) {
      return {
        valid: false,
        error: `Unsupported format "${file.type || 'unknown'}". ImageFit supports JPG, PNG, and WebP images.`,
      };
    }

    if (file.size > APP_CONFIG.maximumPracticalFileSize) {
      return {
        valid: false,
        error: `File is ${(file.size / (1024 * 1024)).toFixed(1)} MB. To prevent browser memory exhaustion, please upload files under 50 MB.`,
      };
    }

    return { valid: true };
  }

  /**
   * Reads a File and extracts dimensional metadata safely
   */
  public async loadSourceImage(file: File): Promise<SourceImageMeta> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onerror = () => reject(new Error('Unable to decode image. The file may be corrupted.'));
        img.onload = () => {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          if (!width || !height) {
            reject(new Error('Image has zero or invalid dimensions.'));
            return;
          }

          resolve({
            id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            name: file.name,
            size: file.size,
            format: file.type,
            width,
            height,
            aspectRatio: width / height,
            dataUrl,
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Processes the image using Web Worker with seamless fallback to canvas.toBlob()
   */
  public async processImage(
    source: SourceImageMeta,
    settings: ProcessingSettings
  ): Promise<ProcessedImageResult> {
    const startTime = performance.now();

    // Try processing via Web Worker if available
    if (this.worker && typeof createImageBitmap === 'function' && typeof OffscreenCanvas !== 'undefined') {
      try {
        return await this.processWithWorker(source, settings, startTime);
      } catch (err) {
        console.warn('Worker processing failed, falling back to main-thread canvas:', err);
      }
    }

    // Fallback directly to main-thread canvas
    return await this.processWithMainThreadCanvas(source, settings, startTime);
  }

  private processWithWorker(
    source: SourceImageMeta,
    settings: ProcessingSettings,
    startTime: number
  ): Promise<ProcessedImageResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const bitmap = await createImageBitmap(source.file);
        const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Worker processing timed out. Reverting to standard canvas.'));
        }, 30000);

        const onMsg = (e: MessageEvent) => {
          if (e.data.id !== jobId) return;
          clearTimeout(timeout);
          cleanup();

          if (!e.data.success) {
            reject(new Error(e.data.error || 'Worker failed to process image.'));
            return;
          }

          const {
            blob,
            width,
            height,
            format,
            processingTimeMs,
            sizeReductionPercent,
            sizeReductionBytes,
            targetMet,
            targetExplanation,
            warnings,
          } = e.data;

          const dataUrl = URL.createObjectURL(blob);
          const baseName = source.name.replace(/\.[^/.]+$/, '');
          const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';

          resolve({
            id: `res-${Date.now()}`,
            sourceId: source.id,
            name: `${baseName}-imagefit.${ext}`,
            blob,
            dataUrl,
            size: blob.size,
            width,
            height,
            format,
            processingTimeMs: processingTimeMs || Math.round(performance.now() - startTime),
            sizeReductionPercent,
            sizeReductionBytes,
            targetMet,
            targetExplanation,
            warnings,
          });
        };

        const cleanup = () => {
          if (this.worker) {
            this.worker.removeEventListener('message', onMsg);
          }
        };

        if (!this.worker) {
          throw new Error('Worker was destroyed.');
        }

        this.worker.addEventListener('message', onMsg);
        this.worker.postMessage(
          {
            id: jobId,
            bitmap,
            originalSize: source.size,
            settings: {
              outputFormat: settings.outputFormat,
              resize: settings.resize,
              compression: settings.compression,
              crop: settings.cropApplied ? settings.crop : null,
            },
          },
          [bitmap] // transfer ImageBitmap
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Main-thread fallback using standard HTMLCanvasElement and canvas.toBlob()
   */
  private async processWithMainThreadCanvas(
    source: SourceImageMeta,
    settings: ProcessingSettings,
    startTime: number
  ): Promise<ProcessedImageResult> {
    const { outputFormat, resize, compression, crop, cropApplied } = settings;

    const img = await this.loadImageElement(source.dataUrl);

    // 1. Crop boundaries
    const activeCrop = cropApplied && crop ? crop : null;
    const cropX = activeCrop ? Math.max(0, Math.floor(activeCrop.x)) : 0;
    const cropY = activeCrop ? Math.max(0, Math.floor(activeCrop.y)) : 0;
    const cropW = activeCrop ? Math.min(img.naturalWidth - cropX, Math.floor(activeCrop.width)) : img.naturalWidth;
    const cropH = activeCrop ? Math.min(img.naturalHeight - cropY, Math.floor(activeCrop.height)) : img.naturalHeight;

    // 2. Initial target dimensions
    let initialTargetW = Math.max(1, Math.round(resize.width || cropW));
    let initialTargetH = Math.max(1, Math.round(resize.height || cropH));

    if (resize.mode === 'percentage') {
      const scale = (resize.percentage || 100) / 100;
      initialTargetW = Math.max(1, Math.round(cropW * scale));
      initialTargetH = Math.max(1, Math.round(cropH * scale));
    }

    const targetBytes =
      compression.mode === 'target-size'
        ? compression.targetSizeUnit === 'MB'
          ? compression.targetSizeValue * 1024 * 1024
          : compression.targetSizeValue * 1024
        : 0;

    const canvasToBlob = (
      w: number,
      h: number,
      format: string,
      quality?: number
    ): Promise<Blob> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { alpha: format !== 'image/jpeg' });
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable.'));
          return;
        }

        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('canvas.toBlob returned null.'));
          },
          format,
          quality !== undefined ? Math.max(0.05, Math.min(1.0, quality)) : undefined
        );
      });
    };

    let finalBlob: Blob;
    let finalW = initialTargetW;
    let finalH = initialTargetH;
    let targetMet = false;
    let targetExplanation: string | undefined = undefined;
    const warnings: string[] = [];

    if (compression.mode === 'quality') {
      const q = compression.qualityPercent / 100;
      finalBlob = await canvasToBlob(finalW, finalH, outputFormat, q);
      targetMet = true;
    } else {
      // TARGET SIZE MODE
      const isAlreadySmaller = source.size <= targetBytes;

      if (outputFormat === 'image/png') {
        let scale = 1.0;
        let blob = await canvasToBlob(finalW, finalH, outputFormat);

        if (blob.size <= targetBytes) {
          finalBlob = blob;
          targetMet = true;
        } else {
          warnings.push('PNG is a lossless format. Dimensions were scaled down to reach your target file size.');
          let iterations = 0;
          while (blob.size > targetBytes && iterations < 10 && (finalW > 40 && finalH > 40)) {
            iterations++;
            scale *= 0.82;
            finalW = Math.max(20, Math.round(initialTargetW * scale));
            finalH = Math.max(20, Math.round(initialTargetH * scale));
            blob = await canvasToBlob(finalW, finalH, outputFormat);
          }
          finalBlob = blob;
          targetMet = blob.size <= targetBytes;
          if (!targetMet) {
            targetExplanation = `Could not reach ${(targetBytes / 1024).toFixed(0)} KB in PNG format without severe degradation. Convert to WebP for smaller file size.`;
          }
        }
      } else {
        // JPEG or WebP
        let currentScale = 1.0;
        let bestBlob: Blob | null = null;
        let dimensionSteps = 0;
        const maxDimensionSteps = 10;

        while (dimensionSteps < maxDimensionSteps) {
          const testW = Math.max(20, Math.round(initialTargetW * currentScale));
          const testH = Math.max(20, Math.round(initialTargetH * currentScale));

          let lowQ = 0.08;
          let highQ = isAlreadySmaller ? 0.95 : 0.92;
          let matchedBlobForThisScale: Blob | null = null;

          for (let iter = 0; iter < 7; iter++) {
            const midQ = (lowQ + highQ) / 2;
            const candidateBlob = await canvasToBlob(testW, testH, outputFormat, midQ);

            if (candidateBlob.size <= targetBytes) {
              matchedBlobForThisScale = candidateBlob;
              lowQ = midQ;
            } else {
              highQ = midQ;
            }
          }

          if (matchedBlobForThisScale) {
            bestBlob = matchedBlobForThisScale;
            finalW = testW;
            finalH = testH;
            targetMet = true;
            break;
          }

          const lowestQBlob = await canvasToBlob(testW, testH, outputFormat, 0.08);
          if (lowestQBlob.size <= targetBytes) {
            bestBlob = lowestQBlob;
            finalW = testW;
            finalH = testH;
            targetMet = true;
            break;
          }

          dimensionSteps++;
          currentScale *= 0.78;
          if (testW < 50 || testH < 50) {
            bestBlob = lowestQBlob;
            finalW = testW;
            finalH = testH;
            break;
          }
        }

        if (bestBlob && targetMet) {
          finalBlob = bestBlob;
        } else {
          finalBlob = bestBlob || (await canvasToBlob(finalW, finalH, outputFormat, 0.1));
          targetMet = finalBlob.size <= targetBytes;
          if (!targetMet) {
            const targetKb = Math.round(targetBytes / 1024);
            const reachedKb = (finalBlob.size / 1024).toFixed(1);
            targetExplanation = `Reached minimum practical resolution (${finalW}×${finalH}px) at ${reachedKb} KB. Requested target of ${targetKb} KB is too small for this image.`;
          }
        }
      }
    }

    const processingTimeMs = Math.round(performance.now() - startTime);
    const sizeReductionBytes = Math.max(0, source.size - finalBlob.size);
    const sizeReductionPercent =
      source.size > 0 ? Math.round(((source.size - finalBlob.size) / source.size) * 100) : 0;

    const dataUrl = URL.createObjectURL(finalBlob);
    const baseName = source.name.replace(/\.[^/.]+$/, '');
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/png' ? 'png' : 'webp';

    return {
      id: `res-${Date.now()}`,
      sourceId: source.id,
      name: `${baseName}-imagefit.${ext}`,
      blob: finalBlob,
      dataUrl,
      size: finalBlob.size,
      width: finalW,
      height: finalH,
      format: outputFormat,
      processingTimeMs,
      sizeReductionPercent,
      sizeReductionBytes,
      targetMet,
      targetExplanation,
      warnings,
    };
  }

  private loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image element.'));
      img.src = src;
    });
  }
}

export const compressionEngine = new CompressionEngine();
