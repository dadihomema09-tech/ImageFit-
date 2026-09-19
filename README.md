# ImageFit – Privacy-Focused In-Browser Image Utility

ImageFit is a high-performance, privacy-first web application designed to help users resize, compress, crop, and convert images directly inside their web browser. No files are ever uploaded to a remote server.

---

## 🚀 Key Highlights & Features

- **100% Client-Side Privacy:** All operations execute locally in browser memory using standard HTML5 Canvas, Web Workers, and `OffscreenCanvas`.
- **Target Size Compression Engine:** Binary search quality optimization and iterative dimension downscaling guarantee files meet exact maximum target sizes (50 KB, 100 KB, 200 KB, 500 KB, 1 MB, 2 MB, or custom KB/MB).
- **Accurate Target Reporting:** Transparently indicates if a target is met or explains why if the target is technically unachievable without extreme degradation.
- **Image Resizing & Distortion Protection:** Resize by exact pixels or percentage scaling with aspect ratio locking and clear distortion warnings.
- **Format Conversion:** Convert freely between JPG, PNG, and WebP with clear explanations regarding transparency and file size.
- **Freeform & Aspect-Ratio Cropping:** Visual crop tool with 1:1, 4:3, 16:9, 3:2, 9:16 presets and freeform dragging.
- **Batch Processing & ZIP Download:** Process dozens of images simultaneously and download all results bundled into a single ZIP archive.
- **"What Are You Trying To Do?" Presets:** One-click presets for website uploads, document portals, emails, social media, and printing.
- **Mobile-First Touch & Desktop Drag-and-Drop:** Responsive, accessible UI for phones, tablets, and desktops.

---

## 📂 Project Structure

```
├── index.html                   # HTML entry point with SEO, OG tags, & Schema.org JSON-LD
├── metadata.json                # Applet configuration and capability flags
├── package.json                 # Project dependencies and build scripts
├── vite.config.ts               # Vite configuration with Tailwind CSS plugin
├── src/
│   ├── main.tsx                 # React application mounting
│   ├── App.tsx                  # Root ImageFit controller and UI coordinator
│   ├── index.css                # Global styling with Tailwind
│   ├── types.ts                 # TypeScript interfaces and shared types
│   ├── config/
│   │   └── appConfig.ts         # Central configuration (presets, formats, size caps, ad toggles)
│   ├── workers/
│   │   └── imageWorker.ts       # OffscreenCanvas Web Worker for off-thread image rendering
│   ├── services/
│   │   ├── compressionEngine.ts # Core iterative compression engine and canvas fallback
│   │   ├── downloadManager.ts   # Single file download and multi-file JSZip bundling
│   │   └── analyticsManager.ts  # Privacy-safe, pluggable analytics abstraction
│   ├── utils/
│   │   └── formatters.ts        # Byte sizes, aspect ratios, and dimension formatters
│   └── components/
│       ├── Header.tsx           # Navigation bar, trust badge, modal links
│       ├── Footer.tsx           # Technical disclaimer, copyright, legal links
│       ├── ImageUploader.tsx    # Drag-and-drop dropzone and mobile file picker
│       ├── PresetManager.tsx    # "What are you trying to do?" intent presets
│       ├── ImageCropper.tsx     # Interactive canvas crop tool with aspect ratios
│       ├── ImageResizer.tsx     # Dimension controls, percentage scaling, and distortion alerts
│       ├── FormatConverter.tsx  # Format selector (JPG, PNG, WebP) with guidance
│       ├── CompressionControls.tsx # Target size presets, custom units, and quality sliders
│       ├── ImagePreview.tsx     # Side-by-side comparison, metrics, and download
│       ├── BatchProcessor.tsx   # Multi-file queue, progress tracking, and batch actions
│       ├── PrivacySection.tsx   # Transparent privacy and device limitations explanation
│       ├── AdSlot.tsx           # Non-intrusive ad placeholder (disabled by default)
│       └── Modals/
│           └── LegalModals.tsx  # About, Privacy Policy, Terms of Use, and Contact modals
```

