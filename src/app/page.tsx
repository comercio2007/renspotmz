
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PropertyCard } from "@/components/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Property } from "@/lib/placeholder-data";
import { Search, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { rtdb } from "@/lib/firebase";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const amenitiesList = [
  "Ar Condicionado", "Piscina", "Estacionamento", "Aceita Animais",
  "Totalmente Mobilado", "Varanda", "Jardim", "Segurança 24h"
];

const defaultFilters = {
  searchQuery: "",
  priceRange: [800, 100000] as [number, number],
  bedrooms: "any",
  bathrooms: "any",
  selectedAmenities: [] as string[],
};

const PROPERTIES_PER_PAGE = 6;
const PREVIEW_PROPERTIES_LIMIT = 4;

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingType, setListingType] = useState<'Para Alugar' | 'Para Venda'>('Para Alugar');
  
  // State for filter inputs
  const [searchQuery, setSearchQuery] = useState(defaultFilters.searchQuery);
  const [priceRange, setPriceRange] = useState(defaultFilters.priceRange);
  const [bedrooms, setBedrooms] = useState(defaultFilters.bedrooms);
  const [bathrooms, setBathrooms] = useState(defaultFilters.bathrooms);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(defaultFilters.selectedAmenities);
  
  // State for applied filters
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDisabled, setIsFilterDisabled] = useState(true);

  const priceConfig = useMemo(() => {
      if (listingType === 'Para Venda') {
          return { min: 500000, max: 20000000, step: 100000, defaultRange: [500000, 20000000] as [number, number] };
      }
      return { min: 800, max: 100000, step: 1000, defaultRange: [800, 100000] as [number, number] };
  }, [listingType]);

  useEffect(() => {
    // Reset filters when listing type changes
    handleResetFilters(false);
    setPriceRange(priceConfig.defaultRange);
    setAppliedFilters(prev => ({ ...prev, priceRange: priceConfig.defaultRange }));
  }, [listingType, priceConfig]);


  useEffect(() => {
    setIsClient(true);
    if (!authLoading) {
      setIsFilterDisabled(!user);
    }
  }, [user, authLoading]);
  
  useEffect(() => {
    setLoading(true);
    const propertiesRef = query(ref(rtdb, 'properties'), orderByChild('createdAt'));
    const unsubscribe = onValue(propertiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const propertyList: Property[] = (Object.values(data) as Property[]).reverse();
        setProperties(propertyList);
      } else {
        setProperties([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const handleAmenityChange = (amenity: string) => {
    if(isFilterDisabled) {
        router.push('/login');
        return;
    }
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };
  
  const currentFilters = useMemo(() => ({
    searchQuery,
    priceRange,
    bedrooms,
    bathrooms,
    selectedAmenities
  }), [searchQuery, priceRange, bedrooms, bathrooms, selectedAmenities]);

  const areFiltersChanged = useMemo(() => {
    return JSON.stringify(currentFilters) !== JSON.stringify(appliedFilters);
  }, [currentFilters, appliedFilters]);

  const areFiltersApplied = useMemo(() => {
    return JSON.stringify(appliedFilters) !== JSON.stringify({ ...defaultFilters, priceRange: priceConfig.defaultRange });
  }, [appliedFilters, defaultFilters, priceConfig.defaultRange]);

  const handleApplyFilters = () => {
      if(isFilterDisabled) {
        router.push('/login');
        return;
      }
      setCurrentPage(1);
      setAppliedFilters(currentFilters);
  }

  const handleResetFilters = (resetAll = true) => {
      if(isFilterDisabled && resetAll) {
        router.push('/login');
        return;
      }
      setCurrentPage(1);
      setSearchQuery(defaultFilters.searchQuery);
      setPriceRange(priceConfig.defaultRange);
      setBedrooms(defaultFilters.bedrooms);
      setBathrooms(defaultFilters.bathrooms);
      setSelectedAmenities(defaultFilters.selectedAmenities);
      setAppliedFilters({ ...defaultFilters, priceRange: priceConfig.defaultRange });
  }


  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      if (!property) return false;

      // Filter by listing type first
      if (property.listingType !== listingType) return false;

      // Ensure only available properties are shown
      const availableStatuses = ['Para Alugar', 'À Venda'];
      if (!availableStatuses.includes(property.status)) return false;

      const { priceRange, bedrooms, bathrooms, searchQuery, selectedAmenities } = appliedFilters;
      
      const maxPrice = priceConfig.max;
      const matchesPrice = property.price >= priceRange[0] && (priceRange[1] >= maxPrice ? true : property.price <= priceRange[1]);
      const matchesBedrooms = bedrooms === 'any' || (bedrooms === '4' ? property.bedrooms >= 4 : property.bedrooms === parseInt(bedrooms));
      const matchesBathrooms = bathrooms === 'any' || (bathrooms === '3' ? property.bathrooms >= 3 : property.bathrooms === parseInt(bathrooms));
      const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (property.bairro && property.bairro.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesAmenities = selectedAmenities.every(amenity => property.amenities?.includes(amenity));

      return matchesPrice && matchesBedrooms && matchesBathrooms && matchesSearch && matchesAmenities;
    });
  }, [properties, appliedFilters, listingType, priceConfig.max]);
  
  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);

  const displayedProperties = useMemo(() => {
    if (isFilterDisabled) {
      return filteredProperties.slice(0, PREVIEW_PROPERTIES_LIMIT);
    }
    const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
    const endIndex = startIndex + PROPERTIES_PER_PAGE;
    return filteredProperties.slice(startIndex, endIndex);
  }, [filteredProperties, currentPage, isFilterDisabled]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative py-20 md:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 font-headline text-primary-foreground-dark">
              Encontre o seu Imóvel Perfeito
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Descubra os melhores imóveis para alugar ou comprar na sua cidade. A sua próxima casa está a apenas um clique de distância.
            </p>
            <div className="max-w-4xl mx-auto bg-background p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Pesquise por localização, bairro ou título..." 
                  className="pl-10 h-12 text-base" 
                  value={searchQuery}
                  onChange={(e) => {
                      if(isFilterDisabled) {
                          router.push('/login');
                          return;
                      }
                      setSearchQuery(e.target.value);
                  }}
                  onFocus={(e) => {
                    if(isFilterDisabled) {
                      router.push('/login');
                    }
                  }}
                />
              </div>
              <Button size="lg" className="w-full md:w-auto h-12" onClick={handleApplyFilters}>
                <Search className="mr-2 h-5 w-5" />
                Pesquisar
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
             <Tabs value={listingType} onValueChange={(value) => setListingType(value as 'Para Alugar' | 'Para Venda')} className="w-full mb-8">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                    <TabsTrigger value="Para Alugar">Para Alugar</TabsTrigger>
                    <TabsTrigger value="Para Venda">Para Venda</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Filtros na lateral */}
              <aside className="md:col-span-1">
                <div className="p-6 rounded-lg shadow-lg bg-secondary/30 sticky top-24">
                  <h3 className="text-xl font-bold mb-4 flex items-center"><Filter className="mr-2 h-5 w-5"/> Filtros</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="price-range" className="font-semibold">Faixa de Preço (MT)</Label>
                       <Slider
                        id="price-range"
                        value={priceRange}
                        onValueChange={(value) => { 
                             if(isFilterDisabled) {
                                router.push('/login');
                                return
                             };
                            setPriceRange(value as [number, number]); 
                        }}
                        max={priceConfig.max}
                        min={priceConfig.min}
                        step={priceConfig.step}
                        className="mt-4"
                        disabled={isFilterDisabled}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{isClient ? priceRange[0].toLocaleString() : priceRange[0]} MT</span>
                        <span>{isClient ? (priceRange[1] >= priceConfig.max ? `${priceConfig.max.toLocaleString()}+ MT` : `${priceRange[1].toLocaleString()} MT`) : `${priceRange[1]}+ MT`}</span>
                      </div>
                    </div>

                     <div>
                      <Label className="font-semibold">Quartos</Label>
                       <Select 
                          value={bedrooms} 
                          onValueChange={(value) => {
                              if(isFilterDisabled) {
                                router.push('/login');
                                return;
                              }
                             setBedrooms(value); 
                           }}
                          disabled={isFilterDisabled}
                        >
                        <SelectTrigger className="w-full mt-2" onFocus={(e) => {if(isFilterDisabled) router.push('/login')}}>
                          <SelectValue placeholder="Qualquer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Qualquer</SelectItem>
                          <SelectItem value="1">1 Quarto</SelectItem>
                          <SelectItem value="2">2 Quartos</SelectItem>
                          <SelectItem value="3">3 Quartos</SelectItem>
                          <SelectItem value="4">4+ Quartos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="font-semibold">Banheiros</Label>
                       <Select 
                          value={bathrooms}
                          onValueChange={(value) => { 
                               if(isFilterDisabled) {
                                router.push('/login');
                                return;
                               }
                              setBathrooms(value); 
                          }}
                          disabled={isFilterDisabled}
                        >
                        <SelectTrigger className="w-full mt-2" onFocus={(e) => {if(isFilterDisabled) router.push('/login')}}>
                          <SelectValue placeholder="Qualquer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Qualquer</SelectItem>
                          <SelectItem value="1">1 Banheiro</SelectItem>
                          <SelectItem value="2">2 Banheiros</SelectItem>
                          <SelectItem value="3">3+ Banheiros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="font-semibold">Comodidades</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 mt-2">
                         {amenitiesList.slice(0, 6).map(amenity => (
                          <div key={amenity} className="flex items-center gap-2">
                            <Checkbox 
                              id={`filter-${amenity}`} 
                              checked={selectedAmenities.includes(amenity)}
                              onCheckedChange={() => handleAmenityChange(amenity)}
                              disabled={isFilterDisabled}
                            />
                            <Label htmlFor={`filter-${amenity}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {amenity}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t">
                       {areFiltersChanged && !isFilterDisabled && (
                         <Button onClick={handleApplyFilters}>
                            <Filter className="mr-2 h-4 w-4" />
                            Aplicar Filtros
                         </Button>
                       )}
                       {areFiltersApplied && !isFilterDisabled && (
                        <Button onClick={() => handleResetFilters(true)} variant="outline">
                            <X className="mr-2 h-4 w-4" />
                            Remover Filtros
                        </Button>
                       )}
                       {isFilterDisabled && <p className="text-xs text-muted-foreground text-center">Faça login para aplicar filtros.</p>}
                    </div>

                  </div>
                </div>
              </aside>

              {/* Lista de Imóveis */}
              <main className="md:col-span-3">
                 <h2 className="text-3xl font-bold mb-8">
                   {!areFiltersApplied ? `Imóveis ${listingType === 'Para Alugar' ? 'para Alugar' : 'à Venda'}` : 'Resultados da Pesquisa'}
                   <span className="text-lg font-normal text-muted-foreground ml-2">({filteredProperties.length} encontrados)</span>
                 </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                  {loading ? (
                    <>
                      {Array.from({ length: PROPERTIES_PER_PAGE }).map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                          <Skeleton className="h-[200px] w-full rounded-lg" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-3/5" />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : displayedProperties.length > 0 ? displayedProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  )) : (
                    <div className="col-span-full text-center py-16">
                      <p className="text-muted-foreground">Nenhum imóvel encontrado com os filtros selecionados.</p>
                      </div>
                  )}
                </div>
                {!loading && !isFilterDisabled && totalPages > 1 && (
                  <Pagination className="mt-12">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          aria-disabled={currentPage === 1}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink 
                              onClick={() => setCurrentPage(i + 1)}
                              isActive={currentPage === i + 1}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          aria-disabled={currentPage === totalPages}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
                 {isFilterDisabled && filteredProperties.length > PREVIEW_PROPERTIES_LIMIT && (
                    <div className="mt-12 text-center">
                        <p className="text-muted-foreground mb-4">Mostrando {PREVIEW_PROPERTIES_LIMIT} de {filteredProperties.length} imóveis.</p>
                        <Button asChild>
                            <Link href="/login">Faça login para ver todos</Link>
                        </Button>
                    </div>
                )}
              </main>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
