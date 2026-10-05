"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Product {
  id: number;
  image: string;
  name: string;
  price: number;
  category?: string; slug?: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);


  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <Card className="group overflow-hidden bg-card border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          name="Like Button"
          className={cn(
            "absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm hover:bg-background",
            isLiked && "opacity-100 text-destructive"
          )}
          onClick={handleToggleLike}
        >
          <Heart
            name="Like Icon"
            className={cn("h-4 w-4", isLiked && "fill-current")}
          />
        </Button>

        <Link href={`/urun/${product.slug || product.id}`} className="block relative">
          <div className="aspect-square overflow-hidden bg-muted">
            {!imageError ? (
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="text-muted-foreground text-sm">
                  Image not available
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Eye className="h-4 w-4 mr-2" />
              Quick View
            </Button>
          </div>
        </Link>
      </div>

      <CardContent className="p-4 space-y-3">
        <Link href={`/urun/${product.slug || product.id}`}>
          <h2 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h2>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
            {product.price.toFixed(2)} TL
          </span>
        </div>

        <Link href={`/urun/${product.slug || product.id}`} className="w-full block">
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Seçenekleri İncele
            </div>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}


