import React from 'react';
import { ResizeSettings, ImageDimensions } from '../types';
import { Lock, Unlock, AlertTriangle, Maximize2, Percent } from 'lucide-react';
import { formatDimensions } from '../utils/formatters';

interface ImageResizerProps {
  settings: ResizeSettings;
  originalDimensions: ImageDimensions;
  onChange: (settings: ResizeSettings) => void;
}

export const ImageResizer: React.FC<ImageResizerProps> = ({
  settings,
  originalDimensions,
  onChange,
}) => {
  const originalRatio = originalDimensions.width / originalDimensions.height;
  const currentRatio = settings.width / settings.height;
  const isDistorted =
    !settings.maintainAspectRatio &&
    Math.abs(currentRatio - originalRatio) > 0.05 &&
    settings.mode === 'pixels';

  const handleWidthChange = (val: number) => {
    const width = Math.max(1, Math.round(val));
    if (settings.maintainAspectRatio) {
      const height = Math.max(1, Math.round(width / originalRatio));
      onChange({ ...settings, width, height });
    } else {
      onChange({ ...settings, width });
    }
  };

  const handleHeightChange = (val: number) => {
    const height = Math.max(1, Math.round(val));
    if (settings.maintainAspectRatio) {
      const width = Math.max(1, Math.round(height * originalRatio));
      onChange({ ...settings, width, height });
    } else {
      onChange({ ...settings, height });
    }
  };

  const toggleMaintainRatio = () => {
    const newMaintain = !settings.maintainAspectRatio;
    if (newMaintain) {
      // Re-align height to width based on original ratio
      const height = Math.max(1, Math.round(settings.width / originalRatio));
      onChange({ ...settings, maintainAspectRatio: true, height });
    } else {
      onChange({ ...settings, maintainAspectRatio: false });
    }
  };

  const handlePercentageChange = (pct: number) => {
    const percentage = Math.max(10, Math.min(300, Math.round(pct)));
    const scale = percentage / 100;
    const width = Math.max(1, Math.round(originalDimensions.width * scale));
    const height = Math.max(1, Math.round(originalDimensions.height * scale));
    onChange({ ...settings, percentage, width, height });
  };

  const applyPresetDimensions = (w: number, h: number) => {
    onChange({
      ...settings,
      mode: 'pixels',
      width: w,
      height: h,
      maintainAspectRatio: false, // presets may have specific crop/ratios
    });
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Resize Mode
        </label>
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => onChange({ ...settings, mode: 'pixels' })}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              settings.mode === 'pixels'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pixels (px)
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...settings, mode: 'percentage' })}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              settings.mode === 'percentage'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Percentage (%)
          </button>
        </div>
      </div>

      {/* Pixels Mode Controls */}
      {settings.mode === 'pixels' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 mb-1">Width (px)</span>
              <input
                id="input-resize-width"
                type="number"
                min="10"
                max="12000"
                value={settings.width}
                onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            <div className="pt-5 flex flex-col items-center">
              <button
                type="button"
                onClick={toggleMaintainRatio}
                title={
                  settings.maintainAspectRatio
                    ? 'Aspect ratio locked'
                    : 'Aspect ratio unlocked (image may distort)'
                }
                className={`p-2 rounded-xl border transition-all ${
                  settings.maintainAspectRatio
                    ? 'bg-sky-50 border-sky-300 text-sky-600'
                    : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
              >
                {settings.maintainAspectRatio ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4" />
                )}
              </button>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-slate-500 mb-1">Height (px)</span>
              <input
                id="input-resize-height"
                type="number"
                min="10"
                max="12000"
                value={settings.height}
                onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Common Dimensions</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  applyPresetDimensions(originalDimensions.width, originalDimensions.height)
                }
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
              >
                Original ({originalDimensions.width}×{originalDimensions.height})
              </button>
              <button
                type="button"
                onClick={() => applyPresetDimensions(1920, 1080)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
              >
                1080p (1920×1080)
              </button>
              <button
                type="button"
                onClick={() => applyPresetDimensions(1200, 630)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
              >
                Social Share (1200×630)
              </button>
              <button
                type="button"
                onClick={() => applyPresetDimensions(1080, 1080)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
              >
                Square (1080×1080)
              </button>
              <button
                type="button"
                onClick={() => applyPresetDimensions(800, 600)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
              >
                Standard (800×600)
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Percentage Mode Controls */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Scale Scale Factor:</span>
            <span className="font-bold text-sky-600 text-sm">{settings.percentage}%</span>
          </div>

          <input
            id="input-resize-percent-slider"
            type="range"
            min="10"
            max="200"
            step="5"
            value={settings.percentage}
            onChange={(e) => handlePercentageChange(parseInt(e.target.value) || 100)}
            className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between gap-1.5">
            {[25, 50, 75, 100, 150].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentageChange(pct)}
                className={`flex-1 py-1 text-xs rounded-lg border font-medium transition-all ${
                  settings.percentage === pct
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Resulting size:</span>
            <span className="font-semibold text-slate-900">
              {formatDimensions(
                Math.round(originalDimensions.width * (settings.percentage / 100)),
                Math.round(originalDimensions.height * (settings.percentage / 100))
              )}
            </span>
          </div>
        </div>
      )}

      {/* Distortion Warning */}
      {isDistorted && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Distortion Warning:</strong> Aspect ratio is unlocked. Changing dimensions
            unequally will stretch or squash the image.
          </span>
        </div>
      )}
    </div>
  );
};
