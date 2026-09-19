import React from 'react';
import { ShieldCheck, Sparkles, SlidersHorizontal, Info, FileText } from 'lucide-react';

interface HeaderProps {
  onOpenAbout: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
  batchCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAbout,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
  batchCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-slate-900">ImageFit</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Local Browser Only
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">Privacy-focused image resize, compression & conversion</p>
          </div>
        </div>

        {/* Navigation & Trust Badges */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            id="btn-nav-about"
            onClick={onOpenAbout}
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            About
          </button>
          <button
            id="btn-nav-privacy"
            onClick={onOpenPrivacy}
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Privacy
          </button>
          <button
            id="btn-nav-terms"
            onClick={onOpenTerms}
            className="hidden md:inline-flex text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Terms
          </button>
          <button
            id="btn-nav-contact"
            onClick={onOpenContact}
            className="hidden sm:inline-flex text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Contact
          </button>
        </div>
      </div>
    </header>
  );
};
