"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner"; // <--- Importamo Sonner
import { useRouter } from "next/navigation"; // Za preusmjeravanje

interface TicketType {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

interface TicketSelectorProps {
  event: {
    _id: string;
    title: string;
    date: string;
    image: string;
    ticketTypes: TicketType[];
  };
}

export default function TicketSelector({ event }: TicketSelectorProps) {
  const { addToCart } = useCart();
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const router = useRouter();

  const selectedTicket = event.ticketTypes.find((t) => t._id === selectedTicketId);

  const handleAddToCart = () => {
    if (!selectedTicket) return;

    // Provjera ima li dovoljno karata
    if (quantity > selectedTicket.quantity) {
      toast.error("Nema dovoljno ulaznica na stanju!");
      return;
    }

    addToCart({
      _id: selectedTicket._id,
      eventID: event._id,
      name: `${event.title} - ${selectedTicket.name}`,
      price: selectedTicket.price,
      image: event.image,
      quantity: quantity,
      eventDate: event.date,
    });

    setQuantity(1);

    // --- NOVA POTVRDA (Toast) ---
    toast.success(`${quantity}x ${selectedTicket.name} dodano!`, {
      description: "Artikl je uspješno dodan u vašu košaricu.",
      action: {
        label: "Idi u košaricu",
        onClick: () => router.push("/cart"),
      },
    });
  };

  return (
    <Card className="border-2 border-primary/10 shadow-lg">
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2">Odaberi ulaznice</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Osigurajte svoje mjesto na vrijeme.
          </p>
        </div>

        {/* ODABIR TIPA */}
        <div className="space-y-3">
          {event.ticketTypes.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => setSelectedTicketId(ticket._id)}
              className={`
                cursor-pointer rounded-lg border p-4 flex justify-between items-center transition-all
                ${selectedTicketId === ticket._id 
                  ? "border-primary bg-primary/5 ring-1 ring-primary" 
                  : "border-gray-200 hover:border-gray-400"}
                ${ticket.quantity === 0 ? "opacity-50 pointer-events-none grayscale" : ""}
              `}
            >
              <div>
                <p className="font-semibold">{ticket.name}</p>
                {/* Prikazujemo "Rasprodano" ako je 0 */}
                <p className="text-sm text-muted-foreground">
                  {ticket.quantity > 0 ? `Još ${ticket.quantity} dostupno` : "Rasprodano"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">{ticket.price} KM</span>
                {selectedTicketId === ticket._id && <Check className="w-5 h-5 text-primary" />}
              </div>
            </div>
          ))}
        </div>

        {selectedTicket && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            
            {/* ODABIR KOLIČINE - Limitiran na max dostupno ili 10 */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Količina:</span>
              <Select 
                value={quantity.toString()} 
                onValueChange={(val) => setQuantity(Number(val))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent>
                  {/* Generiramo brojeve samo do onoliko koliko ih ima na stanju (max 10 da lista ne bude preduga) */}
                  {Array.from({ length: Math.min(selectedTicket.quantity, 10) }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium">Ukupno:</span>
                <span className="text-2xl font-bold text-primary">
                  {selectedTicket.price * quantity} KM
                </span>
              </div>
              
              <Button onClick={handleAddToCart} className="w-full text-lg py-6">
                <ShoppingCart className="mr-2 w-5 h-5" />
                Dodaj u košaricu
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}