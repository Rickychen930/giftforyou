# Admin Hero Analytics Components Documentation

## Overview

Admin Hero Analytics components adalah kumpulan komponen modular dan reusable untuk menampilkan analytics data hero slider di homepage. Semua komponen mengikuti prinsip **Luxury & Elegant Design**, **Responsive**, **Efisien & Reusable**, dan menggunakan **Design System** yang konsisten.

## Architecture

### MVC Pattern

Komponen hero analytics mengikuti arsitektur MVC (Model-View-Controller) untuk pemisahan concern yang jelas:

#### **Model** (Data Types)
- **Tanggung Jawab**: Hanya untuk data dan type definitions
- **Fungsi**:
  - Type definitions untuk HeroAnalyticsData
  - Data structures untuk analytics metrics
  - Utility functions untuk data formatting (formatPercent, formatNumber, formatTime)
- **Tidak mengandung**: UI logic atau event handlers

#### **View** (`src/view/sections/HeroAnalyticsSection.tsx`)
- **Tanggung Jawab**: Fokus pada tampilan (presentation)
- **Fungsi**:
  - Render analytics dashboard
  - Format display data
  - Handle visual feedback
- **Tidak mengandung**: Business logic kompleks (didelegasikan ke API)

#### **Controller** (Component State Management)
- **Tanggung Jawab**: Menangani logika interaksi dan state management
- **Fungsi**:
  - Load analytics data dari API
  - Handle period selection
  - Error handling
  - Loading states
- **Tidak mengandung**: Business logic (didelegasikan ke backend)

### Component Structure

```
HeroAnalyticsSection (Main Container)
├── Header
│   ├── Title
│   ├── Subtitle
│   └── Period Selector (7d, 30d, 90d, all)
├── Stats Grid
│   └── StatCard[] (Total Views, Total Clicks, CTR, Avg Time)
└── Slides Analytics Table
    └── Table dengan data per slide
```

## Components

### 1. HeroAnalyticsSection

**File**: `src/view/sections/HeroAnalyticsSection.tsx`

**Deskripsi**: Main container component yang menampilkan analytics data untuk hero slider.

**Props**:
```typescript
interface HeroAnalyticsSectionProps {
  period?: "7d" | "30d" | "90d" | "all";
  onPeriodChange?: (period: "7d" | "30d" | "90d" | "all") => void;
}
```

**State**:
```typescript
interface HeroAnalyticsSectionState {
  loading: boolean;
  error: string | null;
  data: HeroAnalyticsData | null;
  selectedPeriod: "7d" | "30d" | "90d" | "all";
}
```

**Data Structure**:
```typescript
type HeroAnalyticsData = {
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  averageTimeSpent: number;
  slides: Array<{
    slideId: string;
    slideTitle: string;
    views: number;
    clicks: number;
    ctr: number;
    timeSpent: number;
  }>;
  period: {
    start: string;
    end: string;
    days: number;
  };
  trends: {
    views: { change: number; trend: "up" | "down" | "stable" };
    clicks: { change: number; trend: "up" | "down" | "stable" };
    ctr: { change: number; trend: "up" | "down" | "stable" };
  };
};
```

**Features**:
- Load analytics data dari API
- Period selector (7d, 30d, 90d, all)
- Stats cards dengan trends
- Slides analytics table
- Error handling dengan retry
- Loading states
- Empty states

**Methods**:
- `loadAnalytics()`: Load analytics data dari API
- `formatPercent()`: Format percentage
- `formatNumber()`: Format number dengan commas
- `formatTime()`: Format time dalam seconds ke readable format
- `renderStatCard()`: Render stat card dengan icon dan trend
- `renderSlidesTable()`: Render slides analytics table
- `renderPeriodSelector()`: Render period selector buttons

**Usage**:
```tsx
<HeroAnalyticsSection
  period="30d"
  onPeriodChange={(period) => {
    console.log('Period changed:', period);
  }}
/>
```

### 2. Stat Card

**Deskripsi**: Individual stat card dengan icon, value, trend, dan subtitle.

**Features**:
- Icon dengan luxury gold color
- Large value dengan luxury gradient
- Trend indicator (up/down/stable) dengan color coding
- Subtitle untuk additional info
- Hover effects dengan luxury styling

**CSS Classes**:
- `.heroAnalytics__statCard` - Main card container
- `.heroAnalytics__statHeader` - Header dengan label dan trend
- `.heroAnalytics__statLabel` - Label dengan icon
- `.heroAnalytics__statIcon` - Icon dengan luxury gold color
- `.heroAnalytics__statTrend` - Trend indicator
- `.heroAnalytics__statValue` - Large value dengan luxury gradient
- `.heroAnalytics__statSubtitle` - Subtitle text

