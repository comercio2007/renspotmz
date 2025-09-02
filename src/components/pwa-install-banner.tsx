
"use client"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { usePwaInstall } from "./pwa-install-provider"
import { InstallPWA } from "./install-pwa"
import { cn } from "@/lib/utils"

export function PwaInstallFAB() {
  const { deferredPrompt, isAppInstalled } = usePwaInstall();
 
  if (isAppInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl animate-in fade-in zoom-in-50 duration-500",
            "lg:h-16 lg:w-16"
          )}
        >
          <Download className="h-6 w-6 lg:h-7 lg:w-7" />
          <span className="sr-only">Instalar a Aplicação</span>
        </Button>
      </DialogTrigger>
      <InstallPWA />
    </Dialog>
  );
}
