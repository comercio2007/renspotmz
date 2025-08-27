
"use client"
import Link from 'next/link'
import { MoreHorizontal, PlusCircle, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Image from 'next/image'
import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import { rtdb } from '@/lib/firebase'
import { ref, query, orderByChild, equalTo, onValue, remove, update } from "firebase/database";
import type { Property } from '@/lib/placeholder-data'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
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

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (user) {
            const propertiesRef = query(
                ref(rtdb, 'properties'),
                orderByChild('ownerId'),
                equalTo(user.uid)
            );

            const unsubscribe = onValue(propertiesRef, (snapshot) => {
                setLoading(true);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const userProps: Property[] = Object.values(data as Record<string, Property>).sort((a: any, b: any) => b.createdAt - a.createdAt);
                    setProperties(userProps);
                } else {
                    setProperties([]);
                }
                setLoading(false);
            });
            
            return () => unsubscribe();

        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const handleDeleteProperty = async (propertyId: string) => {
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
        }
    }

    const handleStatusChange = async (property: Property) => {
        let newStatus: Property['status'];
        if (property.listingType === 'Para Alugar') {
            newStatus = property.status === 'Para Alugar' ? 'Alugado' : 'Para Alugar';
        } else {
            newStatus = property.status === 'À Venda' ? 'Vendido' : 'À Venda';
        }

        try {
            await update(ref(rtdb, `properties/${property.id}`), { status: newStatus });
            toast({
                title: "Status Atualizado!",
                description: `O imóvel foi marcado como ${newStatus}.`
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível atualizar o status do imóvel.",
                variant: "destructive"
            })
        }
    }
    
    const getStatusChangeActionText = (property: Property): string => {
        if (property.listingType === 'Para Alugar') {
            return property.status === 'Para Alugar' ? 'Marcar como Alugado' : 'Marcar como Para Alugar';
        } else {
            return property.status === 'À Venda' ? 'Marcar como Vendido' : 'Marcar como À Venda';
        }
    };

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Bem-vindo de volta, {user?.displayName || 'Usuário'}!</h1>
            <p className="text-muted-foreground">Aqui está uma lista de seus imóveis para alugar e à venda.</p>
        </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seus Imóveis</CardTitle>
              <CardDescription>
                Gerencie seus anúncios e veja o status deles.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="gap-1">
              <Link href="/dashboard/properties/new">
                <PlusCircle className="h-4 w-4" />
                Adicionar Imóvel
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Imagem</span>
                </TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Preço</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 Array.from({length: 2}).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell className="hidden sm:table-cell">
                             <Skeleton className="h-16 w-16 rounded-md" />
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                    </TableRow>
                 ))
              ) : properties.length > 0 ? (
                properties.map((property) => (
                    <TableRow key={property.id}>
                    <TableCell className="hidden sm:table-cell">
                        <Image
                        alt="Imagem do imóvel"
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={(property.images && property.images[0]) ? property.images[0] : 'https://placehold.co/64x64.png'}
                        width="64"
                        data-ai-hint="house exterior"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>
                        <Badge variant={property.listingType === 'Para Venda' ? 'default' : 'secondary'}>
                          {property.listingType}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant={['Alugado', 'Vendido'].includes(property.status) ? 'destructive' : 'outline'}>
                        {property.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {isClient ? property.price.toLocaleString() : property.price} MT
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                            >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Alternar menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                             <DropdownMenuItem onSelect={() => router.push(`/dashboard/properties/edit/${property.id}`)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleStatusChange(property)}>
                                {getStatusChangeActionText(property)}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4"/>
                                        Excluir
                                    </DropdownMenuItem>
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
                                    <AlertDialogAction onClick={() => handleDeleteProperty(property.id)}>Continuar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Você ainda não publicou nenhum imóvel. <Link href="/dashboard/properties/new" className="text-primary underline">Adicione um agora!</Link>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
