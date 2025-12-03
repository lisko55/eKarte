"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

export function OrderStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "all";

  const handleFilter = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val !== "all") params.set("status", val);
    else params.delete("status");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-[180px]">
        <Select value={status} onValueChange={handleFilter}>
            <SelectTrigger>
                <SelectValue placeholder="Status plaćanja" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Sve narudžbe</SelectItem>
                <SelectItem value="paid">Plaćeno</SelectItem>
                <SelectItem value="unpaid">Nije plaćeno</SelectItem>
            </SelectContent>
        </Select>
    </div>
  );
}