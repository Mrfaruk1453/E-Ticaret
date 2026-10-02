"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // { success: boolean, message: string }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    setResult(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/payment/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId,
          cardNumber: cardNumber
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: true, message: data.message, txnId: data.txnId });
      } else {
        setResult({ success: false, message: data.message || data.error });
      }
    } catch (err: any) {
      setResult({ success: false, message: "Sunucuya ulaşılamadı." });
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) {
    return <div className="text-center py-20">Geçersiz sipariş numarası.</div>;
  }

  if (result?.success) {
    return (
      <div className="text-center py-10 space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold text-green-600">Ödeme Başarılı!</h2>
        <p className="text-muted-foreground">{result.message}</p>
        <div className="bg-muted p-4 rounded-md inline-block mt-4">
          <p className="text-sm font-mono">İşlem No (Referans): {result.txnId}</p>
        </div>
        <div className="pt-6">
          <Button onClick={() => router.push("/")}>Ana Sayfaya Dön</Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sanal POS (Deneme Ortamı - Sandbox)</CardTitle>
      </CardHeader>
      <CardContent>
        {result?.success === false && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6 flex items-start gap-3">
            <XCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Ödeme Başarısız</p>
              <p className="text-sm">{result.message}</p>
              <p className="text-xs mt-1 text-red-500 font-medium">Sipariş durumu: ÖDEME BAŞARISIZ oldu, stoklar düşülmedi.</p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 text-blue-800 p-4 rounded-md mb-6 text-sm">
          <strong>Hoca Notu Uygulaması:</strong><br/>
          - Başarılı senaryo için kart numarasını <strong>4242</strong> ile başlatın.<br/>
          - Başarısız senaryo için kart numarasını <strong>4000</strong> ile başlatın.<br/>
          Stoklar SADECE ödeme başarılıysa düşecektir (Durum makinesi kuralı).
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sipariş Numarası</label>
            <Input type="text" value={orderId} disabled className="bg-muted" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Kart Numarası (Test)</label>
            <Input 
              type="text" 
              required 
              value={cardNumber} 
              onChange={(e) => setCardNumber(e.target.value)} 
              placeholder="4242 4242 4242 4242"
              maxLength={19}
            />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? "İşleniyor..." : "Ödemeyi Tamamla"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PaymentPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <PaymentForm />
      </Suspense>
    </div>
  );
}
