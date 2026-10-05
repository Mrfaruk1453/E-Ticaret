import { Metadata } from "next";
import { notFound } from "next/navigation";
import ClientProduct from "./ClientProduct";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/slug/${slug}`, {
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProduct((await params).slug);

  if (!product) {
    return {
      title: "Ürün Bulunamadı | ModaSepeti",
      description: "Aradığınız ürün bulunamadı."
    };
  }

  return {
    title: `${product.name} | ModaSepeti`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.name} | ModaSepeti`,
      description: product.description.substring(0, 160),
      images: [{ url: product.image_url }],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProduct((await params).slug);

  if (!product) {
    notFound();
  }

  // Generate JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image_url],
    description: product.description,
    sku: product.variants?.[0]?.sku || `PRD-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "ModaSepeti",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: (product.price / 100).toFixed(2),
      availability: product.variants?.some((v: any) => v.stock_quantity > 0) 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      url: `https://e-ticaret-red-mu.vercel.app/urun/${(await params).slug}`
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: "https://e-ticaret-red-mu.vercel.app"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mağaza",
        item: "https://e-ticaret-red-mu.vercel.app/shop"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://e-ticaret-red-mu.vercel.app/urun/${(await params).slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ClientProduct product={product} />
    </>
  );
}