### 3. Period Selector

**Deskripsi**: Period selector buttons untuk memilih periode analytics.

**Features**:
- 4 options: 7d, 30d, 90d, all
- Active state dengan luxury gold styling
- Hover effects
- Responsive layout

**CSS Classes**:
- `.heroAnalytics__periodSelector` - Container
- `.heroAnalytics__periodBtn` - Button
- `.heroAnalytics__periodBtn--active` - Active state dengan luxury gold

### 4. Slides Analytics Table

**Deskripsi**: Table yang menampilkan analytics data per slide.

**Features**:
- Slide index dengan luxury gold badge
- Slide title
- Views, Clicks, CTR, Avg Time columns
- Hover effects
- Responsive dengan horizontal scroll

**CSS Classes**:
- `.heroAnalytics__tableWrapper` - Table wrapper dengan scroll
- `.heroAnalytics__table` - Table element
- `.heroAnalytics__slideInfo` - Slide info container
- `.heroAnalytics__slideIndex` - Slide index badge dengan luxury gold
- `.heroAnalytics__slideTitle` - Slide title
- `.heroAnalytics__tableValue` - Table value dengan luxury gold gradient

### 5. Loading & Error States

**Loading State**:
- Skeleton loaders dengan luxury styling
- Multiple skeleton cards

**Error State**:
- Error icon
- Error message
- Retry button dengan luxury gold styling

**Empty State**:
- Empty state dengan icon dan message
- Luxury styling

**CSS Classes**:
- `.heroAnalytics__loading` - Loading container
- `.heroAnalytics__error` - Error container
- `.heroAnalytics__retryBtn` - Retry button dengan luxury gold
- `.heroAnalytics__empty` - Empty state container

## Design System

### Luxury & Elegant Colors

Semua komponen menggunakan design system variables dari `design-system.css`:

```css
/* Luxury Gold Palette */
--luxury-gold-50 to --luxury-gold-800

/* Elegant Neutrals */
--elegant-black: #1a1a1a
--elegant-charcoal: #2d2d2d
--elegant-white: #ffffff
--elegant-cream: #faf9f6

/* Luxury Gradients */
--gradient-luxury-gold
--gradient-luxury-gold-subtle
--gradient-elegant-surface

/* Luxury Shadows */
--shadow-luxury-sm
--shadow-luxury-md
--shadow-luxury-lg
--shadow-luxury-xl
--shadow-luxury-gold
--shadow-luxury-gold-lg

/* Luxury Borders */
--border-luxury
--border-luxury-gold
--border-luxury-gold-strong

/* Transitions */
--transition-elegant
```

### CSS File

**HeroAnalyticsSection.css**: Styling untuk semua hero analytics components, termasuk:
- Main analytics container
- Header dengan period selector
- Stats grid dengan stat cards
- Slides analytics table
- Loading & error states
- Responsive adjustments

## Responsive Design

Semua komponen fully responsive dengan breakpoints:

- **Mobile** (`max-width: 640px`): Single column layout, stacked controls, horizontal scroll untuk table
- **Tablet** (`640px - 1024px`): 2-column layout untuk stats grid
- **Desktop** (`min-width: 1024px`): Multi-column layout

Media queries menggunakan design system variables:
```css
@media (max-width: 768px) {
  .heroAnalytics {
    padding: var(--space-4);
    border-radius: var(--radius-xl);
  }
  
  .heroAnalytics__statsGrid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .heroAnalytics__tableWrapper {
    overflow-x: scroll;
    -webkit-overflow-scrolling: touch;
  }
}
```

## Reusability

### Modular Components

Setiap komponen dirancang untuk reusable:

1. **Props-based configuration**: Semua behavior dikonfigurasi melalui props
2. **No hardcoded dependencies**: Tidak ada hardcoded API calls atau business logic
3. **Composition over inheritance**: Menggunakan composition pattern
4. **Single Responsibility**: Setiap method memiliki satu tanggung jawab

### Example: Reusing Stat Card

```tsx
// Stat card dapat digunakan di berbagai konteks
private renderStatCard = (
  label: string,
  value: string | number,
  icon?: React.ReactNode,
  trend?: { change: number; trend: "up" | "down" | "stable" },
  subtitle?: string
): React.ReactNode => {
  // Stat card implementation
};
```

## Best Practices

