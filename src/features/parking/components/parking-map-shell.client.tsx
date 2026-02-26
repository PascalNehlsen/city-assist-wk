"use client";

import type { ParkingLocation } from "@/features/parking/types";
import dynamic from "next/dynamic";

const ParkingMap = dynamic(() => import("@/features/parking/components/parking-map.client"), {
  ssr: false,
});

type Props = {
  locations: ParkingLocation[];
};

export default function ParkingMapShell({ locations }: Props) {
  return <ParkingMap locations={locations} />;
}
