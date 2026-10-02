"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basit bir veritabanı simülasyonu (Tarayıcı hafızası)
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    const userExists = existingUsers.find((u: any) => u.email === email);
    if (userExists) {
      alert("Bu e-posta adresi zaten kayıtlı!");
      return;
    }

    const newUser = { name, email, password };
    existingUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(existingUsers));
    
    alert("Kayıt başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.");
    router.push("/login");
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Kayıt Ol</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad</label>
              <Input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ad Soyad" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">E-posta</label>
              <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="ornek@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şifre</label>
              <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} />
            </div>
            <Button className="w-full" type="submit">
              Hesap Oluştur
            </Button>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Zaten hesabın var mı? <Link href="/login" className="text-primary hover:underline">Giriş Yap</Link>
            </div>
          <div className="flex items-center my-4">
              <div className="flex-grow border-t border-muted"></div>
              <span className="mx-2 text-muted-foreground text-sm">veya</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>
            
            <div className="flex justify-center mb-4">
              <GoogleLogin
                                onSuccess={(credentialResponse) => {
                  try {
                    const decoded = jwtDecode(credentialResponse.credential as string) as any;
                    localStorage.setItem("currentUser", JSON.stringify({ name: decoded.name, email: decoded.email, picture: decoded.picture }));
                    window.location.href = "/";
                  } catch (err: any) {
                    alert("Kayıt olunurken bir hata oluştu: " + err.message);
                  }
                }}
                onError={() => {
                  alert("Google ile kayıt olunamadı.");
                }}
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}





