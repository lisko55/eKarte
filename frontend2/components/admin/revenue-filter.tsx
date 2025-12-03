"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Filter } from "lucide-react";

export function RevenueFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentYear = new Date().getFullYear();
  const initialYear = searchParams.get("year") || currentYear.toString();
  const initialMonth = searchParams.get("month") || "all";

  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const handleApply = () => {
    let query = `?year=${year}`;
    if (month !== "all") {
      query += `&month=${month}`;
    }
    router.push(`/admin/revenue${query}`);
  };

  const months = [
    "Januar", "Februar", "Mart", "April", "Maj", "Juni",
    "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"
  ];

  return (
    <div className="flex gap-2 items-center bg-white p-2 rounded-lg border shadow-sm">
      <Filter className="w-4 h-4 text-muted-foreground ml-2" />
      
      <div className="w-[100px]">
        <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="border-none shadow-none focus:ring-0">
                <SelectValue placeholder="Godina" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="h-6 w-[1px] bg-slate-200"></div>

      <div className="w-[140px]">
         <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="border-none shadow-none focus:ring-0">
                <SelectValue placeholder="Mjesec" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Cijela godina</SelectItem>
                {months.map((m, i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                ))}
            </SelectContent>
         </Select>
      </div>

      <Button onClick={handleApply} size="sm" className="ml-2">
        Prikaži
      </Button>
    </div>
  );
}