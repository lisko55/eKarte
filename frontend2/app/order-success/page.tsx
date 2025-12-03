import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Package } from "lucide-react";
import Link from "next/link";

interface OrderSuccessProps {
  searchParams: Promise<{
    orderId: string;
  }>;
}

export default async function OrderSuccessPage(props: OrderSuccessProps) {
  // Otpakiramo parametre (Next.js 15)
  const searchParams = await props.searchParams;
  const { orderId } = searchParams;

  return (
    <div className="container flex items-center justify-center min-h-[70vh] py-10">
      <Card className="max-w-lg w-full text-center border-green-200 shadow-xl bg-green-50/30">
        <CardContent className="pt-10 pb-10 space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="w-20 h-20 text-green-600 animate-in zoom-in duration-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-green-800">Uspješna narudžba!</h1>
          
          <p className="text-muted-foreground">
            Hvala vam na kupnji. Vaša narudžba je zaprimljena i obrađena.
            Poslali smo potvrdu na vaš email.
          </p>

          <div className="bg-white p-4 rounded-lg border border-green-100 inline-block">
            <p className="text-sm text-gray-500 mb-1">Broj narudžbe:</p>
            <p className="font-mono font-bold text-lg">{orderId}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Button asChild variant="outline">
              <Link href="/">
                Natrag na naslovnicu
              </Link>
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/my-orders">
                <Package className="mr-2 h-4 w-4" />
                Moje narudžbe
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}