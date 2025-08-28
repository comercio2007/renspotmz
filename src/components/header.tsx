
"use client";
import Link from 'next/link';
import { Button } from './ui/button';
import { PlusCircle, Home } from 'lucide-react';
import { UserNav } from './user-nav';
import { useAuth } from '@/contexts/auth-context';


export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <Home className="h-8 w-8 text-primary" />
            <span className="hidden sm:inline-block font-bold text-xl font-headline">RentSpot</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/dashboard/properties/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Anuncie seu Imóvel
            </Link>
          </Button>
          {loading ? (
            <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
          ) : user ? (
            <UserNav />
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Inscrever-se</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
