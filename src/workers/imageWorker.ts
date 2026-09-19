/// <reference lib="webworker" />

interface WorkerPayload {
  id: string;
  bitmap: ImageBitmap;
  originalSize: number;
  settings: {
    outputFormat: 'image/jpeg' | 'image/png' | 'image/webp';
    resize: {
      mode: 'pixels' | 'percentage';
      width: number;
      height: number;
      percentage: number;
      maintainAspectRatio: boolean;
      aspectRatio: number;
    };
    compression: {
      mode: 'target-size' | 'quality';
      targetSizeValue: number;
      targetSizeUnit: 'KB' | 'MB';
      qualityPercent: number;
    };
    crop: {
      x: number;
      y: number;
      width: number;
      height: number;
    } | null;
  };
}

self.onmessage = async (e: MessageEvent<WorkerPayload>) => {
  const { id, bitmap, originalSize, settings } = e.data;
  const startTime = performance.now();

  try {
    const { outputFormat, resize, compression, crop } = settings;

    // 1. Determine base crop dimensions
    const cropX = crop ? Math.max(0, Math.floor(crop.x)) : 0;
    const cropY = crop ? Math.max(0, Math.floor(crop.y)) : 0;
    const cropW = crop ? Math.min(bitmap.width - cropX, Math.floor(crop.width)) : bitmap.width;
    const cropH = crop ? Math.min(bitmap.height - cropY, Math.floor(crop.height)) : bitmap.height;

    // 2. Determine target dimensions after resize
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

    // Helper to render on OffscreenCanvas and encode to Blob
    const renderToBlob = async (
      w: number,
      h: number,
      format: string,
      quality?: number
    ): Promise<Blob> => {
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext('2d', { alpha: format !== 'image/jpeg' });
      if (!ctx) throw new Error('Could not get 2d context on OffscreenCanvas');

      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, w, h);

      return await canvas.convertToBlob({
        type: format,
        quality: quality !== undefined ? Math.max(0.05, Math.min(1.0, quality)) : undefined,
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
      finalBlob = await renderToBlob(finalW, finalH, outputFormat, q);
      targetMet = true;
    } else {
      // TARGET SIZE MODE
      // "If the original is already smaller than the target, don't make it larger."
      const isAlreadySmaller = originalSize <= targetBytes;

      if (outputFormat === 'image/png') {
        // PNG is lossless in standard canvas. Quality parameter has no effect.
        // We must reduce dimensions if needed to hit target size.
        let scale = 1.0;
        let blob = await renderToBlob(finalW, finalH, outputFormat);

        if (blob.size <= targetBytes) {
          finalBlob = blob;
          targetMet = true;
        } else {
          warnings.push('PNG is a lossless format. Dimensions were reduced to meet your target file size.');
          let iterations = 0;
          while (blob.size > targetBytes && iterations < 12 && (finalW > 40 && finalH > 40)) {
            iterations++;
            scale *= 0.82;
            finalW = Math.max(20, Math.round(initialTargetW * scale));
            finalH = Math.max(20, Math.round(initialTargetH * scale));
            blob = await renderToBlob(finalW, finalH, outputFormat);
          }
          finalBlob = blob;
          targetMet = blob.size <= targetBytes;
          if (!targetMet) {
            targetExplanation = `Could not compress PNG below ${(targetBytes / 1024).toFixed(0)} KB because PNG is lossless. Try converting to WebP or JPEG for better compression.`;
          }
        }
      } else {
        // JPEG or WebP: repeatedly adjust quality and, if necessary, reduce dimensions
        let currentScale = 1.0;
        let bestBlob: Blob | null = null;
        let dimensionSteps = 0;
        const maxDimensionSteps = 10;

        while (dimensionSteps < maxDimensionSteps) {
          const testW = Math.max(20, Math.round(initialTargetW * currentScale));
          const testH = Math.max(20, Math.round(initialTargetH * currentScale));

          // Binary search for highest quality that produces blob.size <= targetBytes
          let lowQ = 0.08;
          let highQ = isAlreadySmaller ? 0.95 : 0.92;
          let matchedBlobForThisScale: Blob | null = null;

          for (let iter = 0; iter < 7; iter++) {
            const midQ = (lowQ + highQ) / 2;
            const candidateBlob = await renderToBlob(testW, testH, outputFormat, midQ);

            if (candidateBlob.size <= targetBytes) {
              matchedBlobForThisScale = candidateBlob;
              lowQ = midQ; // Try higher quality
            } else {
              highQ = midQ; // Needs lower quality
            }
          }

          if (matchedBlobForThisScale) {
            bestBlob = matchedBlobForThisScale;
            finalW = testW;
            finalH = testH;
            targetMet = true;
            break; // Target successfully met!
          }

          // If even lowest quality on this resolution failed, test lowest quality blob to check gap
          const lowestQBlob = await renderToBlob(testW, testH, outputFormat, 0.08);
          if (lowestQBlob.size <= targetBytes) {
            bestBlob = lowestQBlob;
            finalW = testW;
            finalH = testH;
            targetMet = true;
            break;
          }

          // Reduce dimensions and loop
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
          // If still over target:
          finalBlob = bestBlob || (await renderToBlob(finalW, finalH, outputFormat, 0.1));
          targetMet = finalBlob.size <= targetBytes;
          if (!targetMet) {
            const targetKb = Math.round(targetBytes / 1024);
            const reachedKb = (finalBlob.size / 1024).toFixed(1);
            targetExplanation = `Reached minimum practical resolution (${finalW}×${finalH}px) at ${reachedKb} KB. The requested target of ${targetKb} KB is too small for this image.`;
          }
        }
      }
    }

    const processingTimeMs = Math.round(performance.now() - startTime);
    const sizeReductionBytes = Math.max(0, originalSize - finalBlob.size);
    const sizeReductionPercent =
      originalSize > 0 ? Math.round(((originalSize - finalBlob.size) / originalSize) * 100) : 0;

    // Send back response
    self.postMessage({
      id,
      success: true,
      blob: finalBlob,
      width: finalW,
      height: finalH,
      format: outputFormat,
      processingTimeMs,
      sizeReductionPercent,
      sizeReductionBytes,
      targetMet,
      targetExplanation,
      warnings,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown image processing error in worker';
    self.postMessage({
      id,
      success: false,
      error: errMessage,
    });
  }
};
