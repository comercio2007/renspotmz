
"use client"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithPopup, isSignInWithEmailLink } from "firebase/auth";
import { app, googleProvider, rtdb } from "@/lib/firebase"
import { ref, set, get } from "firebase/database";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
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

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const auth = getAuth(app);
  const { setIsLoading } = useLoading();

  // Function to create a user record in RTDB
  const createUserInDb = (uid: string, email: string, name: string) => {
    return set(ref(rtdb, 'users/' + uid), {
      email,
      name,
      disabled: false, // Start as active
      propertyLimit: 1, // Default property limit
    });
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // Create user record in Realtime Database
        await createUserInDb(userCredential.user.uid, email, name);
        router.push('/');
      }
    } catch (error: any) {
      let description = "Não foi possível criar a conta. Tente novamente.";
      if (error.code === 'auth/email-already-in-use') {
          description = "Este e-mail já está em uso. Por favor, tente fazer login ou use um e-mail diferente.";
      }
      toast({
        title: "Erro de Cadastro",
        description: description,
        variant: "destructive",
      })
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  }
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setIsLoading(true);
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user already exists in RTDB
        const userRef = ref(rtdb, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
             // Create user record in Realtime Database on first Google sign-in
            await createUserInDb(user.uid, user.email!, user.displayName!);
        }
        
        router.push('/');
    } catch (error: any) {
        toast({
            title: "Erro de Cadastro com Google",
            description: "Não foi possível cadastrar com o Google. Tente novamente.",
            variant: "destructive"
        });
    } finally {
        setLoading(false);
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
          <CardTitle className="text-2xl font-headline">Criar Conta</CardTitle>
          <CardDescription>
            Insira suas informações para criar uma conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="full-name">Nome Completo</Label>
                  <Input id="full-name" placeholder="John Doe" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
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
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando...' : 'Criar conta'}
              </Button>
               <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                 <GoogleIcon className="mr-2 h-5 w-5"/>
                 Continuar com o Google
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

    