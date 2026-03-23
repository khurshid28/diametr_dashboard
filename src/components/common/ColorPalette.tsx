import { useState } from "react";
import Label from "../form/Label";
import { COLOR_PALETTE } from "./colorPaletteData";

interface ColorPaletteProps {
  label?: string;
  value: string;
  onChange: (hex: string) => void;
  onClear?: () => void;
}

export default function ColorPalette({ label = "Rang", value, onChange, onClear }: ColorPaletteProps) {
  const [expanded, setExpanded] = useState(false);
  const selected = COLOR_PALETTE.find((c) => c.hex.toLowerCase() === value?.toLowerCase());

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {value && (
            <>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span
                  className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600"
                  style={{ background: value }}
                />
                {selected?.name ?? value}
              </span>
              {onClear && (
                <button
                  type="button"
                  onClick={onClear}
                  className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Rangni tozalash"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
          >
            {expanded ? "Yopish ▲" : value ? "O'zgartirish ▼" : "Tanlash ▼"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-10 gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 max-h-[200px] overflow-y-auto">
          {COLOR_PALETTE.map((c) => {
            const isSelected = value?.toLowerCase() === c.hex.toLowerCase();
            const isWhite = c.hex.toUpperCase() === "#FFFFFF";
            return (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  onChange(c.hex);
                  setExpanded(false);
                }}
                title={c.name}
                className={`group relative w-full aspect-square rounded-lg transition-all duration-150 ${
                  isSelected
                    ? "ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-800 scale-110 z-10"
                    : "hover:scale-110 hover:z-10 hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-500 hover:ring-offset-1"
                }`}
                style={{
                  background: c.hex,
                  border: isWhite ? "1.5px solid #d1d5db" : "1.5px solid transparent",
                }}
              >
                {isSelected && (
                  <svg className="absolute inset-0 m-auto w-3.5 h-3.5" viewBox="0 0 20 20" fill={isWhite || c.hex === "#FDE047" || c.hex === "#FACC15" || c.hex === "#FCD34D" || c.hex === "#FFFDD0" || c.hex === "#D1D5DB" || c.hex === "#9CA3AF" || c.hex === "#C0C0C0" || c.hex === "#F5F5DC" ? "#000" : "#fff"}>
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
