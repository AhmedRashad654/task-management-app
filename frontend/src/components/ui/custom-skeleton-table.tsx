import { Skeleton } from "./skeleton"

const CustomSkeletonTable = () => {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex gap-4 border-b border-border bg-muted/50 px-4 py-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-border px-4 py-3.5 last:border-b-0">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
  )
}

export default CustomSkeletonTable