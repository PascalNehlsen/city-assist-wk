import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <h1>Stadt-Assistent Wermelskirchen</h1>
      <p>Digitale Infos zu Abfall, Veranstaltungen, Parkplätzen und Angeboten.</p>
      <nav className="nav-grid" aria-label="Hauptbereiche">
        <Link href="/events">Veranstaltungen</Link>
        <Link href="/parking">Parken</Link>
        <Link href="/deals">Deals</Link>
      </nav>
    </main>
  );
}
