import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kategoriler | ModaSepeti",
  description: "ModaSepeti giyim, ayakkabı ve aksesuar kategorilerini keşfedin.",
};

const categories = [
  {
    name: "Giyim",
    slug: "giyim",
    description: "Günlük ve şık giyim ürünleri.",
  },
  {
    name: "Ayakkabı",
    slug: "ayakkabi",
    description: "Her tarza uygun rahat ayakkabılar.",
  },
  {
    name: "Aksesuar",
    slug: "aksesuar",
    description: "Tarzınızı tamamlayacak aksesuarlar.",
  },
];

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Kategoriler
          </h1>
          <p className="mt-3 text-muted-foreground">
            İhtiyacınız olan ürünleri kategorilere göre keşfedin.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/kategori/${category.slug}`}
              className="group rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold text-foreground group-hover:text-primary">
                {category.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {category.description}
              </p>
              <span className="mt-5 inline-block text-sm font-medium text-primary">
                Ürünleri Gör →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}