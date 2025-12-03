"use client";

import { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createOrder } from "@/actions/order-actions"; // Tvoja postojeća akcija
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function CheckoutForm({
  totalPrice,
  useCredit,
}: {
  totalPrice: number;
  useCredit: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { cartItems, clearCart } = useCart();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    // 1. POTVRDI PLAĆANJE KOD STRIPEA
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // Ovo sprječava da Stripe automatski preusmjeri, želimo ostati ovdje da spremimo narudžbu
    });

    if (error) {
      setMessage(error.message || "Došlo je do greške pri plaćanju.");
      setIsLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // 2. AKO JE PLAĆANJE PROŠLO, KREIRAJ NARUDŽBU U BAZI
      try {
        const res = await createOrder({
          items: cartItems,
          totalPrice,
          useCredit: useCredit,
          paymentResult: {
            id: paymentIntent.id, // Pravi Stripe ID transakcije
            status: paymentIntent.status,
            email_address: "stripe_user@example.com", // Stripe Element ne vraća uvijek email, uzet ćemo ga iz sesije u backendu
            update_time: new Date().toISOString(),
          },
        });

        if (res.success) {
          toast.success("Plaćanje uspješno!");
          clearCart();
          router.push(`/order-success?orderId=${res.orderId}`);
        } else {
          toast.error(
            "Plaćanje je prošlo, ali narudžba nije spremljena: " + res.error
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Kritična greška nakon plaćanja.");
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border p-4 rounded-lg bg-white">
        {/* OVO GENERIRA INPUTE ZA KARTICU */}
        <PaymentElement />
      </div>

      {message && <div className="text-red-500 text-sm">{message}</div>}

      <Button
        disabled={!stripe || isLoading}
        className="w-full py-6 text-lg bg-slate-900 hover:bg-slate-800"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesiranje...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" /> Plati {totalPrice} KM
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Plaćanje je osigurano SSL enkripcijom putem Stripea.
      </p>
    </form>
  );
}
