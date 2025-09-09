
"use client";
import Link from 'next/link';
import { Button } from './ui/button';
import { Home, PlusCircle, Menu, Building, Info, LogIn, UserPlus, LayoutDashboard, Settings, LogOut, Shield, Share2, HelpCircle, Users } from 'lucide-react';
import { UserNav } from './user-nav';
import { useAuth } from '@/contexts/auth-context';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { DialogTrigger } from './ui/dialog';


const NavLink = ({ href, children, onClick }: { href: string, children: React.React.Node, onClick?: () => void }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <SheetClose asChild>
            <Link
                href={href}
                onClick={onClick}
                className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors text-base",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                )}
            >
                {children}
            </Link>
        </SheetClose>
    );
};


export function Header() {
  const { user, loading, isAdmin } = useAuth();
  const auth = getAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
             <Link href="/" className="flex items-center gap-2 mr-4">
                <Home className="h-8 w-8 text-primary" />
                <span className="hidden sm:inline-block font-bold text-xl font-headline">RentSpot</span>
            </Link>
             <Button asChild variant="default" size="sm">
                <Link href={user ? "/dashboard/properties/new" : "/login"}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Anuncie seu Imóvel
                </Link>
            </Button>
        </div>

        <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
                {loading ? (
                    <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
                ) : !user && (
                    <div className="items-center gap-2 flex">
                        <Button asChild size="sm" variant="outline">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href="/signup">Inscrever-se</Link>
                        </Button>
                    </div>
                )}
            </div>
            {loading ? null : user && <UserNav />}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
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
                         <NavLink href="/how-to-use">
                            <HelpCircle className="h-6 w-6" />
                            Como Usar
                        </NavLink>
                        <SheetClose asChild>
                            <Link
                                href="https://chat.whatsapp.com/FHOrI6eKyA9Fsi8q8LIKPE?mode=ems_copy_c"
                                target="_blank"
                                className="flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors text-base text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                            >
                                <Users className="h-6 w-6" />
                                Grupo WhatsApp
                            </Link>
                        </SheetClose>
                         {user ? (
                            <>
                                <NavLink href="/dashboard">
                                    <LayoutDashboard className="h-6 w-6" />
                                    Painel
                                </NavLink>
                                {isAdmin && (
                                    <NavLink href="/dashboard/admin">
                                        <Shield className="h-6 w-6" />
                                        Admin
                                    </NavLink>
                                )}
                                <NavLink href="/dashboard/properties/new">
                                    <PlusCircle className="h-6 w-6" />
                                    Novo Imóvel
                                </NavLink>
                                <NavLink href="/dashboard/settings">
                                    <Settings className="h-6 w-6" />
                                    Configurações
                                </NavLink>
                                <div className="pt-4 mt-4 border-t">
                                     <SheetClose asChild>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors text-base text-muted-foreground hover:bg-secondary/80 hover:text-foreground cursor-pointer">
                                            <LogOut className="h-6 w-6" />
                                            Sair
                                        </button>
                                     </SheetClose>
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
                                <div className="pt-4 mt-4 border-t">
                                     <NavLink href="/login">
                                        <PlusCircle className="h-6 w-6" />
                                        Anunciar Imóvel
                                    </NavLink>
                                </div>
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
