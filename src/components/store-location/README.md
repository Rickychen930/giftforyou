# Store Location Components - Reusable & Luxury

Komponen-komponen reusable untuk Store Location Section yang efisien dan luxury.

## Components

### StoreLocationCard
Base card component untuk location, contact, dan hours cards.

**Props:**
- `icon: React.ReactNode` - Icon untuk card
- `title: string` - Title card
- `children: React.ReactNode` - Content card
- `variant?: "location" | "contact" | "hours"` - Variant untuk styling
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<StoreLocationCard
  icon={<LocationIcon />}
  title="Store Location"
  variant="location"
>
  {/* Content */}
</StoreLocationCard>
```

### StoreAddressCard
Card untuk menampilkan alamat toko dengan copy button dan directions link.

**Props:**
- `name: string` - Nama toko
- `address: string` - Alamat toko
- `city: string` - Kota
- `mapDirectionsUrl?: string` - URL untuk Google Maps directions

**Usage:**
```tsx
<StoreAddressCard
  name="Giftforyou.idn"
  address="Perum Mustika Blok C No. 9"
  city="Cirebon, Jawa Barat"
  mapDirectionsUrl="https://maps.google.com/..."
/>
```

### StoreContactCard
Card untuk menampilkan informasi kontak (phone, email, WhatsApp).

**Props:**
- `phone: string` - Nomor telepon
- `email: string` - Email
- `whatsappUrl?: string` - URL WhatsApp

**Usage:**
```tsx
<StoreContactCard
  phone="+62 851 6142 8911"
  email="giftforyou.idn01@gmail.com"
  whatsappUrl="https://wa.me/6285161428911"
/>
```

### StoreHoursCard
Card untuk menampilkan jam operasional.

**Props:**
- `hours: StoreHours` - Object dengan weekdays, saturday, sunday

**Usage:**
```tsx
<StoreHoursCard
  hours={{
    weekdays: "Mon–Fri: 9:00 AM – 6:00 PM",
    saturday: "Sat: 10:00 AM – 4:00 PM",
    sunday: "Sun: Closed"
  }}
/>
```

### StoreSocialLinks
Menampilkan social media links (Instagram, TikTok).

**Props:**
- `instagram?: string` - Instagram URL
- `tiktok?: string` - TikTok URL
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<StoreSocialLinks
  instagram="https://instagram.com/giftforyou.idn"
  tiktok="https://tiktok.com/@giftforyouidn"
/>
```

## Common Components Used

### CopyButton
Reusable button untuk copy to clipboard dengan visual feedback.

**Location:** `src/components/common/CopyButton.tsx`

**Props:**
- `text: string` - Text yang akan di-copy
- `label?: string` - Label button (default: "Salin")
- `copiedLabel?: string` - Label saat sudah di-copy (default: "Tersalin")
- `onCopy?: () => void` - Callback setelah copy
- `size?: "sm" | "md" | "lg"` - Ukuran button

**Usage:**
```tsx
<CopyButton
  text="Alamat lengkap"
  label="Salin alamat"
  copiedLabel="Tersalin"
  size="sm"
/>
```

## Main StoreLocationSection Component

Section utama yang menggunakan semua komponen di atas:

```tsx
import StoreLocationSection from "../components/sections/store-location-section";

<StoreLocationSection data={storeData} />
```

## Features

- ✅ Fully reusable components
- ✅ Luxury design dengan gradients, shadows, dan animations
- ✅ Responsive design untuk semua breakpoints
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Menggunakan komponen yang sudah ada (UIIcons, SocialIcons, CopyButton)
- ✅ TypeScript type-safe
- ✅ Performance optimized

