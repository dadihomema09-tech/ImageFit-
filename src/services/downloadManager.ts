import JSZip from 'jszip';
import { ProcessedImageResult } from '../types';

export class DownloadManager {
  /**
   * Downloads a single processed image file
   */
  public static downloadSingle(result: ProcessedImageResult): void {
    const link = document.createElement('a');
    link.href = result.dataUrl;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Packages multiple processed images into a ZIP archive and triggers download
   */
  public static async downloadAllAsZip(
    results: ProcessedImageResult[],
    zipFilename = 'imagefit-processed-images.zip',
    onProgress?: (percent: number) => void
  ): Promise<void> {
    if (!results || results.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder('imagefit');

    // Add each file to the zip
    results.forEach((item, index) => {
      // Ensure unique filename if duplicate names exist
      const fileName = item.name || `image-${index + 1}.jpg`;
      folder?.file(fileName, item.blob);
    });

    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        if (onProgress) {
          onProgress(Math.round(metadata.percent));
        }
      }
    );

    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = zipFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up memory
    setTimeout(() => URL.revokeObjectURL(zipUrl), 10000);
  }
}
