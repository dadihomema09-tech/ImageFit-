import React from 'react';
import { APP_CONFIG } from '../config/appConfig';

interface AdSlotProps {
  slotId?: string;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slotId = 'default-slot', className = '' }) => {
  // Advertising is strictly disabled by default in config
  if (!APP_CONFIG.adsEnabled) {
    return null;
  }

  // When enabled in future via config, ad networks (e.g. Google AdSense) can mount here cleanly
  return (
    <div
      id={`ad-slot-${slotId}`}
      aria-label="Advertisement slot"
      className={`w-full max-w-3xl mx-auto my-6 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-100/50 flex flex-col items-center justify-center min-h-[90px] text-xs text-slate-400 ${className}`}
    >
      <span className="uppercase tracking-widest font-semibold text-[10px] text-slate-400 mb-1">
        Advertisement
      </span>
      <div id={`ad-container-${slotId}`} className="w-full flex items-center justify-center">
        {/* Future ad network script insertion point */}
      </div>
    </div>
  );
};
