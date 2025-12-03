"use client";

import { cancelResale } from "@/actions/ticket-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";

export function CancelResaleButton({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    const res = await cancelResale(ticketId);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Prodaja otkazana. Ulaznica je ponovno aktivna.");
    }
    setLoading(false);
  };

  return (
    <Button
      onClick={handleCancel}
      disabled={loading}
      variant="secondary"
      className="w-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <XCircle className="w-4 h-4 mr-2" />
      )}
      Otkaži prodaju
    </Button>
  );
}
