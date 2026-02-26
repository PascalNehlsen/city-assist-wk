import { listActiveDeals } from "@/features/deals/services/deals-service";

export default function DealsPage() {
  const deals = listActiveDeals();

  return (
    <main className="container">
      <h1>Lokale Deals</h1>
      <ul className="list">
        {deals.map((deal) => (
          <li key={deal.id}>
            <h2>{deal.title}</h2>
            <p>
              {deal.vendor} · gültig bis {deal.expiresAt}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
