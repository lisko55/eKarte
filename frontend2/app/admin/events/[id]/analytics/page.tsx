import { getSingleEventAnalytics } from "@/actions/event-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Users,
  CreditCard,
  Ticket,
  ScanLine,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { IssueFreeTicket } from "@/components/admin/issue-free-ticket";

interface EventAnalyticsProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EventAnalyticsPage(props: EventAnalyticsProps) {
  const params = await props.params;
  const data = await getSingleEventAnalytics(params.id);

  if (!data) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/eventlist">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{data.eventTitle}</h1>
              {data.isPast ? (
                <Badge variant="secondary" className="bg-slate-200">
                  Završeno (Arhiva)
                </Badge>
              ) : (
                <Badge className="bg-emerald-600">Aktivno</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Analitika i statistika ulaza u realnom vremenu.
            </p>
          </div>
        </div>
        {!data.isPast && (
          <IssueFreeTicket eventId={params.id} ticketTypes={data.ticketTypes} />
        )}
      </div>

      {/* --- LIVE STATISTIKA ULAZA (GATE CONTROL) --- */}
      <Card className="bg-slate-900 text-white shadow-xl border-none">
        <CardContent className="p-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-slate-400 font-medium uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
                <ScanLine className="w-4 h-4" /> Live Očitanja na ulazu
              </p>
              <h2 className="text-5xl font-extrabold">
                {data.stats.scannedTickets}{" "}
                <span className="text-xl text-slate-500 font-normal">
                  / {data.stats.soldTickets} prodanih
                </span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-400">
                {data.stats.attendanceRate}%
              </p>
              <p className="text-sm text-slate-400">Popunjenost (Ušli)</p>
            </div>
          </div>

          <Progress
            value={data.stats.attendanceRate}
            className="h-3 bg-slate-800 [&>div]:bg-emerald-500"
          />

          <div className="flex justify-between mt-3 text-xs text-slate-500 font-mono">
            <span>0</span>
            <span>
              Očekuje se još{" "}
              {data.stats.soldTickets - data.stats.scannedTickets} ljudi
            </span>
          </div>
        </CardContent>
      </Card>

      {/* --- FINANSIJE I PRODAJA --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Ukupan Prihod
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {data.stats.totalRevenue} KM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Ticket className="w-4 h-4" /> Preostalo u prodaji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {data.stats.remainingTickets}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              od ukupno {data.stats.totalCapacity} kapaciteta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Users className="w-4 h-4" /> Prodato karata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {data.stats.soldTickets}
            </p>
            <Progress
              value={data.stats.salesRate}
              className="h-1.5 mt-3 mb-1"
            />
            <p className="text-xs text-slate-500 text-right">
              {data.stats.salesRate}% prodato
            </p>
          </CardContent>
        </Card>
      </div>

      {/* --- PREGLED PO KATEGORIJAMA ULAZNICA --- */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Prodaja po tipu ulaznice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.ticketBreakdown.map((item: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold text-slate-800">{item._id}</p>
                  <p className="text-sm text-slate-500">{item.count} prodato</p>
                </div>
                <div className="font-bold text-lg">{item.revenue} KM</div>
              </div>
            ))}
            {data.ticketBreakdown.length === 0 && (
              <p className="text-center text-slate-500 py-4">
                Još nema prodanih karata.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
