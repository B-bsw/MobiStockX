"use client";

import { useState } from "react";
import { ImageOff, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Only http(s) URLs are rendered. image_url is free text, so this blocks
 * javascript:/data: values from ever reaching the src attribute.
 */
export function isDisplayableImageUrl(url: string) {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Tracked per URL rather than as a bare status, so editing the URL field
 * implicitly resets the state without an effect: a result for the old URL no
 * longer matches the current one.
 */
interface ImageState {
  url: string;
  status: "ready" | "failed";
}

interface ProductImageProps {
  url: string | null;
  /** Product name — used for alt text, not shown. */
  name: string;
  className?: string;
  /** Rendered when there is no usable URL or the image fails to load. */
  iconSize?: number;
}

/*
 * A plain <img> rather than next/image: image_url points at arbitrary
 * third-party hosts, and next/image needs every host allowlisted in
 * next.config.ts up front, which would break any URL a user types later.
 */
export function ProductImage({
  url,
  name,
  className,
  iconSize = 20,
}: ProductImageProps) {
  const src = url?.trim() ?? "";
  const usable = src !== "" && isDisplayableImageUrl(src);

  const [state, setState] = useState<ImageState | null>(null);
  const status = state?.url === src ? state.status : "loading";

  const box = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary",
    className,
  );

  if (!usable || status === "failed") {
    return (
      <div className={box} role="img" aria-label={`ไม่มีรูปสินค้า ${name}`}>
        {usable ? (
          <ImageOff
            size={iconSize}
            aria-hidden="true"
            className="text-muted-foreground"
          />
        ) : (
          <Smartphone
            size={iconSize}
            aria-hidden="true"
            className="text-muted-foreground"
          />
        )}
      </div>
    );
  }

  return (
    <div className={box}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt={`รูปสินค้า ${name}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setState({ url: src, status: "ready" })}
        onError={() => setState({ url: src, status: "failed" })}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-200",
          status === "ready" ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
