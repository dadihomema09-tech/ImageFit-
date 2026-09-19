import React from 'react';
import { X, ShieldCheck, FileText, Info, Mail, Cpu, CheckCircle } from 'lucide-react';

interface ModalWrapperProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ title, icon, onClose, children }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              {icon}
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {children}
        </div>

        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper title="About ImageFit" icon={<Info className="w-4 h-4" />} onClose={onClose}>
    <p>
      <strong>ImageFit</strong> is an open, privacy-focused image utility engineered to help users
      resize, compress, crop, and convert graphics without needing to upload sensitive files to remote
      servers.
    </p>
    <p>
      Whether you are submitting an ID photo for a government portal, attaching proof documents to a
      job application, optimizing images for a lightweight blog post, or formatting social media
      banners, ImageFit provides instantaneous client-side processing.
    </p>
    <h4 className="font-bold text-slate-900 text-sm pt-2">How It Works Under the Hood</h4>
    <p>
      ImageFit uses modern HTML5 Canvas, Web Workers, and the OffscreenCanvas API. All calculations,
      color space conversions, and binary search quality adjustments are executed directly on your
      local processor.
    </p>
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
      <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Key Guarantees:
      </div>
      <p>• Zero server-side uploads or file queues</p>
      <p>• No accounts, passwords, or personal profiles</p>
      <p>• Clean, transparent compression targets without false reporting</p>
    </div>
  </ModalWrapper>
);

export const PrivacyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper
    title="Privacy Policy & Technical Scope"
    icon={<ShieldCheck className="w-4 h-4" />}
    onClose={onClose}
  >
    <p className="font-medium text-slate-800">
      Your image is processed locally in your browser. Image files are not uploaded to our servers for
      processing.
    </p>
    <h4 className="font-bold text-slate-900 text-sm pt-1">1. Information We Do Not Collect</h4>
    <p>
      We do not collect names, email addresses, phone numbers, location data, or image contents.
      There is no registration, account creation, or user authentication system.
    </p>
    <h4 className="font-bold text-slate-900 text-sm pt-1">2. Image Handling</h4>
    <p>
      When you drag and drop or select an image, your browser loads the file binary into client-side
      memory using standard Web APIs. The resulting compressed or resized file is rendered onto an
      in-browser canvas. Once you close or reload the webpage, this data is cleared from memory.
    </p>
    <h4 className="font-bold text-slate-900 text-sm pt-1">3. Third-Party Services & AI</h4>
    <p>
      ImageFit does not transmit your images to third-party image-processing APIs or artificial
      intelligence models.
    </p>
    <h4 className="font-bold text-slate-900 text-sm pt-1">4. Performance & Hardware Dependencies</h4>
    <p>
      Because image processing is performed client-side, the speed and maximum practical image size
      depend entirely on your device’s processor, available RAM, and web browser version.
    </p>
  </ModalWrapper>
);

export const TermsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper title="Terms of Use" icon={<FileText className="w-4 h-4" />} onClose={onClose}>
    <p>
      By accessing and using ImageFit, you acknowledge and agree to the following standard usage terms:
    </p>
    <h4 className="font-bold text-slate-900 text-sm pt-1">1. Permitted Use</h4>
    <p>
      You are free to use ImageFit for personal, educational, or commercial image preparation tasks.
      You are solely responsible for ensuring that you possess the legal rights or permissions to
      modify the files you process.
    </p>
    <h4 className="font-bold text-slate-900 text-sm pt-1">2. Disclaimer of Warranties</h4>
    <p>
      ImageFit is provided &ldquo;as is&rdquo; without warranties of any kind, whether express or implied.
      While our compression engine strives to meet requested target sizes accurately without
      distortion, we do not guarantee that every external third-party portal will accept your final file.
    </p>
    <h4 className="font-bold text-slate-900 text-sm pt-1">3. Device Limitations</h4>
    <p>
      ImageFit operates client-side. Large batches or high-resolution images may consume significant
      device memory. You agree not to hold ImageFit liable for browser tab crashes or memory errors
      resulting from local device resource exhaustion.
    </p>
  </ModalWrapper>
);

export const ContactModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper title="Contact & Feedback" icon={<Mail className="w-4 h-4" />} onClose={onClose}>
    <p>
      Have questions, suggestions, or feedback regarding ImageFit? We are committed to maintaining a
      clean, fast, and respectful utility.
    </p>
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
      <div className="font-bold text-slate-900 text-sm">Direct Contact</div>
      <p className="text-xs text-slate-600">
        For technical inquiries, bug reports, or partnership discussions, you can reach the
        maintainer directly at:
      </p>
      <a
        href="mailto:support@imagefit.local"
        className="inline-block font-semibold text-sky-600 hover:text-sky-700 underline text-xs"
      >
        support@imagefit.local
      </a>
    </div>
    <p className="text-xs text-slate-500">
      We typically respond to inquiries within 2–3 business days. Please note that because we do not
      store user images, we cannot assist with recovering files after you close your browser.
    </p>
  </ModalWrapper>
);
