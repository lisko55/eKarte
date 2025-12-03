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
import { listTicketForSale } from "@/actions/ticket-actions";
import { toast } from "sonner";
import { Loader2, Banknote, Tag } from "lucide-react"; // Dodao sam Tag ikonu

interface SellDialogProps {
  ticketId: string;
  originalPrice: number;
}

export function SellDialog({ ticketId, originalPrice }: SellDialogProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(originalPrice.toString());
  const [loading, setLoading] = useState(false);

  const handleSell = async () => {
    const numPrice = parseFloat(price);

    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Unesite validnu cijenu.");
      return;
    }
    if (numPrice > originalPrice) {
      toast.error(`Maksimalna cijena je ${originalPrice} KM.`);
      return;
    }

    setLoading(true);
    const res = await listTicketForSale(ticketId, numPrice);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Karta je stavljena na prodaju!");
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* --- OVO JE GUMB KOJI SE PRIKAZUJE NA STRANICI --- */}
      <DialogTrigger asChild>
        <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm font-semibold">
          <Tag className="w-4 h-4 mr-2" />
          Prodaj Ulaznicu
        </Button>
      </DialogTrigger>
      {/* ------------------------------------------------ */}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Prodaja Ulaznice</DialogTitle>
          <DialogDescription>
            Postavite cijenu za vašu ulaznicu. Maksimalni iznos je{" "}
            {originalPrice} KM.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Cijena
            </Label>

            <div className="col-span-3 relative flex items-center">
              <Banknote className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />

              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-9 pr-10"
                max={originalPrice}
              />

              <span className="absolute right-3 text-sm text-muted-foreground font-bold pointer-events-none">
                KM
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSell}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Potvrdi i objavi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
