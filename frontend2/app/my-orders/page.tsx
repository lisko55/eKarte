import { getMyOrders } from "@/actions/order-actions"; // <--- NOVI IMPORT
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CalendarDays, ShoppingBag } from "lucide-react";

export default async function MyOrdersPage() {
  // VIŠE NE TREBA DEMO_USER_ID!

  // Pozivamo funkciju bez parametara (ona sama zna tko je logiran)
  const orders = await getMyOrders();

  if (!orders || orders.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Moje Narudžbe</h1>
        <p className="text-muted-foreground mb-8">
          Još niste napravili niti jednu narudžbu.
        </p>
        <Button asChild>
          <Link href="/">Istraži događaje</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8" />
        Povijest Narudžbi
      </h1>

      <div className="space-y-6">
        {orders.map((order: any) => (
          <Card key={order._id} className="overflow-hidden">
            <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Broj narudžbe</p>
                <p className="font-mono font-bold text-xs sm:text-sm">
                  {order._id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Datum</p>
                <div className="flex items-center gap-1 font-medium text-sm">
                  <CalendarDays className="w-3 h-3" />
                  {new Date(order.createdAt).toLocaleDateString("hr-HR")}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {order.orderItems.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Količina: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{item.price} KM</p>
                  </div>
                ))}
              </div>

              <div className="border-t mt-6 pt-4 flex justify-between items-center">
                <div>
                  <Badge
                    className={order.isPaid ? "bg-green-600" : "bg-yellow-600"}
                  >
                    {order.isPaid ? "Plaćeno" : "Na čekanju"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg">
                    {order.totalPrice} KM
                  </span>

                  {/* --- OVO JE KLJUČNI DIO --- */}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/my-orders/${order._id}`}>
                      Pregledaj ulaznice
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
