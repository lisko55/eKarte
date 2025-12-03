import { Skeleton } from "@/components/ui/skeleton";
export function EventCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="flex justify-between pt-4">
        <Skeleton className="h-10 w-24" />
        <ButtonSkeleton />
      </div>
    </div>
  );
}

function ButtonSkeleton() {
  return <Skeleton className="h-10 w-20 rounded-md" />;
}
