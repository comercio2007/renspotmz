
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
  const { deferredPrompt, isAppInstalled, handleInstallClick } = usePwaInstall();
 
  if (isAppInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-10 duration-500">
        <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg shadow-2xl flex items-center justify-between gap-4 border">
            <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                    <Download className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-semibold">Instalar a Aplicação</p>
                    <p className="text-sm text-muted-foreground">Aceda mais rápido e offline.</p>
                </div>
            </div>
            <Button onClick={handleInstallClick} className="shrink-0">
                Instalar
            </Button>
        </div>
    </div>
  );
}
