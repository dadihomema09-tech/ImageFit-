import React, { useState } from 'react';
import { ProcessedImageResult, SourceImageMeta } from '../types';
import {
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Maximize2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { formatBytes, formatDimensions, getFormatLabel } from '../utils/formatters';
import { DownloadManager } from '../services/downloadManager';

interface ImagePreviewProps {
  source: SourceImageMeta;
  result: ProcessedImageResult | null;
  isProcessing: boolean;
  onReset: () => void;
  onOpenCrop: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  source,
  result,
  isProcessing,
  onReset,
  onOpenCrop,
}) => {
  const [viewMode, setViewMode] = useState<'comparison' | 'processed' | 'original'>('comparison');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleDownload = () => {
    if (result) {
      DownloadManager.downloadSingle(result);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top bar with image info and view toggle */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {source.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{getFormatLabel(source.format)}</span>
              <span>•</span>
              <span>{formatDimensions(source.width, source.height)}</span>
              <span>•</span>
              <span>{formatBytes(source.size)}</span>
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/70 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('comparison')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'comparison'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side by Side
          </button>
          <button
            type="button"
            onClick={() => setViewMode('processed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'processed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Processed
          </button>
          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'original'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {/* Visual Canvas Stage */}
      <div className="relative bg-slate-950 p-4 sm:p-6 min-h-[280px] max-h-[500px] flex items-center justify-center overflow-hidden">
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-white">
            <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold">Processing image in browser...</p>
            <p className="text-xs text-slate-400 mt-1">Applying crop, scaling & iterative quality search</p>
          </div>
        )}

        {viewMode === 'comparison' && result ? (
          <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px]">
            {/* Original Card */}
            <div className="flex flex-col items-center justify-center bg-slate-900/60 rounded-xl p-2 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Original ({formatBytes(source.size)})
              </span>
              <img
                src={source.dataUrl}
                alt="Original preview"
                className="max-h-[360px] max-w-full object-contain rounded-lg"
              />
            </div>
            {/* Processed Card */}
            <div className="flex flex-col items-center justify-center bg-slate-900/60 rounded-xl p-2 border border-slate-800">
              <span className="text-[11px] font-semibold text-sky-400 mb-2 uppercase tracking-wider">
                Processed Result ({formatBytes(result.size)})
              </span>
              <img
                src={result.dataUrl}
                alt="Processed output preview"
                className="max-h-[360px] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center max-h-[460px]">
            <img
              src={viewMode === 'original' || !result ? source.dataUrl : result.dataUrl}
              alt="Preview"
              className="max-h-[420px] max-w-full object-contain rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Fullscreen Expand Button */}
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700 backdrop-blur transition-all"
          title="View Full Size"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics & Processing Results Summary */}
      {result && (
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {/* Metric 1: Size Progression */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Size Change
              </span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">
                <span className="text-slate-500 line-through font-normal">{formatBytes(source.size)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-emerald-600">{formatBytes(result.size)}</span>
              </div>
            </div>

            {/* Metric 2: Percentage Saved */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Reduction
              </span>
              <div className="text-xs sm:text-sm font-bold text-emerald-600">
                {result.sizeReductionPercent > 0 ? (
                  <>
                    -{result.sizeReductionPercent}%{' '}
                    <span className="text-[11px] font-medium text-slate-500">
                      ({formatBytes(result.sizeReductionBytes)} saved)
                    </span>
                  </>
                ) : (
                  <span className="text-slate-600 font-normal">Original kept optimal</span>
                )}
              </div>
            </div>

            {/* Metric 3: Dimensions */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Output Dimensions
              </span>
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                {formatDimensions(result.width, result.height)}
              </div>
            </div>

            {/* Metric 4: Format & Processing Time */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Format & Time
              </span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">
                <span>{getFormatLabel(result.format)}</span>
                <span className="text-slate-300">•</span>
                <span className="font-normal text-slate-500 inline-flex items-center gap-0.5 text-xs">
                  <Clock className="w-3 h-3" /> {result.processingTimeMs} ms
                </span>
              </div>
            </div>
          </div>

          {/* Target Met or Honest Explanation Callout */}
          {result.targetMet ? (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Target Met:</strong> File size is genuinely below your requested threshold.
              </span>
            </div>
          ) : result.targetExplanation ? (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong>Target Note:</strong> {result.targetExplanation}
              </div>
            </div>
          ) : null}

          {/* Primary Action Button Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenCrop}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-all"
              >
                Crop Image
              </button>
              <button
                type="button"
                onClick={onReset}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Upload Another
              </button>
            </div>

            {/* Download Button */}
            <button
              id="btn-download-result"
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" /> Download Processed Image ({formatBytes(result.size)})
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Zoom Modal */}
      {isFullscreen && (
        <div
          id="fullscreen-preview-modal"
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={result ? result.dataUrl : source.dataUrl}
              alt="Full Preview"
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />
            <p className="text-white/70 text-xs mt-3">Click anywhere to close full screen</p>
          </div>
        </div>
      )}
    </div>
  );
};
