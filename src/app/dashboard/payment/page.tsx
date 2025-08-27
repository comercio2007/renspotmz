import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, CreditCard } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center">
            <CreditCard className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">Confirmar Pagamento</CardTitle>
          <CardDescription>Revise os detalhes e confirme seu pagamento para publicar seu anúncio de imóvel.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/50">
            <span className="font-medium">Taxa de Anúncio</span>
            <span className="font-bold text-xl">200 MT</span>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Você será redirecionado para um gateway de pagamento seguro para concluir a transação.
            Para esta demonstração, clicar abaixo simulará um pagamento bem-sucedido.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" asChild>
                <Link href="/dashboard">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Confirmar e Pagar 200 MT
                </Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
                <Link href="/dashboard/properties/new">
                    Cancelar
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
