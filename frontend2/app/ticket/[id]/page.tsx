import { getSecureTicket } from "@/actions/ticket-actions";
import { SecureTicket } from "@/components/secure-ticket";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Send,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SellDialog } from "@/components/ticket/sell-dialog";
import { CancelResaleButton } from "@/components/ticket/cancel-resale-button";

interface TicketPageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketPage(props: TicketPageProps) {
  const params = await props.params;
  const ticket = await getSecureTicket(params.id);

  if (!ticket) return notFound();
  const maxPrice = ticket.purchasePrice || ticket.ticketType.price;

  const eventDate = new Date(ticket.event.date);
  const isListed = ticket.status === "listed_for_resale";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-8 px-4">
      {/* HEADER */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 text-white">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="text-white hover:bg-white/10"
        >
          <Link href="/my-tickets">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <span className="font-semibold tracking-wide">Moja Ulaznica</span>
        <div className="w-9"></div>
      </div>

      {/* KARTICA */}
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        {/* SLIKA */}
        <div className="relative h-48 bg-slate-200">
          <img
            src={ticket.event.image}
            alt={ticket.event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <h2 className="text-2xl font-bold leading-tight mb-1">
              {ticket.event.title}
            </h2>
            <p className="text-sm font-medium text-emerald-400 uppercase tracking-wide">
              {ticket.ticketType.name}
            </p>
          </div>
        </div>

        {/* SADRŽAJ */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                Datum
              </p>
              <div className="flex items-center gap-2 text-slate-800 text-sm font-bold">
                <Calendar className="w-4 h-4 text-primary" />
                {eventDate.toLocaleDateString("bs-BA", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                Vrijeme
              </p>
              <div className="flex items-center gap-2 text-slate-800 text-sm font-bold">
                <Clock className="w-4 h-4 text-primary" />
                20:00 h
              </div>
            </div>
            <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">
                Lokacija
              </p>
              <div className="flex items-center gap-2 text-slate-800 text-sm font-bold">
                <MapPin className="w-4 h-4 text-primary" />
                {ticket.event.location}
              </div>
            </div>
          </div>

          {/* QR PODRUČJE */}
          {isListed ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center mb-6">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="font-bold text-amber-900 text-lg">
                Ulaznica je na prodaji
              </h3>
              <p className="text-sm text-amber-700 mt-2 leading-relaxed">
                QR kod je privremeno deaktiviran jer ste oglasili prodaju ove
                ulaznice.
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <SecureTicket secret={ticket.secretKey} ticketId={ticket._id} />
            </div>
          )}

          <div className="text-center border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              Vlasnik ulaznice
            </p>
            <p className="text-slate-900 font-bold text-lg mt-1">
              {ticket.ownerName}
            </p>
          </div>
        </div>

        {/* --- AKCIJSKA TRAKA --- */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex gap-3">
          {isListed ? (
            // Prikaz ako se prodaje
            <CancelResaleButton ticketId={ticket._id} />
          ) : (
            // Prikaz ako je aktivna
            <>
              <Button
                variant="outline"
                className="flex-1 bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                <Send className="w-4 h-4 mr-2" />
                Pokloni
              </Button>

              <div className="flex-1">
                <SellDialog ticketId={ticket._id} originalPrice={maxPrice} />
              </div>
            </>
          )}
        </div>
        {/* ---------------------- */}
      </div>
    </div>
  );
}
