# Footer Components - Reusable & Luxury

Komponen-komponen reusable untuk Footer yang efisien dan luxury.

## Components

### FooterBrand
Menampilkan brand logo, nama, tagline, dan deskripsi.

**Usage:**
```tsx
<FooterBrand />
```

### FooterLinks
Menampilkan daftar link navigasi dengan animasi hover luxury.

**Props:**
- `links: FooterLink[]` - Array of links
- `title?: string` - Optional title

**FooterLink:**
- `label: string` - Text untuk link
- `href: string` - URL atau path
- `external?: boolean` - External link flag

**Usage:**
```tsx
<FooterLinks 
  links={[
    { label: "Beranda", href: "/" },
    { label: "Katalog", href: "/collection" }
  ]}
  title="Tautan Cepat"
/>
```

### FooterContact
Menampilkan informasi kontak (phone, email, business hours).

**Usage:**
```tsx
<FooterContact />
```

### FooterSocial
Menampilkan social media icons dengan hover effects luxury.

**Usage:**
```tsx
<FooterSocial />
```

### FooterNewsletter
Form newsletter subscription dengan validation dan status messages.

**Usage:**
```tsx
<FooterNewsletter />
```

### BackToTopButton
Button untuk scroll ke atas dengan smooth animation.

**Usage:**
```tsx
<BackToTopButton />
```

## Main Footer Component

Footer utama yang menggunakan semua komponen di atas:

```tsx
import Footer from "../view/footer";

<Footer />
```

## Features

- ✅ Fully reusable components
- ✅ Luxury design dengan gradients dan animations
- ✅ Responsive design untuk semua breakpoints
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Performance optimized (requestAnimationFrame untuk scroll)
- ✅ TypeScript type-safe
- ✅ Menggunakan komponen yang sudah ada (SocialIcons, UIIcons)

