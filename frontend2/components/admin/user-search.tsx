"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { searchUsersPreview } from "@/actions/admin-actions";
import { Search, X } from "lucide-react";

export function UserSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce logika (da ne šalje zahtjev na svako slovo odmah)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        const data = await searchUsersPreview(query);
        setResults(data);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); // Čeka 300ms nakon prestanka kucanja

    return () => clearTimeout(timer);
  }, [query]);

  // Zatvori dropdown kad klikneš van
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (userQuery: string) => {
    setQuery(userQuery);
    setIsOpen(false);
    router.push(`/admin/userlist?query=${userQuery}`);
  };

  const handleReset = () => {
    setQuery("");
    setResults([]);
    router.push("/admin/userlist");
  };

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        setIsOpen(false);
        router.push(`/admin/userlist?query=${query}`);
    }
  }

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleEnter}
          placeholder="Pretraži korisnike..."
          className="pr-10"
        />
        {query ? (
             <button onClick={handleReset} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
             </button>
        ) : (
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
        )}
      </div>

      {/* DROPDOWN REZULTATI */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((user) => (
            <div
              key={user._id}
              onClick={() => handleSelect(user.email)} // Klikom pretražujemo po emailu
              className="p-3 hover:bg-slate-100 cursor-pointer border-b last:border-none"
            >
              <p className="font-medium text-sm text-slate-800">
                {user.name} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          ))}
        </div>
      )}
      
      {query && (
          <Button 
            onClick={handleReset} 
            variant="secondary" 
            size="sm" 
            className="mt-2 bg-slate-500 text-white hover:bg-slate-600"
          >
            Resetiraj
          </Button>
      )}
    </div>
  );
}