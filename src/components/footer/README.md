# Footer Components - Luxury & Elegant Design System

Komponen reusable untuk Footer yang luxury, elegant, responsive, efisien, dan bebas bug.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Usage](#usage)
- [Design System](#design-system)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Accessibility](#accessibility)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Footer yang dibangun dengan prinsip:
- **Luxury & Elegant**: Premium color palette dengan gradient backgrounds, glass morphism effects
- **Responsive**: Mobile-first approach dengan breakpoints yang optimal
- **Efficient & Reusable**: Modular components yang dapat digunakan di berbagai halaman
- **Design System**: CSS variables untuk konsistensi warna, spacing, dan tipografi
- **DRY & SOLID**: Tidak ada duplikasi kode, setiap komponen memiliki single responsibility
- **Bug-Free**: Semua bugs, overlapping, dan CSS conflicts telah diperbaiki

## 🏗️ Architecture

### Component Structure

```
Footer (Main View Component)
├── FooterBrand (Brand & Logo)
├── FooterLinks (Quick Links Navigation)
├── FooterContact (Contact Information)
├── FooterSocial (Social Media Links)
├── FooterNewsletter (Newsletter Subscription)
└── BackToTopButton (Scroll to Top)
```

### MVC Pattern

```
src/
├── view/
│   └── footer.tsx              # View - Pure presentation
├── components/
│   └── footer/
│       ├── FooterBrand.tsx     # Brand component
│       ├── FooterLinks.tsx     # Links component
│       ├── FooterContact.tsx   # Contact component
│       ├── FooterSocial.tsx    # Social component
│       ├── FooterNewsletter.tsx # Newsletter component
│       └── BackToTopButton.tsx # Back to top button
└── styles/
    ├── Footer.css              # Main footer styles
    └── footer/
        ├── FooterBrand.css
        ├── FooterLinks.css
        ├── FooterContact.css
        ├── FooterSocial.css
        ├── FooterNewsletter.css
        └── BackToTopButton.css
```

**MVC Separation:**
- **Model**: Data dari `constants/app-constants.ts` (BRAND_INFO, QUICK_LINKS, CONTACT_INFO, etc.)
- **View**: `src/view/footer.tsx` - Pure presentation, no business logic
- **Controller**: Logic di masing-masing component (FooterNewsletter untuk form handling)

## 🧩 Components

### Footer (Main View)

Main footer component yang mengatur layout dan struktur.

**Features:**
- ✅ 3-column grid layout (Brand, Links, Contact)
- ✅ Social & Newsletter bar
- ✅ Copyright section
- ✅ Back to Top button
- ✅ Luxury glass morphism background
- ✅ Responsive grid layout

**Usage:**
```tsx
import Footer from "../view/footer";

<Footer />
```

---

### FooterBrand

Brand section dengan logo dan description.

**Features:**
- ✅ Logo dengan luxury border dan shadow
- ✅ Brand name dengan Playfair Display font
- ✅ Tagline dan description
- ✅ Hover effects pada logo
- ✅ Responsive centering di mobile

**Usage:**
```tsx
import FooterBrand from "../components/footer/FooterBrand";

<FooterBrand />
```

---

### FooterLinks

Navigation links section.

**Props:**
```typescript
interface FooterLinksProps {
  links: FooterLink[];
  title?: string;
}
```

**Features:**
- ✅ Arrow indicator on hover
- ✅ Smooth transitions
- ✅ External/internal link support
- ✅ Focus states untuk accessibility

**Usage:**
```tsx
import FooterLinks from "../components/footer/FooterLinks";

<FooterLinks 
  links={quickLinks} 
  title="Tautan Cepat" 
/>
```

---

### FooterContact

Contact information section.

**Features:**
- ✅ Phone, email, dan business hours
- ✅ Icon support
- ✅ Hover effects
- ✅ Responsive layout

**Usage:**
```tsx
import FooterContact from "../components/footer/FooterContact";

<FooterContact />
```

---

### FooterSocial

Social media links section.

**Features:**
- ✅ Platform-specific hover colors
- ✅ Glass morphism buttons
- ✅ Luxury shadows
- ✅ Responsive layout

**Usage:**
```tsx
import FooterSocial from "../components/footer/FooterSocial";

<FooterSocial />
```

---

### FooterNewsletter

Newsletter subscription form.

**Features:**
- ✅ Email validation
- ✅ Success/error states
- ✅ Luxury glass morphism input
- ✅ Gradient button
- ✅ Auto-reset setelah 3 detik

**Usage:**
```tsx
import FooterNewsletter from "../components/footer/FooterNewsletter";

<FooterNewsletter />
```

---

### BackToTopButton

Scroll to top button.

**Features:**
- ✅ Fixed positioning
- ✅ Visibility on scroll
- ✅ Smooth scroll animation
- ✅ Luxury gradient background
- ✅ Responsive sizing

**Usage:**
```tsx
import BackToTopButton from "../components/footer/BackToTopButton";

<BackToTopButton />
```

## 🚀 Usage

### Basic Usage

```tsx
import Footer from "../view/footer";

function App() {
  return (
    <div>
      {/* Main content */}
      <Footer />
    </div>
  );
}
```

### Custom Footer Layout

```tsx
import FooterBrand from "../components/footer/FooterBrand";
import FooterLinks from "../components/footer/FooterLinks";

function CustomFooter() {
  return (
    <footer className="custom-footer">
      <FooterBrand />
      <FooterLinks links={customLinks} />
    </footer>
  );
}
```

## 🎨 Design System

### Color Palette

- **Luxury Gold**: `--luxury-gold-*` untuk accents
- **Brand Colors**: `--brand-rose-*`, `--brand-green-*`
- **Neutral**: `--neutral-0`, `--ink-*`
- **Gradients**: `--gradient-brand`, `--gradient-surface`

### Spacing

- Menggunakan `--space-*` variables (1 hingga 24)
- Responsive dengan `clamp()`

### Shadows

- **Luxury Shadows**: `--shadow-luxury-*` (sm, md, lg, xl)
- **Brand Shadows**: `--shadow-brand-*`

### Borders

- `--border-width-1-5`: 1.5px luxury border
- `--border-brand-subtle`: Subtle brand border
- `--gradient-divider`: Gradient divider line

### Transitions

- `--transition-elegant`: 400ms cubic-bezier untuk luxury feel
- `--transition-base`: Base transition

### Glass Morphism

- `--backdrop-glass-lg`: Large glass effect
- `--backdrop-blur-lg`: Large blur effect

## 📱 Responsive Breakpoints

### Desktop (> 1024px)
- 3-column grid layout
- Full spacing
- Large typography
- All features visible

### Tablet (768px - 1024px)
- Single column layout
- Medium spacing
- Medium typography
- Stacked layout

### Mobile (< 768px)
- Single column layout
- Compact spacing
- Smaller typography
- Centered alignment
- Touch-optimized

### Small Mobile (< 480px)
- Minimal spacing
- Extra small typography
- Compact buttons
- Full-width inputs

## ♿ Accessibility

### ARIA Attributes
- `aria-label` untuk semua sections
- `aria-live="polite"` untuk newsletter messages
- `role="status"` dan `role="alert"` untuk form feedback
- Semantic HTML (`<footer>`, `<nav>`, `<section>`)

### Keyboard Navigation
- **Tab**: Navigate focusable elements
- **Enter/Space**: Activate buttons
- **Escape**: Close modals (if any)

### Screen Reader Support
- Semantic HTML
- Descriptive labels
- Proper heading hierarchy
- Alt text untuk images

### Focus Management
- Visible focus indicators
- Proper focus order
- Focus trap untuk modals

## 🐛 Troubleshooting

### Common Issues

**1. Footer tidak responsive**
- Check breakpoints di CSS
- Verify `clamp()` functions
- Check grid layout properties

**2. Glass morphism tidak bekerja**
- Check browser support untuk `backdrop-filter`
- Verify fallback background
- Check z-index hierarchy

**3. Newsletter form tidak submit**
- Check email validation
- Verify form handler
- Check console untuk errors

**4. Back to Top button tidak muncul**
- Check scroll event listener
- Verify visibility logic
- Check z-index

**5. CSS conflicts**
- Verify design system variables
- Check untuk duplicate class names
- Verify import order

### Debug Tips

1. **Check Console**: Look untuk errors atau warnings
2. **React DevTools**: Inspect component state
3. **CSS Inspector**: Verify design system variables
4. **Responsive Mode**: Test di berbagai breakpoints
5. **Accessibility Tools**: Test dengan screen readers

## 📚 Additional Resources

- [Design System Documentation](../../styles/design-system.css)
- [Color Palette](../../styles/colors.css)
- [App Constants](../../constants/app-constants.ts)

---

**Last Updated**: 2024
**Version**: 2.0.0
**Maintainer**: Development Team
