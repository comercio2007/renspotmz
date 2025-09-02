
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Download, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallBanner() {
  const { toast } = useToast()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Do not show the banner if the app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return;
      }
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: "App Instalado!",
        description: "O RentSpot foi adicionado ao seu ecrã principal.",
      });
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  };
  
  const handleDismiss = () => {
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
     <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md">
        <div className="bg-background rounded-lg shadow-2xl p-4 border flex items-center gap-4 animate-in slide-in-from-top-10 duration-500">
            <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex-shrink-0 flex items-center justify-center">
                <span className="font-headline font-bold text-2xl">R</span>
            </div>
            <div className="flex-grow">
                <p className="font-bold">Instalar a Aplicação</p>
                <p className="text-sm text-muted-foreground">Adicione ao ecrã principal para uma experiência mais rápida.</p>
            </div>
            <Button size="sm" onClick={handleInstallClick}>
                <Download className="mr-2 h-4 w-4"/>
                Instalar
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={handleDismiss}>
                <X className="h-4 w-4"/>
                <span className="sr-only">Fechar</span>
            </Button>
        </div>
     </div>
  )
}
