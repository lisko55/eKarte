import { getMyOrderById } from "@/actions/order-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Download,
  Info,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

// Pomoćna komponenta za pojedinačnu kartu
function TicketItem({ item, index, orderId, user }: any) {
  // Generiramo ID
  const uniqueId = `${orderId}-${item._id}-${index}`;
  const ticketNumber = index + 1;

  // Podaci o događaju (dolaze iz populate-a)
  const event = item.event;

  // Formatiranje datuma događaja (ne kupovine!)
  const eventDate = event?.date
    ? new Date(event.date).toLocaleDateString("bs-BA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Datum nije definisan";

  const eventTime = event?.time || "20:00"; // Default ili iz baze

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col md:flex-row mb-6 relative group hover:shadow-md transition-shadow">
      {/* Dekoracija - Zupci */}
      <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full hidden md:block border-r border-slate-200"></div>
      <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full hidden md:block border-l border-slate-200"></div>

      {/* LIJEVI DIO - GLAVNE INFO */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-slate-300">
        <div>
          <div className="flex justify-between items-start mb-4">
            <Badge
              variant="outline"
              className="text-slate-500 border-slate-300 bg-slate-50"
            >
              ULAZNICA {ticketNumber} / {item.quantity}
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              #{uniqueId.substring(uniqueId.length - 6).toUpperCase()}
            </span>
          </div>

          {/* Naslov Događaja */}
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 leading-tight">
            {event?.title || item.name.split(" - ")[0]}
          </h2>

          {/* Tip Ulaznice (npr. VIP, Parter) */}
          <p className="text-lg font-medium text-primary mb-6 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary/10 rounded text-sm">
              {item.name.includes(" - ")
                ? item.name.split(" - ")[1]
                : "Standard"}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
            {/* Datum Događaja */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">
                Datum
              </p>
              <div className="flex items-center gap-2 font-medium text-slate-800 text-base">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>{eventDate}</span>
              </div>
            </div>

            {/* Vrijeme */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">
                Vrijeme
              </p>
              <div className="flex items-center gap-2 font-medium text-slate-800 text-base">
                <Clock className="w-4 h-4 text-primary" />
                <span>{eventTime} h</span>
              </div>
            </div>

            {/* Lokacija */}
            <div className="col-span-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">
                Lokacija
              </p>
              <div className="flex items-center gap-2 font-medium text-slate-800 text-base">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{event?.location || "Lokacija uskoro"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer karte */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground font-semibold">
              Posjetitelj
            </p>
            <p className="font-semibold text-slate-900 text-lg">
              {user.name} {user.lastName}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-muted-foreground font-semibold">
              Cijena
            </p>
            <p className="font-bold text-xl text-slate-900">{item.price} KM</p>
          </div>
        </div>
      </div>

      {/* DESNI DIO - QR KOD */}
      <div className="w-full md:w-72 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center relative">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <QRCodeSVG value={uniqueId} size={140} fgColor="#0f172a" level="Q" />
        </div>

        <p className="mt-6 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          Skeniraj na ulazu
        </p>
        <p className="text-[10px] text-slate-400 mt-1">Validna samo jednom</p>
      </div>
    </div>
  );
}

interface OrderDetailProps {
  params: Promise<{ id: string }>;
}

export default async function UserOrderDetailPage(props: OrderDetailProps) {
  const params = await props.params;
  const order = await getMyOrderById(params.id);

  if (!order) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* HEADER STRANICE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="-ml-2 mb-2 text-muted-foreground hover:text-slate-900"
            >
              <Link href="/my-orders">
                <ArrowLeft className="w-4 h-4 mr-2" /> Povratak na narudžbe
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">
              Digitalne Ulaznice
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>Narudžba #{order._id.substring(0, 8)}</span>
              <span>•</span>
              <span>
                Kupljeno:{" "}
                {new Date(order.createdAt).toLocaleDateString("bs-BA")}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`/api/tickets/${order._id}/download`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-slate-900 hover:bg-slate-800 shadow-lg transition-all hover:-translate-y-0.5">
                <Download className="w-4 h-4 mr-2" />
                Preuzmi PDF
              </Button>
            </a>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex gap-4 items-start shadow-sm">
          <div className="bg-blue-100 p-2 rounded-full">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-sm text-blue-900">
            <p className="font-bold mb-1">Spremno za ulaz!</p>
            <p className="opacity-90 leading-relaxed">
              Ovo su vaše validne ulaznice. Jednostavno pokažite QR kod sa
              zaslona vašeg telefona osoblju na ulazu. Za svaki slučaj, možete
              preuzeti i PDF verziju.
            </p>
          </div>
        </div>

        {/* LISTA KARTI */}
        <div className="space-y-2">
          {order.orderItems.map((item: any) =>
            // Petlja za količinu
            Array.from({ length: item.quantity }).map((_, index) => (
              <TicketItem
                key={`${item._id}-${index}`}
                item={item}
                index={index}
                orderId={order._id}
                user={order.user}
              />
            ))
          )}
        </div>

        {/* TOTAL */}
        <div className="mt-8 flex justify-end items-center">
          <div className="text-right bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">
              Ukupno plaćeno
            </p>
            <p className="text-3xl font-bold text-emerald-600">
              {order.totalPrice} KM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
