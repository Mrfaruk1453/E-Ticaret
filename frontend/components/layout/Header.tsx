"use client";

import { useCart } from "@/context/CartContext";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";

export default function Header() {
  const { cart } = useCart();

  const cartCount =
    cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const pathname = usePathname();

  const [currentUser, setCurrentUser] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    window.location.reload(); // Sayfayı yenile
  };

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const isActivePath = (path: string) => pathname === path;

  const navItems = [
    {
      href: "/",
      label: "Ana Sayfa",
    },
    {
      href: "/shop",
      label: "Ürünler",
    },
    {
      href: "/categories",
      label: "Kategoriler",
    },
    {
      href: "/about",
      label: "Hakkımızda",
    },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"
          : "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">

          {/* LOGO + MASAÜSTÜ MENÜ */}
          <div className="flex items-center space-x-8 lg:space-x-12">

            <Link
              className="text-2xl font-bold tracking-tight text-gray-900 hover:text-gray-700 transition-colors"
              href="/"
              aria-label="ModaSepeti Ana Sayfa"
            >
              MODA<span className="text-primary">SEPETİ</span>
            </Link>

            <nav
              className="hidden md:flex items-center space-x-1"
              role="navigation"
              aria-label="Ana menü"
            >
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(href)
                      ? "bg-orange-100 text-gray-900 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  aria-current={
                    isActivePath(href) ? "page" : undefined
                  }
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ARAMA */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form
              className="relative w-full"
              onSubmit={(e) => {
                e.preventDefault();

                if (searchQuery.trim()) {
                  window.location.href = `/shop?search=${encodeURIComponent(
                    searchQuery.trim()
                  )}`;
                }
              }}
            >
              <input
                type="search"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                aria-label="Ürün ara"
              />

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* SAĞ TARAF */}
          <div className="flex items-center space-x-2 sm:space-x-4">

            {/* MOBİL ARAMA */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Arama"
            >
              <Search className="h-5 w-5 text-gray-700" />
            </button>

            {/* MOBİL MENÜ */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Menüyü aç/kapat"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>

            {/* SEPET */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group"
              aria-label={`Sepette ${cartCount} ürün var`}
            >
              <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />

              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                  aria-label={`${cartCount} ürün sepette`}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* GİRİŞ / KAYIT / KULLANICI */}
            <div className="hidden sm:flex items-center space-x-2">
              {currentUser ? (
                <>
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    Merhaba, {currentUser.name}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    onClick={handleLogout}
                  >
                    Çıkış
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm"
                    >
                      Giriş Yap
                    </Button>
                  </Link>

                  <Link href="/register">
                    <Button
                      size="sm"
                      variant="default"
                      className="text-sm"
                    >
                      Kayıt Ol
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* MOBİL ARAMA ALANI */}
        {isSearchOpen && (
          <div className="lg:hidden mt-4 animate-in slide-in-from-top duration-200">
            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();

                if (searchQuery.trim()) {
                  window.location.href = `/shop?search=${encodeURIComponent(
                    searchQuery.trim()
                  )}`;
                }
              }}
            >
              <input
                type="search"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                aria-label="Ürün ara"
                autoFocus
              />

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>
        )}

        {/* MOBİL MENÜ */}
        {isMobileOpen && (
          <nav
            className="md:hidden mt-4 animate-in slide-in-from-top duration-200"
            role="navigation"
            aria-label="Mobil menü"
          >
            <div className="flex flex-col space-y-2 pb-4 border-b border-gray-200">

              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={`text-sm font-medium py-3 px-3 rounded-lg transition-all ${
                    isActivePath(href)
                      ? "bg-orange-100 text-gray-900"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  aria-current={
                    isActivePath(href) ? "page" : undefined
                  }
                >
                  {label}
                </Link>
              ))}

              <Link
                href="/contact"
                onClick={closeMobileMenu}
                className="text-sm font-medium py-3 px-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                İletişim
              </Link>

            </div>

            <div className="flex flex-col space-y-3 pt-4 sm:hidden">
              {currentUser ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg">
                    Merhaba, {currentUser.name}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                  >
                    Çıkış Yap
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full text-sm"
                    asChild
                  >
                    <Link href="/login" onClick={closeMobileMenu}>
                      Giriş Yap
                    </Link>
                  </Button>

                  <Button
                    className="w-full text-sm"
                    variant="default"
                    asChild
                  >
                    <Link href="/register" onClick={closeMobileMenu}>
                      Kayıt Ol
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}