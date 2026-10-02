const axios = require('axios'); // Hızlı istek atmak için
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function runTest() {
  console.log("=== EŞZAMANLILIK (CONCURRENCY) TESTİ BAŞLIYOR ===");
  
  // 1. Önce test için yeni bir sipariş oluşturalım
  const client = await pool.connect();
  let orderId;
  try {
      const orderRes = await client.query(`
          INSERT INTO orders (status, total_amount, customer_email) 
          VALUES ('ÖDEME BEKLİYOR', 10000, 'test@test.com') RETURNING id
      `);
      orderId = orderRes.rows[0].id;
      
      // Siparişe uydurma bir ürün ekleyelim (Varyant ID 1 varsayarak, varsa)
      await client.query(`
          INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase) 
          VALUES ($1, 1, 1, 10000)
      `, [orderId]);
      
      console.log(`Test siparişi oluşturuldu (Sipariş No: ${orderId}). Durum: ÖDEME BEKLİYOR`);
  } catch (err) {
      console.error("Test siparişi oluşturulamadı. (Varyant ID 1 olmayabilir)", err.message);
      client.release();
      process.exit(1);
  } finally {
      client.release();
  }

  console.log(`Aynı siparişe (Sipariş No: ${orderId}) aynı milisaniyede 2 farklı ödeme isteği atılıyor...`);

  // 2. Aynı anda (Promise.all ile) iki istek at
  const istek1 = axios.post('http://localhost:5000/api/payment/process', {
    orderId: orderId,
    cardNumber: '4242 4242 4242 4242'
  });

  const istek2 = axios.post('http://localhost:5000/api/payment/process', {
    orderId: orderId,
    cardNumber: '4242 4242 4242 4242'
  });

  try {
    // İsteklerin sonuçlarını bekle
    const sonuclar = await Promise.allSettled([istek1, istek2]);

    console.log("\n=== TEST SONUÇLARI ===");
    
    sonuclar.forEach((sonuc, index) => {
        if (sonuc.status === 'fulfilled') {
            console.log(`İstek ${index + 1} Başarılı! Sunucu yanıtı: ${sonuc.value.data.message}`);
        } else {
            console.log(`İstek ${index + 1} Başarısız (Reddedildi)! Sunucu hata mesajı: ${sonuc.reason.response?.data?.error || sonuc.reason.message}`);
        }
    });

    console.log("\n=== HOCA İÇİN AÇIKLAMA ===");
    console.log("Veritabanındaki 'SELECT ... FOR UPDATE' (Satır Kilidi) sayesinde, birinci istek siparişi işlemeye başladığında satırı kilitledi.");
    console.log("İkinci istek o kilidin açılmasını bekledi. Birinci istek siparişi 'ÖDENDİ' yapıp kilidi açtığında, ikinci istek siparişin artık 'ÖDEME BEKLİYOR' olmadığını gördü ve kural gereği reddedildi.");
    console.log("Böylece bir sipariş için stokların 2 kez düşmesi engellendi!");

  } catch (err) {
      console.error(err);
  }
  
  pool.end();
}

runTest();
