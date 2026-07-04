import * as React from "react";
import { cn } from "@/lib/utils";

function Eyebrow({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="eyebrow"
      className={cn(
        "text-xs font-semibold tracking-wide text-accent uppercase",
        className,
      )}
      {...props}
    />
  );
}

export { Eyebrow };
