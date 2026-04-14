"use client";

import type { ParkingLocation } from "@/features/parking/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  locations: ParkingLocation[];
};

export default function ParkingMap({ locations }: Props) {
  const center = locations[0] ?? {
    latitude: 51.1398,
    longitude: 7.214,
  };

  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={14}
      style={{ height: "420px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <Marker
          icon={icon}
          key={location.id}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <strong>{location.name}</strong>
            <br />
            {location.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
