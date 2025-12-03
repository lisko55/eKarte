import { getAdminOrderById } from "@/actions/order-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, User, Phone, CalendarDays } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface AdminOrderDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailPage(props: AdminOrderDetailProps) {
  const params = await props.params;
  const order = await getAdminOrderById(params.id);

  if (!order) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/admin/orderlist">
                <ArrowLeft className="w-4 h-4" />
            </Link>
        </Button>
        <h1 className="text-2xl font-bold">Detalji Narudžbe #{order._id.substring(0, 8)}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LIJEVA STRANA: STAVKE */}
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Kupljene Ulaznice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {order.orderItems.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 border rounded-lg bg-slate-50">
                        <div className="flex items-center gap-4">
                            {item.image && (
                                <img src={item.image} className="w-12 h-12 object-cover rounded" alt="event" />
                            )}
                            <div>
                                <p className="font-bold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Količina: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-medium">{item.price} KM</p>
                    </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t">
                    <span className="font-bold text-lg">Ukupno:</span>
                    <span className="font-bold text-2xl text-primary">{order.totalPrice} KM</span>
                </div>
            </CardContent>
        </Card>

        {/* DESNA STRANA: INFO O KUPCU I STATUSU */}
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Podaci o Kupcu</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{order.user?.name} {order.user?.lastName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{order.user?.email}</span>
                    </div>
                    {order.user?.phone && (
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{order.user?.phone}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Status Plaćanja</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge className={order.isPaid ? "bg-emerald-600" : "bg-red-600"}>
                            {order.isPaid ? "PLAĆENO" : "NIJE PLAĆENO"}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Metoda:</span>
                        <span className="font-medium">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Datum:</span>
                        <div className="flex items-center gap-2 text-sm">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleDateString("bs-BA")}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}