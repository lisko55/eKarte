import { getAllOrders } from "@/actions/order-actions";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/admin/pagination"; // Koristimo numeriranu paginaciju
import { OrderSearch } from "@/components/admin/order-search"; // <--- NOVO
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrderStatusFilter } from "@/components/admin/order-status-filter"; // <--- MALA KOMPONENTA ZA STATUS

interface OrderListPageProps {
  searchParams: Promise<{ page?: string; query?: string; status?: string; }>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("bs-BA", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

export default async function OrderListPage(props: OrderListPageProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const query = searchParams.query || "";
  const status = searchParams.status || "all";

  const { orders, totalPages } = await getAllOrders(page, query, status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Pregled Narudžbi</h1>
        <p className="text-muted-foreground text-sm">Upravljanje i pregled svih transakcija.</p>
      </div>

      {/* TOOLBAR: SEARCH + FILTER */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
         <OrderSearch /> {/* Nova live pretraga */}
         <OrderStatusFilter /> {/* Filter za status (kod dolje) */}
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Kupac</TableHead>
              <TableHead>Sadržaj</TableHead>
              <TableHead>Iznos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead className="text-right">Akcija</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: any) => (
              <TableRow key={order._id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {order._id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{order.user.name} {order.user.lastName}</span>
                    <span className="text-xs text-muted-foreground">{order.user.email}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm" title={order.itemsSummary}>
                  {order.itemsSummary}
                </TableCell>
                <TableCell className="font-bold text-nowrap">{order.totalPrice} KM</TableCell>
                <TableCell>
                  <Badge variant={order.isPaid ? "default" : "destructive"} className={order.isPaid ? "bg-emerald-600" : ""}>
                    {order.isPaid ? "Plaćeno" : "Neplaćeno"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild title="Detalji">
                    <Link href={`/admin/orderlist/${order._id}`}>
                        <Eye className="w-4 h-4 text-blue-600" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {orders.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">Nema pronađenih narudžbi.</div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}