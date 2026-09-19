import React, { useState, useRef, useEffect } from 'react';
import { CropArea, AspectRatioPreset } from '../types';
import { Check, X, RotateCcw, Crop as CropIcon } from 'lucide-react';
import { formatDimensions } from '../utils/formatters';

interface ImageCropperProps {
  imageSrc: string;
  originalWidth: number;
  originalHeight: number;
  initialCrop: CropArea | null;
  onApplyCrop: (crop: CropArea) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  originalWidth,
  originalHeight,
  initialCrop,
  onApplyCrop,
  onCancel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [aspectPreset, setAspectPreset] = useState<AspectRatioPreset>('free');

  // Crop box in natural image coordinates (0 to originalWidth, 0 to originalHeight)
  const [crop, setCrop] = useState<CropArea>(() => {
    if (initialCrop) return initialCrop;
    // Default to central 90%
    const w = Math.round(originalWidth * 0.9);
    const h = Math.round(originalHeight * 0.9);
    return {
      x: Math.round((originalWidth - w) / 2),
      y: Math.round((originalHeight - h) / 2),
      width: w,
      height: h,
    };
  });

  // Display dimensions for rendered image inside container
  const [displaySize, setDisplaySize] = useState({ width: 1, height: 1, scale: 1 });

  // Update display scale when container resizes
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const maxW = rect.width - 32;
      const maxH = Math.min(window.innerHeight * 0.55, 520);

      const scaleW = maxW / originalWidth;
      const scaleH = maxH / originalHeight;
      const scale = Math.min(scaleW, scaleH, 1);

