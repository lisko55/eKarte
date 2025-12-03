"use client";

import { useCart } from "@/context/cart-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import CheckoutForm from "@/components/checkout/checkout-form";
import { Loader2, ShieldCheck, CreditCard, Wallet } from "lucide-react"; // Import Wallet
import { Separator } from "@/components/ui/separator";
import { getUserBalance } from "@/actions/user-actions"; // Nova akcija
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Za slučaj kad je 0 KM
import { createOrder } from "@/actions/order-actions"; // Za 0 KM slučaj
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [balance, setBalance] = useState(0);
  const [useCredit, setUseCredit] = useState(false);
  const [amountToPay, setAmountToPay] = useState(cartTotal);
  const [loading, setLoading] = useState(false); // Za full wallet pay
  const router = useRouter();

  // 1. Dohvati balans korisnika
  useEffect(() => {
    getUserBalance().then((bal) => setBalance(bal));
  }, []);

  // 2. Dohvati Stripe Intent (svaki put kad se promijeni useCredit ili cartTotal)
  useEffect(() => {
    if (cartTotal > 0) {
      // Resetiramo secret dok čekamo novi
      setClientSecret("");

      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal, useCredit }), // Šaljemo useCredit
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
          setAmountToPay(data.amountToPay); // Spremamo koliko stvarno treba platiti
        });
    }
  }, [cartTotal, useCredit]);

  // --- FUNKCIJA ZA PLAĆANJE SAMO KREDITOM (0 KM na kartici) ---
  const handleFullWalletPayment = async () => {
    setLoading(true);
    try {
      const res = await createOrder({
        items: cartItems,
        totalPrice: cartTotal,
        useCredit: true, // Bitno!
        paymentResult: {
          id: "WALLET_" + Date.now(),
          status: "succeeded",
          email_address: "wallet@ekarte.ba",
          update_time: new Date().toISOString(),
        },
      });

      if (res.success) {
        toast.success("Plaćeno kreditom!");
        clearCart();
        router.push(`/order-success?orderId=${res.orderId}`);
      } else {
        toast.error(res.error);
      }
    } catch (e) {
      toast.error("Greška.");
    }
    setLoading(false);
  };

  if (cartItems.length === 0) return <div>Prazna košarica</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="container max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Završetak Kupovine
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LIJEVA STRANA: SAŽETAK */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pregled Narudžbe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>{item.price * item.quantity} KM</span>
                  </div>
                ))}

                <Separator />

                {/* WALLET TOGGLE */}
                {balance > 0 && (
                  <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                      <div className="text-sm">
                        <p className="font-semibold text-emerald-900">
                          Moj Kredit
                        </p>
                        <p className="text-emerald-700">
                          Dostupno: {balance} KM
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={useCredit}
                      onCheckedChange={setUseCredit}
                    />
                  </div>
                )}

                <div className="flex justify-between items-center text-lg font-bold pt-2">
                  <span>Za platiti</span>
                  <span>{amountToPay} KM</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* DESNA STRANA: PLAĆANJE */}
          <div className="lg:col-span-7">
            <Card className="shadow-lg border-primary/10 overflow-hidden">
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">Plaćanje</h2>
                <CreditCard className="w-8 h-8 text-slate-400" />
              </div>

              <CardContent className="p-6 sm:p-8">
                {/* 
                            SCENARIJ 1: Sve pokriveno kreditom (amountToPay = 0)
                            SCENARIJ 2: Treba nadoplatiti karticom (clientSecret postoji)
                        */}

                {amountToPay === 0 ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Cijeli iznos pokriven je vašim kreditom.
                    </p>
                    <Button
                      className="w-full py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleFullWalletPayment}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Plati Kreditom"
                      )}
                    </Button>
                  </div>
                ) : clientSecret ? (
                  // VAŽNO: Prosljeđujemo useCredit u formu da ga proslijedi createOrder funkciji
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      totalPrice={cartTotal}
                      useCredit={useCredit} // <--- MORAŠ DODATI OVO U CheckoutForm
                    />
                  </Elements>
                ) : (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
