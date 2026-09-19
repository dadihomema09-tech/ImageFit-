import React, { useState } from 'react';
import { BatchItem, ProcessedImageResult } from '../types';
import {
  Download,
  Archive,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { formatBytes, formatDimensions, getFormatLabel } from '../utils/formatters';
import { DownloadManager } from '../services/downloadManager';

interface BatchProcessorProps {
  items: BatchItem[];
  isProcessing: boolean;
  onProcessAll: () => void;
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export const BatchProcessor: React.FC<BatchProcessorProps> = ({
  items,
  isProcessing,
  onProcessAll,
  onRemoveItem,
  onClearAll,
}) => {
  const [zipProgress, setZipProgress] = useState<number | null>(null);

  const completedItems = items.filter((item) => item.status === 'done' && item.result);
  const isAllDone = items.length > 0 && completedItems.length === items.length;

  const handleDownloadSingle = (result: ProcessedImageResult) => {
    DownloadManager.downloadSingle(result);
  };

  const handleDownloadZip = async () => {
    const results = completedItems.map((i) => i.result!).filter(Boolean);
    if (results.length === 0) return;

    setZipProgress(0);
    try {
      await DownloadManager.downloadAllAsZip(results, 'imagefit-batch-images.zip', (pct) => {
        setZipProgress(pct);
      });
    } finally {
      setZipProgress(null);
    }
  };

  const totalOriginalBytes = items.reduce((acc, i) => acc + i.source.size, 0);
  const totalProcessedBytes = completedItems.reduce((acc, i) => acc + (i.result?.size || 0), 0);
  const totalSavingsBytes = Math.max(0, totalOriginalBytes - totalProcessedBytes);
  const overallSavingsPercent =
    totalOriginalBytes > 0 ? Math.round((totalSavingsBytes / totalOriginalBytes) * 100) : 0;

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Batch Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Batch Image Queue
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
              {items.length} {items.length === 1 ? 'image' : 'images'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Apply your configuration across all files simultaneously.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearAll}
            disabled={isProcessing}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Queue
          </button>

          {!isAllDone && (
            <button
              id="btn-batch-process-all"
              type="button"
              onClick={onProcessAll}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Processing Queue...' : 'Process All'}
            </button>
          )}

          {completedItems.length > 0 && (
            <button
              id="btn-download-zip"
              type="button"
              onClick={handleDownloadZip}
              disabled={zipProgress !== null}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Archive className="w-4 h-4" />
              {zipProgress !== null
                ? `Creating ZIP (${zipProgress}%)...`
                : `Download All as ZIP (${completedItems.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Batch Stats Bar */}
      {completedItems.length > 0 && (
        <div className="px-5 py-3 bg-emerald-50/50 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500">Completed:</span>{' '}
              <strong className="text-slate-900">
                {completedItems.length} of {items.length}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Overall Reduction:</span>{' '}
              <strong className="text-emerald-700">
                -{overallSavingsPercent}% ({formatBytes(totalSavingsBytes)} saved)
              </strong>
            </div>
          </div>
          <div className="text-slate-500">
            Total Size:{' '}
            <span className="line-through">{formatBytes(totalOriginalBytes)}</span> →{' '}
            <strong className="text-slate-900">{formatBytes(totalProcessedBytes)}</strong>
          </div>
        </div>
      )}

      {/* Item Cards List */}
      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {items.map((item, index) => {
          const res = item.result;
          return (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
            >
              {/* Thumbnail and Filename */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={res?.dataUrl || item.source.dataUrl}
                  alt={item.source.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.source.name}
                    </h4>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                      {getFormatLabel(item.source.format)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>{formatDimensions(item.source.width, item.source.height)}</span>
                    <span>•</span>
                    <span>{formatBytes(item.source.size)}</span>
                  </div>

                  {/* Status Indicator */}
                  {item.status === 'processing' && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-sky-500 rounded-full animate-pulse" />
                      </div>
                      <span className="text-[11px] text-sky-600 font-medium">Processing...</span>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.error || 'Failed to process'}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Processed Comparison Column */}
              {res && (
                <div className="flex flex-col sm:items-end text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="text-slate-400 line-through font-normal">
                      {formatBytes(item.source.size)}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-emerald-600">{formatBytes(res.size)}</span>
                    {res.sizeReductionPercent > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        -{res.sizeReductionPercent}%
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {formatDimensions(res.width, res.height)} • {getFormatLabel(res.format)} • {res.processingTimeMs}ms
                  </div>
                  {res.targetMet ? (
                    <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Target met
                    </span>
                  ) : res.targetExplanation ? (
                    <span className="text-[10px] text-amber-600 font-medium mt-0.5">
                      Target partially met
                    </span>
                  ) : null}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {res && (
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(res)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-200 transition-all"
                    title="Download individual file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  disabled={isProcessing}
                  className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                  title="Remove from batch"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
