"use client";

import React from "react";
import { MapPin, Navigation, Plus, Search, SlidersHorizontal } from "lucide-react";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLocateMe: () => void;
  isLocating: boolean;
  isDropPinMode: boolean;
  onToggleDropPinMode: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onLocateMe,
  isLocating,
  isDropPinMode,
  onToggleDropPinMode,
  showFilters,
  onToggleFilters,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-2.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & App Title */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                Amenities Finder
              </h1>
              <p className="text-xs text-slate-500">Restrooms • Water • Seating</p>
            </div>
          </div>

          {/* Mobile Drop Pin & Locate buttons */}
          <div className="flex items-center space-x-2 sm:hidden">
            <button
              onClick={onLocateMe}
              disabled={isLocating}
              title="Find my location"
              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin text-blue-600" : ""}`} />
            </button>
            <button
              onClick={onToggleDropPinMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
                isDropPinMode
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {isDropPinMode ? "Cancel Pin" : "Add Pin"}
            </button>
          </div>
        </div>

        {/* Search Bar & Desktop Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md justify-end">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>

          <button
            onClick={onToggleFilters}
            className={`p-2 rounded-xl border transition-all ${
              showFilters
                ? "bg-blue-50 border-blue-300 text-blue-600"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Desktop Locate Me button */}
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            title="Locate me"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-all"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin text-blue-600" : ""}`} />
            <span>Near Me</span>
          </button>

          {/* Desktop Add Pin button */}
          <button
            onClick={onToggleDropPinMode}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all ${
              isDropPinMode
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isDropPinMode ? "Cancel Pin" : "Drop Pin"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