### 1. DRY (Don't Repeat Yourself)

- **CSS Variables**: Semua styling menggunakan design system variables
- **Reusable Methods**: Common rendering logic di-extract ke methods
- **Utility Functions**: formatPercent, formatNumber, formatTime digunakan secara konsisten

### 2. SOLID Principles

- **Single Responsibility**: Setiap method memiliki satu tanggung jawab
- **Open/Closed**: Extensible melalui props, tidak perlu modify existing code
- **Liskov Substitution**: Components dapat diganti dengan implementasi lain
- **Interface Segregation**: Props interfaces yang spesifik dan minimal
- **Dependency Inversion**: Bergantung pada abstractions (props), bukan concrete implementations

### 3. Performance Optimization

- **Lazy Loading**: Data loaded on demand
- **Memoization**: Expensive calculations cached
- **Reduced Motion**: Support untuk `prefers-reduced-motion`
- **Will-change**: CSS property untuk smooth animations

### 4. Accessibility (A11y)

- **ARIA Labels**: Semua interactive elements memiliki aria-label
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Screen Reader Support**: Semantic HTML dan ARIA attributes
- **Table Accessibility**: Proper table headers dan structure

## Usage Examples

### Basic Usage

```tsx
import HeroAnalyticsSection from './sections/HeroAnalyticsSection';

function AdminDashboard() {
  return (
    <HeroAnalyticsSection
      period="30d"
      onPeriodChange={(period) => {
        console.log('Period changed:', period);
      }}
    />
  );
}
```

### With Custom Handler

```tsx
<HeroAnalyticsSection
  period="7d"
  onPeriodChange={async (period) => {
    // Handle period change
    await refreshAnalytics(period);
    // Show notification
    showNotification(`Analytics updated untuk periode ${period}`);
  }}
/>
```

## API Integration

### Endpoints Used

1. **GET `/api/analytics/hero?period={period}`**: Get hero analytics data
   - Query params: `period` (7d, 30d, 90d, all)
   - Returns: HeroAnalyticsData object dengan metrics dan trends

### Data Flow

```
User Action → Component State → API Call → Data Processing → State Update → UI Render
```

### Expected Response Format

```json
{
  "totalViews": 12345,
  "totalClicks": 1234,
  "clickThroughRate": 10.0,
  "averageTimeSpent": 15.5,
  "slides": [
    {
      "slideId": "slide-1",
      "slideTitle": "Orchid Luxe Collection",
      "views": 5000,
      "clicks": 500,
      "ctr": 10.0,
      "timeSpent": 20.0
    }
  ],
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31",
    "days": 31
  },
  "trends": {
    "views": { "change": 5.2, "trend": "up" },
    "clicks": { "change": -2.1, "trend": "down" },
    "ctr": { "change": 1.5, "trend": "up" }
  }
}
```

## Troubleshooting

### Common Issues

1. **Analytics tidak muncul**: Check API endpoint dan response format
2. **Period selector tidak bekerja**: Check state management dan event handlers
3. **Table tidak responsive**: Check CSS overflow dan scroll properties
4. **Styling tidak konsisten**: Pastikan `design-system.css` di-import
5. **Trend indicators tidak muncul**: Check data structure dan trend calculation

### Debug Tips

- Check browser console untuk errors
- Verify API responses di Network tab
- Check state updates di React DevTools
- Inspect CSS variables di DevTools
- Verify design system variables tersedia
- Test responsive layout di berbagai screen sizes

## Future Enhancements

- [ ] Real-time analytics updates
- [ ] Export analytics data ke CSV/PDF
- [ ] Chart visualizations (line charts, bar charts)
- [ ] Comparison dengan periode sebelumnya
- [ ] Filter by slide
- [ ] Date range picker
- [ ] Analytics insights dan recommendations
- [ ] A/B testing analytics
- [ ] Heatmap untuk slide performance
- [ ] Conversion funnel analysis

## Contributing

Saat menambahkan fitur baru:

1. **Follow MVC pattern**: Pisahkan Model, View, Controller
2. **Use Design System**: Gunakan CSS variables dari design system
3. **Make it Reusable**: Design components untuk reusable
4. **Add Documentation**: Update README ini
5. **Test Responsive**: Test di mobile, tablet, desktop
6. **Check Accessibility**: Verify keyboard navigation dan screen readers
7. **Follow Naming Convention**: Gunakan prefix `heroAnalytics` untuk semua classes
8. **Test API Integration**: Verify dengan mock data dan real API

---

**Last Updated**: 2024
**Maintainer**: Development Team

