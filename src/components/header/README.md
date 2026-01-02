# Header Components - Luxury & Elegant Design System

Komponen-komponen reusable untuk Header yang luxury, elegant, responsive, efisien, dan bebas bug.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Usage](#usage)
- [Design System](#design-system)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Accessibility](#accessibility)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Header system yang dibangun dengan prinsip:
- **Luxury & Elegant**: Premium color palette (gold accents, elegant neutrals), modern typography
- **Responsive**: Mobile-first approach dengan breakpoints yang optimal
- **Efficient & Reusable**: Modular components yang dapat digunakan di berbagai halaman
- **Design System**: CSS variables untuk konsistensi warna, spacing, dan tipografi
- **DRY & SOLID**: Tidak ada duplikasi kode, setiap komponen memiliki single responsibility

## 🏗️ Architecture

### MVC Pattern

```
src/
├── models/
│   └── header-model.ts          # Data models & initial state
├── view/
│   └── header.tsx               # Pure presentation component
├── controllers/
│   └── header-controller.tsx    # Business logic & state management
└── components/
    └── header/
        ├── HeaderBrand.tsx       # Logo & brand component
        ├── HeaderNavigation.tsx  # Navigation links component
        ├── HeaderSearch.tsx      # Search modal component
        ├── HeaderActions.tsx     # Action buttons component
        └── HeaderDropdown.tsx    # Collections dropdown component
```

### Component Hierarchy

```
Header (View)
├── HeaderBrand (Logo & Brand)
├── HeaderNavigation (Nav Links)
│   └── HeaderDropdown (Collections Menu)
├── HeaderActions (Search, Cart, Hamburger)
└── HeaderSearch (Search Modal)
```

## 🧩 Components

### HeaderBrand

Komponen untuk menampilkan logo dan brand text dengan luxury styling.

**Props:**
```typescript
interface HeaderBrandProps {
  logoSrc?: string;              // Path ke logo image (default: BRAND_INFO.logoPath)
  onNavigate?: () => void;      // Callback saat navigasi
}
```

**Features:**
- ✅ Automatic fallback jika logo gagal load
- ✅ Luxury hover effects dengan premium shadows
- ✅ Responsive sizing untuk semua breakpoints
- ✅ Accessibility: proper ARIA labels

**Usage:**
```tsx
<HeaderBrand 
  logoSrc="/images/logo.png" 
  onNavigate={() => closeMobile()} 
/>
```

---

### HeaderNavigation

Komponen untuk navigation links dengan dropdown support dan elegant animations.

**Props:**
```typescript
interface HeaderNavigationProps {
  navLinks: NavItem[];                          // Array of navigation items
  isMobile?: boolean;                           // Mobile mode flag
  collectionsOpen?: boolean;                     // Collections dropdown open state
  onCollectionsToggle?: () => void;             // Toggle collections dropdown
  onCollectionsOpen?: () => void;               // Open collections dropdown
  onCollectionsClose?: () => void;              // Close collections dropdown
  collectionsAnimate?: boolean;                 // Animation state
  collectionNames?: string[];                   // Collection names for dropdown
  typeNames?: string[];                         // Type names for dropdown
  onNavigate?: () => void;                     // Navigation callback
  collectionsItemRef?: React.RefObject<HTMLLIElement>; // Ref for collections item
}

interface NavItem {
  label: string;    // Link label
  path: string;     // Route path
  icon?: string;    // Optional icon
}
```

**Features:**
- ✅ Active state highlighting dengan elegant underline animation
- ✅ Hover effects dengan smooth transitions
- ✅ Dropdown menu untuk collections dengan elegant animations
- ✅ Mobile-responsive dengan hamburger menu integration
- ✅ Keyboard navigation support
- ✅ Focus management untuk accessibility

**Usage:**
```tsx
const navLinks: NavItem[] = [
  { label: "Beranda", path: "/" },
  { label: "Koleksi", path: "/collection" },
  { label: "Tentang", path: "/about" },
];

<HeaderNavigation
  navLinks={navLinks}
  isMobile={mobileOpen}
  collectionsOpen={collectionsOpen}
  onCollectionsToggle={handleToggle}
  onCollectionsOpen={handleOpen}
  onCollectionsClose={handleClose}
  collectionsAnimate={collectionsAnimate}
  collectionNames={collectionNames}
  typeNames={typeNames}
  onNavigate={handleNavigate}
  collectionsItemRef={collectionsItemRef}
/>
```

---

### HeaderSearch

Komponen search modal dengan suggestions dan focus trap untuk luxury UX.

**Props:**
```typescript
interface HeaderSearchProps {
  isOpen: boolean;                              // Modal open state
  onClose: (opts?: { returnFocus?: boolean }) => void; // Close callback
  searchButtonRef?: React.RefObject<HTMLButtonElement>; // Ref untuk search button
  collectionSuggestions?: string[];             // Search suggestions
}
```

**Features:**
- ✅ Focus trap untuk keyboard navigation
- ✅ Auto-focus pada input saat modal dibuka
- ✅ Search suggestions dengan popular searches
- ✅ Keyboard shortcuts (Escape untuk close)
- ✅ Elegant backdrop dengan glass morphism
- ✅ Smooth animations

**Usage:**
```tsx
<HeaderSearch
  isOpen={searchOpen}
  onClose={(opts) => handleCloseSearch(opts)}
  searchButtonRef={searchButtonRef}
  collectionSuggestions={collectionSuggestions}
/>
```

---

### HeaderActions

Komponen untuk action buttons (search, cart, hamburger) dengan luxury styling.

**Props:**
```typescript
interface HeaderActionsProps {
  onSearchToggle: () => void;                  // Toggle search
  searchOpen: boolean;                          // Search open state
  searchButtonRef?: React.RefObject<HTMLButtonElement>; // Search button ref
  hamburgerButtonRef?: React.RefObject<HTMLButtonElement>; // Hamburger button ref
  mobileOpen: boolean;                          // Mobile menu open state
  onMobileToggle: () => void;                   // Toggle mobile menu
}
```

**Features:**
- ✅ Cart badge dengan real-time count updates
- ✅ Hamburger menu animation (3-line to X)
- ✅ Luxury hover effects dengan premium shadows
- ✅ Responsive visibility (cart hanya untuk authenticated users)
- ✅ Accessibility: proper ARIA labels dan keyboard support

**Usage:**
```tsx
<HeaderActions
  onSearchToggle={handleToggleSearch}
  searchOpen={searchOpen}
  searchButtonRef={searchButtonRef}
  hamburgerButtonRef={hamburgerButtonRef}
  mobileOpen={mobileOpen}
  onMobileToggle={handleToggleMobile}
/>
```

---

### HeaderDropdown

Komponen dropdown untuk collections menu dengan elegant animations.

**Props:**
```typescript
interface HeaderDropdownProps {
  collectionNames?: string[];    // Collection names
  typeNames?: string[];          // Type names
  onNavigate?: () => void;       // Navigation callback
  onClose?: () => void;          // Close callback
}
```

**Features:**
- ✅ Elegant fade-in animation
- ✅ Glass morphism background
- ✅ Premium shadows dan borders
- ✅ Responsive layout
- ✅ Click outside to close

**Usage:**
```tsx
<HeaderDropdown
  collectionNames={collectionNames}
  typeNames={typeNames}
  onNavigate={handleNavigate}
  onClose={handleClose}
/>
```

## 🚀 Usage

### Basic Usage

```tsx
import HeaderControllerWrapper from "../controllers/header-controller";

const navLinks = [
  { label: "Beranda", path: "/" },
  { label: "Koleksi", path: "/collection" },
  { label: "Tentang", path: "/about" },
];

<HeaderControllerWrapper 
  navLinks={navLinks} 
  logoSrc="/images/logo.png" 
/>
```

### With Custom Navigation

```tsx
const customNavLinks: NavItem[] = [
  { label: "Home", path: "/", icon: "home" },
  { label: "Products", path: "/products" },
  { label: "Contact", path: "/contact" },
];

<HeaderControllerWrapper 
  navLinks={customNavLinks}
/>
```

## 🎨 Design System

### Color Palette

Header menggunakan design system variables untuk konsistensi:

**Brand Colors:**
- `--brand-rose-500`: Main brand color (#d48c9c)
- `--brand-rose-600`: Darker brand (#c07888)
- `--brand-sage-400`: Secondary accent (#a8d5ba)

**Luxury Colors:**
- `--luxury-gold-400`: Gold accent (#fbbf24)
- `--luxury-gold-500`: Gold main (#f59e0b)
- `--elegant-black`: Elegant black (#1a1a1a)
- `--elegant-charcoal`: Charcoal gray (#2d2d2d)

**Neutral Colors:**
- `--neutral-0`: Pure white (#ffffff)
- `--neutral-100`: Light cream (#f8f4f0)
- `--ink-900`: Dark text (#2f2f2f)
- `--ink-600`: Medium text (rgba(0, 0, 0, 0.60))

### Spacing System

Menggunakan 8px base unit:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px

### Typography

- **Font Family**: System fonts dengan fallback
- **Font Sizes**: `--font-size-xs` hingga `--font-size-5xl`
- **Font Weights**: `--font-weight-normal` hingga `--font-weight-black`
- **Letter Spacing**: `--letter-spacing-tight`, `--letter-spacing-normal`, `--letter-spacing-wider`

### Shadows

**Luxury Shadows:**
- `--shadow-luxury-sm`: Small luxury shadow
- `--shadow-luxury-md`: Medium luxury shadow
- `--shadow-luxury-lg`: Large luxury shadow
- `--shadow-luxury-xl`: Extra large luxury shadow
- `--shadow-luxury-gold`: Gold accent shadow

### Borders

- `--border-luxury`: 1.5px solid dengan opacity
- `--border-luxury-gold`: Gold accent border
- `--border-elegant`: Elegant subtle border

## 📱 Responsive Breakpoints

### Desktop (> 980px)
- Full navigation dengan dropdown menus
- All action buttons visible
- Horizontal layout dengan optimal spacing

### Tablet (640px - 980px)
- Hamburger menu untuk navigation
- Compact spacing
- Dropdown menus tetap accessible

### Mobile (< 640px)
- Hamburger menu required
- Compact layout dengan optimized spacing
- Touch-friendly button sizes (min 44x44px)
- Full-width mobile menu overlay

### Small Mobile (< 400px)
- Extra compact layout
- Reduced padding dan spacing
- Optimized font sizes

## ♿ Accessibility

### ARIA Labels
- Semua interactive elements memiliki proper ARIA labels
- Navigation memiliki `role="navigation"` dan `aria-label`
- Modals memiliki `role="dialog"` dan `aria-modal="true"`
- Buttons memiliki descriptive `aria-label`

### Keyboard Navigation
- **Tab**: Navigate through focusable elements
- **Enter/Space**: Activate buttons dan links
- **Escape**: Close modals dan dropdowns
- **Arrow Keys**: Navigate dropdown menus (future enhancement)

### Focus Management
- Focus trap dalam modals
- Return focus ke trigger button saat modal ditutup
- Visible focus indicators dengan `--focus-ring`

### Screen Reader Support
- Semantic HTML elements
- Proper heading hierarchy
- Descriptive alt text untuk images
- Hidden text untuk screen readers jika diperlukan

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open search modal |
| `Escape` | Close modals (search, mobile menu) |
| `Tab` | Navigate focusable elements |
| `Shift + Tab` | Navigate backwards |
| `Enter` | Activate button/link |
| `Space` | Activate button (when focused) |

## 🐛 Troubleshooting

### Common Issues

**1. Logo tidak muncul**
- Pastikan `logoSrc` path benar
- Check console untuk 404 errors
- Component akan hide image jika error (graceful degradation)

**2. Search modal tidak terbuka**
- Pastikan `isOpen` prop di-set ke `true`
- Check `onSearchToggle` handler
- Pastikan tidak ada z-index conflicts

**3. Mobile menu tidak responsive**
- Check breakpoints di CSS
- Pastikan hamburger button memiliki proper event handlers
- Check untuk CSS conflicts

**4. Dropdown tidak muncul**
- Pastikan `collectionsOpen` state di-set
- Check `onCollectionsOpen` handler
- Verify `collectionsItemRef` di-attach dengan benar

**5. Cart badge tidak update**
- Pastikan `cartUpdated` event di-dispatch saat cart berubah
- Check `getCartCount()` function
- Verify authentication state

### Debug Tips

1. **Check Console**: Look untuk errors atau warnings
2. **React DevTools**: Inspect component state dan props
3. **Network Tab**: Check untuk failed API requests
4. **CSS Inspector**: Verify styles di-apply dengan benar
5. **Accessibility Tree**: Check ARIA attributes

### Performance Optimization

- ✅ Lazy loading untuk images
- ✅ Debounced scroll handlers
- ✅ Memoized callbacks
- ✅ Efficient re-renders dengan proper state management
- ✅ CSS animations menggunakan `transform` dan `opacity` untuk GPU acceleration

## 📚 Additional Resources

- [Design System Documentation](../../styles/design-system.css)
- [Color Palette](../../styles/colors.css)
- [Component Architecture](../../README.md)

## 🤝 Contributing

Saat menambahkan fitur baru atau memperbaiki bug:

1. Pastikan mengikuti SOLID principles
2. Gunakan design system variables
3. Test di semua breakpoints
4. Verify accessibility
5. Update dokumentasi ini

---

**Last Updated**: 2024
**Version**: 2.0.0
**Maintainer**: Development Team
