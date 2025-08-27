
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { ref as dbRef, push, set, serverTimestamp, query, orderByChild, equalTo, get } from "firebase/database"
import { Progress } from "@/components/ui/progress"
import { useLoading } from "@/contexts/loading-context"
import type { Property } from "@/lib/placeholder-data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const amenitiesList = [
  "Ar Condicionado", "Piscina", "Estacionamento", "Aceita Animais",
  "Totalmente Mobilado", "Varanda", "Jardim", "Segurança 24h"
]

const MAX_IMAGES = 8;
const MIN_DESCRIPTION_LENGTH = 90;

type ImageUpload = {
  file: File;
  previewUrl: string;
}

export default function NewPropertyPage() {
  const { user, propertyLimit } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { setIsLoading } = useLoading();
  
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
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (uploadToRemove) {
      URL.revokeObjectURL(uploadToRemove.previewUrl);
    }
    setImageUploads(prev => prev.filter((_, i) => i !== index));
  }

  const uploadImagesToStorage = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    for (const upload of imageUploads) {
      const fileStorageRef = storageRef(storage, `properties/${user?.uid}/${Date.now()}_${upload.file.name}`);
      
      try {
        const snapshot = await uploadBytesResumable(fileStorageRef, upload.file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(downloadURL);
      } catch (error) {
        console.error(`Falha ao carregar a imagem ${upload.file.name}:`, error);
        // Throw a specific error to be caught by handleSubmit
        throw new Error(`Falha ao carregar a imagem ${upload.file.name}. Verifique sua conexão e as regras do Storage.`);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({ title: "Não autenticado", description: "Por favor, faça login para publicar.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
        // Check property count against limit
        const allPropertiesRef = dbRef(rtdb, 'properties');
        const snapshot = await get(allPropertiesRef);
        let propertyCount = 0;
        if (snapshot.exists()) {
            const allProperties = snapshot.val();
            propertyCount = Object.values(allProperties).filter(
                (prop: any) => prop.ownerId === user.uid
            ).length;
        }

        if (propertyCount >= propertyLimit) {
            toast({
                title: "Limite de Anúncios Atingido",
                description: "Você será redirecionado para aumentar seu limite.",
                variant: "destructive",
            });
            setTimeout(() => {
                router.push('/dashboard/upgrade');
            }, 2000);
            setIsSubmitting(false);
            setIsLoading(false);
            return;
        }

        if (imageUploads.length === 0) {
            throw new Error("Adicione pelo menos uma imagem.");
        }
        
        if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
            throw new Error(`A descrição deve ter pelo menos ${MIN_DESCRIPTION_LENGTH} caracteres.`);
        }
    
        const imageUrls = await uploadImagesToStorage();
        
        const propertiesRef = dbRef(rtdb, 'properties');
        const newPropertyRef = push(propertiesRef);

        const propertyData: Omit<Property, 'id' | 'status'> & { id: string | null; status: string; createdAt: object; ownerId: string; ownerName: string | null; ownerEmail: string | null; } = {
            id: newPropertyRef.key,
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
            status: listingType === 'Para Alugar' ? 'Para Alugar' : 'À Venda',
            ownerId: user.uid,
            ownerName: user.displayName,
            ownerEmail: user.email,
            createdAt: serverTimestamp()
        };
        
        await set(newPropertyRef, propertyData);
        
        toast({ title: "Sucesso!", description: `Imóvel "${title}" publicado com sucesso.` });
        router.push("/dashboard");

    } catch (error: any) {
        console.error("Error submitting form: ", error);
        const errorMessage = (error.code && error.message) ? `${error.message} (${error.code})` : error.message;
        toast({ title: "Erro ao Enviar", description: `Não foi possível publicar o imóvel. Detalhes: ${errorMessage}`, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
        setIsLoading(false);
    }
  }

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Anunciar um Novo Imóvel</CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para publicar o seu imóvel. Você pode publicar até {propertyLimit} {propertyLimit > 1 ? 'imóveis' : 'imóvel'}.
            Para aumentar o seu limite,{" "}
            <Link href="/dashboard/upgrade" className="text-primary underline">
                clique aqui.
            </Link>
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
                    <Select value={listingType} onValueChange={(value: 'Para Alugar' | 'Para Venda') => setListingType(value)}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
               <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="dropzone-file-main"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary/80"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para carregar</span> ou arraste e solte
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. {MAX_IMAGES} imagens)</p>
                  </div>
                  <Input id="dropzone-file-main" type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} disabled={isSubmitting} />
                </Label>
              </div>
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
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Publicando...</> : "Publicar Imóvel"}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
