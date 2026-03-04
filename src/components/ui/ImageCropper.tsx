"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

// Header + footer + outer padding + inner padding
const CHROME_H = 64 + 76 + 32 + 32; // = 204px

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [mounted, setMounted] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  }, []);

  const getCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return;
    const image = imgRef.current;
    const canvas = canvasRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y, width, height } = completedCrop;
    canvas.width = width * scaleX;
    canvas.height = height * scaleY;
    ctx.drawImage(image, x * scaleX, y * scaleY, width * scaleX, height * scaleY, 0, 0, width * scaleX, height * scaleY);
    onCropComplete(canvas.toDataURL("image/jpeg", 0.9));
  }, [completedCrop, onCropComplete]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-[#141414] rounded-2xl flex flex-col shadow-2xl border border-white/10 overflow-hidden"
        style={{ maxHeight: '90vh' }}>

        {/* Header - Fixed Height */}
        <div className="h-[70px] flex-none px-6 flex items-center justify-between border-b border-white/5 bg-[#1a1a1a]">
          <h3 className="text-white text-lg font-bold">Crop Image</h3>
          <span className="px-3 py-1 bg-white/5 rounded-md text-xs text-gray-400 font-mono">16:9</span>
        </div>

        {/* Content Area - Flexible, but strictly prevents overflow */}
        <div className="flex-1 min-h-0 bg-[#0a0a0a] p-4 sm:p-8 flex items-center justify-center overflow-auto">
          {/* 
            This wrapper ensures ReactCrop has a strong boundary to respect.
            Rather than relying on the modal max-height to squish the image,
            we force the image to never exceed 60vh. This leaves 30vh for header/footer padding.
          */}
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={16 / 9}
            style={{ maxWidth: "100%", maxHeight: "100%", margin: "auto" }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="Source"
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: "60vh", // The explicit bulletproof fix
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </ReactCrop>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Footer - Fixed Height */}
        <div className="h-[80px] flex-none px-6 flex items-center justify-end gap-3 border-t border-white/5 bg-[#1a1a1a]">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={getCroppedImage}
            className="px-6 py-2.5 rounded-lg text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            Apply Crop
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}