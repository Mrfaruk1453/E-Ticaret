"use client";

import Features from "@/components/product/Features";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductNotFound from "@/components/product/ProductNotFound";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import {
  Check,
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Product() {
  const { addToCart } = useCart();
  const { productId } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Varyant seçim state'leri
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${API_URL}/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
           setProduct(data);
           // Varsayılan olarak ilk varyantı seç
           if (data.variants && data.variants.length > 0) {
             setSelectedSize(data.variants[0].size);
             setSelectedColor(data.variants[0].color);
           }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return <div className="container mx-auto p-20 text-center">Yükleniyor...</div>;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  // Seçili varyantı bul
  const currentVariant = product.variants?.find(
    (v: any) => v.size === selectedSize && v.color === selectedColor
  );
  const stock = currentVariant ? currentVariant.stock_quantity : 0;
  const isOutOfStock = stock === 0 || stock < quantity;

  // Benzersiz bedenleri ve renkleri bul (Seçim butonları için)
  const uniqueSizes = Array.from(new Set(product.variants?.map((v: any) => v.size) || []));
  const uniqueColors = Array.from(new Set(product.variants?.map((v: any) => v.color) || []));

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAdding(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Sepete eklerken varyant bilgisini de gönderiyoruz
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        variant_id: currentVariant?.id,
        name: `${product.name} (${selectedSize} - ${selectedColor})`,
        price: product.price / 100, // Kuruşu TL'ye çevir
        image: product.image_url || "/placeholder.jpg",
        quantity: 1,
      });
    }

    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart();
    setTimeout(() => router.push("/cart"), 500);
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment" && quantity < stock) {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductBreadcrumb />

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="w-full max-w-[500px] mx-auto flex flex-col items-center px-4">
            <div className="rounded-xl shadow-lg overflow-hidden mb-4 w-full bg-muted flex items-center justify-center aspect-square">
              {product.image_url ? (
                  <Image
                  src={product.image_url}
                  alt={product.name}
                  width={600}
                  height={600}
                  priority
                  className="rounded-xl object-cover w-full h-auto max-h-[500px]"
                />
              ) : (
                 <span className="text-muted-foreground">Resim Yok</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-foreground">
              {(product.price / 100).toFixed(2)} TL
            </span>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <Separator />

          {/* VARYANT SEÇİMLERİ (RENK VE BEDEN) */}
          <div className="space-y-4">
            {uniqueColors.length > 0 && uniqueColors[0] !== "Standart" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Renk Seçimi</label>
                <div className="flex gap-2">
                  {uniqueColors.map((color: any) => (
                    <Button 
                      key={color} 
                      variant={selectedColor === color ? "default" : "outline"}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {uniqueSizes.length > 0 && uniqueSizes[0] !== "Standart" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Beden Seçimi</label>
                <div className="flex gap-2">
                  {uniqueSizes.map((size: any) => (
                    <Button 
                      key={size} 
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STOK DURUMU GÖSTERGESİ */}
          <div className="mt-4">
            {stock > 0 ? (
               <span className="text-green-600 font-medium">Stokta {stock} adet var</span>
            ) : (
               <span className="text-red-600 font-bold text-lg">TÜKENDİ</span>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Miktar
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("decrement")}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="h-10 w-10 rounded-r-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange("increment")}
                    disabled={quantity >= stock || isOutOfStock}
                    className="h-10 w-10 rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className={cn(
                  "flex-1 transition-all duration-300",
                  justAdded
                    ? "bg-green-600 text-white hover:bg-green-600"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                  isOutOfStock && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
              >
                {isOutOfStock ? (
                  "Tükendi"
                ) : isAdding ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Ekleniyor...
                  </div>
                ) : justAdded ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Sepete Eklendi!
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Sepete Ekle
                  </div>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1"
              >
                Hemen Al
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Features />
    </div>
  );
}
