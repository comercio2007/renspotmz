
"use client"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/header"


function DashboardLayoutContent({ children }: { children: React.React.Node }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8" />
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
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
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
