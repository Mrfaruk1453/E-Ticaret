"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await res.json();
        localStorage.setItem("currentUser", JSON.stringify({ name: userInfo.name, email: userInfo.email, picture: userInfo.picture }));
        window.location.href = "/";
      } catch (err: any) {
        alert("Google bilgileri alınamadı: " + err.message);
      }
    },
    onError: () => alert("Google ile giriş yapılamadı."),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      // Başarılı giriş
      localStorage.setItem("currentUser", JSON.stringify({ name: user.name, email: user.email }));
      
      // Çerez uyarısı (Hocanın notu: Misafir sepeti giriş yapınca devralınır)
      // Bizde zaten cart localStorage'da tutulduğu için otomatik devralınmış oluyor.
      
      alert(`Hoş geldin, ${user.name}!`);
      
      // Header'ı güncellemek için sayfayı tamamen yenileyerek ana sayfaya yönlendiriyoruz
      window.location.href = "/";
    } else {
      setError("Hatalı e-posta veya şifre!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Giriş Yap</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şifre</label>
              <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button className="w-full" type="submit">
              Giriş Yap
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Hesabın yok mu? <Link href="/register" className="text-primary hover:underline">Kayıt Ol</Link>
            </div>
          <div className="flex items-center my-4">
              <div className="flex-grow border-t border-muted"></div>
              <span className="mx-2 text-muted-foreground text-sm">veya</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>
            
            <div className="flex justify-center mb-4">
              <Button type="button" variant="outline" onClick={() => { console.log("Google butonuna tıklandı!"); try { loginWithGoogle(); } catch(e) { alert("Buton hatası: " + e.message); } }} className="w-full flex items-center gap-2 justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" /> Google ile Giriş Yap</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}