      setDisplaySize({
        width: originalWidth * scale,
        height: originalHeight * scale,
        scale,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [originalWidth, originalHeight]);

  const applyAspectToCrop = (preset: AspectRatioPreset) => {
    setAspectPreset(preset);
    if (preset === 'free') return;

    let targetRatio = 1;
    switch (preset) {
      case '1:1':
        targetRatio = 1;
        break;
      case '4:3':
        targetRatio = 4 / 3;
        break;
      case '16:9':
        targetRatio = 16 / 9;
        break;
      case '3:2':
        targetRatio = 3 / 2;
        break;
      case '9:16':
        targetRatio = 9 / 16;
        break;
    }

    // Recalculate crop maintaining center and ratio
    let newW = crop.width;
    let newH = Math.round(newW / targetRatio);

    if (newH > originalHeight) {
      newH = originalHeight;
      newW = Math.round(newH * targetRatio);
    }
    if (newW > originalWidth) {
      newW = originalWidth;
      newH = Math.round(newW / targetRatio);
    }

    const newX = Math.max(0, Math.min(originalWidth - newW, Math.round((originalWidth - newW) / 2)));
    const newY = Math.max(0, Math.min(originalHeight - newH, Math.round((originalHeight - newH) / 2)));

    setCrop({
      x: newX,
      y: newY,
      width: newW,
      height: newH,
    });
  };

  // Dragging interaction state
  const dragRef = useRef<{
    isDragging: boolean;
    dragType: 'move' | 'nw' | 'ne' | 'sw' | 'se';
    startX: number;
    startY: number;
    initialCrop: CropArea;
  }>({
    isDragging: false,
    dragType: 'move',
    startX: 0,
    startY: 0,
    initialCrop: crop,
  });

  const handlePointerDown = (
    e: React.PointerEvent,
    type: 'move' | 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragRef.current = {
      isDragging: true,
      dragType: type,
      startX: e.clientX,
      startY: e.clientY,
      initialCrop: { ...crop },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    e.preventDefault();

    const dx = (e.clientX - dragRef.current.startX) / displaySize.scale;
    const dy = (e.clientY - dragRef.current.startY) / displaySize.scale;
    const init = dragRef.current.initialCrop;

    let { x, y, width, height } = init;

    if (dragRef.current.dragType === 'move') {
      x = Math.max(0, Math.min(originalWidth - width, Math.round(init.x + dx)));
      y = Math.max(0, Math.min(originalHeight - height, Math.round(init.y + dy)));
    } else if (dragRef.current.dragType === 'se') {
      width = Math.max(40, Math.min(originalWidth - init.x, Math.round(init.width + dx)));
      height = Math.max(40, Math.min(originalHeight - init.y, Math.round(init.height + dy)));
      if (aspectPreset !== 'free') {
        const ratio = init.width / init.height;
        width = Math.min(width, Math.round(height * ratio));
        height = Math.round(width / ratio);
      }
    } else if (dragRef.current.dragType === 'sw') {
      const maxLeftChange = init.width - 40;
      const clampedDx = Math.min(maxLeftChange, Math.max(-init.x, dx));
      x = Math.round(init.x + clampedDx);
      width = Math.round(init.width - clampedDx);
      height = Math.max(40, Math.min(originalHeight - init.y, Math.round(init.height + dy)));
    } else if (dragRef.current.dragType === 'ne') {
      width = Math.max(40, Math.min(originalWidth - init.x, Math.round(init.width + dx)));
      const maxTopChange = init.height - 40;
      const clampedDy = Math.min(maxTopChange, Math.max(-init.y, dy));
      y = Math.round(init.y + clampedDy);
      height = Math.round(init.height - clampedDy);
    } else if (dragRef.current.dragType === 'nw') {
      const maxLeftChange = init.width - 40;
      const clampedDx = Math.min(maxLeftChange, Math.max(-init.x, dx));
      x = Math.round(init.x + clampedDx);
      width = Math.round(init.width - clampedDx);

      const maxTopChange = init.height - 40;
      const clampedDy = Math.min(maxTopChange, Math.max(-init.y, dy));
      y = Math.round(init.y + clampedDy);
      height = Math.round(init.height - clampedDy);
    }

    setCrop({
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(width),
      height: Math.round(height),
    });
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
  };

  const resetToFull = () => {
    setAspectPreset('free');
    setCrop({
      x: 0,
      y: 0,
      width: originalWidth,
      height: originalHeight,
    });
  };

  // Coordinates in rendered container
  const boxLeft = crop.x * displaySize.scale;
  const boxTop = crop.y * displaySize.scale;
  const boxWidth = crop.width * displaySize.scale;
  const boxHeight = crop.height * displaySize.scale;

  return (
    <div
      id="crop-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <CropIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Crop Image</h3>
              <p className="text-xs text-slate-500">
                Drag the crop box or corners to frame your image.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Toolbar */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-1">Aspect Ratio:</span>
            {(['free', '1:1', '4:3', '16:9', '3:2', '9:16'] as AspectRatioPreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyAspectToCrop(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  aspectPreset === preset
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset === 'free' ? 'Free' : preset}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetToFull}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded-lg hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Full
          </button>
        </div>

        {/* Crop Viewport */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-[300px] max-h-[520px] bg-slate-950/95 flex items-center justify-center p-4 select-none overflow-hidden"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className="relative"
            style={{
              width: `${displaySize.width}px`,
              height: `${displaySize.height}px`,
            }}
          >
            {/* Background image */}
            <img
              src={imageSrc}
              alt="Crop target"
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Dark Mask Overlays */}
            {/* Top */}
            <div
              className="absolute left-0 right-0 top-0 bg-black/60 pointer-events-none"
              style={{ height: `${boxTop}px` }}
            />
            {/* Bottom */}
            <div
              className="absolute left-0 right-0 bottom-0 bg-black/60 pointer-events-none"
              style={{ top: `${boxTop + boxHeight}px` }}
            />
            {/* Left */}
            <div
              className="absolute left-0 bg-black/60 pointer-events-none"
              style={{
                top: `${boxTop}px`,
                height: `${boxHeight}px`,
                width: `${boxLeft}px`,
              }}
            />
            {/* Right */}
            <div
              className="absolute right-0 bg-black/60 pointer-events-none"
              style={{
                top: `${boxTop}px`,
                height: `${boxHeight}px`,
                left: `${boxLeft + boxWidth}px`,
              }}
            />

            {/* Draggable Crop Selection Box */}
            <div
              id="crop-selection-box"
              onPointerDown={(e) => handlePointerDown(e, 'move')}
              className="absolute border-2 border-white cursor-move shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
              style={{
                left: `${boxLeft}px`,
                top: `${boxTop}px`,
                width: `${boxWidth}px`,
                height: `${boxHeight}px`,
              }}
            >
              {/* Grid rule-of-thirds lines */}
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>

              {/* Corner Handles */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'nw')}
                className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-sky-600 rounded-sm cursor-nwse-resize shadow-md"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'ne')}
                className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-sky-600 rounded-sm cursor-nesw-resize shadow-md"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'sw')}
                className="absolute -bottom-2.5 -left-2.5 w-5 h-5 bg-white border-2 border-sky-600 rounded-sm cursor-nesw-resize shadow-md"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'se')}
                className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-white border-2 border-sky-600 rounded-sm cursor-nwse-resize shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer with Dimensions and Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-600 font-medium">
            Cropped dimensions:{' '}
            <span className="font-bold text-slate-900">
              {formatDimensions(crop.width, crop.height)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-apply-crop"
              type="button"
              onClick={() => onApplyCrop(crop)}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
