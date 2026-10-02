"use client";

import {
  ArrowRight,
  Facebook,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

import Link from "next/link";
import { useState } from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (email.trim()) {
      console.log("Newsletter subscription:", email);
      setEmail("");
    }
  };

  const footerSections = [
    {
      title: "Mağaza",
      links: [
        {
          href: "/shop",
          label: "Tüm Ürünler",
        },
        {
          href: "/categories",
          label: "Kategoriler",
        },
        {
          href: "/shop?sort=newest",
          label: "Yeni Ürünler",
        },
        {
          href: "/shop?sort=price_asc",
          label: "Uygun Fiyatlı Ürünler",
        },
      ],
    },

    {
      title: "Müşteri Hizmetleri",
      links: [
        {
          href: "/contact",
          label: "İletişim",
        },
        {
          href: "/contact",
          label: "Yardım",
        },
        {
          href: "/contact",
          label: "Kargo Bilgileri",
        },
        {
          href: "/contact",
          label: "İade ve Değişim",
        },
      ],
    },

    {
      title: "ModaSepeti",
      links: [
        {
          href: "/about",
          label: "Hakkımızda",
        },
        {
          href: "/",
          label: "Ana Sayfa",
        },
        {
          href: "/shop",
          label: "Alışverişe Başla",
        },
      ],
    },

    {
      title: "Yasal",
      links: [
        {
          href: "/",
          label: "Gizlilik Politikası",
        },
        {
          href: "/",
          label: "Kullanım Koşulları",
        },
        {
          href: "/",
          label: "Çerez Politikası",
        },
      ],
    },
  ];

  const socialLinks = [
    {
      href: "#",
      icon: Facebook,
      label: "Facebook",
    },
    {
      href: "#",
      icon: Twitter,
      label: "Twitter",
    },
    {
      href: "#",
      icon: Instagram,
      label: "Instagram",
    },
  ];

  return (
    <footer className="border-t border-border bg-background">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* BÜLTEN */}
        <div className="border-b border-border py-12">

          <div className="mx-auto max-w-2xl text-center">

            <h3 className="mb-4 text-2xl font-bold text-foreground">
              Yeniliklerden Haberdar Olun
            </h3>

            <p className="mb-6 text-muted-foreground">
              Yeni ürünler, kampanyalar ve özel fırsatlardan
              haberdar olmak için e-posta listemize katılın.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="mx-auto flex max-w-md gap-2"
            >
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />

              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ArrowRight className="h-4 w-4" />

                <span className="sr-only">
                  Abone ol
                </span>
              </Button>
            </form>

          </div>

        </div>

        {/* FOOTER ANA ALAN */}
        <div className="py-12">

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">

            {/* MARKA */}
            <div className="lg:col-span-2">

              <Link
                className="text-2xl font-bold tracking-tight text-gray-900 hover:text-gray-700 transition-colors"
                href="/"
                aria-label="ModaSepeti Ana Sayfa"
              >
                MODA<span className="text-primary">SEPETİ</span>
              </Link>

              <p className="mb-6 mt-4 max-w-sm text-muted-foreground">
                Giyim ve aksesuar ürünlerini kolayca keşfedebileceğiniz,
                beden ve renk seçenekleriyle alışveriş yapabileceğiniz
                online alışveriş platformu.
              </p>

              {/* İLETİŞİM */}
              <div className="space-y-3">

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />

                  <span>
                    Osmaniye, Türkiye
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />

                  <span>
                    0551 351 4680
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />

                  <span>
                    info@modasepeti.com
                  </span>
                </div>

              </div>

              {/* SOSYAL MEDYA */}
              <div className="mt-6 flex gap-3">

                {socialLinks.map(
                  ({ href, icon: Icon, label }) => (
                    <Button
                      key={label}
                      variant="ghost"
                      size="icon"
                      asChild
                      className="h-10 w-10 rounded-full bg-muted transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Link
                        href={href}
                        aria-label={label}
                      >
                        <Icon className="h-4 w-4" />
                      </Link>
                    </Button>
                  )
                )}

              </div>

            </div>

            {/* FOOTER MENÜLERİ */}
            {footerSections.map(
              (section) => (
                <div key={section.title}>

                  <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                    {section.title}
                  </h4>

                  <ul className="space-y-3">

                    {section.links.map(
                      (link) => (
                        <li key={link.label}>

                          <Link
                            href={link.href}
                            className="inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </Link>

                        </li>
                      )
                    )}

                  </ul>

                </div>
              )
            )}

          </div>

        </div>

        <Separator className="my-8" />

        {/* ALT FOOTER */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 md:flex-row">

          <div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">

              <span>
                © 2026 ModaSepeti. Tüm hakları saklıdır.
              </span>

              <Heart className="h-4 w-4 fill-current text-red-500" />

            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Bilgisayar Programcılığı E-Ticaret Projesi
            </p>

          </div>

          <div className="flex items-center gap-6 text-sm">

            <Link
              href="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Gizlilik
            </Link>

            <Link
              href="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Koşullar
            </Link>

            <Link
              href="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Çerezler
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}