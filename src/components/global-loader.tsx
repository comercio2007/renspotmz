
"use client";
import { useLoading } from "@/contexts/loading-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function GlobalLoader() {
  const { isLoading } = useLoading();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-[9999] transition-all duration-300",
        isLoading ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
      )}
    >
      <div className="relative w-12 h-12">
        <div className="absolute -inset-1 bg-primary/30 rounded-full animate-ping"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-primary rounded-full shadow-lg">
          <span className="font-headline font-bold text-2xl text-primary-foreground">R</span>
        </div>
      </div>
    </div>
  );
}
