import { parkingLocations } from "@/features/parking/data/parking-locations";
import ParkingMapShell from "@/features/parking/components/parking-map-shell.client";

export default function ParkingPage() {
  return (
    <main className="container">
      <h1>Parken</h1>
      <ul className="list">
        {parkingLocations.map((location) => (
          <li key={location.id}>
            <h2>{location.name}</h2>
            <p>{location.address}</p>
          </li>
        ))}
      </ul>
      <ParkingMapShell locations={parkingLocations} />
    </main>
  );
}
