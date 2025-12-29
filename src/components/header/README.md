# Header Components - Reusable & Luxury

Komponen-komponen reusable untuk Header yang efisien, luxury, dan responsive.

## Components

### HeaderBrand
Komponen untuk menampilkan logo dan brand text.

**Props:**
- `logoSrc?: string` - Path ke logo image (default: BRAND_INFO.logoPath)
- `onNavigate?: () => void` - Callback saat navigasi

**Usage:**
```tsx
<HeaderBrand logoSrc="/images/logo.png" onNavigate={() => closeMobile()} />
```

### HeaderNavigation
Komponen untuk navigation links dengan dropdown support.

**Props:**
- `navLinks: NavItem[]` - Array of navigation items
- `isMobile?: boolean` - Mobile mode flag
- `collectionsOpen?: boolean` - Collections dropdown open state
- `onCollectionsToggle?: () => void` - Toggle collections dropdown
- `onCollectionsOpen?: () => void` - Open collections dropdown
- `onCollectionsClose?: () => void` - Close collections dropdown
- `collectionsAnimate?: boolean` - Animation state
- `collectionNames?: string[]` - Collection names for dropdown
- `typeNames?: string[]` - Type names for dropdown
- `onNavigate?: () => void` - Navigation callback
- `collectionsItemRef?: React.RefObject<HTMLLIElement>` - Ref for collections item

**Usage:**
```tsx
<HeaderNavigation
  navLinks={navLinks}
  isMobile={mobileOpen}
  collectionsOpen={collectionsOpen}
  onCollectionsToggle={handleToggle}
  collectionNames={collectionNames}
  typeNames={typeNames}
/>
```

### HeaderDropdown
Komponen dropdown untuk collections menu.

**Props:**
- `collectionNames?: string[]` - Collection names
- `typeNames?: string[]` - Type names
- `onNavigate?: () => void` - Navigation callback
- `onClose?: () => void` - Close callback

**Usage:**
```tsx
<HeaderDropdown
  collectionNames={collectionNames}
  typeNames={typeNames}
  onNavigate={handleNavigate}
  onClose={handleClose}
/>
```

### HeaderSearch
Komponen search modal dengan suggestions.

**Props:**
- `isOpen: boolean` - Modal open state
- `onClose: (opts?: { returnFocus?: boolean }) => void` - Close callback
- `searchButtonRef?: React.RefObject<HTMLButtonElement>` - Ref untuk search button
- `collectionSuggestions?: string[]` - Search suggestions

**Usage:**
```tsx
<HeaderSearch
  isOpen={searchOpen}
  onClose={closeSearch}
  searchButtonRef={searchButtonRef}
  collectionSuggestions={collectionSuggestions}
/>
```

### HeaderActions
Komponen untuk action buttons (search, cart, hamburger).

**Props:**
- `onSearchToggle: () => void` - Toggle search
- `searchOpen: boolean` - Search open state
- `searchButtonRef?: React.RefObject<HTMLButtonElement>` - Search button ref
- `hamburgerButtonRef?: React.RefObject<HTMLButtonElement>` - Hamburger button ref
- `mobileOpen: boolean` - Mobile menu open state
- `onMobileToggle: () => void` - Toggle mobile menu

**Usage:**
```tsx
<HeaderActions
  onSearchToggle={toggleSearch}
  searchOpen={searchOpen}
  mobileOpen={mobileOpen}
  onMobileToggle={onToggleMobile}
/>
```

## Main Header Component

Header utama yang menggunakan semua komponen di atas:

```tsx
import Header from "../view/header";

<Header navLinks={navLinks} logoSrc="/images/logo.png" />
```

## Features

- ✅ Fully reusable components
- ✅ Luxury design dengan gradients, shadows, dan animations
- ✅ Responsive design untuk semua breakpoints (desktop, tablet, mobile)
- ✅ Accessibility (ARIA labels, keyboard navigation, focus management)
- ✅ Menggunakan komponen yang sudah ada (UIIcons)
- ✅ TypeScript type-safe
- ✅ Performance optimized
- ✅ Mobile-first approach
- ✅ Smooth animations dan transitions
- ✅ Focus trap untuk modals
- ✅ Keyboard shortcuts (Ctrl/Cmd + K untuk search, Escape untuk close)

## Responsive Breakpoints

- **Desktop**: > 980px - Full navigation dengan dropdown
- **Tablet**: 640px - 980px - Hamburger menu dengan mobile navigation
- **Mobile**: < 640px - Compact layout dengan optimized spacing
- **Small Mobile**: < 400px - Extra compact layout

## Keyboard Shortcuts

- `Ctrl/Cmd + K` - Open search modal
- `Escape` - Close modals (search, mobile menu)
- `Tab` - Navigate focusable elements (with focus trap in modals)

## CSS Architecture

Setiap komponen memiliki CSS file sendiri:
- `HeaderBrand.css` - Brand styling
- `HeaderNavigation.css` - Navigation links styling
- `HeaderDropdown.css` - Dropdown menu styling
- `HeaderSearch.css` - Search modal styling
- `HeaderActions.css` - Action buttons styling
- `Header.css` - Main header container styling

Semua CSS files menggunakan CSS variables dari `colors.css` untuk consistency.

