"use client";
import { GoogleOAuthProvider } from "@react-oauth/google";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="404045677030-58e13k2r19jmcrqmcb5e8rdc6f9s4i11.apps.googleusercontent.com" onScriptLoadError={() => alert("DİKKAT: Tarayıcın veya Reklam Engelleyicin (Adblock) Google altyapısını engelliyor! Lütfen kalkanları veya eklentiyi kapatıp sayfayı yenile.")}>
      {children}
    </GoogleOAuthProvider>
  );
}
