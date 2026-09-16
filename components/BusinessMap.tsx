"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Business } from "@/types/business";

type BusinessMapProps = {
  businesses: Business[];
};

const OLFEN_CENTER: [number, number] = [51.7079, 7.3786];

const markerIcon = new L.Icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "business-marker",
});

function ResizeMapAutomatically() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const resizeMap = () => {
      requestAnimationFrame(() => {
        map.invalidateSize({
          animate: false,
          pan: false,
        });
      });
    };

    resizeMap();

    const timeouts = [
      window.setTimeout(resizeMap, 100),
      window.setTimeout(resizeMap, 300),
      window.setTimeout(resizeMap, 700),
      window.setTimeout(resizeMap, 1200),
    ];

    const resizeObserver = new ResizeObserver(() => {
      resizeMap();
    });

    resizeObserver.observe(container);
    window.addEventListener("resize", resizeMap);

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeMap);
    };
  }, [map]);

  return null;
}

function FitMapToBusinesses({ businesses }: BusinessMapProps) {
  const map = useMap();

  useEffect(() => {
    if (businesses.length === 0) {
      map.setView(OLFEN_CENTER, 13);
      return;
    }

    const validBusinesses = businesses.filter(
      (business) =>
        Number.isFinite(business.latitude) &&
        Number.isFinite(business.longitude)
    );

    if (validBusinesses.length === 0) {
      map.setView(OLFEN_CENTER, 13);
      return;
    }

    const bounds = L.latLngBounds(
      validBusinesses.map((business) => [
        business.latitude,
        business.longitude,
      ])
    );

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
    });

    window.setTimeout(() => {
      map.invalidateSize({
        animate: false,
        pan: false,
      });
    }, 200);
  }, [businesses, map]);

  return null;
}

export default function BusinessMap({ businesses }: BusinessMapProps) {
  const mapKeyRef = useRef("olfen-business-map");

  return (
    <div className="relative z-0 h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-[520px] lg:h-[600px]">
      <MapContainer
        key={mapKeyRef.current}
        center={OLFEN_CENTER}
        zoom={13}
        minZoom={11}
        maxZoom={18}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <ResizeMapAutomatically />
        <FitMapToBusinesses businesses={businesses} />

        {businesses.map((business) => (
          <Marker
            key={business.id}
            position={[business.latitude, business.longitude]}
            icon={markerIcon}
            interactive={true}
            riseOnHover={true}
            zIndexOffset={1000}
          >
            <Popup>
  <div className="space-y-3">
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {business.category}
      </p>

      <h3 className="mt-1 text-base font-bold text-slate-900">
        {business.name}
      </h3>
    </div>

    <p className="text-sm text-slate-600">
      {business.address}
    </p>

    {business.phone && (
      <p className="text-sm text-slate-600">
        Tel.: {business.phone}
      </p>
    )}

    <div className="flex flex-wrap gap-2 pt-1">
      <Link
        href={`/anbieter/${business.id}`}
        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
      >
        Details
      </Link>

      {business.website && (
        <a
          href={business.website}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          Website
        </a>
      )}
    </div>
  </div>
</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}