import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div className={cn("container mx-auto px-4 py-8 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
