"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  // Logika za generiranje brojeva stranica (npr. 1 2 ... 5 6 7 ... 100)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Koliko brojeva želimo vidjeti odjednom

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Uvijek pokaži prvu
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Pokaži trenutnu i okolne
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Uvijek pokaži zadnju
      pages.push(totalPages);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 py-6">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page, idx) => (
        typeof page === "number" ? (
          <Button
            key={idx}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            className="w-9"
          >
            {page}
          </Button>
        ) : (
          <span key={idx} className="px-2 text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </span>
        )
      ))}

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}