const pool = require('./db');

async function runSeed() {
  const client = await pool.connect();
  
  try {
    console.log("Veritabanı tabloları oluşturuluyor...");
    
    // Tabloları sil (varsa temiz kurulum)
    await client.query(`
      DROP TABLE IF EXISTS order_items CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS coupons CASCADE;
      DROP TABLE IF EXISTS variants CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS categories CASCADE;
    `);

    // Tabloları oluştur
    await client.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL
      );

      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES categories(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL, -- Hocanın notu: Kuruş cinsinden tutulmalı
        image_url VARCHAR(255)
      );

      CREATE TABLE variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        sku VARCHAR(50) UNIQUE NOT NULL,
        size VARCHAR(20),
        color VARCHAR(50),
        stock_quantity INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        discount_type VARCHAR(20) NOT NULL, -- 'PERCENTAGE' veya 'AMOUNT'
        discount_value INTEGER NOT NULL,
        min_cart_amount INTEGER,
        expiry_date TIMESTAMP
      );

      -- Durum makinesi için (SEPET, ODEME_BEKLIYOR, ODENDI vs.)
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        status VARCHAR(50) NOT NULL DEFAULT 'SEPET',
        total_amount INTEGER NOT NULL, -- Kuruş
        customer_email VARCHAR(255),
        provider_reference VARCHAR(100) UNIQUE, -- Ödeme sağlayıcı benzersiz ID'si
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        variant_id INTEGER REFERENCES variants(id),
        quantity INTEGER NOT NULL,
        price_at_purchase INTEGER NOT NULL
      );
    `);
    console.log("Tablolar oluşturuldu.");

    // Tohum (Seed) Verileri Ekleme
    console.log("Kategoriler ekleniyor...");
    const catRes = await client.query(`
      INSERT INTO categories (name, slug) VALUES 
      ('Giyim', 'giyim'), 
      ('Ayakkabı', 'ayakkabi'), 
      ('Aksesuar', 'aksesuar')
      RETURNING id;
    `);
    const categoryIds = catRes.rows.map(r => r.id);

    console.log("30 Adet ürün ekleniyor...");
    const products = [];
    const adjectives = ['Harika', 'Şık', 'Yeni', 'Klasik', 'Spor', 'Rahat', 'Trend'];
    const nouns = ['Tişört', 'Pantolon', 'Ceket', 'Kazak', 'Şapka', 'Gözlük', 'Çanta', 'Bot'];
    
    // Sadece çalışan Unsplash resimleri
    const nounImages = {
      'Tişört': [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&auto=format&fit=crop"
      ],
      'Pantolon': [
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1475178626620-a4d074967452?q=80&w=600&auto=format&fit=crop"
      ],
      'Ceket': [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1559551409-dadc959f76b8?q=80&w=600&auto=format&fit=crop"
      ],
      'Kazak': [
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop"
      ],
      'Şapka': [
        "https://images.unsplash.com/photo-1533827432537-70133748f5c8?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=600&auto=format&fit=crop"
      ],
      'Gözlük': [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1582142407894-ec85a1260a46?q=80&w=600&auto=format&fit=crop"
      ],
      'Çanta': [
        "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=600&auto=format&fit=crop"
      ],
      'Bot': [
        "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&auto=format&fit=crop"
      ]
    };

    const counters = {
      'Tişört': 0, 'Pantolon': 0, 'Ceket': 0, 'Kazak': 0,
      'Şapka': 0, 'Gözlük': 0, 'Çanta': 0, 'Bot': 0
    };

    for (let i = 1; i <= 30; i++) {
      const catId = categoryIds[i % 3];
      const noun = nouns[i % nouns.length];
      const name = adjectives[i % adjectives.length] + ' ' + noun + ' ' + i;
      const price = (Math.floor(Math.random() * 500) + 50) * 100; // 50 TL - 550 TL arası (kuruş)
      
      const imagesArr = nounImages[noun] || [];
      const idx = counters[noun]++;
      const imageUrl = imagesArr.length > 0 ? imagesArr[idx % imagesArr.length] : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop';
      
      const prodRes = await client.query(`
        INSERT INTO products (category_id, name, description, price, image_url) 
        VALUES ($1, $2, $3, $4, $5) RETURNING id;
      `, [catId, name, name + ' için harika bir açıklama.', price, imageUrl]);
      
      products.push(prodRes.rows[0].id);
    }

    console.log("Varyantlar (Stoklar) ekleniyor...");
    let skuCounter = 1000;
    
    // Hoca notu: "En az onunda varyant" -> Biz ilk 15 ürüne birden fazla varyant (Beden/Renk) ekleyelim
    for (let i = 0; i < 15; i++) {
      const prodId = products[i];
      const sizes = ['S', 'M', 'L'];
      const colors = ['Kırmızı', 'Mavi', 'Siyah'];
      
      for (let s of sizes) {
        for (let c of colors) {
          await client.query(`
            INSERT INTO variants (product_id, sku, size, color, stock_quantity)
            VALUES ($1, $2, $3, $4, $5)
          `, [prodId, 'SKU-' + (skuCounter++), s, c, Math.floor(Math.random() * 20) + 5]);
        }
      }
    }

    // Kalan 15 ürüne tek (standart) varyant ekleyelim
    for (let i = 15; i < 30; i++) {
      const prodId = products[i];
      await client.query(`
        INSERT INTO variants (product_id, sku, size, color, stock_quantity)
        VALUES ($1, $2, $3, $4, $5)
      `, [prodId, 'SKU-' + (skuCounter++), 'Standart', 'Standart', Math.floor(Math.random() * 50) + 10]);
    }

    console.log("Kuponlar ekleniyor...");
    await client.query(`
      INSERT INTO coupons (code, discount_type, discount_value, min_cart_amount, expiry_date)
      VALUES 
      ('INDIRIM10', 'PERCENTAGE', 10, 50000, '2027-12-31'), -- Yüzde 10 indirim
      ('YUZTL', 'AMOUNT', 10000, 300000, '2027-12-31'); -- 100 TL indirim (10000 kuruş)
    `);

    console.log("Veritabanı kurulumu ve veri ekleme BAŞARIYLA TAMAMLANDI! ✅");
  } catch (err) {
    console.error("Hata oluştu:", err);
  } finally {
    client.release();
    pool.end();
  }
}

runSeed();
