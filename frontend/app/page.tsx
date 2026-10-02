import ProductList from "@/components/home/ProductList";

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:py-12 lg:px-8 lg:py-16">

      <div className="mx-auto mb-18 max-w-4xl space-y-4 text-center">

        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          ModaSepeti
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-primary sm:text-5xl lg:text-6xl">
          Tarzını Keşfet
        </h1>

        <p className="mx-auto max-w-3xl text-base text-foreground sm:text-lg">
          Günlük hayatınıza uygun giyim ve aksesuar ürünlerini
          keşfedin. Beden ve renk seçenekleriyle alışverişin
          keyfini çıkarın.
        </p>

      </div>

      <ProductList searchParams={searchParams} />

    </div>
  );
}