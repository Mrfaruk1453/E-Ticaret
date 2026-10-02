export const dynamic = 'force-dynamic';
import ProductList from "@/components/home/ProductList";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto">

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Ürünler
          </h1>

          <p className="mt-3 text-muted-foreground">
            ModaSepeti ürünlerini keşfedin.
          </p>
        </div>

        <div className="mt-8">
          <ProductList searchParams={searchParams} />
        </div>

      </div>
    </main>
  );
}
