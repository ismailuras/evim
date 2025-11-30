# Evim - Akıllı Ev Uygulaması 🏠

**Gerçek TV Kontrolü - İnternet Gerekmez!**

Ultra premium akıllı ev uygulaması. Samsung, LG, Roku, Android TV ve Vestel TV'leri yerel ağda kontrol edin.

## 🚀 Özellikler

### 📺 Yerel TV Kontrolü (İnternet Gerekmez!)
- **Otomatik Keşif**: Aynı Wi-Fi'daki TV'leri otomatik bulur
- **Gerçek Komutlar**: Güç, ses, kanal, kaynak değiştirme
- **Streaming Uygulamaları**: Netflix, YouTube, Disney+, Spotify başlatma
- **Wake-on-LAN**: Kapalı TV'yi uyandırma
- **Çoklu Marka Desteği**: Samsung, LG, Roku, Android TV, Vestel

### ☁️ Bulut Senkronizasyon (Opsiyonel)
- Cihazları birden fazla telefonda senkronize edin
- Kullanıcı hesabı yönetimi
- Oda ve ev organizasyonu

### 🎨 Premium UI/UX
- Reanimated 4 ile 60fps animasyonlar
- Apple-level tasarım
- Dark/Light mode desteği
- SF Pro/Inter fontlar

## 📱 Desteklenen TV Markaları

| Marka | Protokol | Port | Özellikler |
|-------|----------|------|------------|
| Samsung | WebSocket | 8001/8002 | Tam kontrol + Uygulama başlatma |
| LG | WebOS WebSocket | 3000 | Tam kontrol + Toast bildirimi |
| Roku | HTTP ECP | 8060 | Tam kontrol |
| Android TV | HTTP/Cast | 8008/8443 | Temel kontrol |
| Vestel | WebSocket | 8001 | Temel kontrol |

## 🛠 Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. iOS için pod'ları yükle (macOS)
cd ios && pod install && cd ..

# 3. Uygulamayı başlat
npx expo start
```

## 📁 Proje Yapısı

```
src/
├── services/tv/           # TV Kontrol Servisleri
│   ├── types.ts          # Ortak tipler
│   ├── discover.ts       # TV keşif (SSDP/HTTP)
│   ├── wakeOnLan.ts      # Wake-on-LAN
│   ├── samsung.ts        # Samsung WebSocket kontrolü
│   ├── lg.ts             # LG WebOS kontrolü
│   ├── roku.ts           # Roku ECP kontrolü
│   ├── android.ts        # Android TV kontrolü
│   └── index.ts          # Unified export
├── hooks/                 # React Hooks
│   ├── useAuth.ts        # Kimlik doğrulama
│   ├── useDevices.ts     # Cihaz yönetimi
│   └── useTvControl.ts   # TV kontrol hook'u
├── lib/
│   └── api.ts            # Bulut API (axios)
└── providers/
    └── AppProviders.tsx  # Query + Toast providers

app/
├── (tabs)/
│   └── index.tsx         # Ana ekran
├── add-tv.tsx            # TV ekleme (yerel keşif)
├── tv-remote.tsx         # TV kumandası
├── rooms.tsx             # Odalar & cihazlar
└── profile.tsx           # Profil & ayarlar
```

## 🔧 Nasıl Çalışır?

### TV Keşfi
1. Uygulama yerel ağdaki IP'leri tarar (192.168.x.x)
2. Her IP'de bilinen TV portlarını kontrol eder
3. Yanıt veren cihazları markasına göre tanır
4. Kullanıcı TV'yi seçer ve kaydeder

### TV Kontrolü
```typescript
// Örnek kullanım
import { useTvControl } from '@/src/hooks/useTvControl';

const tvControl = useTvControl(selectedDevice);

// Güç kontrolü
await tvControl.power(true);  // Aç
await tvControl.power(false); // Kapat

// Ses kontrolü
await tvControl.setVolume(50);
await tvControl.mute();

// Kanal değiştir
await tvControl.setChannel(7);

// Uygulama başlat
await tvControl.launchApp('netflix');

// HDMI kaynağı
await tvControl.setInput('HDMI1');

// Wake-on-LAN
await tvControl.wake();
```

## 🌐 Bulut API (Opsiyonel)

Bulut senkronizasyonu için `.env` dosyası oluşturun:

```env
EXPO_PUBLIC_API_URL=https://api.evim.app/api
```

### API Endpoints

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/login` | POST | Giriş yap |
| `/register` | POST | Kayıt ol |
| `/user` | GET | Kullanıcı bilgisi |
| `/homes` | GET/POST | Evler |
| `/rooms` | GET/POST | Odalar |
| `/devices` | GET/POST | Cihazlar |
| `/devices/sync` | POST | Yerel cihazı senkronize et |

## 📝 Ekranlar

1. **Splash Screen** - Animasyonlu açılış
2. **Onboarding** - 3 sayfalık tanıtım
3. **Auth Screen** - Giriş/Kayıt
4. **Home Screen** - Ana dashboard
5. **Add TV Screen** - Yerel TV keşfi
6. **TV Remote Screen** - Tam kumanda
7. **Rooms Screen** - Oda/cihaz listesi
8. **Profile Screen** - Kullanıcı ayarları
9. **AI Modal** - Akıllı öneriler

## 🎯 Kullanım

1. **TV Ekle**: Ana sayfadan "TV Ekle" butonuna basın
2. **Otomatik Keşif**: Uygulama aynı Wi-Fi'daki TV'leri bulacak
3. **Seç ve Kaydet**: TV'nizi seçin, isim verin, kaydedin
4. **Kumanda**: Ana sayfadaki TV kartına tıklayarak kumandayı açın
5. **Kontrol**: Güç, ses, kanal, uygulamalar... hepsi çalışıyor!

## ⚡ Performans

- **60fps** animasyonlar (Reanimated 4)
- **Optimistic updates** - UI anında tepki verir
- **Yerel önbellek** - Offline çalışma desteği
- **Paralel tarama** - Hızlı TV keşfi

## 🔒 Gizlilik

- Tüm TV kontrolü **yerel ağda** yapılır
- Bulut API **opsiyoneldir**
- Veriler telefonunuzda kalır

## 📄 Lisans

MIT License

---

**Made with ❤️ in Turkey**

*Evim - Gerçek akıllı ev, gerçek kontrol!*
