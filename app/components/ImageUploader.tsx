"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { uploadImage } from "@/app/lib/api";
import { useToast } from "@/app/providers/ToastProvider";

interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

/** Drag-and-drop or click to upload; posts to /api/upload and stores the path. */
export default function ImageUploader({
  value,
  onChange,
  label = "Photo",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      toast("Photo uploaded");
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
        {label}
      </span>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`relative mt-2 overflow-hidden rounded-2xl border-2 border-dashed transition-colors duration-300 ${
          dragging
            ? "border-carrot-400 bg-carrot-50"
            : "border-ink-200 bg-ink-50/50"
        }`}
      >
        {value ? (
          <div className="relative aspect-[16/10]">
            <Image
              src={value}
              alt="Dish preview"
              fill
              sizes="(max-width: 640px) 90vw, 380px"
              className="object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 bg-linear-to-t from-ink-950/80 to-transparent p-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-ink-900 backdrop-blur transition-colors hover:bg-white"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="rounded-full bg-rose-500/90 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition-colors hover:bg-rose-600"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2.5 px-6 text-center transition-colors hover:bg-carrot-50/50"
          >
            {uploading ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  className="size-7 animate-spin text-carrot-500"
                  aria-hidden
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M12 3a9 9 0 0 1 9 9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-sm text-ink-500">Uploading…</span>
              </>
            ) : (
              <>
                <span className="grid size-11 place-items-center rounded-full bg-white text-carrot-500 shadow-sm">
                  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                    <path
                      d="M12 16V5m0 0L8 9m4-4 4 4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-sm font-medium text-ink-700">
                  Drop a photo or click to upload
                </span>
                <span className="text-xs text-ink-400">
                  JPG, PNG or WebP · up to 4MB
                </span>
              </>
            )}
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {/* URL fallback — lets an admin point at a hosted image instead */}
      <input
        type="url"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        placeholder="…or paste an image URL"
        className="mt-2 w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-xs text-ink-700 outline-none transition-colors placeholder:text-ink-300 focus:border-carrot-400"
      />
    </div>
  );
}
