"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { searchOrdersPreview } from "@/actions/order-actions";
import { Search, X, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function OrderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        const data = await searchOrdersPreview(query);
        setResults(data);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (orderId: string) => {
    router.push(`/admin/orderlist/${orderId}`);
    setIsOpen(false);
  };

  const handleFullSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if(query) params.set("query", query);
    else params.delete("query");
    params.set("page", "1");
    router.push(`/admin/orderlist?${params.toString()}`);
    setIsOpen(false);
  };

  const handleReset = () => {
    setQuery("");
    setResults([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("query");
    router.push(`/admin/orderlist?${params.toString()}`);
  };

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div className="relative flex gap-2">
        <div className="relative w-full">
            <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFullSearch()}
                placeholder="Traži narudžbu (ID, Ime, Email)..."
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
        <Button variant="secondary" onClick={handleFullSearch}>Traži</Button>
      </div>

      {/* REZULTATI PRETRAGE */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-80 overflow-auto">
          {results.map((order) => (
            <div
              key={order._id}
              onClick={() => handleSelect(order._id)}
              className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-none flex justify-between items-center"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-slate-100 p-2 rounded-full h-fit">
                    <ShoppingBag className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex flex-col overflow-hidden">
                    {/* IME KORISNIKA */}
                    <span className="font-medium text-sm truncate text-slate-800">
                        {order.userName || "Nepoznato"}
                    </span>
                    
                    {/* --- NOVO: EMAIL KORISNIKA --- */}
                    <span className="text-xs text-blue-600 truncate">
                        {order.userEmail}
                    </span>
                    {/* ----------------------------- */}

                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        #{order._id.substring(0, 8)}...
                    </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 pl-2">
                 <span className="font-bold text-sm whitespace-nowrap">{order.totalPrice} KM</span>
                 <Badge className={order.isPaid ? "bg-green-600 h-4 px-1 text-[9px]" : "bg-red-500 h-4 px-1 text-[9px]"}>
                    {order.isPaid ? "Plaćeno" : "Neplaćeno"}
                 </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}