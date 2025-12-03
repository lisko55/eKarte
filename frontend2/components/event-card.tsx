"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin } from "lucide-react";
import { useCart } from "@/context/cart-context";

interface EventProps {
  event: {
    _id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    image: string;
    category?: string;
    ticketTypes: Array<{ price: number; name: string; _id?: string }>;
  };
}

// --- NOVA FUNKCIJA ZA DATUME (Rješava "M10" problem) ---
function formatDateToBosnian(dateString: string) {
  const date = new Date(dateString);
  
  const months = [
    "Januar", "Februar", "Mart", "April", "Maj", "Juni",
    "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day}. ${month} ${year}.`;
}
// -------------------------------------------------------

export default function EventCard({ event }: EventProps) {
  const { addToCart } = useCart();
  
  // KORISTIMO NAŠU NOVU FUNKCIJU
  const formattedDate = formatDateToBosnian(event.date);

  const hasTickets = event.ticketTypes && event.ticketTypes.length > 0;
  
  const minPrice = hasTickets
    ? Math.min(...event.ticketTypes.map((t) => t.price)) 
    : 0;

  const handleAddToCart = () => {
    if (!hasTickets) return;
    
    const ticket = event.ticketTypes.reduce((prev, curr) => prev.price < curr.price ? prev : curr);

    addToCart({
      _id: ticket._id || event._id, 
      eventID: event._id,
      name: `${event.title} - ${ticket.name}`,
      price: ticket.price,
      image: event.image,
      quantity: 1,
      eventDate: event.date
    });
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden border-slate-200">
      <div className="relative w-full h-48 bg-gray-100">
        <img 
          src={event.image || "/placeholder.jpg"} 
          alt={event.title}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        />
        {event.category && (
          <Badge className="absolute top-2 right-2 bg-black/70 hover:bg-black/80 text-white border-none">
            {event.category}
          </Badge>
        )}
      </div>

      <CardHeader className="p-4 pb-2">
        <CardTitle className="line-clamp-1 text-lg" title={event.title}>
            {event.title}
        </CardTitle>
        <div className="flex items-center text-muted-foreground text-sm gap-2 mt-1">
          <CalendarDays className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center text-muted-foreground text-sm gap-2">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {event.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 border-t flex justify-between items-center bg-slate-50/50 mt-auto">
        <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">
            {minPrice === 0 ? "Besplatno" : `od ${minPrice} KM`}
            </span>
        </div>
        
        <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href={`/event/${event._id}`}>Detalji</Link>
            </Button>
            
            {hasTickets && (
                <Button size="sm" onClick={handleAddToCart}>
                    Kupi
                </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}