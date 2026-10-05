const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Frontend'in API'ye istek atabilmesi için
app.use(express.json()); // JSON verilerini okuyabilmek için

const pool = require('./db');

// Test Rotası
app.get('/', (req, res) => {
    res.json({ message: 'E-Ticaret Backend Sunucusu Çalışıyor!' });
});

// Ürünleri Listeleme API'si (Arama ve Kategori Filtresi ile)
app.get('/api/products', async (req, res) => {
    try {
        const { search, category } = req.query;
        
        let query = `
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (search) {
            query += ` AND p.name ILIKE $${paramCount}`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (category) {
            query += ` AND c.slug = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        query += ` ORDER BY p.id ASC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Ürünler çekilirken hata:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Ürün Detayı ve Varyantları API'si

// Urun Detayi by SLUG (SEO icin)
app.get('/api/products/slug/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Urun bilgisini cek
        const productResult = await pool.query('SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = $1', [slug]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Urun bulunamadi' });
        }
        
        const product = productResult.rows[0];
        
        // Varyantlarini (renk, beden, stok) cek
        const variantsResult = await pool.query('SELECT * FROM variants WHERE product_id = $1', [product.id]);
        product.variants = variantsResult.rows;
        
        res.json(product);
    } catch (error) {
        console.error('Urun detayi cekilirken hata:', error);
        res.status(500).json({ error: 'Sunucu hatasi' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Ürün bilgisini çek
        const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }
        
        // Varyantlarını (renk, beden, stok) çek
        const variantsResult = await pool.query('SELECT * FROM variants WHERE product_id = $1', [id]);
        
        const product = productResult.rows[0];
        product.variants = variantsResult.rows;
        
        res.json(product);
    } catch (error) {
        console.error('Ürün detayı çekilirken hata:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Sipariş Oluşturma (Checkout) API'si - GÜVENLİK KRİTİK!
app.post('/api/orders/checkout', async (req, res) => {
    const client = await pool.connect();
    try {
        const { items, couponCode, email } = req.body; // items: [{variant_id, quantity}]
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Sepet boş' });
        }

        await client.query('BEGIN'); // Transaction başlat (Stok ve sipariş bütünlüğü için)

        let subtotal = 0;
        const orderItems = [];

        // 1. Fiyatları Veritabanından Doğrula ve Stoğu Kontrol Et
        for (const item of items) {
            const variantRes = await client.query(`
                SELECT v.id, v.stock_quantity, p.price, p.name 
                FROM variants v 
                JOIN products p ON v.product_id = p.id 
                WHERE v.id = $1
            `, [item.variant_id]);

            if (variantRes.rows.length === 0) {
                throw new Error('Geçersiz ürün');
            }

            const dbItem = variantRes.rows[0];

            if (dbItem.stock_quantity < item.quantity) {
                throw new Error(`Yetersiz stok: ${dbItem.name}`);
            }

            // Hocanın Kuralı: Fiyatı istemciden alma! Veritabanındaki fiyatı kullanıyoruz.
            const itemTotal = dbItem.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                variant_id: item.variant_id,
                quantity: item.quantity,
                price_at_purchase: dbItem.price // O anki geçerli fiyat
            });
        }

        let totalAmount = subtotal;

        // 2. Kupon Kontrolü
        if (couponCode) {
            const couponRes = await client.query(
                'SELECT * FROM coupons WHERE code = $1 AND expiry_date > NOW()', 
                [couponCode]
            );

            if (couponRes.rows.length > 0) {
                const coupon = couponRes.rows[0];
                if (subtotal >= coupon.min_cart_amount) {
                    if (coupon.discount_type === 'PERCENTAGE') {
                        const discount = Math.floor(subtotal * (coupon.discount_value / 100));
                        totalAmount -= discount;
                    } else if (coupon.discount_type === 'AMOUNT') {
                        totalAmount -= coupon.discount_value;
                    }
                }
            }
        }

        // Negatif tutarı engelle (Eğer kupon tutarı sepetten büyükse)
        if (totalAmount < 0) totalAmount = 0;

        // 3. Vergi ve Kargo (Frontend ile birebir aynı hesaplama - Kuruş cinsinden)
        const shipping = subtotal > 5000 ? 0 : 999; // 50 TL üstü bedava, yoksa 9.99 TL (999 kuruş)
        const tax = Math.floor(subtotal * 0.08); // %8 KDV
        
        // Son tutara vergi ve kargoyu ekle
        totalAmount = totalAmount + shipping + tax;

        // 4. Siparişi Oluştur (Durum: ÖDEME BEKLİYOR)
        const orderRes = await client.query(`
            INSERT INTO orders (status, total_amount, customer_email) 
            VALUES ('ÖDEME BEKLİYOR', $1, $2) RETURNING id
        `, [totalAmount, email || 'misafir@ornek.com']);

        const orderId = orderRes.rows[0].id;

        // 4. Sipariş Detaylarını (Kalemlerini) Ekle
        for (const oi of orderItems) {
            await client.query(`
                INSERT INTO order_items (order_id, variant_id, quantity, price_at_purchase) 
                VALUES ($1, $2, $3, $4)
            `, [orderId, oi.variant_id, oi.quantity, oi.price_at_purchase]);
        }

        // NOT: Stokları henüz DÜŞMÜYORUZ! Hoca notu: "Stok yalnız ödeme başarılı olduğunda düşmeli"
        
        await client.query('COMMIT'); // İşlemleri onayla
        
        res.json({ 
            success: true, 
            orderId: orderId, 
            totalAmount: totalAmount,
            message: 'Sipariş oluşturuldu, ödeme bekleniyor.' 
        });

    } catch (error) {
        await client.query('ROLLBACK'); // Hata varsa hiçbir şeyi kaydetme geri al
        console.error('Checkout hatası:', error.message);
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Ödeme Simülasyonu (Sandbox) ve Durum Makinesi
app.post('/api/payment/process', async (req, res) => {
    const client = await pool.connect();
    try {
        const { orderId, cardNumber } = req.body;
        
        await client.query('BEGIN'); // Transaction başlat

        // Siparişi kilitleyerek (FOR UPDATE) aynı anda iki ödeme gelmesini engelliyoruz
        const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
        if (orderRes.rows.length === 0) {
            throw new Error('Sipariş bulunamadı');
        }

        const order = orderRes.rows[0];

        // Durum geçişi sadece ÖDEME BEKLİYOR veya ÖDEME BAŞARISIZ durumlarındayken yapılabilir
        if (order.status !== 'ÖDEME BEKLİYOR' && order.status !== 'ÖDEME BAŞARISIZ') {
            throw new Error(`Mevcut durum (${order.status}) ödeme yapmaya uygun değil.`);
        }

        // Sağlayıcı Referansı (Sahte bir işlem ID'si oluşturuyoruz)
        const providerRef = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        // 4242 ile başlıyorsa BAŞARILI senaryosu
        if (cardNumber && cardNumber.startsWith('4242')) {
            // 1. Sipariş durumunu ÖDENDİ yap ve sağlayıcı referansını kaydet
            await client.query(`
                UPDATE orders 
                SET status = 'ÖDENDİ', provider_reference = $1 
                WHERE id = $2
            `, [providerRef, orderId]);

            // 2. STOKLARI DÜŞ (Sadece ödeme başarılı olduğunda düşülür)
            const itemsRes = await client.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
            
            for (const item of itemsRes.rows) {
                // Stoğu eksiye düşürmemek için kontrol
                const updateRes = await client.query(`
                    UPDATE variants 
                    SET stock_quantity = stock_quantity - $1 
                    WHERE id = $2 AND stock_quantity >= $1
                    RETURNING id
                `, [item.quantity, item.variant_id]);

                if (updateRes.rows.length === 0) {
                    throw new Error('Yetersiz stok! Bir başka müşteri son ürünü almış olabilir.'); // Concurrency kontrolü
                }
            }

            await client.query('COMMIT');
            return res.json({ success: true, message: 'Ödeme onaylandı. Stoklar düşüldü.', newStatus: 'ÖDENDİ', txnId: providerRef });

        } else {
            // BAŞARISIZ senaryosu
            await client.query(`
                UPDATE orders 
                SET status = 'ÖDEME BAŞARISIZ' 
                WHERE id = $1
            `, [orderId]);
            
            await client.query('COMMIT');
            return res.status(400).json({ success: false, message: 'Ödeme reddedildi. Lütfen kartınızı kontrol edin.', newStatus: 'ÖDEME BAŞARISIZ' });
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ödeme hatası:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// --- DURUM MAKİNESİ (STATE MACHINE) VE YÖNETİM EKRANI API'LERİ ---

// 1. Tüm siparişleri listeleme (Yönetim Ekranı için)
app.get('/api/admin/orders', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Siparişler çekilemedi' });
    }
});

// 2. Durum Makinesi Geçiş Kuralı (State Transition Logic)
const VALID_TRANSITIONS = {
    'ÖDEME BEKLİYOR': ['ÖDENDİ', 'ÖDEME BAŞARISIZ', 'İPTAL'],
    'ÖDEME BAŞARISIZ': ['İPTAL', 'ÖDEME BEKLİYOR'],
    'ÖDENDİ': ['HAZIRLANIYOR', 'İPTAL'],
    'HAZIRLANIYOR': ['KARGOLANDI'],
    'KARGOLANDI': ['TESLİM EDİLDİ'],
    'TESLİM EDİLDİ': ['İADE'],
    'İPTAL': [], // Bitiş durumu
    'İADE': []   // Bitiş durumu
};

// 3. Durum Değiştirme API'si (Sadece kurallara uyan geçişlere izin verilir)
app.post('/api/admin/orders/:id/status', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { newStatus } = req.body;

        await client.query('BEGIN'); // Transaction başlat

        // Siparişi kilitle
        const orderRes = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id]);
        if (orderRes.rows.length === 0) throw new Error('Sipariş bulunamadı');
        
        const currentStatus = orderRes.rows[0].status;

        // Kural Kontrolü: İzin verilen geçişler tablosunda var mı?
        const allowedNextStates = VALID_TRANSITIONS[currentStatus] || [];
        if (!allowedNextStates.includes(newStatus)) {
            throw new Error(`Kural İhlali: ${currentStatus} durumundan ${newStatus} durumuna geçilemez!`);
        }

        // Stok İade İşlemleri (Eğer İptal veya İade oluyorsa ve önceden ödenmişse)
        // Hoca notu: "İPTAL: stok geri eklenir (ödeme alındıysa)". "İADE: stok geri eklenir"
        if (newStatus === 'İPTAL' || newStatus === 'İADE') {
            // Sadece ödeme başarılı olduktan sonra stok düştüğümüz için, 
            // "ÖDENDİ" sonrası durumlarda iptal ediliyorsa stok geri verilir.
            const needsRestock = ['ÖDENDİ', 'HAZIRLANIYOR', 'KARGOLANDI', 'TESLİM EDİLDİ'].includes(currentStatus);
            
            if (needsRestock) {
                const itemsRes = await client.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [id]);
                for (const item of itemsRes.rows) {
                    await client.query(`
                        UPDATE variants 
                        SET stock_quantity = stock_quantity + $1 
                        WHERE id = $2
                    `, [item.quantity, item.variant_id]);
                }
            }
        }

        // Durumu Güncelle
        await client.query('UPDATE orders SET status = $1 WHERE id = $2', [newStatus, id]);

        // Hocanın Ekstra İsteği: "Sipariş özeti müşteriye e-postayla gitmeli" 
        // Gerçek e-posta yerine konsola basarak simüle ediyoruz.
        if (newStatus === 'KARGOLANDI' || newStatus === 'İPTAL') {
            console.log(`[E-POSTA SİMÜLASYONU] Müşteriye (${orderRes.rows[0].customer_email}) sipariş durumunun ${newStatus} olduğuna dair e-posta gönderildi.`);
        }

        await client.query('COMMIT');
        res.json({ success: true, message: `Durum başarıyla ${newStatus} olarak güncellendi.` });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Durum değiştirme hatası:', error.message);
        res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Sunucuyu Başlat
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
