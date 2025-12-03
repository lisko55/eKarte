"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function OrderFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (status && status !== "all") params.set("status", status);
    
    // Resetiramo na 1. stranicu kad se filtrira
    params.set("page", "1");
    
    router.push(`?${params.toString()}`);
  };

  const handleReset = () => {
    setQuery("");
    setStatus("all");
    router.push("?"); // Očisti URL
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-3 rounded-lg border shadow-sm w-full">
      
      {/* SEARCH INPUT */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Traži kupca (Ime, Email)..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-9"
        />
        {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-black">
                <X className="w-4 h-4" />
            </button>
        )}
      </div>

      {/* STATUS SELECT */}
      <div className="w-full sm:w-48">
        <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="paid">Plaćeno</SelectItem>
                <SelectItem value="unpaid">Nije plaćeno</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 w-full sm:w-auto">
        <Button onClick={handleSearch} className="flex-1 sm:flex-none">
            Traži
        </Button>
        {(query || status !== "all") && (
            <Button variant="ghost" onClick={handleReset} className="flex-1 sm:flex-none">
                Reset
            </Button>
        )}
      </div>
    </div>
  );
}