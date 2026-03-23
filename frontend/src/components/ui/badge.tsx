import * as React from "react";
import { cn } from "./utils";

function Badge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex w-fit items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-bold tracking-wide",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
