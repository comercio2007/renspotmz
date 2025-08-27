
import Link from 'next/link';
import { Home } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Home className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold font-headline">RentSpot</span>
            </Link>
            <p className="text-muted-foreground">O seu destino para casas de aluguel de qualidade.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-primary transition-colors">Início</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Meu Painel</Link></li>
              <li><Link href="/dashboard/properties/new" className="hover:text-primary transition-colors">Anunciar um Imóvel</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacte-nos</h3>
            <p className="text-muted-foreground">
              Chimoio, Moçambique<br />
              Email: rentspotmz@gmail.com<br />
              Telefone: +258 84 920 0525
            </p>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RentSpot. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
