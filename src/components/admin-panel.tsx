
"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useMemo, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Search, Eye, Edit, Trash2, AlertTriangle, UserCheck, UserX, KeyRound, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, off, remove } from "firebase/database";
import type { Property } from "@/lib/placeholder-data";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog"
import { deleteUser, type UserRecord, toggleUserStatus, updateUserPropertyLimit, getUsers } from "@/actions/user.actions";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { UserStats } from "./user-stats";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Label } from "./ui/label";
import { useLoading } from "@/contexts/loading-context";


type AdminPanelProps = {
    initialUsers: UserRecord[];
    initialProperties: Property[];
    usersError?: string;
}

export function AdminPanel({ initialUsers, initialProperties, usersError }: AdminPanelProps) {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { setIsLoading } = useLoading();

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  
  const [propertySearchTerm, setPropertySearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [newLimit, setNewLimit] = useState<number>(1);
  const [realtimeError, setRealtimeError] = useState<string | undefined>(usersError);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, authLoading, router]);

  // Real-time listener for users
  useEffect(() => {
    if (!isAdmin) return;

    // A server action to periodically re-fetch the full user list from Auth
    // This is a workaround because there's no real-time listener for Firebase Auth users.
    // We check every 30 seconds for new sign-ups.
    const fetchLatestUsers = async () => {
        const { users: latestUsers, error } = await getUsers();
        if (latestUsers) {
            setUsers(latestUsers);
            setRealtimeError(undefined); // Clear previous errors if successful
        } else if (error) {
            setRealtimeError(error);
        }
    };
    
    // Fetch immediately on component mount
    fetchLatestUsers(); 

    const interval = setInterval(fetchLatestUsers, 30000); // 30 seconds
    
    // Real-time listener for properties
    const propertiesRef = ref(rtdb, 'properties');
    const propertiesUnsubscribe = onValue(propertiesRef, (snapshot) => {
        if(snapshot.exists()) {
            const data = snapshot.val();
            const propertyList: Property[] = Object.values(data as Record<string, Property>).sort((a: any, b: any) => b.createdAt - a.createdAt);
            setProperties(propertyList);
        } else {
            setProperties([]);
        }
    });

    return () => {
      clearInterval(interval);
      off(propertiesRef); // Detach the properties listener
    };
  }, [isAdmin]);

  const filteredProperties = useMemo(() => {
    if (!propertySearchTerm) return properties;
    return properties.filter(p => 
      p.title.toLowerCase().includes(propertySearchTerm.toLowerCase()) || 
      (p.id && p.id.toLowerCase().includes(propertySearchTerm.toLowerCase()))
    );
  }, [propertySearchTerm, properties]);
  
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return users;
    return users.filter(u => 
      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
      u.displayName?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [userSearchTerm, users]);

  const handleDeleteProperty = async (propertyId: string) => {
    setIsLoading(true);
    startTransition(async () => {
        try {
            await remove(ref(rtdb, `properties/${propertyId}`));
            toast({
                title: "Sucesso!",
                description: "O imóvel foi excluído."
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível excluir o imóvel.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }
    });
  }
  
  const handleToggleStatus = async (uid: string, disabled: boolean) => {
    setIsLoading(true);
    startTransition(async () => {
      const result = await toggleUserStatus(uid, disabled);
      toast({
        title: result.success ? "Sucesso!" : "Erro",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      // The real-time listener will update the UI automatically
      setIsLoading(false);
    });
  }

  const handleDeleteUser = async (uid: string) => {
    setIsLoading(true);
    startTransition(async () => {
        const result = await deleteUser(uid);
        toast({
            title: result.success ? "Sucesso!" : "Erro",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        })
        // The real-time listener will update the UI automatically
        setIsLoading(false);
    })
  }
  
  const handleOpenLimitModal = (user: UserRecord) => {
    setEditingUser(user);
    setNewLimit(user.propertyLimit || 1);
  }

  const handleUpdateLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsLoading(true);
    startTransition(async () => {
        const result = await updateUserPropertyLimit(editingUser.uid, newLimit);
        toast({
            title: result.success ? "Sucesso!" : "Erro",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
        if (result.success) {
            // The real-time listener will update the UI automatically
            setEditingUser(null);
        }
        setIsLoading(false);
    });
  }

  // This check is important to avoid rendering anything for non-admins or during initial auth load
  if (authLoading || !isAdmin) {
      return null;
  }

  if (selectedProperty) {
    return (
        <Card>
            <CardHeader>
                <Button onClick={() => setSelectedProperty(null)} variant="outline" className="mb-4 w-fit">Voltar</Button>
                <CardTitle>{selectedProperty.title}</CardTitle>
                <CardDescription>
                    ID: {selectedProperty.id} <br />
                    Proprietário: {selectedProperty.ownerEmail || "N/A"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {(selectedProperty.images || []).map((img, index) => (
                        <div key={index} className="relative aspect-square">
                            <Image src={img} alt={`Imagem ${index+1}`} layout="fill" className="rounded-md object-cover" />
                        </div>
                     ))}
                 </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Painel de Administração</CardTitle>
              <CardDescription>
                Gerencie imóveis, usuários e configurações do site.
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/dashboard/upgrade')}>
              <Zap className="mr-2 h-4 w-4" />
              Aumentar Limite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           {realtimeError ? (
               <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erro de Configuração ou Sincronização</AlertTitle>
                    <AlertDescription>
                       {realtimeError}
                    </AlertDescription>
                </Alert>
            ) : <UserStats users={users} />}
            <Tabs defaultValue="properties" className="mt-6">
                <TabsList>
                    <TabsTrigger value="properties">Imóveis ({properties.length})</TabsTrigger>
                    <TabsTrigger value="users" disabled={!!realtimeError}>Usuários ({users.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="properties">
                    <div className="flex flex-col sm:flex-row items-center gap-4 my-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Pesquisar por ID ou título..." 
                                className="pl-10" 
                                value={propertySearchTerm}
                                onChange={(e) => setPropertySearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                     <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Título</TableHead>
                                    <TableHead className="hidden md:table-cell">Preço</TableHead>
                                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProperties.map(prop => (
                                     <TableRow key={prop.id}>
                                        <TableCell className="font-medium">{prop.title}</TableCell>
                                        <TableCell className="hidden md:table-cell">{isClient ? prop.price.toLocaleString() : prop.price} MT</TableCell>
                                        <TableCell className="hidden sm:table-cell">{prop.status}</TableCell>
                                        <TableCell className="flex justify-end items-center gap-2">
                                            <Button variant="outline" size="icon" onClick={() => setSelectedProperty(prop)}>
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">Ver Imagens</span>
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/properties/edit/${prop.id}`)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Editar</span>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" disabled={isPending}>
                                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                                                        <span className="sr-only">Excluir</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Essa ação não pode ser desfeita. Isso excluirá permanentemente o imóvel.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteProperty(prop.id)}>Continuar</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="users">
                    <div className="flex flex-col sm:flex-row items-center gap-4 my-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Pesquisar por nome ou email..." 
                                className="pl-10" 
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="border rounded-lg mt-4 overflow-hidden">
                      <TooltipProvider>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Limite</TableHead>
                                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map(u => (
                                    <TableRow key={u.uid}>
                                        <TableCell className="font-medium">{u.displayName || 'N/A'}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                         <TableCell>
                                            <Badge variant="secondary">{u.propertyLimit || 1}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant={u.disabled ? 'destructive' : 'outline'}>
                                                {u.disabled ? 'Desativado' : 'Ativo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon" disabled={isPending} onClick={() => handleOpenLimitModal(u)}>
                                                        <KeyRound className="h-4 w-4" />
                                                        <span className="sr-only">Alterar Limite</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Alterar Limite de Imóveis</p>
                                                </TooltipContent>
                                            </Tooltip>
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon" disabled={isPending || u.uid === user?.uid} onClick={() => handleToggleStatus(u.uid, u.disabled)}>
                                                        {isPending && u.uid === editingUser?.uid ? <Loader2 className="h-4 w-4 animate-spin"/> : u.disabled ? <UserCheck className="h-4 w-4 text-green-600" /> : <UserX className="h-4 w-4 text-orange-600" />}
                                                        <span className="sr-only">{u.disabled ? 'Ativar Usuário' : 'Desativar Usuário'}</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{u.disabled ? 'Ativar Usuário' : 'Desativar Usuário'}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon" disabled={isPending || u.uid === user?.uid}>
                                                      {isPending && u.uid === editingUser?.uid ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                                                        <span className="sr-only">Excluir</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação é irreversível e excluirá permanentemente o usuário <span className="font-bold">{u.displayName || u.email}</span>.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteUser(u.uid)}>Confirmar Exclusão</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                      </TooltipProvider>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <form onSubmit={handleUpdateLimit}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alterar Limite de Imóveis</DialogTitle>
                        <DialogDescription>
                            Altere o número máximo de imóveis que {editingUser.displayName || editingUser.email} pode publicar.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="limit-input">Novo Limite</Label>
                        <Input
                            id="limit-input"
                            type="number"
                            min="0"
                            value={newLimit}
                            onChange={(e) => setNewLimit(Number(e.target.value))}
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
      )}

    </div>
  );
}
