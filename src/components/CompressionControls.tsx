import React from 'react';
import { CompressionSettings } from '../types';
import { Target, Sliders, Check, Info } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface CompressionControlsProps {
  settings: CompressionSettings;
  originalSizeBytes: number;
  outputFormat: string;
  onChange: (settings: CompressionSettings) => void;
}

export const CompressionControls: React.FC<CompressionControlsProps> = ({
  settings,
  originalSizeBytes,
  outputFormat,
  onChange,
}) => {
  const presets: { value: number; unit: 'KB' | 'MB'; label: string }[] = [
    { value: 50, unit: 'KB', label: '50 KB' },
    { value: 100, unit: 'KB', label: '100 KB' },
    { value: 200, unit: 'KB', label: '200 KB' },
    { value: 500, unit: 'KB', label: '500 KB' },
    { value: 1, unit: 'MB', label: '1 MB' },
    { value: 2, unit: 'MB', label: '2 MB' },
  ];

  const targetBytes =
    settings.targetSizeUnit === 'MB'
      ? settings.targetSizeValue * 1024 * 1024
      : settings.targetSizeValue * 1024;

  const isOriginalAlreadySmaller =
    settings.mode === 'target-size' && originalSizeBytes <= targetBytes;

  const handleApplyPreset = (value: number, unit: 'KB' | 'MB') => {
    onChange({
      ...settings,
      mode: 'target-size',
      targetSizeValue: value,
      targetSizeUnit: unit,
    });
  };

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Compression Mode
        </label>
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => onChange({ ...settings, mode: 'target-size' })}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              settings.mode === 'target-size'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Target Max Size
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...settings, mode: 'quality' })}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              settings.mode === 'quality'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manual Quality
          </button>
        </div>
      </div>

      {settings.mode === 'target-size' ? (
        <div className="space-y-3.5">
          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
              Popular Size Caps
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {presets.map((preset) => {
                const isSelected =
                  settings.targetSizeValue === preset.value &&
                  settings.targetSizeUnit === preset.unit;
                return (
                  <button
                    key={`${preset.value}-${preset.unit}`}
                    id={`btn-preset-size-${preset.value}${preset.unit}`}
                    type="button"
                    onClick={() => handleApplyPreset(preset.value, preset.unit)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Size Input */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <span className="block text-[11px] font-semibold text-slate-600">
              Custom Maximum Target
            </span>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  id="input-custom-target-size"
                  type="number"
                  min="5"
                  max="10000"
                  value={settings.targetSizeValue}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      targetSizeValue: Math.max(1, parseFloat(e.target.value) || 1),
                    })
                  }
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* KB / MB unit selector */}
              <div className="inline-flex rounded-xl p-1 bg-white border border-slate-200 text-xs">
                <button
                  type="button"
                  id="btn-unit-kb"
                  onClick={() => onChange({ ...settings, targetSizeUnit: 'KB' })}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    settings.targetSizeUnit === 'KB'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  KB
                </button>
                <button
                  type="button"
                  id="btn-unit-mb"
                  onClick={() => onChange({ ...settings, targetSizeUnit: 'MB' })}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    settings.targetSizeUnit === 'MB'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  MB
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              ImageFit automatically tunes compression quality and downscales resolution step-by-step
              until the output is strictly below {settings.targetSizeValue} {settings.targetSizeUnit}.
            </p>
          </div>

          {/* Notice if original file is already smaller */}
          {isOriginalAlreadySmaller && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Original file ({formatBytes(originalSizeBytes)}) is already below your requested target of{' '}
                {settings.targetSizeValue} {settings.targetSizeUnit}. It will not be enlarged or unnecessarily degraded.
              </span>
            </div>
          )}

          {outputFormat === 'image/png' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                PNG format is lossless and lacks quality level compression. If needed to hit this target size,
                resolution will be scaled down, or switch to <strong>WebP</strong> for smaller files at full resolution.
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Manual Quality Mode */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Quality Rating:</span>
            <span className="font-bold text-sky-600 text-sm">{settings.qualityPercent}%</span>
          </div>

          <input
            id="input-quality-slider"
            type="range"
            min="10"
            max="100"
            step="1"
            value={settings.qualityPercent}
            onChange={(e) =>
              onChange({
                ...settings,
                qualityPercent: parseInt(e.target.value) || 80,
              })
            }
            className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Low (Smaller file)</span>
            <span>Balanced (80%)</span>
            <span>High (Max detail)</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Manual quality adjusts the lossy encoding factor directly without targeting an exact byte count.
          </p>
        </div>
      )}
    </div>
  );
};
