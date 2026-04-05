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
  DownloadCloud,
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
      {/* 🔥 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* LEFT */}
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
                  Završeno
                </Badge>
              ) : (
                <Badge className="bg-emerald-600">Aktivno</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              Real-time analitika i kontrola ulaza
            </p>
          </div>
        </div>

        {/* 🔥 ACTIONS */}
        <div className="flex gap-2 flex-wrap">
          {/* EXPORT */}
          <Button variant="outline" asChild>
            <a
              href={`/api/events/${params.id}/export`}
              target="_blank"
              rel="noreferrer"
            >
              <DownloadCloud className="w-4 h-4 mr-2" />
              Preuzmi Spisak
            </a>
          </Button>

          {/* GRATIS KARTE */}
          {!data.isPast && (
            <IssueFreeTicket
              eventId={params.id}
              ticketTypes={data.ticketTypes}
            />
          )}
        </div>
      </div>

      {/* 🔥 LIVE GATE CONTROL */}
      <Card className="bg-slate-900 text-white shadow-xl border-none">
        <CardContent className="p-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <ScanLine className="w-4 h-4" /> Live ulaz
              </p>

              <h2 className="text-5xl font-extrabold">
                {data.stats.scannedTickets}
                <span className="text-xl text-slate-500 ml-2">
                  / {data.stats.soldTickets}
                </span>
              </h2>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-400">
                {data.stats.attendanceRate}%
              </p>
              <p className="text-sm text-slate-400">Popunjenost</p>
            </div>
          </div>

          <Progress
            value={data.stats.attendanceRate}
            className="h-3 bg-slate-800 [&>div]:bg-emerald-500"
          />

          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>0</span>
            <span>
              Još {data.stats.soldTickets - data.stats.scannedTickets} ljudi
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 🔥 STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500 flex gap-2">
              <CreditCard className="w-4 h-4" />
              Prihod
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.stats.totalRevenue} KM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500 flex gap-2">
              <Ticket className="w-4 h-4" />
              Preostalo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.stats.remainingTickets}</p>
            <p className="text-xs text-slate-500">
              od {data.stats.totalCapacity}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500 flex gap-2">
              <Users className="w-4 h-4" />
              Prodato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.stats.soldTickets}</p>

            <Progress value={data.stats.salesRate} className="mt-2" />

            <p className="text-xs text-right text-slate-500">
              {data.stats.salesRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 🔥 TICKET BREAKDOWN */}
      <Card>
        <CardHeader>
          <CardTitle>Prodaja po tipu</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {data.ticketBreakdown.map((item: any, i: number) => (
            <div key={i} className="flex justify-between border-b pb-3">
              <div>
                <p className="font-semibold">{item._id}</p>
                <p className="text-sm text-slate-500">{item.count} kom</p>
              </div>

              <div className="font-bold">{item.revenue} KM</div>
            </div>
          ))}

          {data.ticketBreakdown.length === 0 && (
            <p className="text-center text-slate-500">Nema prodaje</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
