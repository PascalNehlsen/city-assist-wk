import { listEvents } from "@/features/events/services/events-service";

type Props = {
  searchParams: Promise<{ from?: string }>;
};

export default async function EventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const events = listEvents(params.from);

  return (
    <main className="container">
      <h1>Veranstaltungen</h1>
      <form method="get" className="inline-form">
        <label htmlFor="from">Ab Datum</label>
        <input id="from" name="from" type="date" defaultValue={params.from} />
        <button type="submit">Filtern</button>
      </form>
      <ul className="list">
        {events.map((event) => (
          <li key={event.id}>
            <h2>{event.title}</h2>
            <p>
              {event.date} · {event.location}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
