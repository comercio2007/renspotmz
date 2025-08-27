
"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, XCircle, ImageIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { storage, rtdb } from "@/lib/firebase"
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { ref as dbRef, get, set, serverTimestamp, update } from "firebase/database"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Property } from "@/lib/placeholder-data"
import { useLoading } from "@/contexts/loading-context"
import { cn } from "@/lib/utils"

const amenitiesList = [
  "Ar Condicionado", "Piscina", "Estacionamento", "Aceita Animais",
  "Totalmente Mobilado", "Varanda", "Jardim", "Segurança 24h"
]

const MAX_IMAGES = 8;
const MIN_DESCRIPTION_LENGTH = 90;

type ImageUpload = {
  file?: File;
  previewUrl: string;
  uploadedUrl?: string;
  error?: string;
}

export default function EditPropertyPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { setIsLoading } = useLoading()
  
  const propertyId = params.id as string;

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [listingType, setListingType] = useState<'Para Alugar' | 'Para Venda'>('Para Alugar');
  const [location, setLocation] = useState("")
  const [bairro, setBairro] = useState("")
  const [price, setPrice] = useState("")
  const [bedrooms, setBedrooms] = useState("")
  const [bathrooms, setBathrooms] = useState("")
  const [area, setArea] = useState("")
  const [phone, setPhone] = useState("+258 ")
  const [status, setStatus] = useState<Property['status']>('Para Alugar');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!propertyId) return;

    const fetchPropertyData = async () => {
        setIsLoadingData(true);
        const propertyRef = dbRef(rtdb, `properties/${propertyId}`);
        const snapshot = await get(propertyRef);

        if (snapshot.exists()) {
            const data = snapshot.val() as Property;
            if (data.ownerId !== user?.uid && !isAdmin) {
                toast({ title: "Acesso Negado", description: "Você não tem permissão para editar este imóvel.", variant: "destructive" });
                router.push('/dashboard');
                return;
            }
            
            setTitle(data.title);
            setDescription(data.description);
            setListingType(data.listingType || 'Para Alugar');
            setLocation(data.location);
            setBairro(data.bairro || "");
            setPrice(data.price.toString());
            setBedrooms(data.bedrooms.toString());
            setBathrooms(data.bathrooms.toString());
            setArea(data.area.toString());
            setPhone(data.contactPhone);
            setStatus(data.status);
            setSelectedAmenities(data.amenities || []);
            
            const existingImages: ImageUpload[] = (data.images || []).map(url => ({
                previewUrl: url,
                uploadedUrl: url,
            }));
            setImageUploads(existingImages);

        } else {
            toast({ title: "Não Encontrado", description: "Imóvel não encontrado.", variant: "destructive" });
            router.push('/dashboard');
        }
        setIsLoadingData(false);
    }
    if (user) {
        fetchPropertyData();
    }
  }, [propertyId, user, isAdmin, router, toast]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Ensure the prefix is always there
    if (!value.startsWith('+258 ')) {
      value = '+258 ';
    }

    // Remove non-digit characters except for the prefix part
    let numericValue = value.substring(5).replace(/\D/g, '');

    // Limit the total number of digits to 9
    if (numericValue.length > 9) {
      numericValue = numericValue.substring(0, 9);
    }
    
    let formattedNumber = '+258 ';
    if (numericValue.length > 0) {
      formattedNumber += numericValue.substring(0, 2);
    }
    if (numericValue.length > 2) {
      formattedNumber += ' ' + numericValue.substring(2, 5);
    }
    if (numericValue.length > 5) {
      formattedNumber += ' ' + numericValue.substring(5, 9);
    }
    
    setPhone(formattedNumber);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      if (imageUploads.length + files.length > MAX_IMAGES) {
        toast({
          title: "Limite de Imagens Excedido",
          description: `Você pode carregar no máximo ${MAX_IMAGES} imagens.`,
          variant: "destructive",
        })
        return;
      }
      
      const newUploads: ImageUpload[] = files.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setImageUploads(prev => [...prev, ...newUploads]);
    }
  }
  
  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const removeImage = (index: number) => {
    const uploadToRemove = imageUploads[index];
    if (uploadToRemove && !uploadToRemove.uploadedUrl) {
      URL.revokeObjectURL(uploadToRemove.previewUrl);
    }
    setImageUploads(prev => prev.filter((_, i) => i !== index));
  }

  const uploadImagesToStorage = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const newFilesToUpload = imageUploads.filter(upload => upload.file);

    for (const upload of newFilesToUpload) {
      if (upload.file) {
        const fileStorageRef = storageRef(storage, `properties/${user?.uid}/${Date.now()}_${upload.file.name}`);
        
        try {
          const snapshot = await uploadBytesResumable(fileStorageRef, upload.file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          uploadedUrls.push(downloadURL);
        } catch (error) {
          console.error(`Falha ao carregar a imagem ${upload.file.name}:`, error);
          throw new Error(`Falha ao carregar a imagem ${upload.file.name}. Verifique sua conexão e as regras do Storage.`);
        }
      }
    }

    const existingUrls = imageUploads.filter(upload => upload.uploadedUrl).map(upload => upload.uploadedUrl!);
    return [...existingUrls, ...uploadedUrls];
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Não autenticado", description: "Por favor, faça login para editar.", variant: "destructive" });
        return;
    }

    if (imageUploads.length === 0) {
        toast({ title: "Imagens em falta", description: "Por favor, adicione pelo menos uma imagem.", variant: "destructive" });
        return;
    }
    
    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      toast({
          title: "Descrição muito curta",
          description: `A descrição do imóvel deve ter no mínimo ${MIN_DESCRIPTION_LENGTH} caracteres.`,
          variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
        const imageUrls = await uploadImagesToStorage();
        
        const propertyRef = dbRef(rtdb, `properties/${propertyId}`);

        const propertyData = {
            title,
            description,
            listingType,
            location,
            bairro,
            price: Number(price),
            bedrooms: Number(bedrooms),
            bathrooms: Number(bathrooms),
            area: Number(area),
            contactPhone: phone,
            amenities: selectedAmenities,
            images: imageUrls,
            status,
            updatedAt: serverTimestamp()
        };
        
        await update(propertyRef, propertyData);
        
        toast({ title: "Sucesso!", description: `Imóvel "${title}" atualizado com sucesso.` });
        router.push("/dashboard");

    } catch (error: any) {
        console.error("Error submitting form: ", error);
        const errorMessage = (error.code && error.message) ? `${error.message} (${error.code})` : error.message;
        toast({ title: "Erro ao Atualizar", description: `Não foi possível atualizar o imóvel. Detalhes: ${errorMessage}`, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
        setIsLoading(false);
    }
  }
  
  if (isLoadingData) {
      return (
          <div className="grid flex-1 items-start gap-4 md:gap-8 p-4">
              <Card>
                  <CardHeader>
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-40 w-full" />
                      <div className="flex justify-end">
                           <Skeleton className="h-10 w-24" />
                      </div>
                  </CardContent>
              </Card>
          </div>
      )
  }

  const statusOptions = listingType === 'Para Alugar'
    ? [{ value: 'Para Alugar', label: 'Para Alugar' }, { value: 'Alugado', label: 'Alugado' }]
    : [{ value: 'À Venda', label: 'À Venda' }, { value: 'Vendido', label: 'Vendido' }];

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Editar Imóvel</CardTitle>
          <CardDescription>
            Atualize os detalhes do seu imóvel abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-3">
              <Label htmlFor="title">Título do Imóvel</Label>
              <Input id="title" name="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full" placeholder="ex: Apartamento Moderno no Centro da Cidade" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="grid gap-3">
                    <Label htmlFor="listingType">Tipo de Anúncio</Label>
                    <Select value={listingType} onValueChange={(value: 'Para Alugar' | 'Para Venda') => {
                        setListingType(value);
                        setStatus(value === 'Para Alugar' ? 'Para Alugar' : 'À Venda');
                    }}>
                        <SelectTrigger id="listingType">
                            <SelectValue placeholder="Selecione o tipo de anúncio" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Para Alugar">Para Alugar</SelectItem>
                            <SelectItem value="Para Venda">Para Venda</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-3">
                    <Label htmlFor="price">{listingType === 'Para Alugar' ? 'Preço (MT / mês)' : 'Preço de Venda (MT)'}</Label>
                    <Input id="price" name="price" type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={listingType === 'Para Alugar' ? '25000' : '3500000'} required/>
                </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Forneça uma descrição detalhada do seu imóvel." className="min-h-32" required/>
               {description.length > 0 && description.length < MIN_DESCRIPTION_LENGTH && (
                <p className="text-sm text-destructive">
                  A descrição deve ter pelo menos {MIN_DESCRIPTION_LENGTH} caracteres para fornecer detalhes suficientes.
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="location">Localização (Cidade)</Label>
                <Input id="location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="ex: Maputo" required/>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" name="bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="ex: Polana" required/>
              </div>
               <div className="grid gap-3">
                <Label htmlFor="bedrooms">Quartos</Label>
                <Input id="bedrooms" name="bedrooms" type="number" min="1" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="2" required/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="grid gap-3">
                <Label htmlFor="bathrooms">Banheiros</Label>
                <Input id="bathrooms" name="bathrooms" type="number" min="1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="2" required/>
              </div>
              <div className="grid gap-3">
                  <Label htmlFor="area">Área (m²)</Label>
                  <Input id="area" name="area" type="number" min="1" value={area} onChange={(e) => setArea(e.target.value)} placeholder="120" required/>
              </div>
               <div className="grid gap-3">
                  <Label htmlFor="phone">Telefone para Contato</Label>
                  <Input id="phone" name="phone" type="tel" value={phone} onChange={handlePhoneChange} placeholder="+258 84 920 0525" required/>
              </div>
            </div>

             <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: Property['status']) => setStatus(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(option => (
                           <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="grid gap-3">
              <Label>Comodidades</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {amenitiesList.map(amenity => (
                  <div key={amenity} className="flex items-center gap-2">
                    <input type="checkbox" id={amenity} name={amenity} checked={selectedAmenities.includes(amenity)} onChange={() => handleAmenityChange(amenity)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <Label htmlFor={amenity} className="text-sm font-medium">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Label>Imagens do Imóvel ({imageUploads.length}/{MAX_IMAGES})</Label>
              {imageUploads.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                  {imageUploads.map((upload, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image src={upload.previewUrl} alt={`Preview ${index}`} layout="fill" className="rounded-md object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => removeImage(index)}
                          disabled={isSubmitting}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                   {imageUploads.length < MAX_IMAGES && (
                    <Label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        <span className="text-xs text-center text-muted-foreground mt-1">Adicionar mais</span>
                      </div>
                      <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} disabled={isSubmitting} />
                    </Label>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" asChild disabled={isSubmitting}><Link href="/dashboard">Cancelar</Link></Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Salvando...</> : "Salvar Alterações"}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
