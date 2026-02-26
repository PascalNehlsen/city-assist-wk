import eventsData from "@/features/events/data/events.json";
import {
  type EventItem,
  eventItemSchema,
} from "@/features/events/types";
import { z } from "zod";

const eventsSchema = z.array(eventItemSchema);

function parseDateOrNull(dateString: string): Date | null {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function listEvents(fromDate?: string): EventItem[] {
  const allEvents = eventsSchema.parse(eventsData);

  if (!fromDate) {
    return allEvents;
  }

  const threshold = parseDateOrNull(fromDate);

  if (!threshold) {
    return allEvents;
  }

  return allEvents.filter((event) => new Date(event.date) >= threshold);
}
