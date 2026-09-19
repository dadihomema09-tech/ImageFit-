import React from 'react';
import { SupportedOutputFormat } from '../types';
import { Info, Sparkles } from 'lucide-react';

interface FormatConverterProps {
  currentFormat: SupportedOutputFormat;
  originalFormat: string;
  onChangeFormat: (format: SupportedOutputFormat) => void;
}

export const FormatConverter: React.FC<FormatConverterProps> = ({
  currentFormat,
  originalFormat,
  onChangeFormat,
}) => {
  const formats: {
    id: SupportedOutputFormat;
    label: string;
    badge: string;
    description: string;
    transparencyNote: string;
  }[] = [
    {
      id: 'image/webp',
      label: 'WebP',
      badge: 'Recommended',
      description: 'Modern high-efficiency format. Excellent compression and supports transparent backgrounds.',
      transparencyNote: 'Preserves transparency perfectly with minimal file size.',
    },
    {
      id: 'image/jpeg',
      label: 'JPG / JPEG',
      badge: 'Universal',
      description: 'Widely compatible across all browsers and operating systems. Ideal for photography.',
      transparencyNote: 'Does NOT support transparency. Transparent areas will render on a clean white background.',
    },
    {
      id: 'image/png',
      label: 'PNG',
      badge: 'Lossless',
      description: 'Lossless quality and full alpha channel support. Best for graphics, logos, and screenshots.',
      transparencyNote: 'Preserves full transparency. Notice: File size will be larger because compression is lossless.',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Target Output Format
        </label>
        <span className="text-[11px] text-slate-400">
          Original:{' '}
          {originalFormat.includes('jpeg') || originalFormat.includes('jpg')
            ? 'JPEG'
            : originalFormat.includes('png')
            ? 'PNG'
            : 'WebP'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {formats.map((fmt) => {
          const isSelected = currentFormat === fmt.id;
          return (
            <button
              key={fmt.id}
              id={`format-btn-${fmt.label.toLowerCase().replace(/[^a-z]/g, '')}`}
              type="button"
              onClick={() => onChangeFormat(fmt.id)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-sky-600 bg-sky-50/60 shadow-xs ring-1 ring-sky-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">{fmt.label}</span>
                {fmt.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {fmt.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{fmt.id.split('/')[1].toUpperCase()}</p>
            </button>
          );
        })}
      </div>

      {/* Format Explanation Notice */}
      {(() => {
        const activeFmt = formats.find((f) => f.id === currentFormat);
        if (!activeFmt) return null;
        return (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="flex items-center gap-1.5 font-medium text-slate-800">
              <Info className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>{activeFmt.description}</span>
            </p>
            <p className="text-slate-500 pl-5 text-[11px] leading-relaxed">
              <strong>Transparency & Size:</strong> {activeFmt.transparencyNote}
            </p>
          </div>
        );
      })()}
    </div>
  );
};
