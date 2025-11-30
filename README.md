# 🏠 Evim - Akıllı Ev Uygulaması

<p align="center">
  <img src="./assets/images/icon.png" width="120" alt="Evim Logo">
</p>

<p align="center">
  <strong>2025-2026 Premium Smart Home Experience</strong>
</p>

<p align="center">
  Ultra-modern, minimalist, Apple-level kalitesinde akıllı ev kontrol uygulaması.
</p>

---

## ✨ Özellikler

### 📱 Ekranlar
- **Splash Screen** - Animasyonlu gradient dalga ile hoşgeldin ekranı
- **Onboarding (3 ekran)** - Swipeable tanıtım akışı
- **Auth Screen** - Apple/Google/E-posta ile giriş
- **Home Screen** - Ana dashboard, oda seçici, TV kartı
- **Add TV Screen** - QR kod tarayıcı ile TV ekleme
- **TV Remote Screen** - Tam ekran kumanda, sürüklenebilir ses kontrolü
- **Rooms & Devices** - Grid/List görünümde cihaz yönetimi
- **Profile Screen** - Kullanıcı profili ve Evim Plus abonelik
- **AI Suggestion Modal** - Yapay zeka önerileri

### 🎨 Tasarım
- **Renk Paleti:**
  - Primary: `#0A84FF`
  - Accent: `#FF9F0A`
  - Light Background: `#F7F7FC`
  - Dark Background: `#0A0A0A`
  - Dark Cards: `#1C1C1E`

- **UI/UX:**
  - Soft corner radius (16-24px)
  - Negatif boşluk odaklı
  - SF Pro / Inter tipografi
  - Subtle gölgeler
  - Otomatik Dark Mode desteği

### 🔧 Teknik Özellikler
- **Framework:** React Native + Expo SDK 54
- **Navigasyon:** Expo Router v6
- **Animasyonlar:** React Native Reanimated 4
- **Gestures:** React Native Gesture Handler
- **Styling:** Custom design system with TypeScript
- **Icons:** @expo/vector-icons (Ionicons)

---

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Expo CLI
- iOS Simulator veya Android Emulator (veya fiziksel cihaz)

### Adımlar

```bash
# 1. Projeyi klonla veya dizine git
cd iot/iot

# 2. Bağımlılıkları yükle
npm install

# 3. Expo development server'ı başlat
npx expo start

# iOS için
npx expo start --ios

# Android için
npx expo start --android

# Web için
npx expo start --web
```

### 📱 Fiziksel Cihazda Test

1. **Expo Go** uygulamasını App Store veya Google Play'den indirin
2. Terminalde görünen QR kodu Expo Go ile tarayın
3. Uygulama otomatik olarak yüklenecektir

---

## 📁 Proje Yapısı

```
iot/
├── app/                          # Expo Router sayfaları
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # Entry redirect
│   ├── splash.tsx                # Splash screen
│   ├── auth.tsx                  # Authentication
│   ├── add-tv.tsx                # TV ekleme
│   ├── tv-remote.tsx             # TV kumanda
│   ├── rooms.tsx                 # Odalar & Cihazlar
│   ├── profile.tsx               # Profil
│   ├── onboarding/               # Onboarding flow
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   └── (tabs)/                   # Tab navigation
│       ├── _layout.tsx
│       └── index.tsx             # Home screen
│
├── components/                   # Reusable components
│   └── ui/
│       ├── index.ts              # Component exports
│       ├── Button.tsx            # Premium button
│       ├── Card.tsx              # Animated card
│       ├── TvCard.tsx            # TV device card
│       ├── RoomChip.tsx          # Room selector chip
│       ├── GradientWave.tsx      # Animated wave
│       └── AiModal.tsx           # AI suggestion modal
│
├── constants/
│   └── Colors.ts                 # Design system tokens
│
├── hooks/
│   ├── use-color-scheme.ts       # System theme hook
│   └── useTheme.ts               # Custom theme hook
│
├── animations/
│   └── index.ts                  # Animation utilities
│
├── assets/
│   └── images/                   # App icons & images
│
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

---

## 🎬 Screen Recording

Uygulama demosunu kaydetmek için:

```bash
# iOS Simulator'da kayıt
xcrun simctl io booted recordVideo demo.mp4

# veya Expo ile screenshot
npx expo start

# Ardından terminalde 's' tuşuna basarak screenshot alabilirsiniz
```

---

## 🎨 Componentler

### Button
```tsx
import { Button } from '@/components/ui';

<Button 
  title="Devam Et"
  onPress={() => {}}
  variant="primary" // primary | secondary | outline | ghost | gradient | apple | google
  size="large"      // small | medium | large
  icon={<Icon />}
  fullWidth
/>
```

### Card
```tsx
import { Card } from '@/components/ui';

<Card 
  onPress={() => {}}
  elevated
  padding="medium" // none | small | medium | large
  animated
  delay={100}
>
  <Text>Content</Text>
</Card>
```

### TvCard
```tsx
import { TvCard } from '@/components/ui';

<TvCard
  name="Samsung QLED 55"
  room="Salon"
  isOn={true}
  currentChannel="TRT 1"
  thumbnailUri="https://..."
  onPress={() => {}}
  onPowerPress={() => {}}
/>
```

### RoomChip
```tsx
import { RoomChip } from '@/components/ui';

<RoomChip
  name="Salon"
  icon="tv-outline"
  isSelected={true}
  onPress={() => {}}
  deviceCount={3}
/>
```

### AiModal
```tsx
import { AiModal } from '@/components/ui';

<AiModal
  visible={true}
  onClose={() => {}}
  title="Akşam Rutini"
  message="Haberleri açayım mı?"
  icon="bulb"
  primaryAction={{ label: 'Evet', onPress: () => {} }}
  secondaryAction={{ label: '5 dk sonra', onPress: () => {} }}
  tertiaryAction={{ label: 'Hatırlat', onPress: () => {} }}
/>
```

---

## 🌙 Dark Mode

Uygulama otomatik olarak sistem tema ayarına göre dark/light mode arasında geçiş yapar.

```tsx
import { useTheme } from '@/hooks/useTheme';

const { colors, isDark, shadows } = useTheme();

// colors.background, colors.text, colors.card, vb.
```

---

## 📦 Kullanılan Paketler

| Paket | Versiyon | Açıklama |
|-------|----------|----------|
| expo | ~54.0.25 | Expo SDK |
| expo-router | ~6.0.15 | File-based routing |
| react-native-reanimated | ~4.1.1 | 60fps animasyonlar |
| react-native-gesture-handler | ~2.28.0 | Touch gestures |
| expo-linear-gradient | latest | Gradient backgrounds |
| react-native-svg | latest | SVG support |
| expo-blur | latest | Blur effects |
| moti | latest | Animation components |

---

## 🔮 Gelecek Özellikler

- [ ] Gerçek TV bağlantısı (Samsung SmartThings, LG ThinQ)
- [ ] Sesli komut entegrasyonu
- [ ] HomeKit / Google Home entegrasyonu
- [ ] Enerji tüketimi raporları
- [ ] Aile paylaşımı
- [ ] Widget desteği (iOS/Android)
- [ ] Apple Watch companion app

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

<p align="center">
  Made with ❤️ in Turkey
</p>
