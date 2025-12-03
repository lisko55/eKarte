"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Music, Calendar, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function EventFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all"
  );

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set("keyword", query);
    else params.delete("keyword");
    if (category && category !== "all") params.set("category", category);
    else params.delete("category");
    params.set("page", "1");
    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    setQuery("");
    setCategory("all");
    router.push("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="relative bg-[#0f172a] pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden rounded-b-[2.5rem] shadow-xl mb-12">
      {/* DEKORATIVNI GRADIJENTI (Background Blobs) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <div className="container relative z-10 px-4 mx-auto text-center">
        {/* NASLOV I TEKST */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 drop-shadow-sm">
          Pronađite svoj sljedeći{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            doživljaj
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Najbolji koncerti, predstave i sportski susreti na jednom mjestu.
          Sigurna kupovina i prodaja ulaznica.
        </p>

        {/* SEARCH BAR - Lebdeći dizajn */}
        <div className="bg-white p-2 rounded-2xl shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row gap-2 items-center transform transition-all hover:scale-[1.01]">
          {/* INPUT */}
          <div className="relative flex-1 w-full group">
            <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search className="h-5 w-5" />
            </div>
            <Input
              placeholder="Pretraži događaje, izvođače, lokaciju..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 border-none shadow-none h-12 text-base bg-transparent focus-visible:ring-0 placeholder:text-slate-400"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-3.5 text-gray-300 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="hidden md:block w-[1px] h-8 bg-slate-200 mx-2"></div>

          {/* KATEGORIJA */}
          <div className="w-full md:w-64 relative">
            <div className="absolute left-4 top-3.5 z-10 pointer-events-none text-slate-400">
              <Music className="h-5 w-5" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="pl-12 border-none shadow-none h-12 text-base focus:ring-0 bg-transparent text-slate-600">
                <SelectValue placeholder="Kategorija" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                <SelectItem value="Muzika">Muzika</SelectItem>
                <SelectItem value="Sport">Sport</SelectItem>
                <SelectItem value="Pozorište">Pozorište</SelectItem>
                <SelectItem value="Film">Film</SelectItem>
                <SelectItem value="Ostalo">Ostalo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* GUMB */}
          <Button
            onClick={handleSearch}
            size="lg"
            className="w-full md:w-auto h-12 px-8 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-base font-semibold shadow-md transition-all hover:shadow-lg"
          >
            Pretraži
          </Button>
        </div>

        {/* RESET LINK */}
        {(query || category !== "all") && (
          <button
            onClick={handleReset}
            className="mt-6 text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <X className="w-3 h-3" /> Poništi filtere
          </button>
        )}
      </div>
    </div>
  );
}
