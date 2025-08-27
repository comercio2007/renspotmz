
"use client"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Download, CheckCircle, Smartphone } from "lucide-react"
import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWA() {
  const { toast } = useToast()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Instalação não disponível",
        description: "A instalação só pode ser iniciada através de um navegador compatível.",
        variant: "destructive"
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: "App Instalado!",
        description: "O RentSpot foi adicionado ao seu ecrã principal.",
      });
    }

    setDeferredPrompt(null);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8" />
        </div>
        <DialogTitle className="text-center text-2xl font-headline">Instalar RentSpot</DialogTitle>
        <DialogDescription className="text-center">
          Adicione o RentSpot ao seu ecrã principal para um acesso mais rápido e uma experiência semelhante a uma aplicação.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        {isAppInstalled ? (
          <div className="w-full text-center text-green-600 flex items-center justify-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            <span>Aplicação já instalada!</span>
          </div>
        ) : deferredPrompt ? (
          <Button type="button" className="w-full" onClick={handleInstallClick}>
            <Download className="mr-2 h-5 w-5" />
            Instalar Aplicação
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground text-center w-full">
            O seu navegador não suporta a instalação ou a aplicação já está instalada.
          </p>
        )}
      </DialogFooter>
    </DialogContent>
  )
}
