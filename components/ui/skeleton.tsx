import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Responsive Card Skeleton that matches our card design
function CardSkeleton({
  className,
  showActions = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { showActions?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <Skeleton className="h-4 w-[180px]" />
        <Skeleton className="h-3 w-[280px]" />
      </div>
      <div className="p-6 pt-0 space-y-4">
        <div className="space-y-3">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-16" />
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Overview Skeleton
function ProfileOverviewSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="p-6 pt-0">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Member Table Skeleton
function MemberTableSkeleton({
  className,
  rows = 3,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { rows?: number }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: no need for skelton
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Quick Actions Skeleton
function QuickActionsSkeleton({
  className,
  actions = 2,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { actions?: number }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="p-6 pt-0">
        <div className="flex flex-col gap-2">
          {Array.from({ length: actions }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: no need for skelton
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Account Information Skeleton
function AccountInfoSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-56" />
      </div>
      <div className="p-6 pt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: no need for skelton
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  CardSkeleton,
  ProfileOverviewSkeleton,
  MemberTableSkeleton,
  QuickActionsSkeleton,
  AccountInfoSkeleton,
};
