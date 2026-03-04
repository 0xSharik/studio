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

  useEffect(() => {
    setMounted(true);

    // Lock body scroll while cropper is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

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
      x * scaleX, y * scaleY,
      width * scaleX, height * scaleY,
      0, 0,
      width * scaleX, height * scaleY
    );

    onCropComplete(canvas.toDataURL("image/jpeg", 0.9));
  }, [completedCrop, onCropComplete]);

  if (!mounted) return null;

  return createPortal(
    /*
     * Overlay: full viewport, no scroll.
     * Uses dvh (dynamic viewport height) with a vh fallback so the modal
     * never overflows on mobile browsers where the address bar eats space.
     */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        padding: "clamp(8px, 3vw, 24px)",
        boxSizing: "border-box",
        // Use dvh when available so the overlay fits inside the visual viewport
        height: "100dvh",
      } as React.CSSProperties}
    >
      {/*
       * Modal shell: flex column, constrained to the visual viewport.
       * Never taller than what's available, never wider than the viewport.
       */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "960px",
          // Keep the modal inside the overlay; dvh gives us the real available height
          maxHeight: "calc(100dvh - clamp(16px, 6vw, 48px))",
          height: "100%",
          backgroundColor: "#141414",
          borderRadius: "clamp(8px, 2vw, 16px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            flexShrink: 0,
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            backgroundColor: "#1c1c1c",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              color: "#fff",
              fontSize: "clamp(14px, 2.5vw, 16px)",
              fontWeight: 700,
              letterSpacing: "0.01em",
            }}
          >
            Crop Image
          </span>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: "6px",
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "#9ca3af",
              fontSize: "11px",
              fontFamily: "monospace",
            }}
          >
            16 : 9
          </span>
        </div>

        {/*
         * ── Canvas area ──
         * flex: 1 1 0 lets this region grow/shrink freely between the fixed
         * header and footer. overflow:hidden prevents any internal scroll.
         * The inner wrapper centres the ReactCrop widget.
         */}
        <div
          style={{
            flex: "1 1 0",
            minHeight: 0,           // critical: allows flex child to shrink below content size
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            padding: "clamp(8px, 2vw, 20px)",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={16 / 9}
            style={{
              // Let ReactCrop itself shrink; don't set explicit dimensions here
              maxWidth: "100%",
              maxHeight: "100%",
            }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="Source"
              style={{
                display: "block",
                /*
                 * These two constraints together guarantee the image never
                 * overflows in either axis regardless of orientation or device.
                 * The browser picks whichever dimension hits its container first.
                 */
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </ReactCrop>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            flexShrink: 0,
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "0 20px",
            backgroundColor: "#1c1c1c",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "transparent",
              color: "#d1d5db",
              fontSize: "clamp(12px, 2vw, 14px)",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#d1d5db";
            }}
          >
            Cancel
          </button>

          <button
            onClick={getCroppedImage}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#06b6d4",
              color: "#000",
              fontSize: "clamp(12px, 2vw, 14px)",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(6,182,212,0.35)",
              transition: "background-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#22d3ee";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 28px rgba(6,182,212,0.5)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#06b6d4";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(6,182,212,0.35)";
            }}
          >
            Apply Crop
          </button>
        </div>
      </div>

      {/* Hidden canvas used only for pixel extraction */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>,
    document.body
  );
}