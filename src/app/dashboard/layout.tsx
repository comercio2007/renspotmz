
"use client"
import Link from "next/link"
import {
  Home,
  LayoutDashboard,
  PanelLeft,
  PlusCircle,
  Settings,
  Shield,
  Globe,
  Share,
  Download,
} from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogTrigger
} from "@/components/ui/dialog"
import { ShareDialog } from "@/components/share-dialog"
import { InstallPWA } from "@/components/install-pwa"


function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  const { setOpenMobile } = useSidebar();
  const isActive = (path: string) => pathname === path

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden md:block w-64 border-r p-4 space-y-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex-1 p-8">
            <header className="flex justify-end mb-8">
                <Skeleton className="h-10 w-10 rounded-full" />
            </header>
            <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl font-headline">RentSpot</span>
            </Link>
          </SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem onClick={() => setOpenMobile(false)}>
              <SidebarMenuButton
                asChild
                isActive={isActive("/")}
                tooltip="Início"
              >
                <Link href="/">
                  <Globe />
                  <span>Início</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem onClick={() => setOpenMobile(false)}>
              <SidebarMenuButton
                asChild
                isActive={isActive("/dashboard")}
                tooltip="Painel"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Painel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem onClick={() => setOpenMobile(false)}>
              <SidebarMenuButton
                asChild
                isActive={isActive("/dashboard/properties/new")}
                tooltip="Novo Imóvel"
              >
                <Link href="/dashboard/properties/new">
                  <PlusCircle />
                  <span>Novo Imóvel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem onClick={() => setOpenMobile(false)}>
              <SidebarMenuButton
                asChild
                isActive={isActive("/dashboard/settings")}
                tooltip="Configurações"
              >
                <Link href="/dashboard/settings">
                  <Settings />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Dialog>
                  <DialogTrigger asChild>
                        <SidebarMenuButton tooltip="Partilhar">
                          <Share />
                          <span>Partilhar</span>
                      </SidebarMenuButton>
                  </DialogTrigger>
                  <ShareDialog />
              </Dialog>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Dialog>
                  <DialogTrigger asChild>
                        <SidebarMenuButton tooltip="Instalar App">
                          <Download />
                          <span>Instalar App</span>
                      </SidebarMenuButton>
                  </DialogTrigger>
                  <InstallPWA />
              </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 sm:justify-end">
          <SidebarTrigger className="sm:hidden h-8 w-8" />
          <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.React.Node
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  )
}
