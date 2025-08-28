
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useLoading } from "@/contexts/loading-context";
import { createDirectPayment } from "@/actions/payment.actions";
import { increaseUserPropertyLimit } from "@/actions/user.actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CreditCard, Zap, Loader2, Phone, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";


export default function UpgradePage() {
    const { user, propertyLimit } = useAuth();
    const { setIsLoading } = useLoading();
    const { toast } = useToast();
    const router = useRouter();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'emola'>('mpesa');
    const [phoneNumber, setPhoneNumber] = useState("");
    
    // State to manage the payment flow UI
    const [paymentState, setPaymentState] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');


    const handleUpgrade = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: "Erro de Autenticação",
                description: "Precisa de estar logado para fazer o upgrade.",
                variant: "destructive"
            });
            return router.push('/login');
        }

        if (!phoneNumber) {
            toast({
                title: "Campo Obrigatório",
                description: "Por favor, insira o número de telefone.",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);
        setIsLoading(true);

        try {
            const result = await createDirectPayment({
                amount: 200,
                context: `Upgrade de limite para o utilizador: ${user.email}`,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                },
                payment: {
                    method: paymentMethod,
                    phone: phoneNumber
                }
            });
            
            if (result.success) {
                // Aumenta o limite imediatamente no lado do cliente
                const limitResult = await increaseUserPropertyLimit(user.uid);
                if (limitResult.success) {
                    setPaymentState('success');
                } else {
                    // Se o aumento do limite falhar, informa o utilizador
                    toast({
                        title: "Erro ao Aumentar o Limite",
                        description: limitResult.message + " O seu pagamento será verificado manualmente pela nossa equipa.",
                        variant: "destructive"
                    });
                    setPaymentState('failed');
                }
            } else {
                 toast({
                    title: "Erro no Pagamento",
                    description: result.message,
                    variant: "destructive"
                });
                 setPaymentState('failed');
            }

        } catch (error: any) {
            toast({
                title: "Erro Inesperado",
                description: error.message,
                variant: "destructive"
            });
             setPaymentState('failed');
        } finally {
            setIsProcessing(false);
            setIsLoading(false);
        }
    }
    
    if (paymentState === 'success') {
        return (
            <div className="flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-green-500 text-white rounded-full h-16 w-16 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-headline">Pagamento Bem-Sucedido!</CardTitle>
                        <CardDescription>O seu limite de imóveis foi aumentado com sucesso. Agora pode publicar mais imóveis.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link href="/dashboard">Voltar para o Painel</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (paymentState === 'failed') {
        return (
            <div className="flex items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto bg-destructive text-destructive-foreground rounded-full h-16 w-16 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-headline">Pagamento Falhou</CardTitle>
                        <CardDescription>A transação não foi concluída. Por favor, verifique o seu saldo e tente novamente.</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex gap-2">
                         <Button variant="outline" className="w-full" onClick={() => {
                             setPaymentState('idle');
                         }}>
                            Tentar Novamente
                        </Button>
                        <Button className="w-full" asChild>
                            <Link href="/dashboard">Voltar para o Painel</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                 <form onSubmit={handleUpgrade}>
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center">
                            <Zap className="h-8 w-8" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-headline">Aumentar Limite de Anúncios</CardTitle>
                        <CardDescription>Aumente o seu limite de publicação em +3 imóveis para alcançar mais pessoas.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                         <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                            <span className="font-semibold text-primary">Custo do Aumento de Limite</span>
                            <p className="font-bold text-3xl text-primary-foreground-dark">200 MT</p>
                            <p className="text-xs text-muted-foreground">Pagamento único e seguro.</p>
                        </div>
                        
                        <RadioGroup defaultValue="mpesa" onValueChange={(value: 'mpesa' | 'emola') => setPaymentMethod(value)} className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="mpesa" id="mpesa" className="peer sr-only" />
                                <Label
                                htmlFor="mpesa"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                M-Pesa
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="emola" id="emola" className="peer sr-only" />
                                <Label
                                htmlFor="emola"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                e-Mola
                                </Label>
                            </div>
                        </RadioGroup>

                        <div className="grid gap-2">
                            <Label htmlFor="phone-number">Número de Telefone</Label>
                            <Input 
                                id="phone-number" 
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder={paymentMethod === 'mpesa' ? "841234567" : "871234567"}
                                required 
                            />
                             <p className="text-xs text-muted-foreground">Insira o número que será usado para a cobrança.</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isProcessing}>
                            {isProcessing ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> A Processar...</>
                            ) : (
                                <><CreditCard className="mr-2 h-5 w-5" /> Pagar 200 MT Agora</>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
