import { cn } from "@/lib/utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  active?: boolean;
}

function Skeleton({ className, active = true, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div
        className={cn(
          "h-4 w-1/3 rounded-md bg-muted",
          active && "animate-pulse",
        )}
      />
      <div
        className={cn(
          "h-3 w-full rounded-md bg-muted",
          active && "animate-pulse",
        )}
      />
      <div
        className={cn(
          "h-3 w-5/6 rounded-md bg-muted",
          active && "animate-pulse",
        )}
      />
    </div>
  );
}

export { Skeleton };
