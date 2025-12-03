"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/actions/event-actions"; // Ovu ćemo ažurirati u koraku 5
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // npx shadcn@latest add textarea
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // npx shadcn@latest add label
import { ImageUpload } from "@/components/image-upload";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Stanje forme
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    category: "",
    image: "",
  });

  // Stanje za ulaznice
  const [ticketTypes, setTicketTypes] = useState([
    { name: "Regular", price: 0, quantity: 100 }
  ]);

  const handleTicketChange = (index: number, field: string, value: any) => {
    const newTickets = [...ticketTypes];
    // @ts-ignore
    newTickets[index][field] = value;
    setTicketTypes(newTickets);
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: "", price: 0, quantity: 0 }]);
  };

  const removeTicketType = (index: number) => {
    const newTickets = ticketTypes.filter((_, i) => i !== index);
    setTicketTypes(newTickets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast.error("Molimo dodajte sliku događaja.");
      return;
    }

    setLoading(true);

    // Spajamo datum i vrijeme
    const fullDate = new Date(`${formData.date}T${formData.time}`);

    const payload = {
      ...formData,
      date: fullDate,
      ticketTypes
    };

    const result = await createEvent(payload);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Događaj uspješno kreiran!");
      router.push("/admin/eventlist");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kreiraj Novi Događaj</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. OSNOVNI PODACI */}
        <Card>
          <CardHeader><CardTitle>Osnovne Informacije</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            
            {/* Slika */}
            <div className="space-y-2">
              <Label>Naslovna Slika</Label>
              <ImageUpload 
                value={formData.image} 
                onChange={(url) => setFormData({...formData, image: url})}
                onRemove={() => setFormData({...formData, image: ""})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Naziv Događaja</Label>
                    <Input 
                        required 
                        placeholder="npr. Koncert Halid Bešlić" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Kategorija</Label>
                    <Select onValueChange={(val) => setFormData({...formData, category: val})}>
                        <SelectTrigger>
                            <SelectValue placeholder="Odaberi..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Muzika">Muzika</SelectItem>
                            <SelectItem value="Sport">Sport</SelectItem>
                            <SelectItem value="Pozorište">Pozorište</SelectItem>
                            <SelectItem value="Film">Film</SelectItem>
                            <SelectItem value="Ostalo">Ostalo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Datum</Label>
                    <Input 
                        type="date" required 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Vrijeme</Label>
                    <Input 
                        type="time" required 
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Lokacija</Label>
                <Input 
                    required placeholder="npr. Zetra, Sarajevo" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
            </div>

            <div className="space-y-2">
                <Label>Opis</Label>
                <Textarea 
                    required placeholder="Detaljan opis događaja..." 
                    className="h-32"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>
          </CardContent>
        </Card>

        {/* 2. ULAZNICE */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vrste Ulaznica</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
                <Plus className="w-4 h-4 mr-2" /> Dodaj vrstu
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticketTypes.map((ticket, index) => (
                <div key={index} className="flex items-end gap-4 p-4 border rounded-lg bg-slate-50">
                    <div className="flex-1 space-y-2">
                        <Label>Naziv (npr. VIP)</Label>
                        <Input 
                            value={ticket.name} 
                            onChange={(e) => handleTicketChange(index, "name", e.target.value)}
                            required 
                        />
                    </div>
                    <div className="w-24 space-y-2">
                        <Label>Cijena (KM)</Label>
                        <Input 
                            type="number" min="0"
                            value={ticket.price} 
                            onChange={(e) => handleTicketChange(index, "price", Number(e.target.value))}
                            required 
                        />
                    </div>
                    <div className="w-24 space-y-2">
                        <Label>Količina</Label>
                        <Input 
                            type="number" min="1"
                            value={ticket.quantity} 
                            onChange={(e) => handleTicketChange(index, "quantity", Number(e.target.value))}
                            required 
                        />
                    </div>
                    {ticketTypes.length > 1 && (
                        <Button type="button" size="icon" variant="destructive" onClick={() => removeTicketType(index)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
                Odustani
            </Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Spremanje..." : "Kreiraj Događaj"}
            </Button>
        </div>

      </form>
    </div>
  );
}