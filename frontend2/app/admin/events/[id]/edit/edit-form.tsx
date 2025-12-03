"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEvent } from "@/actions/event-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TicketType {
  name: string;
  price: number;
  quantity: number;
}

interface EditEventFormProps {
  initialData: any;
}

export default function EditEventForm({ initialData }: EditEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Ispravljen način obrade datuma — bez vremenskih zona
  const dateStr = initialData.date.slice(0, 10); // YYYY-MM-DD
  const timeStr = initialData.date.slice(11, 16); // HH:MM

  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description,
    location: initialData.location,
    date: dateStr,
    time: timeStr,
    category: initialData.category,
    image: initialData.image,
  });

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(
    initialData.ticketTypes || []
  );

  const handleTicketChange = (
    index: number,
    field: keyof TicketType,
    value: string | number
  ) => {
    setTicketTypes((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const addTicketType = () => {
    setTicketTypes((prev) => [...prev, { name: "", price: 0, quantity: 0 }]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullDate = new Date(`${formData.date}T${formData.time}`);

    const payload = {
      ...formData,
      date: fullDate,
      ticketTypes,
    };

    const result = await updateEvent(initialData._id, payload);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Događaj uspješno ažuriran!");
      router.push("/admin/eventlist");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Uredi Događaj</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        <Card>
          <CardHeader>
            <CardTitle>Osnovne Informacije</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label>Naslovna Slika</Label>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                onRemove={() => setFormData({ ...formData, image: "" })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Naziv Događaja</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Kategorija</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                >
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
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Vrijeme</Label>
                <Input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lokacija</Label>
              <Input
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea
                required
                className="h-32"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vrste Ulaznica</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
              <Plus className="w-4 h-4 mr-2" /> Dodaj vrstu
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div
                key={index}
                className="flex items-end gap-4 p-4 border rounded-lg bg-slate-50"
              >
                <div className="flex-1 space-y-2">
                  <Label>Naziv</Label>
                  <Input
                    value={ticket.name}
                    onChange={(e) =>
                      handleTicketChange(index, "name", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="w-24 space-y-2">
                  <Label>Cijena (KM)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={ticket.price}
                    onChange={(e) =>
                      handleTicketChange(index, "price", Number(e.target.value))
                    }
                    required
                  />
                </div>

                <div className="w-24 space-y-2">
                  <Label>Količina</Label>
                  <Input
                    type="number"
                    min="1"
                    value={ticket.quantity}
                    onChange={(e) =>
                      handleTicketChange(index, "quantity", Number(e.target.value))
                    }
                    required
                  />
                </div>

                {ticketTypes.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => removeTicketType(index)}
                  >
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

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Spremanje..." : "Ažuriraj Događaj"}
          </Button>
        </div>

      </form>
    </div>
  );
}
