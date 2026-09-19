import React from 'react';
import { Shield, EyeOff, HardDrive, Cpu, AlertCircle } from 'lucide-react';

export const PrivacySection: React.FC = () => {
  return (
    <div className="w-full my-10 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Privacy & Architecture Guarantee
          </h3>
        </div>

        <p className="text-sm text-slate-700 font-medium mb-5 leading-relaxed">
          Your image is processed locally in your browser. Image files are not uploaded to our servers
          for processing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5">
              <EyeOff className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">No Data Collection</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We do not collect names, email addresses, phone numbers, or image contents. No user
              accounts are created.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
              <HardDrive className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Zero Cloud Storage</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Images never touch a remote database or cloud processing bucket. Pixels exist only in
              your local browser RAM.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">No AI Model Training</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your files are never transmitted to third-party AI APIs or used to train visual models.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Device and Memory Notice:</strong> Because computation occurs natively within your
            browser session, processing speeds and practical file limits depend on your device’s
            processor and available RAM. For best performance, processing files under 50 MB is
            recommended.
          </p>
        </div>
      </div>
    </div>
  );
};
