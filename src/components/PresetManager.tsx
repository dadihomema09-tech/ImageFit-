import React from 'react';
import {
  Globe,
  FileCheck,
  Mail,
  Share2,
  Printer,
  Minimize2,
  Sliders,
  Check,
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { IntentPresetId, ProcessingSettings } from '../types';

interface PresetManagerProps {
  selectedPreset: IntentPresetId;
  onSelectPreset: (presetId: IntentPresetId, suggestedSettings: Partial<ProcessingSettings>) => void;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  selectedPreset,
  onSelectPreset,
}) => {
  const getPresetIcon = (id: IntentPresetId) => {
    switch (id) {
      case 'website':
        return <Globe className="w-5 h-5 text-blue-500" />;
      case 'document':
        return <FileCheck className="w-5 h-5 text-emerald-500" />;
      case 'email':
        return <Mail className="w-5 h-5 text-amber-500" />;
      case 'social':
        return <Share2 className="w-5 h-5 text-purple-500" />;
      case 'printing':
        return <Printer className="w-5 h-5 text-rose-500" />;
      case 'smaller':
        return <Minimize2 className="w-5 h-5 text-cyan-500" />;
      case 'custom':
      default:
        return <Sliders className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            What are you trying to do?
          </h3>
          <p className="text-xs text-slate-500">
            Select an intent to auto-configure settings, or pick Custom for full control.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {APP_CONFIG.availablePresets.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          return (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              type="button"
              onClick={() => onSelectPreset(preset.id, preset.suggestedSettings)}
              className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between relative ${
                isSelected
                  ? 'border-sky-600 bg-sky-50/50 shadow-sm ring-1 ring-sky-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-sky-600 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                  {getPresetIcon(preset.id)}
                </div>
                <span className="font-semibold text-xs sm:text-sm text-slate-900 leading-tight">
                  {preset.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {preset.tagline}
              </p>
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-[11px] text-slate-400 italic">
        Note: Presets are recommendations based on common platform standards; exact requirements may vary by specific website.
      </p>
    </div>
  );
};
