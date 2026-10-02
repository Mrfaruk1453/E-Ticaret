import { Button } from "@/components/ui/button";
import { Shield, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";

export default function EmptyCart() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Sepetiniz boş
          </h1>
          <p className="text-muted-foreground text-lg">
            Görünüşe göre sepetinize henüz bir şey eklemediniz.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/">Alışverişe Devam Et</Link>
          </Button>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              50 TL üzeri kargo bedava
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Güvenli ödeme
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

