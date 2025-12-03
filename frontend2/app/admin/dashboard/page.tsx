import { getDashboardStats } from "@/actions/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, Calendar, Activity, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Overview } from "@/components/admin/overview";
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  if (!stats) return <div>Učitavanje...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pregled Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Dobrodošli Nazad! Analitika vašeg poslovanja.
        </p>
      </div>

      {/* 1. RED: BROJKE */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Ukupni Prihod"
          value={`${stats.totalSales} KM`}
          desc="Sveukupna prodaja"
          icon={CreditCard}
          color="text-emerald-600"
          bg="bg-emerald-100"
        />
        <StatsCard
          title="Korisnici"
          value={stats.userCount}
          desc={`+${stats.newUsersThisMonth} ovaj mjesec`}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-100"
        />
        <StatsCard
          title="Aktivni Događaji"
          value={stats.activeEventCount}
          desc="Nadolazeći događaji"
          icon={Calendar}
          color="text-purple-600"
          bg="bg-purple-100"
        />
        <StatsCard
          title="Prodane karte"
          value={stats.totalTickets}
          desc="Ukupno izdanih ulaznica"
          icon={Ticket}
          color="text-orange-600"
          bg="bg-orange-100"
        />
      </div>

      {/* 2. RED: GRAF + TOP LISTA */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-7">
        {/* GRAFIKON (Zauzima 4 stupca od 7) */}
        <Card className="col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>Pregled Zarade (Mjesečno)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={stats.monthlyRevenue} />
          </CardContent>
        </Card>

        {/* TOP LISTA (Zauzima 3 stupca od 7) */}
        <Card className="col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Najprodavaniji Događaji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 flex flex-col items-center">
              {/* Centriranje liste */}
              <div className="w-full">
                {stats.topSellingEvents.map((event: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 mb-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors w-full"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                        flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm shrink-0
                        ${
                          i === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : i === 1
                            ? "bg-gray-100 text-gray-700"
                            : i === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-600"
                        }
                      `}
                      >
                        #{i + 1}
                      </div>
                      <div className="font-semibold text-slate-800 line-clamp-1">
                        {event.title}
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {event.totalTicketsSold}
                    </Badge>
                  </div>
                ))}
              </div>

              {stats.topSellingEvents.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  Još nema prodanih ulaznica.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, desc, icon: Icon, color, bg }: any) {
  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${bg} ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{desc}</p>
      </CardContent>
    </Card>
  );
}
