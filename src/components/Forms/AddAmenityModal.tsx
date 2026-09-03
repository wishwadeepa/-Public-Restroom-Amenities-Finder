"use client";

import React, { useState } from "react";
import { X, MapPin, Check, AlertCircle } from "lucide-react";

interface AddAmenityModalProps {
  latitude: number;
  longitude: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAmenityModal: React.FC<AddAmenityModalProps> = ({
  latitude,
  longitude,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<"RESTROOM" | "WATER_FOUNTAIN" | "SEATING">("RESTROOM");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [isAccessible, setIsAccessible] = useState(false);
  const [isGenderNeutral, setIsGenderNeutral] = useState(false);
  const [hasBabyChanging, setHasBabyChanging] = useState(false);
  const [feeRequired, setFeeRequired] = useState(false);
  const [keyOrCodeRequired, setKeyOrCodeRequired] = useState(false);
  const [doorCode, setDoorCode] = useState("");
  const [hours, setHours] = useState("24/7");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        type,
        latitude,
        longitude,
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        isAccessible,
        isGenderNeutral,
        hasBabyChanging,
        feeRequired,
        keyOrCodeRequired,
        doorCode: keyOrCodeRequired && doorCode.trim() ? doorCode.trim() : undefined,
        hours: hours.trim() || undefined,
      };

      const res = await fetch("/api/amenities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add amenity pin");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving amenity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Add New Amenity Pin</h3>
              <p className="text-xs text-slate-500 font-mono">
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amenity Type Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Amenity Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("RESTROOM")}
                className={`py-2 px-3 rounded-xl border font-semibold flex flex-col items-center gap-1 transition-all ${
                  type === "RESTROOM"
                    ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">🚻</span>
                <span>Restroom</span>
              </button>
              <button
                type="button"
                onClick={() => setType("WATER_FOUNTAIN")}
                className={`py-2 px-3 rounded-xl border font-semibold flex flex-col items-center gap-1 transition-all ${
                  type === "WATER_FOUNTAIN"
                    ? "bg-cyan-50 border-cyan-500 text-cyan-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">💧</span>
                <span>Water Refill</span>
              </button>
              <button
                type="button"
                onClick={() => setType("SEATING")}
                className={`py-2 px-3 rounded-xl border font-semibold flex flex-col items-center gap-1 transition-all ${
                  type === "SEATING"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">🪑</span>
                <span>Seating Spot</span>
              </button>
            </div>
          </div>

          {/* Name & Address */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Name / Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Park North Drinking Fountain, Cafe Customer Restroom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Address / Location Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Near 4th Street entrance, 2nd floor"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Hours of Availability
            </label>
            <input
              type="text"
              placeholder="e.g. 24/7, Mon-Fri 8AM - 8PM"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Feature Checkboxes */}
          <div className="space-y-2 pt-1 border-t border-slate-200">
            <span className="block font-semibold text-slate-700">Features & Access</span>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isAccessible}
                  onChange={(e) => setIsAccessible(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Wheelchair Accessible</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={hasBabyChanging}
                  onChange={(e) => setHasBabyChanging(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Baby Changing Table</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={isGenderNeutral}
                  onChange={(e) => setIsGenderNeutral(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Gender-Neutral</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={feeRequired}
                  onChange={(e) => setFeeRequired(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Fee / Purchase Required</span>
              </label>
            </div>

            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={keyOrCodeRequired}
                onChange={(e) => setKeyOrCodeRequired(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Door Code or Key Required</span>
            </label>

            {keyOrCodeRequired && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Shared Door / Lock Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1234, Ask cashier for token"
                  value={doorCode}
                  onChange={(e) => setDoorCode(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Description / Helpful notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Helpful Notes / Directions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Shaded spot under big oak tree, very clean water filter"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                "Saving Pin..."
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Pin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
