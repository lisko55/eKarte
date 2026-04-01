"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { issueFreeTicket } from "@/actions/ticket-actions";
import { toast } from "sonner";
import { Gift, Loader2, User, Mail, Hash } from "lucide-react";

interface IssueFreeTicketProps {
  eventId: string;
  ticketTypes: { _id: string; name: string; quantity: number }[];
}

export function IssueFreeTicket({
  eventId,
  ticketTypes,
}: IssueFreeTicketProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("eventId", eventId);

    const res = await issueFreeTicket(formData);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Gratis ulaznice uspješno poslane na email!");
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
          <Gift className="w-4 h-4 mr-2" />
          Izdaj Gratis
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Izdavanje Gratis Ulaznica</DialogTitle>
          <DialogDescription>
            Generirajte besplatne ulaznice za sponzore, novinare ili VIP goste.
            PDF ulaznice će biti automatski poslane na uneseni email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ime i Prezime Gosta</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                name="guestName"
                required
                placeholder="Npr. Marko Marković"
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email Gosta</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                name="guestEmail"
                required
                placeholder="Gost će ovdje dobiti PDF"
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Količina</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="number"
                  name="quantity"
                  required
                  min="1"
                  max="20"
                  defaultValue="1"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tip Ulaznice</Label>
              <Select name="ticketTypeId" required>
                <SelectTrigger className="h-auto min-h-10 text-left whitespace-normal leading-tight">
                  <SelectValue placeholder="Odaberi tip..." />
                </SelectTrigger>
                <SelectContent>
                  {ticketTypes.map((t) => (
                    <SelectItem
                      key={t._id}
                      value={t._id}
                      disabled={t.quantity < 1}
                    >
                      {t.name} (Ostalo: {t.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Odustani
            </Button>
            <Button type="submit" disabled={loading} className="bg-slate-900">
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Gift className="w-4 h-4 mr-2" />
              )}
              Pošalji Ulaznice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
