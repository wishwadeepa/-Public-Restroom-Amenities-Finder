"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import { AmenityDetail } from "../Drawer/AmenityDetailDrawer";
import { MapPin, Navigation, Check } from "lucide-react";

interface AmenityMapProps {
  amenities: AmenityDetail[];
  selectedAmenity: AmenityDetail | null;
  onSelectAmenity: (amenity: AmenityDetail) => void;
  userLocation: { lat: number; lng: number } | null;
  isDropPinMode: boolean;
  droppedPinLocation: { lat: number; lng: number } | null;
  onDroppedPinChange: (location: { lat: number; lng: number }) => void;
  onConfirmDropPin: () => void;
  onCancelDropPin: () => void;
}

// Custom Leaflet DivIcon helpers
function createCustomPinIcon(type: string, status: string, isSelected: boolean) {
  let bgColor = "bg-blue-600";
  let symbol = "🚻";
  let borderColor = isSelected ? "border-amber-400 ring-4 ring-amber-300" : "border-white";

  if (type === "WATER_FOUNTAIN") {
    bgColor = "bg-cyan-600";
    symbol = "💧";
  } else if (type === "SEATING") {
    bgColor = "bg-emerald-600";
    symbol = "🪑";
  }

  if (status === "OUT_OF_ORDER") {
    bgColor = "bg-amber-600";
  } else if (status === "CLOSED") {
    bgColor = "bg-slate-600";
  }

  const html = `
    <div class="custom-pin-marker ${bgColor} ${borderColor} border-2 text-white shadow-lg flex items-center justify-center cursor-pointer"
         style="width: 36px; height: 36px; font-size: 16px; border-radius: 9999px;">
      <span>${symbol}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "leaflet-custom-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function createDraggableDropIcon() {
  const html = `
    <div class="custom-pin-marker custom-pin-drop bg-rose-600 border-2 border-white text-white shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing"
         style="width: 44px; height: 44px; font-size: 20px; border-radius: 9999px;">
      <span>📍</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "leaflet-drop-pin-marker",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });
}

// Center map controller
function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || map.getZoom(), { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

// Map events handler for clicking to reposition the dropped pin
function MapClickHandler({
  isDropPinMode,
  onDroppedPinChange,
}: {
  isDropPinMode: boolean;
  onDroppedPinChange: (location: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e) {
      if (isDropPinMode) {
        onDroppedPinChange({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export const AmenityMap: React.FC<AmenityMapProps> = ({
  amenities,
  selectedAmenity,
  onSelectAmenity,
  userLocation,
  isDropPinMode,
  droppedPinLocation,
  onDroppedPinChange,
  onConfirmDropPin,
  onCancelDropPin,
}) => {
  const defaultCenter: [number, number] = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng];
    const envLat = Number(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LAT) || 37.7749;
    const envLng = Number(process.env.NEXT_PUBLIC_DEFAULT_MAP_CENTER_LNG) || -122.4194;
    return [envLat, envLng];
  }, [userLocation]);

  const activeCenter = useMemo((): [number, number] => {
    if (isDropPinMode && droppedPinLocation) {
      return [droppedPinLocation.lat, droppedPinLocation.lng];
    }
    if (selectedAmenity) {
      return [selectedAmenity.latitude, selectedAmenity.longitude];
    }
    return defaultCenter;
  }, [isDropPinMode, droppedPinLocation, selectedAmenity, defaultCenter]);

  return (
    <div className="relative w-full h-full flex-1 min-h-[400px]">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapController center={activeCenter} />

        <MapClickHandler
          isDropPinMode={isDropPinMode}
          onDroppedPinChange={onDroppedPinChange}
        />

        {/* User GPS location pulsing indicator */}
        {userLocation && (
          <>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={80}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#60a5fa",
                fillOpacity: 0.25,
                weight: 1.5,
              }}
            />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                html: `<div class="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>`,
                className: "user-gps-dot",
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>
                <div className="text-xs font-semibold">Your Location</div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Amenity pins */}
        {amenities.map((item) => {
          const isSelected = selectedAmenity?.id === item.id;
          const icon = createCustomPinIcon(item.type, item.status, isSelected);

          return (
            <Marker
              key={item.id}
              position={[item.latitude, item.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectAmenity(item),
              }}
            />
          );
        })}

        {/* Draggable Drop-Pin when adding an amenity */}
        {isDropPinMode && droppedPinLocation && (
          <Marker
            position={[droppedPinLocation.lat, droppedPinLocation.lng]}
            icon={createDraggableDropIcon()}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                onDroppedPinChange({ lat: position.lat, lng: position.lng });
              },
            }}
          />
        )}
      </MapContainer>

      {/* Floating Instructions & Actions when Drop Pin mode is active */}
      {isDropPinMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-md w-11/12 bg-slate-900/90 backdrop-blur text-white p-3 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>
              Tap anywhere on map or drag the pin to place amenity.
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onCancelDropPin}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirmDropPin}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white flex items-center gap-1 shadow-md shadow-rose-600/30"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
