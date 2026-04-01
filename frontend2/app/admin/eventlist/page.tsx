import { getEvents } from "@/actions/event-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/admin/pagination";
import { EventDeleteButton } from "@/components/admin/event-delete-button";
import { Plus, CalendarDays, MapPin, Edit, BarChart3 } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getAdminEvents } from "@/actions/event-actions";
import Image from "next/image";

interface EventListPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

// Pomoćna funkcija za datum (da izbjegnemo hydration error i M10)
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("bs-BA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const dynamic = "force-dynamic";

export default async function EventListPage(props: EventListPageProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;

  // Koristimo postojeću akciju, sortiramo po datumu desc
  const { events, pages } = await getAdminEvents(page);
  const session = await getSession();
  const isOrganizer = session?.role === "organizer";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isOrganizer ? "Moji Događaji" : "Upravljanje Događajima"}
        </h1>

        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/admin/events/new">
            <Plus className="w-4 h-4 mr-2" />
            Novi Događaj
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Slika</TableHead>
                <TableHead>Naziv</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Lokacija</TableHead>
                <TableHead>Kategorija</TableHead>
                <TableHead>Organizator</TableHead>
                <TableHead className="text-right">Opcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event: any) => (
                <TableRow key={event._id}>
                  <TableCell>
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-100">
                      <img
                        src={event.image || "/placeholder.jpg"}
                        alt={event.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="w-3 h-3" />
                      {formatDate(event.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                      {event.category}
                    </span>
                  </TableCell>
                  <TableCell>{event.organizerName || "Nepoznato"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* NOVO DUGME ZA ANALITIKU */}
                      <Button
                        size="icon"
                        variant="ghost"
                        asChild
                        title="Analitika i Live Ulaz"
                      >
                        <Link href={`/admin/events/${event._id}/analytics`}>
                          <BarChart3 className="w-4 h-4 text-emerald-600" />
                        </Link>
                      </Button>

                      {/* UREĐIVANJE */}
                      <Button size="icon" variant="ghost" asChild title="Uredi">
                        <Link href={`/admin/events/${event._id}/edit`}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Link>
                      </Button>

                      <EventDeleteButton
                        eventId={event._id}
                        eventTitle={event.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {events.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            {isOrganizer
              ? "Još niste kreirali nijedan događaj."
              : "Nema događaja u sistemu."}
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={pages} />
    </div>
  );
}
