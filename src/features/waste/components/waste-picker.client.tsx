"use client";

import { useEffect, useMemo, useState } from "react";

const STREET_STORAGE_KEY = "waste.selectedStreetId";
const HOUSE_STORAGE_KEY = "waste.selectedHouseNumberId";

type Street = {
  id: number;
  name: string;
};

type HouseNumber = {
  id: number;
  nr: string;
};

type NextCollection = {
  date: string;
  pickups: Array<{
    type: string;
    colorHex: string;
  }>;
};

type StreetsResponse = {
  streets: Street[];
};

type HouseNumbersResponse = {
  supportsHouseNumbers: boolean;
  houseNumbers: HouseNumber[];
};

type NextResponse = {
  nextCollections: NextCollection[];
};

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Request failed.");
  }

  return (await response.json()) as T;
}

export default function WastePicker() {
  const [streets, setStreets] = useState<Street[]>([]);
  const [houseNumbers, setHouseNumbers] = useState<HouseNumber[]>([]);
  const [streetId, setStreetId] = useState<string>("");
  const [houseNumberId, setHouseNumberId] = useState<string>("");
  const [supportsHouseNumbers, setSupportsHouseNumbers] = useState<boolean>(true);
  const [nextCollections, setNextCollections] = useState<NextCollection[]>([]);
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  function formatWasteDate(dateString: string): string {
    const parsedDate = new Date(dateString);

    if (Number.isNaN(parsedDate.getTime())) {
      return dateString;
    }

    const weekday = new Intl.DateTimeFormat("de-DE", { weekday: "short" })
      .format(parsedDate)
      .replace(".", "");
    const dayMonth = new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
    }).format(parsedDate);

    return `${weekday}, ${dayMonth}.`;
  }

  async function loadNextCollections(selectedStreetId: string, selectedHouseNumberId: string) {
    setError("");
    setLoading(true);

    try {
      const data = await getJson<NextResponse>(
        `/api/waste?mode=next&streetId=${selectedStreetId}&houseNumberId=${selectedHouseNumberId}`,
      );
      setNextCollections(data.nextCollections);
      setCurrentCollectionIndex(0);
    } catch {
      setError("Abfalltermine konnten nicht geladen werden.");
      setNextCollections([]);
      setCurrentCollectionIndex(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadStreets() {
      try {
        const data = await getJson<StreetsResponse>("/api/waste?mode=streets");

        if (ignore) {
          return;
        }

        setStreets(data.streets);

        const storedStreetId = window.localStorage.getItem(STREET_STORAGE_KEY);

        if (storedStreetId && data.streets.some((street) => String(street.id) === storedStreetId)) {
          setStreetId(storedStreetId);
        }
      } catch {
        if (!ignore) {
          setError("Straßen konnten nicht geladen werden.");
        }
      }
    }

    loadStreets();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!streetId) {
      setHouseNumbers([]);
      setHouseNumberId("");
      setSupportsHouseNumbers(true);
      setNextCollections([]);
      setCurrentCollectionIndex(0);
      return;
    }

    let ignore = false;

    async function loadHouseNumbers() {
      try {
        const data = await getJson<HouseNumbersResponse>(
          `/api/waste?mode=houseNumbers&streetId=${streetId}`,
        );

        if (ignore) {
          return;
        }

        setHouseNumbers(data.houseNumbers);
        setSupportsHouseNumbers(data.supportsHouseNumbers);

        const storedHouseNumberId = window.localStorage.getItem(HOUSE_STORAGE_KEY);
        const matchedStoredHouseNumber = data.houseNumbers.find(
          (houseNumber) => String(houseNumber.id) === storedHouseNumberId,
        );

        setHouseNumberId(String(matchedStoredHouseNumber?.id ?? data.houseNumbers[0]?.id ?? ""));
      } catch {
        if (!ignore) {
          setError("Hausnummern konnten nicht geladen werden.");
        }
      }
    }

    loadHouseNumbers();

    return () => {
      ignore = true;
    };
  }, [streetId]);

  useEffect(() => {
    if (!streetId) {
      return;
    }

    window.localStorage.setItem(STREET_STORAGE_KEY, streetId);
  }, [streetId]);

  useEffect(() => {
    if (!houseNumberId) {
      return;
    }

    window.localStorage.setItem(HOUSE_STORAGE_KEY, houseNumberId);
  }, [houseNumberId]);

  useEffect(() => {
    if (!streetId || !houseNumberId) {
      return;
    }

    const storedStreetId = window.localStorage.getItem(STREET_STORAGE_KEY);
    const storedHouseNumberId = window.localStorage.getItem(HOUSE_STORAGE_KEY);

    if (streetId === storedStreetId && houseNumberId === storedHouseNumberId) {
      void loadNextCollections(streetId, houseNumberId);
    }
  }, [houseNumberId, streetId]);

  const canSubmit = useMemo(() => {
    return streetId.length > 0 && houseNumberId.length > 0;
  }, [houseNumberId, streetId]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadNextCollections(streetId, houseNumberId);
  }

  const currentCollection = nextCollections[currentCollectionIndex] ?? null;
  const hasNextCollectionDay = currentCollectionIndex < nextCollections.length - 1;

  function showNextCollectionDay() {
    if (!hasNextCollectionDay) {
      return;
    }

    setCurrentCollectionIndex((value) => value + 1);
  }

  function buildDayBackground(colors: string[]): string {
    if (colors.length === 0) {
      return "#e5e7eb";
    }

    if (colors.length === 1) {
      return colors[0]!;
    }

    const step = 100 / colors.length;
    const segments = colors.map((color, index) => {
      const start = (step * index).toFixed(2);
      const end = (step * (index + 1)).toFixed(2);
      return `${color} ${start}% ${end}%`;
    });

    return `linear-gradient(90deg, ${segments.join(", ")})`;
  }

  return (
    <section>
      <form className="list" onSubmit={onSubmit}>
        <div>
          <label htmlFor="street">Straße</label>
          <select
            id="street"
            value={streetId}
            onChange={(event) => setStreetId(event.target.value)}
          >
            <option value="">Bitte auswählen</option>
            {streets.map((street) => (
              <option key={street.id} value={street.id}>
                {street.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="houseNumber">Hausnummer</label>
          <select
            id="houseNumber"
            value={houseNumberId}
            onChange={(event) => setHouseNumberId(event.target.value)}
            disabled={houseNumbers.length === 0}
          >
            <option value="">Bitte auswählen</option>
            {houseNumbers.map((houseNumber) => (
              <option key={houseNumber.id} value={houseNumber.id}>
                {houseNumber.nr}
              </option>
            ))}
          </select>
          {!supportsHouseNumbers && (
            <p>Für diese Straße werden keine einzelnen Hausnummern unterschieden.</p>
          )}
        </div>

        <button type="submit" disabled={!canSubmit || loading}>
          {loading ? "Lade..." : "Nächste Abholungen anzeigen"}
        </button>
      </form>

      {error && <p>{error}</p>}

      {currentCollection && (
        <div className="list">
          <article
            className="waste-next-card"
            style={{
              background: buildDayBackground(currentCollection.pickups.map((pickup) => pickup.colorHex)),
            }}
          >
            <h2>{formatWasteDate(currentCollection.date)}</h2>
            <p>{currentCollection.pickups.map((pickup) => pickup.type).join(" · ")}</p>
          </article>
          <button onClick={showNextCollectionDay} type="button" disabled={!hasNextCollectionDay}>
            Nächster Abholungstag
          </button>
        </div>
      )}
    </section>
  );
}
