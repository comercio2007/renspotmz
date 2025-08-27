"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getAuth, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const auth = getAuth();

  // Profile states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setNameLoading(true);
    try {
      await updateProfile(user, { displayName: name });
      toast({
        title: "Sucesso!",
        description: "Seu nome foi atualizado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setNameLoading(false);
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (newPassword !== confirmPassword) {
      toast({ title: "Erro", description: "As novas senhas não correspondem.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Erro", description: "A nova senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      toast({
        title: "Sucesso!",
        description: "Sua senha foi alterada com sucesso.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
       let description = "Ocorreu um erro. Tente novamente.";
       if (error.code === 'auth/wrong-password') {
           description = "A senha atual está incorreta.";
       }
       if(error.code === 'auth/too-many-requests') {
           description = "Muitas tentativas. Tente novamente mais tarde.";
       }
      toast({
        title: "Erro ao alterar senha",
        description: description,
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Perfil</CardTitle>
          <CardDescription>Atualize suas informações pessoais.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleProfileUpdate}>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
            <Button type="submit" disabled={nameLoading}>
              {nameLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Salvando...</> : "Salvar Alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Atualize sua senha aqui. É recomendável usar uma senha forte e única.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handlePasswordUpdate}>
            <div className="grid gap-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required/>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
            </div>
            <Button type="submit" disabled={passwordLoading}>
               {passwordLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Atualizando...</> : "Atualizar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
