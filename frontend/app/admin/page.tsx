"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/admin/orders?t=${Date.now()}`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Siparişler çekilemedi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const changeStatus = async (orderId: number, newStatus: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus })
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert("HATA: " + data.error); // Durum makinesi kuralı ihlali burada patlar!
      } else {
        alert(data.message);
        fetchOrders(); // Sayfayı yenile
      }
    } catch (err) {
      alert("Bir hata oluştu");
    }
  };

  // İzin verilen durum geçişleri (Sadece arayüzde butonları göstermek için, asıl güvenlik arka uçtadır)
  const getNextActions = (status: string) => {
    switch (status) {
      case 'ÖDEME BEKLİYOR': return ['İPTAL'];
      case 'ÖDENDİ': return ['HAZIRLANIYOR', 'İPTAL'];
      case 'HAZIRLANIYOR': return ['KARGOLANDI'];
      case 'KARGOLANDI': return ['TESLİM EDİLDİ'];
      case 'TESLİM EDİLDİ': return ['İADE'];
      default: return [];
    }
  };

  if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Yönetim Ekranı (Durum Makinesi)</h1>

      <div className="grid gap-4">
        {orders.map(order => (
          <Card key={order.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                <span>Sipariş #{order.id} - {order.customer_email}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.status === 'ÖDENDİ' ? 'bg-green-100 text-green-800' :
                  order.status === 'İPTAL' || order.status === 'ÖDEME BAŞARISIZ' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mt-4">
                <p className="font-semibold">Tutar: {(order.total_amount / 100).toFixed(2)} TL</p>
                
                <div className="space-x-2">
                  {/* Hocanın kuralı gereği sadece izin verilen geçiş butonları gösterilir */}
                  {getNextActions(order.status).map(action => (
                    <Button 
                      key={action} 
                      size="sm" 
                      variant={action === 'İPTAL' || action === 'İADE' ? "destructive" : "default"}
                      onClick={() => changeStatus(order.id, action)}
                    >
                      {action} Yap
                    </Button>
                  ))}
                  
                  {/* Hata denemesi yapmak için Hile Butonu (Kasten hatalı geçiş yapmayı dener) */}
                  {order.status === 'ÖDENDİ' && (
                     <Button size="sm" variant="outline" onClick={() => changeStatus(order.id, 'TESLİM EDİLDİ')}>
                       Hile: Direkt Teslim Etmeyi Dene (Hata Verir)
                     </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

