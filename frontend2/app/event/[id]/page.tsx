import { getEventById, getRelatedEvents } from "@/actions/event-actions";
import { getResaleTickets } from "@/actions/ticket-actions"; // <--- IMPORT
import TicketSelector from "@/components/ticket-selector";
import EventCard from "@/components/event-card";
import { ResaleList } from "@/components/ticket/resale-list"; // <--- IMPORT
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  MapPin,
  ArrowLeft,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage(props: EventPageProps) {
  const params = await props.params;
  const id = params.id;

  const event = await getEventById(id);
  if (!event) return notFound();

  // Paralelno dohvati sve podatke
  const [relatedEvents, resaleTickets] = await Promise.all([
    getRelatedEvents(event.category, event._id),
    getResaleTickets(event._id),
  ]);

  const formattedDate = new Date(event.date).toLocaleDateString("bs-BA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container py-10 max-w-6xl mx-auto">
      {/* HEADER I NAVIGACIJA */}
      <Link
        href="/"
        className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Natrag na sve događaje
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
        {/* LIJEVA STRANA: SLIKA I OPIS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-md">
            <img
              src={event.image}
              alt={event.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-4 right-4">
              <Badge className="text-lg px-4 py-1 bg-white text-black hover:bg-white/90 shadow-lg">
                {event.category}
              </Badge>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                <span className="font-medium capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
            <div className="prose max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
              <h3 className="text-2xl font-bold mb-4">O događaju</h3>
              <p className="whitespace-pre-line">{event.description}</p>
            </div>
          </div>
        </div>

        {/* DESNA STRANA: ODABIR ULAZNICA (REGULARNE) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <TicketSelector event={event} />
          </div>
        </div>
      </div>

      {/* --- SEKCIJA: RESALE MARKET (SADA UVIJEK VIDLJIVA) --- */}
      <div className="mt-16 mb-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 mb-6">
          <RefreshCw className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Resale Market (Preprodaja)</h2>
        </div>
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
          <p className="text-sm text-blue-800 mb-6 max-w-2xl">
            Sigurna kupovina ulaznica od drugih korisnika. Sistem automatski
            poništava stari i generira novi QR kod na vaše ime.
          </p>

          <ResaleList
            tickets={resaleTickets}
            eventId={event._id}
            eventImage={event.image}
            eventTitle={event.title}
            eventDate={event.date}
          />
        </div>
      </div>
      {/* --------------------------------------------------- */}

      {/* --- SEKCIJA: SLIČNI DOGAĐAJI --- */}
      {relatedEvents.length > 0 && (
        <div>
          <Separator className="my-10" />
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-2xl font-bold">Možda će vas zanimati i...</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedEvents.map((relatedEvent: any) => (
              <EventCard key={relatedEvent._id} event={relatedEvent} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
