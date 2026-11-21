"use client";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { Place } from "@/lib/data";
import { formatINR, permitLabel } from "@/lib/utils";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function InteractiveMap({ places }: { places: Place[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pineIcon = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `<div style="background:#12372A;color:white;border-radius:50% 50% 50% 0;width:32px;height:32px;display:flex;align-items:center;justify-content:center;transform:rotate(-45deg);border:2px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.35)"><span style="transform:rotate(45deg);font-size:14px;line-height:1;">📍</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -34],
    });
  }, []);

  const center: [number, number] = [25.5, 92.5];

  if (!mounted || !pineIcon) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-[var(--bg-editorial)] text-[var(--text-muted)] space-y-2 rounded-2xl">
        <span className="material-symbols-outlined text-[36px] animate-pulse text-accent-terracotta">
          map
        </span>
        <span className="font-label-caps text-xs uppercase tracking-wider">
          Initializing Interactive Map...
        </span>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ width: "100%", height: "100%", minHeight: "400px" }}
      className="z-0 rounded-2xl overflow-hidden"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map(p => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={pineIcon}>
          <Popup>
            <div className="font-sans text-xs space-y-1 min-w-[170px] p-0.5">
              <p className="font-semibold text-sm text-[#12372A]">{p.name}</p>
              <p className="text-gray-600 font-medium">{p.state} · {p.altitude}</p>
              <p className="font-bold text-[#E0531F] font-data-tabular">{formatINR(p.costPerDay)}/day</p>
              <p className="text-[11px] text-gray-500">{permitLabel(p.permit, p.permitCost)}</p>
              <p className="text-[11px] text-gray-500">Hub: {p.hub}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