---

## 🛠️ How Image Processing Works

1. **File Loading & Validation:** `compressionEngine.loadSourceImage(file)` inspects the file MIME type and byte size, creating an `HTMLImageElement` and generating an ephemeral Object URL.
2. **Worker Offloading:** When supported, the image is passed to `src/workers/imageWorker.ts` as an `ImageBitmap` via `postMessage` transfer to prevent main thread frame drops on mobile devices.
3. **Cropping:** Crop coordinates are extracted and mapped to native image coordinates.
4. **Target Size Iteration (Binary Search & Scaling):**
   - For **JPEG** and **WebP**, the engine performs up to 8 binary search steps across encoding quality (0.08 to 0.95).
   - If the lowest acceptable quality still exceeds the requested target bytes, the engine downscales dimensions (by factor ~0.78) and re-evaluates the quality ladder.
   - For **PNG** (which is lossless), the engine downscales dimensions until `blob.size <= targetBytes`.
   - If the original file is already smaller than the target, the engine maintains high quality without unnecessary file expansion.
   - If the target cannot be reached without severe degradation, `targetMet` is flagged as `false` with a descriptive explanation.
5. **Main-Thread Fallback:** If `Worker` or `OffscreenCanvas` is unsupported on a specific legacy browser, `processWithMainThreadCanvas` executes the identical algorithm using `HTMLCanvasElement.toBlob()`.

---

## 💻 How to Run Locally

1. Clone the repository or export the project.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📖 Extension Guides

### 1. How to Add a New Preset

Open `src/config/appConfig.ts` and add an entry to the `availablePresets` array:

```typescript
{
  id: 'passport',
  label: 'Passport Photo',
  tagline: 'Standard 2x2 inch (600x600 px) under 240 KB',
  description: 'Preconfigures dimensions to 600x600 px JPEG under 240 KB for online visa/passport portals.',
  suggestedSettings: {
    outputFormat: 'image/jpeg',
    compression: {
      mode: 'target-size',
      targetSizeValue: 240,
      targetSizeUnit: 'KB',
      qualityPercent: 85,
    },
    resize: {
      mode: 'pixels',
      width: 600,
      height: 600,
      percentage: 100,
      maintainAspectRatio: false,
      aspectRatio: 1,
    },
  },
}
```

### 2. How to Add a New Output Format (e.g., AVIF)

1. Add the format type to `SupportedOutputFormat` in `src/types.ts`:
   ```typescript
   export type SupportedOutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';
   ```
2. Update `src/config/appConfig.ts`:
   ```typescript
   supportedOutputFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
   ```
3. Add the UI tab and format notes in `src/components/FormatConverter.tsx`.

### 3. How to Enable the Future AdSlot

1. Open `src/config/appConfig.ts` and set:
   ```typescript
   adsEnabled: true,
   ```
2. In `src/components/AdSlot.tsx`, mount your preferred ad script (e.g., Google AdSense tag) inside the `<div id="ad-container-${slotId}">`.
3. The image processing engine remains completely isolated from advertising logic.

### 4. How to Connect an Analytics Provider Later

1. Open `src/config/appConfig.ts` and set:
   ```typescript
   analyticsEnabled: true,
   ```
2. Implement the `AnalyticsProvider` interface in `src/services/analyticsManager.ts`:
   ```typescript
   import { analytics } from './services/analyticsManager';

   analytics.setProvider({
     name: 'MyAnalytics',
     init: () => { /* Initialize analytics SDK */ },
     trackEvent: (evt) => { /* Forward event */ },
   });
   ```

---

## 🚢 Deployment

ImageFit is a static client-side application. It can be built and deployed to any static hosting provider (Cloud Run, Vercel, Netlify, Cloudflare Pages, GitHub Pages, AWS S3):

```bash
npm run build
```

This generates production-ready static assets in the `dist/` directory. No backend server or database is needed.
