import { Metadata } from "next";
import ProductList from "@/components/home/ProductList";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // slug: "erkek-giyim" -> "Erkek Giyim"
  const formattedTitle = (await params).slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return {
    title: `${formattedTitle} Ürünleri | ModaSepeti`,
    description: `ModaSepeti ${formattedTitle} kategorisindeki en trend ve şık ürünleri keşfedin.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const formattedTitle = (await params).slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            {formattedTitle}
          </h1>
          <p className="mt-3 text-muted-foreground">
            Bu kategorideki tüm ürünleri inceleyebilirsiniz.
          </p>
        </div>

        <div className="mt-8">
          <ProductList searchParams={{ category: (await params).slug }} />
        </div>
      </div>
    </main>
  );
}

