"use client";
import { useState } from "react";
import Image, { type ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackTitle?: string;
}

export default function SafeImage({
  src,
  alt,
  fallbackTitle,
  className,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#12372A] via-[#1B3B2E] to-[#0D1512] text-white relative overflow-hidden select-none ${className || ""}`}
        aria-label={alt || fallbackTitle || "Destination visual"}
      >
        {/* Scenic subtle mountain contours */}
        <svg
          viewBox="0 0 200 120"
          className="w-full h-full absolute inset-0 opacity-20 pointer-events-none object-cover"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,120 L40,65 L85,95 L140,40 L200,120 Z" fill="#34B37A" />
          <path d="M20,120 L75,50 L115,80 L165,30 L200,85 L200,120 Z" fill="#E0531F" opacity="0.6" />
        </svg>
        <span className="material-symbols-outlined text-[32px] text-primary-fixed mb-1 relative z-10">
          landscape
        </span>
        <span className="font-editorial text-sm font-semibold tracking-wide text-white/90 relative z-10 line-clamp-1">
          {fallbackTitle || alt || "North East Panorama"}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
