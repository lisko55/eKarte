import { EventCardSkeleton } from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <div className="container py-10">
      {/* Hero Skeleton */}
      <div className="w-full h-64 bg-slate-100 rounded-3xl mb-10 animate-pulse" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
