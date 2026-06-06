# AL-RISALA Restoran Menü Yöneticisi

AL-RISALA restoranı için dijital menü, garson çağrı sistemi ve yönetici paneli içeren tam kapsamlı bir restoran yönetim uygulaması.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API sunucusunu çalıştır (port 8080, /api yolunda)
- `pnpm --filter @workspace/restoran-menu run dev` — Frontend'i çalıştır (port 24236, / yolunda)
- `pnpm run typecheck` — Tüm paketlerde tip kontrolü
- `pnpm run build` — Tüm paketleri derle

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + Framer Motion
- Backend: Express 5 (in-memory store, veritabanı yok)
- Kimlik doğrulama: PIN tabanlı (admin PIN + garson PIN)
- Dosya yükleme: Multer (resimler `artifacts/restoran-menu/public/images/` dizinine)
- QR kod: qrcode.react
- Dil: Türkçe yönetim arayüzü, İngilizce + Amharca müşteri arayüzü

## Where things live

- `artifacts/restoran-menu/src/pages/admin.tsx` — Admin paneli (menü, kategori, masa, ayarlar)
- `artifacts/restoran-menu/src/pages/menu.tsx` — Müşteri menü sayfası (QR kod ile erişim: `/masa/:tableId`)
- `artifacts/restoran-menu/src/pages/waiter.tsx` — Garson paneli (garson çağrıları, masa durumları)
- `artifacts/api-server/src/routes/store.ts` — In-memory veri deposu (menü, kategoriler, masalar, ayarlar)
- `artifacts/api-server/src/routes/` — Tüm API route'ları (menu, categories, tables, waiter-calls, bundle, settings, upload, auth)

## Architecture decisions

- **In-memory store**: Veritabanı yerine in-memory store kullanılıyor. Sunucu yeniden başlatıldığında veriler sıfırlanır.
- **PIN tabanlı auth**: Admin PIN (varsayılan: 1234) ve Garson PIN (varsayılan: 1234). `/api/auth/login` ile JWT benzeri token alınıyor.
- **Bundle endpoint**: `/api/bundle` ile menü, kategori ve restoran ayarları tek istekte alınıyor — müşteri sayfası için hız optimizasyonu.
- **Çoklu dil**: Menü öğeleri `{ en, am }` dil haritası formatında tutulmaktadır (İngilizce + Amharca).
- **Resim yükleme**: Resimler `artifacts/restoran-menu/public/images/` dizinine kaydedilir, `/images/filename.jpg` URL'i ile servis edilir.

## Product

- **Müşteri menüsü** (`/masa/:tableId`): QR kod ile masaya özel menü görüntüleme, garson çağırma
- **Garson paneli** (`/garson`): Gerçek zamanlı garson çağrılarını takip etme, masa durumlarını görme
- **Admin paneli** (`/admin`): Menü öğeleri, kategoriler, masalar ve QR kodlarını yönetme, PIN güvenliği

## User preferences

_Kullanıcı tercihleri buraya eklenecek._

## Gotchas

- Sunucu yeniden başlatılınca tüm in-memory veriler (masalar, garson çağrıları) sıfırlanır. Menü ve kategoriler `initial-data.ts` dosyasından tekrar yüklenir.
- Resim yükleme endpoint'i `artifacts/restoran-menu/public/images/` dizinine yazar. Frontend bu resimleri `/images/filename` URL'i ile bulur.
- Admin PIN değişikliği için önce mevcut PIN doğrulanır, bu yüzden default PIN olan 1234'ü kayıt etmek önemli.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
