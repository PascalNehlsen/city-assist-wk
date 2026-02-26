import type { ParkingLocation } from "@/features/parking/types";

export const parkingLocations: ParkingLocation[] = [
  {
    id: "p1",
    name: "Parkhaus Innenstadt",
    latitude: 51.1398,
    longitude: 7.214,
    address: "Telegrafenstraße 20, 42929 Wermelskirchen",
  },
  {
    id: "p2",
    name: "Parkplatz Bürgerzentrum",
    latitude: 51.142,
    longitude: 7.2182,
    address: "Eich 6-8, 42929 Wermelskirchen",
  },
  {
    id: "p3",
    name: "Parkplatz Jahnplatz",
    latitude: 51.1377,
    longitude: 7.2112,
    address: "Jahnplatz, 42929 Wermelskirchen",
  },
];
