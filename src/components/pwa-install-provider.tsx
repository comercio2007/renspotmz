
"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { PwaInstallFAB } from './pwa-install-banner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaInstallContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isAppInstalled: boolean;
  handleInstallClick: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

const PwaInstallContext = createContext<PwaInstallContextType>({ 
    deferredPrompt: null,
    isAppInstalled: false,
    handleInstallClick: async () => 'unavailable',
});

export const PwaInstallProvider = ({ children }: { children: ReactNode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsAppInstalled(true);
    }
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) {
      return 'unavailable';
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        setIsAppInstalled(true);
    }

    setDeferredPrompt(null);
    return outcome;
  }, [deferredPrompt]);

  return (
    <PwaInstallContext.Provider value={{ deferredPrompt, isAppInstalled, handleInstallClick }}>
      {children}
      <PwaInstallFAB />
    </PwaInstallContext.Provider>
  );
};

export const usePwaInstall = () => useContext(PwaInstallContext);
