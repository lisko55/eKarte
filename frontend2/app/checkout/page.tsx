"use client";

import { useCart } from "@/context/cart-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import CheckoutForm from "@/components/checkout/checkout-form";
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  Wallet,
  Receipt,
  Check,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getUserBalance } from "@/actions/user-actions";
import { validateCoupon } from "@/actions/coupon-actions";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrder } from "@/actions/order-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [balance, setBalance] = useState(0);
  const [useCredit, setUseCredit] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- KUPON STATE ---
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Dohvat balansa
  useEffect(() => {
    getUserBalance().then((bal) => setBalance(bal));
  }, []);

  // --- MATEMATIKA ---
  const serviceFee = Number((cartTotal * 0.05).toFixed(2)); // 5% provizija

  // Izračun popusta
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (cartTotal * appliedCoupon.discountValue) / 100;
    } else if (appliedCoupon.discountType === "fixed") {
      discountAmount = appliedCoupon.discountValue;
    }
  }
  // Osiguravamo da popust ne bude veći od same cijene karata
  if (discountAmount > cartTotal) discountAmount = cartTotal;

  // Finalni iznos = Cijena karata - Popust + Provizija
  const finalTotal = Number(
    (cartTotal - discountAmount + serviceFee).toFixed(2),
  );

  const [cardAmountToPay, setCardAmountToPay] = useState(finalTotal);

  // Dohvat Stripe Intenta
  useEffect(() => {
    if (finalTotal > 0) {
      setClientSecret("");
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal, useCredit }),
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
          setCardAmountToPay(data.amountToPay);
        });
    } else {
      setCardAmountToPay(0);
    }
  }, [finalTotal, useCredit]);

  // --- PRIMJENA KUPONA ---
  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setCouponLoading(true);
    const res = await validateCoupon(couponInput);
    if (res.error) {
      toast.error(res.error);
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon(res.coupon);
      toast.success("Kupon uspješno primijenjen!");
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  // --- PLAĆANJE SAMO KREDITOM ---
  const handleFullWalletPayment = async () => {
    setLoading(true);
    try {
      const res = await createOrder({
        items: cartItems,
        totalPrice: finalTotal,
        useCredit: true,
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
      toast.error("Greška prilikom plaćanja kreditom.");
    }
    setLoading(false);
  };

  if (cartItems.length === 0)
    return <div className="p-20 text-center">Vaša košarica je prazna.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="container max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Završetak Kupovine
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LIJEVA STRANA: SAŽETAK I KUPON */}
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

                {/* --- UNOS PROMO KODA --- */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-slate-500">
                    Imate Promo Kod?
                  </label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Unesite kod..."
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="uppercase"
                      />
                      <Button
                        variant="secondary"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput}
                      >
                        {couponLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Primijeni"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 text-green-700 p-2 rounded-md border border-green-200">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span className="font-bold">{appliedCoupon.code}</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="hover:text-green-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* MATEMATIKA */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Iznos stavki</span>
                    <span>{cartTotal.toFixed(2)} KM</span>
                  </div>

                  {/* Prikaz popusta */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-500 font-medium">
                      <span>Popust ({appliedCoupon.code})</span>
                      <span>- {discountAmount.toFixed(2)} KM</span>
                    </div>
                  )}

                  {/* Prikaz provizije */}
                  <div className="flex justify-between text-emerald-700 font-medium bg-emerald-50 p-2 rounded">
                    <span className="flex items-center gap-1">
                      Naknada platforme (5%)
                      <Receipt className="w-3 h-3" />
                    </span>
                    <span>+ {serviceFee.toFixed(2)} KM</span>
                  </div>
                </div>

                <Separator />

                {/* WALLET TOGGLE */}
                {balance > 0 && (
                  <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-blue-600" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue-900">
                          Moj Kredit
                        </p>
                        <p className="text-blue-700">
                          Dostupno: {balance.toFixed(2)} KM
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={useCredit}
                      onCheckedChange={setUseCredit}
                    />
                  </div>
                )}

                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t mt-2">
                  <span>Za platiti</span>
                  <span
                    className={cardAmountToPay === 0 ? "text-emerald-600" : ""}
                  >
                    {cardAmountToPay.toFixed(2)} KM
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-100 p-4 rounded-lg flex gap-3 items-center text-slate-600">
              <ShieldCheck className="w-8 h-8 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold mb-0.5">Sigurno Plaćanje</p>
                <p>
                  Vaši podaci su zaštićeni SSL enkripcijom. Naknada uključuje
                  troškove procesiranja.
                </p>
              </div>
            </div>
          </div>

          {/* DESNA STRANA: FORMA ZA PLAĆANJE */}
          <div className="lg:col-span-7">
            <Card className="shadow-lg border-primary/10 overflow-hidden">
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">Plaćanje</h2>
                <CreditCard className="w-8 h-8 text-slate-400" />
              </div>

              <CardContent className="p-6 sm:p-8">
                {cardAmountToPay === 0 ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Cijeli iznos je pokriven.
                    </p>
                    <Button
                      className="w-full py-6 text-lg bg-emerald-600 hover:bg-emerald-700"
                      onClick={handleFullWalletPayment}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Završi narudžbu besplatno"
                      )}
                    </Button>
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm
                      totalPrice={finalTotal}
                      serviceFee={serviceFee}
                      useCredit={useCredit}
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
