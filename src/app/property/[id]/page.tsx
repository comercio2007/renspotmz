
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { adminDb } from "@/lib/firebase-server";
import { ref, get } from "firebase/database";
import type { Property } from "@/lib/placeholder-data";
import { PropertyView } from "@/components/property-view";
import type { Metadata } from "next";

type PropertyPageProps = {
  params: {
    id: string;
  };
};

async function getProperty(id: string): Promise<Property | null> {
  if (!id) return null;
  try {
    const propertyRef = ref(adminDb, `properties/${id}`);
    const snapshot = await get(propertyRef);
    if (snapshot.exists()) {
      return snapshot.val() as Property;
    }
    return null;
  } catch (error) {
    console.error("Error fetching property on server", error);
    return null;
  }
}

// Generate metadata dynamically
export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const property = await getProperty(params.id);

  if (!property) {
    return {
      title: "Imóvel Não Encontrado",
      description: "O imóvel que procura não existe ou foi removido.",
    };
  }

  const title = `${property.title} | RentSpot`;
  const description = property.description.substring(0, 155); // Truncate for SEO
  const imageUrl = property.images && property.images[0] ? property.images[0] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    }
  };
}


export default async function PropertyPage({ params }: PropertyPageProps) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  return (
    <>
      <Header />
      <PropertyView property={property} />
      <Footer />
    </>
  );
}
