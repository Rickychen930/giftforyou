# Catalog Components - Reusable & Luxury

Komponen-komponen reusable untuk Bouquet Catalog Page yang efisien, luxury, clear, beautiful, dan responsive.

## Components

### CatalogHeader
Komponen untuk header catalog dengan title, subtitle, dan stats.

**Props:**
- `title?: string` - Title catalog (default: "Katalog Bouquet")
- `subtitle?: string` - Subtitle catalog
- `totalItems?: number` - Total jumlah bouquet
- `minPrice?: number` - Harga minimum
- `loading?: boolean` - Loading state

**Usage:**
```tsx
<CatalogHeader
  totalItems={50}
  minPrice={50000}
  loading={false}
/>
```

### CatalogSearch
Komponen search bar dengan clear button.

**Props:**
- `value?: string` - Search query value
- `placeholder?: string` - Placeholder text
- `onSearch?: (query: string) => void` - Callback saat search
- `onClear?: () => void` - Callback saat clear
- `disabled?: boolean` - Disabled state

**Usage:**
```tsx
<CatalogSearch
  value={searchQuery}
  onSearch={handleSearch}
  onClear={handleClear}
  disabled={loading}
/>
```

### CatalogFilters
Wrapper untuk FilterPanel dengan mobile dan desktop support.

**Props:**
- `priceRange: [number, number]` - Price range
- `selectedTypes: string[]` - Selected types
- `selectedSizes: string[]` - Selected sizes
- `selectedCollections: string[]` - Selected collections
- `allTypes: string[]` - All available types
- `allSizes: string[]` - All available sizes
- `allCollections: string[]` - All available collections
- `sortBy: string` - Sort option
- `disabled?: boolean` - Disabled state
- `onPriceChange: (range: [number, number]) => void` - Price change callback
- `onToggleFilter: (key, value) => void` - Toggle filter callback
- `onClearFilter: (key) => void` - Clear filter callback
- `onSortChange: (value: string) => void` - Sort change callback
- `onFilterChange?: () => void` - Filter change callback

**Usage:**
```tsx
<CatalogFilters
  priceRange={priceRange}
  selectedTypes={selectedTypes}
  allTypes={allTypes}
  onPriceChange={handlePriceChange}
  onToggleFilter={handleToggleFilter}
/>
```

### CatalogGrid
Grid layout untuk menampilkan bouquet cards.

**Props:**
- `bouquets: Bouquet[]` - Array of bouquets
- `ariaLabel?: string` - ARIA label
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<CatalogGrid
  bouquets={pageItems}
  ariaLabel="Menampilkan 12 dari 50 bouquet"
/>
```

### CatalogPagination
Komponen pagination dengan page numbers dan navigation.

**Props:**
- `currentPage: number` - Current page number
- `totalItems: number` - Total items
- `itemsPerPage: number` - Items per page
- `onPageChange: (page: number) => void` - Page change callback

**Usage:**
```tsx
<CatalogPagination
  currentPage={1}
  totalItems={50}
  itemsPerPage={12}
  onPageChange={handlePageChange}
/>
```

### CatalogEmpty
Empty state component dengan filter chips dan actions.

**Props:**
- `title?: string` - Empty state title
- `description?: string` - Empty state description
- `hasActiveFilters?: boolean` - Has active filters flag
- `chips?: FilterChip[]` - Filter chips to display
- `onClearAll?: () => void` - Clear all callback
- `onRemoveLastFilter?: () => void` - Remove last filter callback
- `loading?: boolean` - Loading state

**Usage:**
```tsx
<CatalogEmpty
  hasActiveFilters={true}
  chips={chips}
  onClearAll={handleClearAll}
  onRemoveLastFilter={handleRemoveLastFilter}
/>
```

### CatalogSkeleton
Loading skeleton untuk catalog grid.

**Props:**
- `count?: number` - Number of skeleton cards (default: 6)
- `showLoadingState?: boolean` - Show loading state text (default: true)

**Usage:**
```tsx
<CatalogSkeleton count={12} showLoadingState />
```

### CatalogActiveFilters
Komponen untuk menampilkan active filter chips.

**Props:**
- `chips: FilterChip[]` - Array of filter chips
- `loading?: boolean` - Loading state
- `variant?: "default" | "empty"` - Variant style

**Usage:**
```tsx
<CatalogActiveFilters chips={chips} loading={loading} />
```

## Main BouquetCatalogPage Component

Page utama yang menggunakan semua komponen di atas:

```tsx
import BouquetCatalogView from "../view/bouquet-catalog-page";

<BouquetCatalogView
  bouquets={bouquets}
  allTypes={allTypes}
  allSizes={allSizes}
  allCollections={allCollections}
  priceRange={priceRange}
  selectedTypes={selectedTypes}
  onPriceChange={handlePriceChange}
  // ... other props
/>
```

## Features

- ✅ Fully reusable components
- ✅ Luxury design dengan gradients, shadows, dan animations
- ✅ Clear dan beautiful UI dengan proper spacing
- ✅ Responsive design untuk semua breakpoints
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Menggunakan komponen yang sudah ada (BouquetCard, FilterPanel, UIIcons)
- ✅ TypeScript type-safe
- ✅ Performance optimized
- ✅ SEO optimized dengan dynamic meta tags
- ✅ Smooth animations dan transitions
- ✅ Loading states dengan skeleton screens
- ✅ Empty states dengan helpful messages

## Responsive Breakpoints

- **Mobile**: < 640px - Single column grid, mobile filters
- **Tablet**: 640px - 1024px - 2-3 columns grid
- **Desktop**: > 1024px - 3-4 columns grid
- **Large Desktop**: > 1440px - 4 columns grid
- **Ultra-wide**: > 1920px - 4-5 columns grid

## CSS Architecture

Setiap komponen memiliki CSS file sendiri:
- `CatalogHeader.css` - Header styling
- `CatalogSearch.css` - Search bar styling
- `CatalogFilters.css` - Filters styling
- `CatalogGrid.css` - Grid layout styling
- `CatalogPagination.css` - Pagination styling
- `CatalogEmpty.css` - Empty state styling
- `CatalogSkeleton.css` - Skeleton loading styling
- `CatalogActiveFilters.css` - Active filters chips styling
- `BouquetCatalogPage.css` - Main page container styling

Semua CSS files menggunakan CSS variables dari `colors.css` untuk consistency.

