
"use client"
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { BedDouble, Bath, Square, MapPin, DollarSign, CheckCircle, Phone, MessageCircle, Expand, X, Share2, Copy, Check } from "lucide-react";
import { rtdb } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import type { Property } from "@/lib/placeholder-data";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useLoading } from "@/contexts/loading-context";


export default function PropertyPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const pathname = usePathname();
  const { toast } = useToast();
  const { setIsLoading } = useLoading();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [fullscreenApi, setFullscreenApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [copied, setCopied] = useState(false)

  const propertyUrl = `https://rentspotmz.site${pathname}`;
  const shareText = `Olá, encontrei este imóvel interessante no RentSpot: "${property?.title}". Veja aqui:`;
  
  const encodedUrl = encodeURIComponent(propertyUrl);
  const encodedText = encodeURIComponent(shareText);

  const whatsappLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(propertyUrl).then(() => {
      setCopied(true)
      toast({
        title: "Link Copiado!",
        description: "O link do imóvel foi copiado para a sua área de transferência.",
      })
      setTimeout(() => setCopied(false), 2000)
    })
  }


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!mainApi || !fullscreenApi) return

    const syncCarousels = (api: CarouselApi) => {
      const otherApi = api === mainApi ? fullscreenApi : mainApi;
      if (otherApi && otherApi.selectedScrollSnap() !== api.selectedScrollSnap()) {
          otherApi.scrollTo(api.selectedScrollSnap(), true);
      }
      setCurrent(api.selectedScrollSnap())
    }

    mainApi.on("select", () => syncCarousels(mainApi))
    fullscreenApi.on("select", () => syncCarousels(fullscreenApi))

    return () => {
        mainApi.off("select", () => syncCarousels(mainApi))
        fullscreenApi.off("select", () => syncCarousels(fullscreenApi))
    }
  }, [mainApi, fullscreenApi])

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      setIsLoading(true); // Start global loader
      setLoading(true); // Start skeleton loader
      try {
        const propertyRef = ref(rtdb, `properties/${propertyId}`);
        const snapshot = await get(propertyRef);
        if (snapshot.exists()) {
          setProperty(snapshot.val() as Property);
        } else {
          setProperty(null);
        }
      } catch (error) {
        console.error("Error fetching property", error);
        setProperty(null);
      } finally {
        setLoading(false); // Stop skeleton loader
        setIsLoading(false); // Stop global loader
      }
    };

    fetchProperty();
  }, [propertyId, setIsLoading]);

  if (loading) {
    return (
       <>
        <Header />
        <div className="container mx-auto px-4 py-12">
           <Skeleton className="w-full max-w-4xl h-[500px] mx-auto mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                     <Skeleton className="h-12 w-3/4" />
                     <Skeleton className="h-8 w-1/4" />
                     <Skeleton className="h-96 w-full" />
                </div>
                 <div className="lg:col-span-1">
                     <Skeleton className="h-48 w-full" />
                 </div>
            </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!property) {
    notFound();
  }
  
  const whatsappContactMessage = encodeURIComponent(`Olá, tenho interesse no imóvel "${property.title}" que vi no RentSpot. Poderia me dar mais informações? Link do imóvel: ${propertyUrl}`);
  const whatsappContactLink = `https://wa.me/${property.contactPhone.replace(/\D/g, '')}?text=${whatsappContactMessage}`;

  const phoneLink = `tel:${property.contactPhone.replace(/\D/g, '')}`;
  const hasMultipleImages = property.images && property.images.length > 1;

  return (
    <>
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
           <Dialog>
             <Carousel 
                setApi={setMainApi}
                className="w-full max-w-4xl mx-auto mb-8 group" 
                opts={{ loop: true }}
              >
                <CarouselContent>
                  {property.images && property.images.length > 0 ? (
                    property.images.map((src, index) => (
                      <CarouselItem key={index}>
                        <Card className="overflow-hidden">
                          <CardContent className="relative flex aspect-[16/10] items-center justify-center p-0">
                            <Image
                              src={src}
                              alt={`${property.title} - Imagem ${index + 1}`}
                              width={1200}
                              height={750}
                              className="object-cover w-full h-full"
                              data-ai-hint="house interior"
                            />
                             <DialogTrigger asChild>
                                 <Button size="icon" variant="secondary" className="absolute bottom-4 right-4 h-10 w-10 opacity-80 group-hover:opacity-100 transition-opacity">
                                   <Expand className="h-5 w-5"/>
                                   <span className="sr-only">Ver em tela cheia</span>
                                 </Button>
                             </DialogTrigger>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    ))
                  ) : (
                     <CarouselItem>
                        <Card>
                          <CardContent className="flex aspect-[16/10] items-center justify-center p-0">
                             <Image
                              src={`https://placehold.co/1200x750.png`}
                              alt="Placeholder Image"
                              width={1200}
                              height={750}
                              className="rounded-lg object-cover w-full h-full"
                              data-ai-hint="house interior"
                            />
                          </CardContent>
                        </Card>
                      </CarouselItem>
                  )}
                </CarouselContent>
                {hasMultipleImages && (
                    <>
                        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </>
                )}
              </Carousel>
              <DialogContent className="max-w-screen max-h-screen w-full h-full p-0 bg-black/90 border-0 flex items-center justify-center">
                 <DialogTitle className="sr-only">Galeria de Imagens em Tela Cheia</DialogTitle>
                 <DialogDescription className="sr-only">Navegue pelas imagens do imóvel em modo de tela cheia. Use as setas para avançar ou retroceder.</DialogDescription>
                 <DialogClose className="absolute right-4 top-4 z-20 text-white bg-black/20 hover:bg-black/50 rounded-full p-2">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Fechar</span>
                </DialogClose>
                <Carousel
                  setApi={setFullscreenApi}
                  opts={{
                      loop: true,
                      startIndex: current
                  }}
                  className="w-full h-full group"
                >
                  <CarouselContent>
                    {property.images.map((src, index) => (
                        <CarouselItem key={`fullscreen-${index}`}>
                          <div className="flex items-center justify-center h-screen">
                            <Image
                                src={src}
                                alt={`${property.title} - Imagem ${index + 1}`}
                                width={1920}
                                height={1080}
                                className="object-contain w-auto h-auto max-w-full max-h-full"
                              />
                          </div>
                        </CarouselItem>
                    ))}
                  </CarouselContent>
                   {hasMultipleImages && (
                    <>
                        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/20 hover:bg-black/50" />
                        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white bg-black/20 hover:bg-black/50" />
                    </>
                )}
                </Carousel>
              </DialogContent>
            </Dialog>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex gap-2 items-center mb-2">
                        <Badge variant={['Alugado', 'Vendido'].includes(property.status) ? 'destructive' : 'outline'}>{property.status}</Badge>
                      </div>
                      <CardTitle className="text-3xl lg:text-4xl font-headline mb-2">{property.title}</CardTitle>
                      <div className="flex items-center text-muted-foreground mb-4">
                        <MapPin className="w-5 h-5 mr-2" />
                        <span>{property.location}{property.bairro && `, ${property.bairro}`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-primary font-bold text-3xl pt-2">
                    <DollarSign className="w-7 h-7 mr-1" />
                    <span>{isClient ? property.price.toLocaleString() : property.price} MT {property.listingType === 'Para Alugar' && '/ mês'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-8 text-lg border-t border-b py-4 my-4">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-6 h-6 text-primary" />
                      <span>{property.bedrooms} Quartos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="w-6 h-6 text-primary" />
                      <span>{property.bathrooms} Banheiros</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Square className="w-6 h-6 text-primary" />
                      <span>{property.area} m²</span>
                    </div>
                  </div>

                  <div className="prose max-w-none text-foreground/90">
                    <h3 className="font-headline text-2xl">Descrição</h3>
                    <p>{property.description}</p>
                  </div>

                  {property.amenities && property.amenities.length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-headline text-2xl mb-4">Comodidades</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {property.amenities.map(amenity => (
                          <div key={amenity} className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 text-accent" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Contactar o Proprietário</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <p className="text-muted-foreground">Interessado neste imóvel? Entre em contato com o proprietário.</p>
                  <Button size="lg" className="w-full" asChild>
                    <Link href={whatsappContactLink} target="_blank">
                      <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="w-full" asChild>
                    <Link href={phoneLink}>
                      <Phone className="mr-2 h-5 w-5" /> Ligar
                    </Link>
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" variant="secondary" className="w-full">
                        <Share2 className="mr-2 h-5 w-5" /> Partilhar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Partilhar este Imóvel</DialogTitle>
                        <DialogDescription>
                          Envie o link deste imóvel para um amigo ou partilhe nas suas redes sociais.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Input id="link" value={propertyUrl} readOnly />
                          <Button type="button" size="icon" onClick={handleCopyLink}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span className="sr-only">Copiar Link</span>
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" asChild>
                            <Link href={whatsappLink} target="_blank">
                              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                            </Link>
                          </Button>
                          <Button variant="outline" asChild>
                            <Link href={facebookLink} target="_blank">
                              <svg className="mr-2 h-4 w-4" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              Facebook
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
