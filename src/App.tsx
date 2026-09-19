import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BatchItem,
  CropArea,
  IntentPresetId,
  ProcessedImageResult,
  ProcessingSettings,
  SourceImageMeta,
  SupportedOutputFormat,
} from './types';
import { APP_CONFIG } from './config/appConfig';
import { compressionEngine } from './services/compressionEngine';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdSlot } from './components/AdSlot';
import { ImageUploader } from './components/ImageUploader';
import { PresetManager } from './components/PresetManager';
import { ImageCropper } from './components/ImageCropper';
import { ImageResizer } from './components/ImageResizer';
import { FormatConverter } from './components/FormatConverter';
import { CompressionControls } from './components/CompressionControls';
import { ImagePreview } from './components/ImagePreview';
import { BatchProcessor } from './components/BatchProcessor';
import { PrivacySection } from './components/PrivacySection';
import {
  AboutModal,
  PrivacyModal,
  TermsModal,
  ContactModal,
} from './components/Modals/LegalModals';
import {
  Sliders,
  Crop as CropIcon,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { formatBytes, formatDimensions } from './utils/formatters';

export default function App() {
  // Modal states
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(
    null
  );

  // Intent Preset selection
  const [selectedPreset, setSelectedPreset] = useState<IntentPresetId>('website');

  // Working images state
  const [singleSource, setSingleSource] = useState<SourceImageMeta | null>(null);
  const [singleResult, setSingleResult] = useState<ProcessedImageResult | null>(null);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCropper, setShowCropper] = useState(false);

  // Common Processing Settings
  const [settings, setSettings] = useState<ProcessingSettings>({
    outputFormat: 'image/webp',
    resize: {
      mode: 'pixels',
      width: 1600,
      height: 1200,
      percentage: 100,
      maintainAspectRatio: true,
      aspectRatio: 1600 / 1200,
    },
    compression: {
      mode: 'target-size',
      targetSizeValue: 200,
      targetSizeUnit: 'KB',
      qualityPercent: 82,
    },
    crop: null,
    cropApplied: false,
  });

  // Handle Preset Selection
  const handlePresetSelect = (
    presetId: IntentPresetId,
    suggestedSettings: Partial<ProcessingSettings>
  ) => {
    setSelectedPreset(presetId);

    setSettings((prev) => {
      const next = { ...prev };
      if (suggestedSettings.outputFormat) {
        next.outputFormat = suggestedSettings.outputFormat;
      }
      if (suggestedSettings.compression) {
        next.compression = { ...prev.compression, ...suggestedSettings.compression };
      }
      return next;
    });
  };

  // Handle File Uploads (Single or Batch)
  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      if (files.length === 1) {
        // Single image mode
        const meta = await compressionEngine.loadSourceImage(files[0]);
        setSingleSource(meta);
        setBatchItems([]);

        // Synchronize resize settings with uploaded image natural dimensions
        setSettings((prev) => ({
          ...prev,
          resize: {
            ...prev.resize,
            width: meta.width,
            height: meta.height,
            aspectRatio: meta.aspectRatio,
            percentage: 100,
          },
          crop: null,
          cropApplied: false,
        }));
      } else {
        // Multiple images mode (Batch)
        setSingleSource(null);
        setSingleResult(null);

        const loadedItems: BatchItem[] = [];
        for (const file of files) {
          try {
            const meta = await compressionEngine.loadSourceImage(file);
            loadedItems.push({
              id: meta.id,
              source: meta,
              status: 'idle',
              progress: 0,
              result: null,
            });
          } catch (err) {
            console.error('Failed to load item in batch:', file.name, err);
          }
        }
        setBatchItems(loadedItems);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process single image whenever settings or source changes
  const processSingleImage = useCallback(
    async (source: SourceImageMeta, currentSettings: ProcessingSettings) => {
      setIsProcessing(true);
      try {
        const res = await compressionEngine.processImage(source, currentSettings);
        setSingleResult(res);
      } catch (err) {
        console.error('Processing error:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // Debounced auto-processing for single image
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!singleSource) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      processSingleImage(singleSource, settings);
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [singleSource, settings, processSingleImage]);

  // Batch Processing Pipeline
  const processBatchQueue = async () => {
    if (batchItems.length === 0 || isProcessing) return;
    setIsProcessing(true);

    const updated = [...batchItems];
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      if (item.status === 'done' && item.result) continue;

      updated[i] = { ...item, status: 'processing', progress: 30 };
      setBatchItems([...updated]);

      try {
        // Adjust resize settings for item's specific aspect ratio
        const itemSettings: ProcessingSettings = {
          ...settings,
          resize: {
            ...settings.resize,
            width:
              settings.resize.mode === 'percentage'
                ? Math.round(item.source.width * (settings.resize.percentage / 100))
                : settings.resize.width,
            height:
              settings.resize.mode === 'percentage'
                ? Math.round(item.source.height * (settings.resize.percentage / 100))
                : settings.resize.height,
          },
          cropApplied: false, // Batch mode processes full frame
        };

        const res = await compressionEngine.processImage(item.source, itemSettings);
        updated[i] = {
          ...item,
          status: 'done',
          progress: 100,
          result: res,
        };
      } catch (err: unknown) {
        updated[i] = {
          ...item,
          status: 'error',
          progress: 0,
          error: err instanceof Error ? err.message : 'Processing failed',
        };
      }
      setBatchItems([...updated]);
    }

    setIsProcessing(false);
  };

  // Reset tool to initial upload state
  const handleReset = () => {
    setSingleSource(null);
    setSingleResult(null);
    setBatchItems([]);
    setShowCropper(false);
  };

  // Apply Crop
  const handleApplyCrop = (crop: CropArea) => {
    setSettings((prev) => ({
      ...prev,
      crop,
      cropApplied: true,
      resize: {
        ...prev.resize,
        width: crop.width,
        height: crop.height,
        aspectRatio: crop.width / crop.height,
      },
    }));
    setShowCropper(false);
  };

  const isBatchMode = batchItems.length > 0;
  const isSingleMode = singleSource !== null;
  const isInitialState = !isBatchMode && !isSingleMode;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <Header
        onOpenAbout={() => setActiveModal('about')}
        onOpenPrivacy={() => setActiveModal('privacy')}
        onOpenTerms={() => setActiveModal('terms')}
        onOpenContact={() => setActiveModal('contact')}
        batchCount={batchItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Future Non-intrusive AdSlot (disabled by default) */}
        <AdSlot slotId="top-banner" />

        {/* Initial View: What are you trying to do? + Upload Area */}
        {isInitialState && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Value Proposition Hero */}
            <div className="text-center space-y-2.5">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Resize, Compress & Convert Images
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Fast in-browser utility. Prepare photos and graphics for strict website size limits
                without uploading your files to any remote server.
              </p>
            </div>

            {/* E. SIMPLE "WHAT DO YOU NEED?" MODE */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <PresetManager
                selectedPreset={selectedPreset}
                onSelectPreset={handlePresetSelect}
              />
            </div>

            {/* Upload Zone */}
            <ImageUploader onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />

            {/* Privacy Section */}
            <PrivacySection />
          </div>
        )}

        {/* Active Workspace: Single Image Mode */}
        {isSingleMode && singleSource && (
          <div className="space-y-8">
            {/* Top preset switcher in active mode */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <PresetManager
                selectedPreset={selectedPreset}
                onSelectPreset={handlePresetSelect}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Interactive Controls */}
              <div className="lg:col-span-5 space-y-5">
                {/* Control Panel Card */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        Image Settings
                      </h3>
                    </div>

                    <button
                      id="btn-open-cropper"
                      type="button"
                      onClick={() => setShowCropper(true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        settings.cropApplied
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CropIcon className="w-3.5 h-3.5" />
                      {settings.cropApplied ? 'Crop Applied' : 'Crop Image'}
                    </button>
                  </div>

                  {/* 1. Format Converter */}
                  <FormatConverter
                    currentFormat={settings.outputFormat}
                    originalFormat={singleSource.format}
                    onChangeFormat={(outputFormat) => setSettings({ ...settings, outputFormat })}
                  />

                  <div className="border-t border-slate-100 pt-5">
                    {/* 2. Compression Engine UI */}
                    <CompressionControls
                      settings={settings.compression}
                      originalSizeBytes={singleSource.size}
                      outputFormat={settings.outputFormat}
                      onChange={(compression) => setSettings({ ...settings, compression })}
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    {/* 3. Image Resizer */}
                    <ImageResizer
                      settings={settings.resize}
                      originalDimensions={{
                        width: settings.cropApplied && settings.crop ? settings.crop.width : singleSource.width,
                        height: settings.cropApplied && settings.crop ? settings.crop.height : singleSource.height,
                      }}
                      onChange={(resize) => setSettings({ ...settings, resize })}
                    />
                  </div>
                </div>

                {/* Privacy Badge Card */}
                <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Processing locally in browser using Web Workers &amp; Canvas. No server uploads.
                  </span>
                </div>
              </div>

              {/* Right Column: Live Preview & Output Metrics */}
              <div className="lg:col-span-7 space-y-6">
                <ImagePreview
                  source={singleSource}
                  result={singleResult}
                  isProcessing={isProcessing}
                  onReset={handleReset}
                  onOpenCrop={() => setShowCropper(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Workspace: Batch Mode */}
        {isBatchMode && (
          <div className="space-y-6">
            {/* Batch Preset & Global Settings Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <PresetManager
                selectedPreset={selectedPreset}
                onSelectPreset={handlePresetSelect}
              />

              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormatConverter
                  currentFormat={settings.outputFormat}
                  originalFormat="Multiple"
                  onChangeFormat={(outputFormat) => setSettings({ ...settings, outputFormat })}
                />
                <CompressionControls
                  settings={settings.compression}
                  originalSizeBytes={batchItems[0]?.source.size || 0}
                  outputFormat={settings.outputFormat}
                  onChange={(compression) => setSettings({ ...settings, compression })}
                />
              </div>
            </div>

            {/* Batch Processor Component */}
            <BatchProcessor
              items={batchItems}
              isProcessing={isProcessing}
              onProcessAll={processBatchQueue}
              onRemoveItem={(id) => setBatchItems((prev) => prev.filter((i) => i.id !== id))}
              onClearAll={handleReset}
            />
          </div>
        )}

        {/* Cropper Modal */}
        {showCropper && singleSource && (
          <ImageCropper
            imageSrc={singleSource.dataUrl}
            originalWidth={singleSource.width}
            originalHeight={singleSource.height}
            initialCrop={settings.crop}
            onApplyCrop={handleApplyCrop}
            onCancel={() => setShowCropper(false)}
          />
        )}
      </main>

      {/* Modals for Legal, Privacy, About, Contact */}
      {activeModal === 'about' && <AboutModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'privacy' && <PrivacyModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'terms' && <TermsModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'contact' && <ContactModal onClose={() => setActiveModal(null)} />}

      {/* Footer */}
      <Footer
        onOpenAbout={() => setActiveModal('about')}
        onOpenPrivacy={() => setActiveModal('privacy')}
        onOpenTerms={() => setActiveModal('terms')}
        onOpenContact={() => setActiveModal('contact')}
      />
    </div>
  );
}
