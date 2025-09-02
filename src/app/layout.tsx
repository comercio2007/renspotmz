
import type { Metadata } from 'next'
import { PT_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/auth-context'
import { LoadingProvider } from '@/contexts/loading-context'
import { SplashScreen } from '@/components/splash-screen'
import { GlobalLoader } from '@/components/global-loader'

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-headline',
})

export const metadata: Metadata = {
  title: 'RentSpot - Aluguel de Imóveis em Moçambique',
  description: 'Encontre os melhores imóveis para alugar em Moçambique. Apartamentos, casas e vivendas nas melhores localizações.',
  manifest: '/manifest.json',
  themeColor: '#FA8A7D',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RentSpot',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.React.Node
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${ptSans.variable} ${playfairDisplay.variable} font-body flex flex-col min-h-screen`}>
        <AuthProvider>
            <LoadingProvider>
                <SplashScreen />
                {children}
                <Toaster />
                <GlobalLoader />
            </LoadingProvider>
        </AuthProvider>
        
      </body>
    </html>
  )
}
