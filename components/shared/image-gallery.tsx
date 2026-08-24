"use client";

import { useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageNotFound01Icon } from "@hugeicons/core-free-icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type GalleryImage = { id: string | number; src: string; alt?: string };

/**
 * Responsive image grid with a click-to-zoom lightbox. Used for a request's
 * design + reference images and a vendor's portfolio. A URL that fails to load
 * is replaced with an accessible placeholder rather than a broken image.
 */
export function ImageGallery({
  images,
  className,
}: {
  images: GalleryImage[];
  className?: string;
}) {
  const [active, setActive] = useState<GalleryImage | null>(null);
  const [failed, setFailed] = useState<Set<string | number>>(new Set());

  const markFailed = (id: string | number) =>
    setFailed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  if (images.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4",
          className,
        )}
      >
        {images.map((img) =>
          failed.has(img.id) ? (
            <ImageFallback key={img.id} alt={img.alt} />
          ) : (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(img)}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <Image
                src={img.src}
                alt={img.alt ?? "Image"}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform group-hover:scale-105"
                onError={() => markFailed(img.id)}
              />
            </button>
          ),
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-2xl sm:max-w-2xl">
          <DialogTitle className="sr-only">
            {active?.alt ?? "Image preview"}
          </DialogTitle>
          {active &&
            (failed.has(active.id) ? (
              <ImageFallback alt={active.alt} />
            ) : (
              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                <Image
                  src={active.src}
                  alt={active.alt ?? "Image"}
                  fill
                  sizes="(max-width: 768px) 100vw, 42rem"
                  className="object-contain"
                  onError={() => markFailed(active.id)}
                />
              </div>
            ))}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ImageFallback({ alt }: { alt?: string }) {
  return (
    <div
      role="img"
      aria-label={alt ? `${alt} (failed to load)` : "Image failed to load"}
      className="text-muted-foreground flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted px-2 text-center"
    >
      <HugeiconsIcon icon={ImageNotFound01Icon} className="size-6" strokeWidth={1.5} />
      <span className="text-[0.625rem]">Image unavailable</span>
    </div>
  );
}
