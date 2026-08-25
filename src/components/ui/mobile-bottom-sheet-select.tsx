"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface BottomSheetOption {
  id: string;
  label: string;
}

interface MobileBottomSheetSelectProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string;
  options: BottomSheetOption[];
  onChange: (val: string) => void;
}

export function MobileBottomSheetSelect({
  isOpen,
  onClose,
  title,
  value,
  options,
  onChange,
}: MobileBottomSheetSelectProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to ensure the DOM element is rendered before triggering the CSS transition
      const t = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isRendered || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] flex flex-col justify-end bg-[#0f172a]/60 backdrop-blur-sm sm:hidden transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`rounded-t-2xl bg-white pb-8 pt-4 px-4 shadow-xl border-t border-[#d5d9e0] transition-transform duration-300 ease-out ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold tracking-wide text-[#111827] uppercase">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#f1f5f9] p-1.5 text-[#6b7280] transition hover:bg-[#e2e8f0]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-2.5 max-h-[60vh] overflow-y-auto overscroll-contain">
          {options.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onChange(s.id);
                onClose();
              }}
              className={`flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                value === s.id
                  ? "bg-[#eff6ff] text-[#1d4ed8] border-2 border-[#3b82f6] shadow-sm"
                  : "bg-[#f8fafc] text-[#374151] border-2 border-transparent hover:bg-[#f1f5f9]"
              }`}
            >
              {s.label}
              {value === s.id && (
                <svg className="h-5 w-5 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
