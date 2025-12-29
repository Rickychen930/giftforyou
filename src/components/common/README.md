# Common Reusable Components

Komponen-komponen reusable yang dapat digunakan di seluruh aplikasi.

## Components

### ImageLightbox
Lightbox untuk menampilkan gambar dalam mode fullscreen dengan animasi luxury.

**Props:**
- `isOpen: boolean` - Status lightbox
- `imageUrl: string` - URL gambar
- `imageAlt?: string` - Alt text untuk gambar
- `onClose: () => void` - Handler untuk menutup lightbox
- `showDownload?: boolean` - Tampilkan tombol download
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<ImageLightbox
  isOpen={showLightbox}
  imageUrl={imageUrl}
  imageAlt="Product image"
  onClose={() => setShowLightbox(false)}
  showDownload={true}
/>
```

### Breadcrumb
Komponen breadcrumb yang fleksibel dengan items array.

**Props:**
- `items: BreadcrumbItem[]` - Array of breadcrumb items
- `className?: string` - Additional CSS classes

**BreadcrumbItem:**
- `label: string` - Text untuk breadcrumb
- `path?: string` - Path untuk link (optional)
- `isCurrent?: boolean` - Mark sebagai current page

**Usage:**
```tsx
<Breadcrumb
  items={[
    { label: "Beranda", path: "/" },
    { label: "Katalog", path: "/collection" },
    { label: "Product Name", isCurrent: true }
  ]}
/>
```

### StatusBadge
Badge untuk menampilkan status dengan berbagai tipe dan ukuran.

**Props:**
- `type: "ready" | "preorder" | "featured" | "new" | "limited"` - Tipe badge
- `label?: string` - Custom label (optional)
- `count?: number` - Count untuk limited badge
- `className?: string` - Additional CSS classes
- `size?: "sm" | "md" | "lg"` - Ukuran badge

**Usage:**
```tsx
<StatusBadge type="ready" size="md" />
<StatusBadge type="limited" count={5} size="sm" />
```

### ProductImage
Komponen gambar produk dengan loading state, error handling, dan lightbox integration.

**Props:**
- `image?: string` - URL gambar
- `alt: string` - Alt text (required)
- `fallbackImage?: string` - Fallback image URL
- `className?: string` - Additional CSS classes
- `aspectRatio?: string` - Aspect ratio (default: "4 / 5")
- `showLightbox?: boolean` - Enable lightbox (default: true)
- `loading?: "lazy" | "eager"` - Loading strategy
- `onLoad?: () => void` - Load callback
- `onError?: () => void` - Error callback

**Usage:**
```tsx
<ProductImage
  image={bouquet.image}
  alt={bouquet.name}
  aspectRatio="4 / 5"
  showLightbox={true}
  loading="eager"
/>
```

## Utilities

### buildImageUrl
Utility function untuk membangun URL gambar lengkap.

**Location:** `src/utils/image-utils.ts`

**Usage:**
```tsx
import { buildImageUrl } from "../utils/image-utils";

const imageUrl = buildImageUrl(bouquet.image, "/images/fallback.jpg");
```

