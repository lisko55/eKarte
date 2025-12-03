"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Music,
  Trophy,
  Theater,
  Film,
  Hexagon,
  LayoutGrid,
} from "lucide-react";

const categories = [
  { id: "Muzika", label: "Muzika", icon: Music },
  { id: "Sport", label: "Sport", icon: Trophy },
  { id: "Pozorište", label: "Pozorište", icon: Theater },
  { id: "Film", label: "Film", icon: Film },
  { id: "Ostalo", label: "Ostalo", icon: Hexagon },
];

export function CategoryNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  // Funkcija za odabir specifične kategorije
  const handleClick = (catId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", catId);
    params.set("page", "1"); // Reset na 1. stranicu
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  // Funkcija za "Sve" (briše filter)
  const handleAllClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category"); // Mičemo kategoriju iz URL-a
    params.set("page", "1");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  // Provjera je li "Sve" aktivno (ako nema kategorije u URL-u ili je 'all')
  const isAllActive = !currentCategory || currentCategory === "all";

  return (
    <div className="flex flex-wrap justify-center gap-3 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. GUMB "SVE" */}
      <button
        onClick={handleAllClick}
        className={`
            flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-200
            ${
              isAllActive
                ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md transform scale-105 ring-2 ring-offset-2 ring-[#0f172a]"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
            }
        `}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="font-medium text-sm">Sve</span>
      </button>

      {/* 2. OSTALE KATEGORIJE */}
      {categories.map((item) => {
        const Icon = item.icon;
        const isActive = currentCategory === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-200
                ${
                  isActive
                    ? "bg-[#0f172a] text-white border-[#0f172a] shadow-md transform scale-105 ring-2 ring-offset-2 ring-[#0f172a]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
