
"use client";
import Link from 'next/link';
import { Button } from './ui/button';
import { Home, PlusCircle, Menu, Building, Info, LogIn, UserPlus, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { UserNav } from './user-nav';
import { useAuth } from '@/contexts/auth-context';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';


const NavLink = ({ href, children, onClick }: { href?: string, children: React.ReactNode, onClick?: () => void }) => {
    const pathname = usePathname();
    const isActive = href && pathname === href;

    const content = (
         <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg text-lg font-medium transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                !href && "cursor-pointer"
            )}
        >
            {children}
        </div>
    );

    if (href) {
        return (
            <SheetClose asChild>
                <Link href={href}>
                    {content}
                </Link>
            </SheetClose>
        );
    }

    return (
         <SheetClose asChild>
            {content}
        </SheetClose>
    );
};


export function Header() {
  const { user, loading } = useAuth();
  const auth = getAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
             <Link href="/" className="flex items-center gap-2 mr-6">
                <Home className="h-8 w-8 text-primary" />
                <span className="hidden sm:inline-block font-bold text-xl font-headline">RentSpot</span>
            </Link>
        </div>

        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
                <Button asChild variant="default" size="sm">
                    <Link href={user ? "/dashboard/properties/new" : "/login"}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Anuncie seu Imóvel
                    </Link>
                </Button>
                {loading ? (
                    <div className="h-9 w-24 bg-muted rounded-md animate-pulse md:flex" />
                ) : user ? (
                    <div className="hidden md:flex">
                        <UserNav />
                    </div>
                ) : (
                    <>
                    <Button asChild size="sm" className="hidden md:flex">
                        <Link href="/signup">Inscrever-se</Link>
                    </Button>
                    </>
                )}
            </div>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Abrir menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Menu Principal</SheetTitle>
                        <SheetDescription>Navegue pelas diferentes secções do site.</SheetDescription>
                    </SheetHeader>
                    <nav className="flex flex-col gap-4 p-4">
                        <NavLink href="/">
                            <Home className="h-6 w-6" />
                            Início
                        </NavLink>
                        <NavLink href="/about">
                            <Info className="h-6 w-6" />
                            Sobre Nós
                        </NavLink>
                         {user ? (
                            <>
                                <NavLink href="/dashboard">
                                    <LayoutDashboard className="h-6 w-6" />
                                    Painel
                                </NavLink>
                                <NavLink href="/dashboard/properties/new">
                                    <PlusCircle className="h-6 w-6" />
                                    Novo Imóvel
                                </NavLink>
                                <NavLink href="/dashboard/settings">
                                    <Settings className="h-6 w-6" />
                                    Configurações
                                </NavLink>
                                <div className="pt-4 mt-4 border-t">
                                    <NavLink onClick={handleLogout}>
                                        <LogOut className="h-6 w-6" />
                                        Sair
                                    </NavLink>
                                </div>
                            </>
                        ) : (
                             <>
                                <NavLink href="/login">
                                    <LogIn className="h-6 w-6" />
                                    Login
                                </NavLink>
                                <NavLink href="/signup">
                                    <UserPlus className="h-6 w-6" />
                                    Inscrever-se
                                </NavLink>
                            </>
                        )}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
