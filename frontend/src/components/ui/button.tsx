import * as React from "react";
import { cn } from "./utils";

type ButtonProps = React.ComponentProps<"button"> & {
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
};

function Button({
  className,
  type = "button",
  size = "default",
  variant = "default",
  ...props
}: ButtonProps) {
  const sizeClasses = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-2 text-sm",
    lg: "px-8 py-6 text-lg",
    icon: "size-10",
  };

  const variantClasses = {
    default: "",
    outline: "",
    secondary: "",
    ghost: "",
    link: "",
    destructive: "",
  };

  return (
    <button
      data-slot="button"
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-transparent font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Button };
