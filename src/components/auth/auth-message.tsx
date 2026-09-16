import { cn } from "@/lib/utils";

interface AuthMessageProps {
  variant: "error" | "success";
  children: React.ReactNode;
  className?: string;
}

export function AuthMessage({ variant, children, className }: AuthMessageProps) {
  return (
    <p
      role="alert"
      className={cn(
        "rounded-md px-3 py-2 text-sm",
        variant === "error" &&
          "bg-status-rejected-bg text-status-rejected",
        variant === "success" &&
          "bg-status-approved-bg text-status-approved",
        className,
      )}
    >
      {children}
    </p>
  );
}
