import { getMyTickets } from "@/actions/ticket-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Ticket, ArrowRight, QrCode } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function MyTicketsPage() {
  const tickets = await getMyTickets();

  if (tickets.length === 0) {
    return (
      <div className="container py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <Ticket className="w-12 h-12 text-slate-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Nemate aktivnih ulaznica</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Sve vaše kupljene ulaznice pojavit će se ovdje. Spremni za izlazak?
        </p>
        <Button asChild>
          <Link href="/">Pronađi događaj</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Ticket className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Moj Novčanik (Ulaznice)</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket: any) => (
          <Card
            key={ticket._id}
            className="overflow-hidden border-slate-200 hover:shadow-lg transition-all group"
          >
            {/* Slika Eventa */}
            <div className="relative h-40 bg-slate-100">
              <img
                src={ticket.event.image}
                alt={ticket.event.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  className={
                    ticket.status === "valid" ? "bg-emerald-600" : "bg-gray-500"
                  }
                >
                  {ticket.status === "valid" ? "AKTIVNA" : "ISKORIŠTENA"}
                </Badge>
              </div>
            </div>

            <CardContent className="p-5">
              {/* Naslov i Tip */}
              <div className="mb-4">
                <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-1">
                  {ticket.event.title}
                </h3>
                <p className="text-sm font-medium text-primary">
                  {ticket.ticketType.name} Ulaznica
                </p>
              </div>

              {/* Info */}
              <div className="space-y-2 text-sm text-slate-600 mb-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  <span>
                    {new Date(ticket.event.date).toLocaleDateString("bs-BA", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="line-clamp-1">{ticket.event.location}</span>
                </div>
              </div>

              {/* Akcija */}
              <Button
                asChild
                className="w-full bg-slate-900 hover:bg-slate-800"
              >
                <Link href={`/ticket/${ticket._id}`}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Otvori Ulaznicu
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
