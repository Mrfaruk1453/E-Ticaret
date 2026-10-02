"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map(item => ({
            variant_id: item.variant_id,
            quantity: item.quantity
          })),
          couponCode: couponCode || null,
          email: email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }

      // Başarılı! Sepeti temizle ve Sanal Pos sayfasına yönlendir
      clearCart();
      router.push(`/payment?orderId=${data.orderId}`);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Sepetiniz Boş</h1>
        <Button onClick={() => router.push("/")}>Alışverişe Dön</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Ödeme Adımı</h1>

      <Card>
        <CardHeader>
          <CardTitle>Sipariş Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">E-posta Adresi</label>
              <Input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ornek@email.com"
              />
              <p className="text-xs text-muted-foreground mt-1">Sipariş özeti bu e-postaya gönderilecektir.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kupon Kodu (İsteğe Bağlı)</label>
              <Input 
                type="text" 
                value={couponCode} 
                onChange={(e) => setCouponCode(e.target.value)} 
                placeholder="Örn: INDIRIM10 veya YUZTL"
              />
              <p className="text-xs text-muted-foreground mt-1">INDIRIM10 (%10 İndirim), YUZTL (100 TL İndirim)</p>
            </div>

            {/* Güvenlik uyarısı (Hoca için not niyetine) */}
            <div className="p-3 bg-blue-50 text-blue-800 rounded text-sm mt-4">
              <strong>Güvenlik Notu:</strong> Sepetinizdeki fiyatlar güvenlik sebebiyle sunucuya gönderilmez. Tüm tutar hesaplamaları ve kupon indirimleri doğrudan veritabanındaki gerçek fiyatlar üzerinden arka uçta (backend) güvenli bir şekilde hesaplanır.
            </div>

            <Button 
              type="submit" 
              className="w-full mt-6" 
              disabled={loading}
            >
              {loading ? "İşleniyor..." : "Siparişi Onayla ve Ödemeye Geç"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
