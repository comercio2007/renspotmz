import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/lib/placeholder-data";
import { BedDouble, Bath, MapPin, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

type PropertyCardProps = {
  property: Property;
};

export function PropertyCard({ property }: PropertyCardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
      <Card className="w-full overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <CardHeader className="p-0 relative">
          <Image
            src={(property.images && property.images.length > 0) ? property.images[0] : 'https://placehold.co/400x250.png'}
            alt={property.title}
            width={400}
            height={250}
            className="w-full h-48 object-cover"
            data-ai-hint="house exterior"
          />
           <Badge className="absolute top-2 left-2" variant={property.listingType === 'Para Venda' ? 'default' : 'secondary'}>
            {property.listingType}
          </Badge>
          <Badge className="absolute top-2 right-2" variant={'outline'}>
            {property.status}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <CardTitle className="text-lg mb-2 font-headline leading-tight h-14 line-clamp-2">
              {property.title}
            </CardTitle>
            <div className="text-muted-foreground text-sm flex items-center mb-4">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{property.location}{property.bairro && `, ${property.bairro}`}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm text-foreground">
            <div className="flex items-center gap-4">
                <div className="flex items-center">
                    <BedDouble className="w-4 h-4 mr-1 text-primary" />
                    <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1 text-primary" />
                    <span>{property.bathrooms}</span>
                </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-secondary/30 mt-auto">
            <div className="flex items-center text-primary font-bold text-lg">
                <DollarSign className="w-5 h-5 mr-1" />
                <span>{isClient ? property.price.toLocaleString() : property.price} MT {property.listingType === 'Para Alugar' && '/ mês'}</span>
            </div>
        </CardFooter>
      </Card>
  );
}
