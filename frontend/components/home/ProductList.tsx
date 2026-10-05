import ProductCard from "./ProductCard";

interface ProductListProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function ProductList({ searchParams }: ProductListProps = {}) {
  let products = [];
  try {
    const resolvedParams = await searchParams;
    const search = resolvedParams?.search ? `search=${resolvedParams.search}` : "";
    const category = resolvedParams?.category ? `category=${resolvedParams.category}` : "";
    
    const query = [search, category].filter(Boolean).join("&");
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const url = `${API_URL}/api/products${query ? `?${query}` : ""}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (res.ok) {
      const dbProducts = await res.json();
      // Veritabanından gelen veriyi ProductCard'ın beklediği formata dönüştür
      products = dbProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price / 100, // Kuruşu TL'ye çeviriyoruz
        image: p.image_url || "/placeholder.jpg",
        category: p.category_name, slug: p.slug
      }));
    }
  } catch (error) {
    console.error("Ürünler çekilemedi:", error);
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
      {products.length > 0 ? (
        products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Ürün bulunamadı
          </h3>
          <p className="text-muted-foreground mb-4">
            Lütfen backend sunucusunun (localhost:5000) çalıştığından emin olun.
          </p>
        </div>
      )}
    </div>
  );
}


