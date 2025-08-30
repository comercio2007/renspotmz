
"use client"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from "firebase/auth";
import { app, googleProvider } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { sendPasswordResetLink } from "@/actions/user.actions";
import { Home } from "lucide-react";
import { useLoading } from "@/contexts/loading-context";


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.658-3.657-11.303-8.528l-6.571,4.819C9.656,39.663,16.318,44,24,44z"/>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C39.904,36.461,44,30.825,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
)


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const auth = getAuth(app);
  const { setIsLoading } = useLoading();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/')
    } catch (error: any) {
      let description = "Ocorreu um erro desconhecido. Por favor, tente novamente.";
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = "E-mail ou senha incorretos. Verifique suas credenciais.";
          break;
        case 'auth/user-disabled':
          description = "Sua conta foi desativada. Por favor, entre em contato com o suporte.";
          break;
        case 'auth/too-many-requests':
          description = "Acesso temporariamente desativado devido a muitas tentativas. Tente novamente mais tarde.";
          break;
        default:
          console.error("Login Error:", error);
          break;
      }
      toast({
        title: "Erro de Login",
        description: description,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsLoading(false);
    }
  }
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setIsLoading(true);
    try {
        await signInWithPopup(auth, googleProvider);
        router.push('/');
    } catch (error: any) {
        toast({
            title: "Erro de Login com Google",
            description: "Não foi possível fazer login com o Google. Tente novamente.",
            variant: "destructive"
        });
    } finally {
        setLoading(false);
        setIsLoading(false);
    }
  }


  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Campo Obrigatório",
        description: "Por favor, insira o seu e-mail.",
        variant: "destructive"
      });
      return;
    }
    setResetLoading(true);
    setIsLoading(true);
    try {
        // Call the server action to validate and trigger email.
        const result = await sendPasswordResetLink(resetEmail);

        // The client-side call to actually send the email
        await sendPasswordResetEmail(auth, resetEmail);

        // Show the consistent success message from the server action
        toast({
            title: "E-mail Enviado",
            description: result.message,
        });
        document.getElementById('close-reset-dialog')?.click();
        
    } catch (error: any) {
        // This catch block will now mostly handle client-side errors,
        // like network issues or if Firebase client SDK has a problem.
        // We will show a generic message, as the server action already handled the user-not-found case.
        let description = "Ocorreu um erro. Por favor, tente novamente mais tarde.";
        if (error.code === 'auth/too-many-requests') {
            description = "Muitas tentativas. Tente novamente mais tarde.";
        }
        toast({
            title: "Erro",
            description: description,
            variant: "destructive"
        });
    } finally {
        setResetLoading(false);
        setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 p-4">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
                <Home className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold font-headline">RentSpot</span>
            </Link>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Digite seu e-mail abaixo para fazer login em sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                   <Dialog>
                      <DialogTrigger asChild>
                         <button type="button" className="ml-auto inline-block text-sm underline">
                            Esqueceu sua senha?
                         </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handlePasswordReset}>
                           <DialogHeader>
                              <DialogTitle>Redefinir Senha</DialogTitle>
                              <DialogDescription>
                                Insira o seu e-mail para receber um link de redefinição de senha.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="reset-email" className="text-right">
                                  E-mail
                                </Label>
                                <Input
                                  id="reset-email"
                                  type="email"
                                  value={resetEmail}
                                  onChange={(e) => setResetEmail(e.target.value)}
                                  className="col-span-3"
                                  placeholder="seu@email.com"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="secondary" id="close-reset-dialog">
                                  Cancelar
                                </Button>
                              </DialogClose>
                              <Button type="submit" disabled={resetLoading}>
                                {resetLoading ? 'Enviando...' : 'Enviar Link'}
                              </Button>
                            </DialogFooter>
                        </form>
                      </DialogContent>
                   </Dialog>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Login'}
              </Button>
               <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                 <GoogleIcon className="mr-2 h-5 w-5"/>
                 Continuar com o Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <Link href="/signup" className="underline">
              Inscrever-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

    
