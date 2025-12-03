"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, ArrowRight, Check } from "lucide-react"; // Import Check ikone
import { toast } from "sonner";
import { useCart } from "@/context/cart-context";

interface ResaleListProps {
  tickets: any[];
  eventImage: string;
  eventDate: string;
  eventTitle: string;
  eventId: string;
}

export function ResaleList({
  tickets,
  eventImage,
  eventDate,
  eventTitle,
  eventId,
}: ResaleListProps) {
  const { addToCart, cartItems } = useCart();

  const handleBuy = (ticket: any) => {
    addToCart({
      _id: ticket._id,
      eventID: eventId,
      name: `${eventTitle} - ${ticket.ticketType.name} (Resale)`,
      price: ticket.resalePrice,
      image: eventImage,
      quantity: 1, // Uvijek 1 za resale
      eventDate: eventDate,
      isResale: true,
    });

    toast.success("Resale ulaznica dodana u košaricu!");
  };

  // --- NOVO: EMPTY STATE (Kad nema karata) ---
  if (tickets.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
        <div className="bg-slate-100 p-3 rounded-full inline-block mb-3">
          <Ticket className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">
          Trenutno nema ulaznica u preprodaji
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Kada drugi korisnici stave svoje ulaznice na prodaju, one će se
          pojaviti ovdje.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {tickets.map((ticket) => {
        // Provjeri je li ova karta već u košarici
        const isInCart = cartItems.some((item) => item._id === ticket._id);

        return (
          <Card
            key={ticket._id}
            className="overflow-hidden border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-800">
                    {ticket.ticketType.name}
                  </h4>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    Resale
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Originalno:{" "}
                  <span className="line-through">
                    {ticket.originalPrice} KM
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-xl font-bold text-emerald-600">
                  {ticket.resalePrice} KM
                </span>

                {/* Onemogući gumb ako je već dodano */}
                <Button
                  size="sm"
                  onClick={() => handleBuy(ticket)}
                  disabled={isInCart}
                  className={
                    isInCart
                      ? "bg-slate-100 text-slate-500"
                      : "bg-blue-600 hover:bg-blue-700"
                  }
                >
                  {isInCart ? (
                    <>
                      U košarici <Check className="w-3 h-3 ml-1" />
                    </>
                  ) : (
                    <>
                      Kupi <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
