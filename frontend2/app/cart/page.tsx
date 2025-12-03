"use client";

import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

// 1. NOVI IMPORTI ZA DIJALOG
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <div className="bg-slate-100 p-6 rounded-full">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Vaša košarica je prazna</h1>
        <p className="text-muted-foreground max-w-md">
          Niste dodali niti jednu ulaznicu. Istražite događaje i pronađite nešto
          za sebe.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Pregledaj događaje</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Vaša Košarica ({cartItems.length})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LISTA STAVKI */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <CardContent className="p-4 flex gap-4 items-center">
                <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={item.image || "/placeholder.jpg"}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-lg truncate" title={item.name}>
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Količina: {item.quantity}
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">
                    {item.price} KM / kom
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-lg">
                    {item.price * item.quantity} KM
                  </span>

                  {/* 2. OMOTAVAMO GUMB ZA BRISANJE U ALERT DIALOG */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ovom radnjom ćete ukloniti <b>{item.name}</b> iz vaše
                          košarice.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Odustani</AlertDialogCancel>
                        {/* 3. PRAVA AKCIJA BRISANJA SE DOGAĐA OVDJE */}
                        <AlertDialogAction
                          onClick={() => removeFromCart(item._id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Obriši
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* OPCIONALNO: Potvrda za pražnjenje cijele košarice */}
          <div className="flex justify-end pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground"
                >
                  Isprazni košaricu
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Isprazniti cijelu košaricu?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Svi odabrani događaji bit će uklonjeni.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Odustani</AlertDialogCancel>
                  <AlertDialogAction onClick={clearCart} className="bg-red-600">
                    Isprazni sve
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* SAŽETAK */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-lg border-primary/10">
            <CardHeader className="bg-slate-50/50">
              <CardTitle>Sažetak narudžbe</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ukupno bez PDV-a</span>
                <span>{cartTotal} KM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">PDV (uključen)</span>
                <span>0.00 KM</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Ukupno</span>
                <span className="font-bold text-2xl text-primary">
                  {cartTotal} KM
                </span>
              </div>

              <Button
                className="w-full py-6 text-lg font-semibold shadow-md mt-4"
                asChild
              >
                <Link href="/checkout">
                  Nastavi na plaćanje <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Sigurno plaćanje SSL enkripcijom.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
