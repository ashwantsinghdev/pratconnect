import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyProps {
  className?: string;
  description?: string;
}

function Empty({ className, description = "No data" }: EmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-8 text-center",
        className,
      )}
    >
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export { Empty };
