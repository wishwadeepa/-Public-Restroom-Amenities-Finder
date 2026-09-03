"use client";

import dynamic from "next/dynamic";
import React from "react";

const AmenityMap = dynamic(
  () => import("./AmenityMap").then((mod) => mod.AmenityMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 font-medium">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading interactive map...</span>
        </div>
      </div>
    ),
  }
);

export const DynamicAmenityMap = AmenityMap;
