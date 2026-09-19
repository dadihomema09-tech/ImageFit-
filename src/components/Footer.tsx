import React from 'react';
import { ShieldCheck, Cpu, Lock, Sparkles } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAbout,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
}) => {
  return (
    <footer className="mt-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900">ImageFit</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Fast, privacy-focused image utility. Prepare your photos and graphics for website uploads,
              job applications, passports, forms, and social media without sacrificing privacy.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4" /> Client-Side Only Processing
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Privacy & Performance Notice
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Your images are processed entirely in your web browser. Image files are never uploaded to
              our servers.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed flex items-start gap-1.5">
              <Cpu className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
              <span>Processing speed and memory limits depend on your device hardware and browser capacity.</span>
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Navigation & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="btn-footer-about"
                  onClick={onOpenAbout}
                  className="text-slate-600 hover:text-sky-600 transition-colors"
                >
                  About ImageFit
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-privacy"
                  onClick={onOpenPrivacy}
                  className="text-slate-600 hover:text-sky-600 transition-colors"
                >
                  Privacy Policy & Technical Scope
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-terms"
                  onClick={onOpenTerms}
                  className="text-slate-600 hover:text-sky-600 transition-colors"
                >
                  Terms of Use
                </button>
              </li>
              <li>
                <button
                  id="btn-footer-contact"
                  onClick={onOpenContact}
                  className="text-slate-600 hover:text-sky-600 transition-colors"
                >
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ImageFit. Built for high-speed client-side image optimization.</p>
          <p className="text-[11px] text-slate-400">
            Zero telemetry. No cloud accounts. No AI model training on your photos.
          </p>
        </div>
      </div>
    </footer>
  );
};
