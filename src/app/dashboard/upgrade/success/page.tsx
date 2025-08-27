
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function UpgradeSuccessPage() {
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto bg-green-500 text-white rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle className="h-8 w-8" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">Pagamento Concluído!</CardTitle>
          <CardDescription>O seu limite de imóveis foi aumentado com sucesso. Pode levar alguns instantes para a alteração ser refletida na sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Obrigado por escolher o RentSpot!</p>
        </CardContent>
        <CardFooter>
            <Button className="w-full" asChild>
                <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Voltar para o Painel
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
