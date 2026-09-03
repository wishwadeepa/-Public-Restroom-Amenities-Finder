"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "@/components/Navigation/Navbar";
import { FilterChips, FilterState } from "@/components/Filters/FilterChips";
import { DynamicAmenityMap } from "@/components/Map/DynamicAmenityMap";
import {
  AmenityDetail,
  AmenityDetailDrawer,
} from "@/components/Drawer/AmenityDetailDrawer";
import { AddAmenityModal } from "@/components/Forms/AddAmenityModal";
import { MapPin, List, Layers, Plus } from "lucide-react";
import { formatDistance } from "@/lib/utils";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    type: "ALL",
    accessibleOnly: false,
    freeOnly: false,
    operationalOnly: false,
  });
  const [showFilters, setShowFilters] = useState(true);

  const [amenities, setAmenities] = useState<AmenityDetail[]>([]);
  const [selectedAmenity, setSelectedAmenity] = useState<AmenityDetail | null>(null);
  const [viewMode, setViewMode] = useState<"MAP" | "LIST">("MAP");

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Pin Drop state
  const [isDropPinMode, setIsDropPinMode] = useState(false);
  const [droppedPinLocation, setDroppedPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch amenities
  const fetchAmenities = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type !== "ALL") params.append("type", filters.type);
      if (filters.accessibleOnly) params.append("isAccessible", "true");
      if (filters.freeOnly) params.append("feeRequired", "false");
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (userLocation) {
        params.append("userLat", userLocation.lat.toString());
        params.append("userLng", userLocation.lng.toString());
      }

      const res = await fetch(`/api/amenities?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch amenities");
      const data = await res.json();
      setAmenities(data.data || []);

      // If an amenity was selected, update its state
      if (selectedAmenity) {
        const updated = (data.data || []).find((a: AmenityDetail) => a.id === selectedAmenity.id);
        if (updated) setSelectedAmenity(updated);
      }
    } catch (err) {
      console.error("Error fetching amenities:", err);
    }
  }, [filters, searchQuery, userLocation, selectedAmenity]);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  // Request user GPS location
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn("Geolocation permission denied or timed out:", err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Attempt to locate on first load
  useEffect(() => {
    handleLocateMe();
  }, [handleLocateMe]);

  // Drop pin mode toggling
  const handleToggleDropPinMode = () => {
    if (!isDropPinMode) {
      const centerLat = userLocation?.lat || Number(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT) || 37.7879;
      const centerLng = userLocation?.lng || Number(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG) || -122.4075;
      setDroppedPinLocation({ lat: centerLat, lng: centerLng });
      setIsDropPinMode(true);
      setSelectedAmenity(null);
    } else {
      setIsDropPinMode(false);
      setDroppedPinLocation(null);
    }
  };

  const handleConfirmDropPin = () => {
    if (droppedPinLocation) {
      setIsAddModalOpen(true);
    }
  };

  const handleCancelDropPin = () => {
    setIsDropPinMode(false);
    setDroppedPinLocation(null);
  };

  const handleAmenityCreated = () => {
    setIsDropPinMode(false);
    setDroppedPinLocation(null);
    fetchAmenities();
  };

  // Filter amenities further in memory for operationalOnly
  const displayedAmenities = useMemo(() => {
    if (!filters.operationalOnly) return amenities;
    return amenities.filter((item) => item.status === "OPERATIONAL");
  }, [amenities, filters.operationalOnly]);

  const amenityCounts = useMemo(() => {
    return {
      total: amenities.length,
      restrooms: amenities.filter((a) => a.type === "RESTROOM").length,
      water: amenities.filter((a) => a.type === "WATER_FOUNTAIN").length,
      seating: amenities.filter((a) => a.type === "SEATING").length,
    };
  }, [amenities]);

  return (
    <main className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
      {/* Top App Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        isDropPinMode={isDropPinMode}
        onToggleDropPinMode={handleToggleDropPinMode}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Filter Chips Bar */}
      {showFilters && (
        <FilterChips
          filters={filters}
          onChange={setFilters}
          amenityCounts={amenityCounts}
        />
      )}

      {/* Main View Area: Map or List */}
      <div className="flex-1 relative flex">
        {viewMode === "MAP" ? (
          <DynamicAmenityMap
            amenities={displayedAmenities}
            selectedAmenity={selectedAmenity}
            onSelectAmenity={(item) => setSelectedAmenity(item)}
            userLocation={userLocation}
            isDropPinMode={isDropPinMode}
            droppedPinLocation={droppedPinLocation}
            onDroppedPinChange={setDroppedPinLocation}
            onConfirmDropPin={handleConfirmDropPin}
            onCancelDropPin={handleCancelDropPin}
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 max-w-3xl mx-auto w-full space-y-3">
            <h2 className="text-base font-bold text-slate-800">
              Nearby Amenities ({displayedAmenities.length})
            </h2>
            {displayedAmenities.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No amenities found matching your criteria. Try adjusting your search or filters.
              </div>
            ) : (
              displayedAmenities.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedAmenity(item);
                    setViewMode("MAP");
                  }}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {item.type === "RESTROOM"
                          ? "🚻 Restroom"
                          : item.type === "WATER_FOUNTAIN"
                          ? "💧 Water Refill"
                          : "🪑 Seating"}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.status === "OPERATIONAL"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "OUT_OF_ORDER"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                    {item.address && (
                      <p className="text-xs text-slate-500">{item.address}</p>
                    )}
                    <div className="flex items-center gap-3 pt-1 text-xs text-slate-600">
                      {item.avgRating && (
                        <span className="text-amber-600 font-semibold">
                          ★ {item.avgRating} ({item.reviewCount})
                        </span>
                      )}
                      {item.isAccessible && (
                        <span className="text-blue-600 font-medium">♿ Accessible</span>
                      )}
                      {item.feeRequired ? (
                        <span className="text-amber-700">Fee Required</span>
                      ) : (
                        <span className="text-emerald-700">Free</span>
                      )}
                    </div>
                  </div>
                  {item.distanceMeters !== undefined && item.distanceMeters !== null && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {formatDistance(item.distanceMeters)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Selected Amenity Detail Drawer */}
        <AmenityDetailDrawer
          amenity={selectedAmenity}
          onClose={() => setSelectedAmenity(null)}
          onVerificationSubmitted={fetchAmenities}
          onReviewSubmitted={fetchAmenities}
        />
      </div>

      {/* Floating Bottom View Toggle (Map vs List) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center bg-white/95 backdrop-blur rounded-full shadow-lg border border-slate-200 p-1">
        <button
          onClick={() => setViewMode("MAP")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            viewMode === "MAP"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Map</span>
        </button>
        <button
          onClick={() => setViewMode("LIST")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            viewMode === "LIST"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>List ({displayedAmenities.length})</span>
        </button>
      </div>

      {/* Add Amenity Form Modal */}
      {droppedPinLocation && (
        <AddAmenityModal
          latitude={droppedPinLocation.lat}
          longitude={droppedPinLocation.lng}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAmenityCreated}
        />
      )}
    </main>
  );
}
