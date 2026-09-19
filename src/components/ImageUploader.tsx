import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, ShieldCheck, AlertCircle, Files } from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { formatBytes } from '../utils/formatters';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesSelected, isProcessing = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      // Validate type
      if (!APP_CONFIG.supportedInputFormats.includes(file.type as any)) {
        errors.push(`"${file.name}" is an unsupported format (${file.type || 'unknown'}). Please upload JPG, PNG, or WebP.`);
        return;
      }

      // Validate size
      if (file.size > APP_CONFIG.maximumPracticalFileSize) {
        errors.push(
          `"${file.name}" is ${formatBytes(file.size)}. Browser local memory limit is ${formatBytes(
            APP_CONFIG.maximumPracticalFileSize
          )}.`
        );
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setErrorMessage(errors[0]);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  return (
    <div className="w-full">
      <div
        id="dropzone-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-sky-500 bg-sky-50/70 scale-[1.005]'
            : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/70 shadow-sm'
        }`}
      >
        <input
          id="file-input-element"
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            // Reset input so re-uploading same file triggers change
            e.target.value = '';
          }}
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          {/* Animated Icon Circle */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105 ${
              isDragOver ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25' : 'bg-sky-50 text-sky-600'
            }`}
          >
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
            Drag & drop your images here
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-5">
            or tap anywhere to choose files from your device
          </p>

          {/* Primary Action Button for Mobile & Touch */}
          <button
            id="btn-select-images"
            type="button"
            disabled={isProcessing}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ImageIcon className="w-4 h-4" /> Select Image or Batch
          </button>

          {/* Format & Privacy Badges */}
          <div className="mt-6 pt-5 border-t border-slate-100 w-full flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="font-semibold text-slate-700">Supported:</span> JPG, PNG, WebP
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser Privacy
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1">
              <Files className="w-3.5 h-3.5 text-slate-400" /> Multiple files supported
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div
          id="upload-error-alert"
          className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-amber-700 hover:text-amber-900 text-xs font-semibold px-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
