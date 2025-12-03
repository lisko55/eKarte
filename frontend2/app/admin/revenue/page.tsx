import { getRevenueAnalytics } from "@/actions/admin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "@/components/admin/overview"; // Koristimo isti graf
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Banknote, Filter } from "lucide-react";
import { redirect } from "next/navigation";
import { RevenueFilter } from "@/components/admin/revenue-filter"; // Import

interface RevenuePageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function RevenuePage(props: RevenuePageProps) {
  const searchParams = await props.searchParams;
  
  // Defaultne vrijednosti (Trenutna godina)
  const currentYear = new Date().getFullYear();
  const selectedYear = Number(searchParams.year) || currentYear;
  const selectedMonth = searchParams.month ? Number(searchParams.month) : undefined;

  // Dohvat podataka
  const { totalRevenue, chartData } = await getRevenueAnalytics(selectedYear, selectedMonth);

  const months = [
    "Januar", "Februar", "Mart", "April", "Maj", "Juni",
    "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"
  ];

  const years = [2024, 2025, 2026]; // Možeš generirati dinamički

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prihodi i Zarada</h1>
          <p className="text-muted-foreground mt-1">
            Detaljna analitika financija po periodima.
          </p>
        </div>

        {/* FILTERI */}
        <form className="flex gap-2 items-center bg-white p-2 rounded-lg border shadow-sm">
          <Filter className="w-4 h-4 text-muted-foreground ml-2" />
          
          {/* Selektor Godine */}
          <div className="w-[100px]">
            <Select name="year" defaultValue={selectedYear.toString()}>
                {/* Mali trik: Koristimo formu i onValueChange s redirectom ili submit gumb */}
                {/* Za jednostavnost ovdje koristimo linkove unutar selecta ili client komponentu */}
                {/* Budući da je ovo server component, najlakše je koristiti Button za submit forme */}
                <SelectTrigger className="border-none shadow-none focus:ring-0">
                    <SelectValue placeholder="Godina" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-[1px] bg-slate-200"></div>

          {/* Selektor Mjeseca */}
          <div className="w-[140px]">
             <Select name="month" defaultValue={selectedMonth?.toString() || "all"}>
                <SelectTrigger className="border-none shadow-none focus:ring-0">
                    <SelectValue placeholder="Cijela godina" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Cijela godina</SelectItem>
                    {months.map((m, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                    ))}
                </SelectContent>
             </Select>
          </div>

          <Button type="submit" size="sm" className="ml-2">
            Primijeni
          </Button>
        </form>
      </div>

      {/* GLAVNA KARTICA SA SUMOM */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="p-4 bg-white rounded-full shadow-sm">
                <Banknote className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
                <p className="text-sm font-medium text-emerald-800">
                    Ukupni prihod za {selectedMonth ? months[selectedMonth - 1] : "cijelu"} {selectedYear}.
                </p>
                <h2 className="text-4xl font-bold text-emerald-900 mt-1">
                    {totalRevenue} KM
                </h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRAFIKON */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>
            {selectedMonth 
                ? `Pregled po danima (${months[selectedMonth - 1]})` 
                : `Pregled po mjesecima (${selectedYear})`
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-2 pt-4">
          <Overview data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}