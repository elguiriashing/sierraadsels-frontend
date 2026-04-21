"use client";

import { useEffect, useCallback } from "react";
import { JewelryItem } from "@/types";
import { cn } from "@/lib/utils";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: JewelryItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export default function Lightbox({
  isOpen,
  onClose,
  items,
  currentIndex,
  onNavigate,
}: LightboxProps) {
  const currentItem = items[currentIndex];

  const handlePrev = useCallback(() => {
    onNavigate(currentIndex === 0 ? items.length - 1 : currentIndex - 1);
  }, [currentIndex, items.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate(currentIndex === items.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, items.length, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "ArrowRight":
          handleNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !currentItem) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
        aria-label="Sluiten"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 text-white/70 text-sm tracking-wider">
        {currentIndex + 1} / {items.length}
      </div>

      {/* Navigation - Previous */}
      <button
        onClick={handlePrev}
        className="absolute left-4 z-10 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
        aria-label="Vorige"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Navigation - Next */}
      <button
        onClick={handleNext}
        className="absolute right-4 z-10 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
        aria-label="Volgende"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Image Container */}
      <div
        className="w-full h-full flex items-center justify-center p-16 md:p-20"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative inline-flex max-w-full max-h-full">
          <img
            src={currentItem.src}
            alt={currentItem.title || "Jewelry"}
            className="max-w-full max-h-[80vh] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23999'%3ESierraadsels%3C/text%3E%3C/svg%3E";
            }}
          />

          {/* Info */}
          {(currentItem.title || currentItem.description) && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              {currentItem.title && (
                <h3 className="text-white text-lg font-light tracking-wide mb-1">
                  {currentItem.title}
                </h3>
              )}
              {currentItem.description && (
                <p className="text-white/80 text-sm font-light">
                  {currentItem.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
