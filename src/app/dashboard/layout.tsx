
"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Home, PlusCircle, Settings, LogOut, Menu, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAuth, signOut } from "firebase/auth"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function DashboardLayoutContent({ children }: { children: React.React.Node }) {
  const router = useRouter()
  const { user, loading, isAdmin } = useAuth()
  const pathname = usePathname()
  const auth = getAuth()

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </header>
        <main className="flex-1 p-8">
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-10 w-10">
              {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />}
              <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user?.displayName || "Usuário"}</span>
              <span className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/"}
                tooltip="Voltar ao Início"
                className="text-lg"
              >
                <Link href="/">
                  <Home />
                  <span>Início</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard"}
                tooltip="Painel Principal"
                className="text-lg"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Painel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard/properties/new"}
                tooltip="Adicionar Novo Imóvel"
                className="text-lg"
              >
                <Link href="/dashboard/properties/new">
                  <PlusCircle />
                  <span>Novo Imóvel</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/dashboard/settings"}
                tooltip="Configurações da Conta"
                className="text-lg"
              >
                <Link href="/dashboard/settings">
                  <Settings />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Sair da Conta" className="text-lg">
                <LogOut />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content can be added here if needed in the future */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
              <Home className="h-6 w-6 text-primary" />
              <span>RentSpot</span>
            </Link>
          </div>
          {/* UserNav is removed from here */}
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.React.Node
}) {
  return (
    <DashboardLayoutContent>{children}</DashboardLayoutContent>
  )
}
