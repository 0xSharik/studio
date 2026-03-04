"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onCancel: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    ctx.drawImage(
      image,
      x * scaleX,
      y * scaleY,
      width * scaleX,
      height * scaleY,
      0,
      0,
      width * scaleX,
      height * scaleY
    );

    const croppedImageUrl = canvas.toDataURL("image/jpeg", 0.9);
    onCropComplete(croppedImageUrl);
  }, [completedCrop, onCropComplete]);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-xl p-4 max-w-3xl w-full">
        <h3 className="text-white text-lg font-bold mb-4 text-center">Crop Image</h3>
        
        <div className="flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={16 / 9}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              className="max-h-[50vh]"
              alt="Crop"
            />
          </ReactCrop>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={getCroppedImage}
            className="px-4 py-2 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-500 transition-colors"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}
