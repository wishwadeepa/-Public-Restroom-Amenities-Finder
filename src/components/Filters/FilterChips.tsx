"use client";

import React from "react";
import { Sparkles, Accessibility, DollarSign, CheckCircle2 } from "lucide-react";

export interface FilterState {
  type: string; // "ALL", "RESTROOM", "WATER_FOUNTAIN", "SEATING"
  accessibleOnly: boolean;
  freeOnly: boolean;
  operationalOnly: boolean;
}

interface FilterChipsProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  amenityCounts: {
    total: number;
    restrooms: number;
    water: number;
    seating: number;
  };
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onChange,
  amenityCounts,
}) => {
  const handleTypeSelect = (type: string) => {
    onChange({ ...filters, type });
  };

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2.5 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Amenity Type selector chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => handleTypeSelect("ALL")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              filters.type === "ALL"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Amenities ({amenityCounts.total})
          </button>
          <button
            onClick={() => handleTypeSelect("RESTROOM")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filters.type === "RESTROOM"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            <span>🚻 Restrooms</span>
            <span className="opacity-80 text-[10px]">({amenityCounts.restrooms})</span>
          </button>
          <button
            onClick={() => handleTypeSelect("WATER_FOUNTAIN")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filters.type === "WATER_FOUNTAIN"
                ? "bg-cyan-600 text-white shadow-sm"
                : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
            }`}
          >
            <span>💧 Water Refill</span>
            <span className="opacity-80 text-[10px]">({amenityCounts.water})</span>
          </button>
          <button
            onClick={() => handleTypeSelect("SEATING")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filters.type === "SEATING"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <span>🪑 Seating</span>
            <span className="opacity-80 text-[10px]">({amenityCounts.seating})</span>
          </button>
        </div>

        {/* Feature Toggles */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() =>
              onChange({ ...filters, accessibleOnly: !filters.accessibleOnly })
            }
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
              filters.accessibleOnly
                ? "bg-blue-50 border-blue-400 text-blue-700 font-semibold"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span>Accessible</span>
          </button>

          <button
            onClick={() => onChange({ ...filters, freeOnly: !filters.freeOnly })}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
              filters.freeOnly
                ? "bg-emerald-50 border-emerald-400 text-emerald-700 font-semibold"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Free</span>
          </button>

          <button
            onClick={() =>
              onChange({
                ...filters,
                operationalOnly: !filters.operationalOnly,
              })
            }
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-all ${
              filters.operationalOnly
                ? "bg-green-50 border-green-400 text-green-700 font-semibold"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Open Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
