export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Hakkımızda
          </h1>

          <p className="mt-3 text-muted-foreground">
            ModaSepeti hakkında daha fazla bilgi edinin.
          </p>
        </div>

        <div className="space-y-8">

          <section className="rounded-xl border border-border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold">
              ModaSepeti
            </h2>

            <p className="mt-4 leading-7 text-muted-foreground">
              ModaSepeti, kullanıcıların farklı kategorilerdeki
              giyim ve aksesuar ürünlerini kolayca inceleyebildiği,
              beden ve renk seçeneklerini belirleyerek alışveriş
              yapabildiği bir e-ticaret platformudur.
            </p>

            <p className="mt-4 leading-7 text-muted-foreground">
              Projemizde kullanıcı deneyimi, ürün stoklarının doğru
              yönetilmesi ve güvenli ödeme akışının sağlanması
              hedeflenmektedir.
            </p>
          </section>

          <section className="grid gap-6 sm:grid-cols-3">

            <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm">
              <h3 className="text-lg font-semibold">
                Kaliteli Ürünler
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Günlük kullanıma uygun ürün seçenekleri.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm">
              <h3 className="text-lg font-semibold">
                Güvenli Alışveriş
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Güvenli ve kontrollü ödeme süreci.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 text-center shadow-sm">
              <h3 className="text-lg font-semibold">
                Kolay Kullanım
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Basit ve anlaşılır alışveriş deneyimi.
              </p>
            </div>

          </section>

        </div>

      </div>
    </main>
  );
}