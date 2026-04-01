import { getDashboardStats } from "@/actions/admin-actions";
import { getOrganizerStats } from "@/actions/organizer-actions"; // <--- NOVI IMPORT
import { getSession } from "@/lib/session"; // <--- NOVI IMPORT
import { CardDataStats } from "@/components/admin/card-data-stats";
import { Users, CreditCard, Calendar, Ticket } from "lucide-react";
import { Overview } from "@/components/admin/overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isOrganizer = session.role === "organizer";

  // DOHVATAMO PODATKE OVISNO O ULOZI
  let stats: any = null;

  if (isOrganizer) {
    stats = await getOrganizerStats();
  } else if (session.isAdmin) {
    stats = await getDashboardStats();
  }

  if (!stats)
    return (
      <div className="p-8 text-center text-slate-500">
        Učitavanje podataka...
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Naslov se mijenja ovisno o ulozi */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {isOrganizer ? "Moj Dashboard" : "Pregled Sistema"}
        </h1>
        <p className="text-slate-500 mt-1">Dobrodošli nazad, {session.name as string}.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Prihod od prodaje"
          total={`${stats.totalSales} KM`}
          rate="0%"
          levelUp
        >
          <CreditCard className="h-6 w-6" />
        </CardDataStats>

        {/* Organizator ne vidi ukupan broj korisnika cijele platforme */}
        {!isOrganizer && (
          <CardDataStats
            title="Ukupno Korisnika"
            total={stats.userCount?.toString() || "0"}
            rate=""
            levelUp
          >
            <Users className="h-6 w-6" />
          </CardDataStats>
        )}

        <CardDataStats
          title={isOrganizer ? "Moji Događaji" : "Aktivni Događaji"}
          total={stats.activeEventCount.toString()}
        >
          <Calendar className="h-6 w-6" />
        </CardDataStats>

        <CardDataStats
          title="Prodane Karte"
          total={stats.totalTickets.toString()}
        >
          <Ticket className="h-6 w-6" />
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        {/* Grafikon samo za Admine (za sada, možemo ga kasnije upaliti i za organizatore) */}
        {!isOrganizer && stats.monthlyRevenue && (
          <div className="col-span-12 xl:col-span-8">
            <Card className="shadow-sm border-slate-200 h-full">
              <CardHeader>
                <CardTitle>Pregled Zarade</CardTitle>
              </CardHeader>
              <CardContent>
                <Overview data={stats.monthlyRevenue} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Događaji (Prilagođava se automatski) */}
        <div
          className={`col-span-12 ${isOrganizer ? "xl:col-span-12" : "xl:col-span-4"}`}
        >
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader>
              <CardTitle>Top Događaji</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                {stats.topSellingEvents.map((event: any, key: number) => (
                  <div
                    key={key}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">
                      #{key + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-black line-clamp-1">
                        {event.title}
                      </h4>
                      <span className="text-xs font-medium text-slate-500">
                        Prodano: {event.totalTicketsSold}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-700"
                    >
                      Top
                    </Badge>
                  </div>
                ))}
                {stats.topSellingEvents.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Nema podataka.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
