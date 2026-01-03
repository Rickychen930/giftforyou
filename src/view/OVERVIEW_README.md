# Admin Overview Components Documentation

## Overview

Admin Overview components adalah kumpulan komponen modular dan reusable untuk menampilkan ringkasan (overview) data dashboard admin. Semua komponen mengikuti prinsip **Luxury & Elegant Design**, **Responsive**, **Efisien & Reusable**, dan menggunakan **Design System** yang konsisten.

## Architecture

### MVC Pattern

Komponen overview mengikuti arsitektur MVC (Model-View-Controller) untuk pemisahan concern yang jelas:

#### **Model** (`src/models/dashboard-page-model.ts`)
- **Tanggung Jawab**: Hanya untuk data dan business logic
- **Fungsi**:
  - Data structures untuk overview metrics
  - Type definitions untuk view state
  - Data transformation utilities
- **Tidak mengandung**: UI logic atau event handlers

#### **View** (`src/view/dashboard-page.tsx`)
- **Tanggung Jawab**: Fokus pada tampilan (presentation)
- **Fungsi**:
  - Render overview sections
  - Format display data
  - Handle visual feedback
- **Tidak mengandung**: Business logic atau state management kompleks

#### **Controller** (`src/controllers/dashboard-page-controller.tsx`)
- **Tanggung Jawab**: Menangani logika interaksi
- **Fungsi**:
  - Event handlers (onCopyOverview, onReloadDashboard, dll)
  - State management
  - API calls coordination
  - User interaction logic
- **Tidak mengandung**: Business logic (didelegasikan ke Model)

### Component Structure

```
DashboardPageView (Main Container)
├── renderOverviewHeader() (Header dengan actions)
├── renderSalesMetrics() (Sales metrics cards)
├── renderOverviewInsights() (Insights cards)
├── renderPerformanceMetrics() (Performance score)
└── renderSeoAnalysis() (SEO analysis)
```

## Components

### 1. Overview Header

**Location**: `renderOverviewHeader()` method in `dashboard-page.tsx`

**Deskripsi**: Header section dengan title, last updated info, dan action buttons.

**Features**:
- Title dengan luxury gradient text
- Last updated timestamp
- Action buttons (Copy, Reload)
- Toast notification untuk feedback

**CSS Classes**:
- `.overviewHeader` - Main container
- `.overviewHeader__title` - Title dengan gradient
- `.overviewHeader__sub` - Subtitle
- `.overviewHeader__actions` - Action buttons container
- `.overviewActionBtn` - Action button
- `.overviewActionBtn--primary` - Primary action button
- `.overviewToast` - Toast notification

**Usage**:
```tsx
private renderOverviewHeader = (): React.ReactNode => {
  // Renders overview header with actions
}
```

### 2. Sales Metrics Cards

**Location**: `renderSalesMetrics()` method

**Deskripsi**: Menampilkan sales metrics dalam bentuk cards.

**Features**:
- Revenue card
- Orders card
- Order Status card
- Payment Status card
- Top Selling Products card
- Customers card

**CSS Classes**:
- `.overviewCard` - Card container
- `.overviewCard__title` - Card title
- `.overviewKeyValue` - Key-value pairs container
- `.overviewKeyValue__row` - Key-value row
- `.overviewKeyValue__key` - Key label
- `.overviewKeyValue__val` - Value dengan gradient
- `.overviewList` - List container
- `.overviewList__item` - List item
- `.overviewRank` - Ranking list
- `.overviewRank__item` - Ranking item

### 3. Overview Insights

**Location**: `renderOverviewInsights()` method

**Deskripsi**: Menampilkan insights seperti top collections, top searches, popular bouquets.

**Features**:
- Top Collections
- Top Searches
- Popular Bouquets (30 days, 7 days)
- Peak Visit Hours

**CSS Classes**:
- `.overviewCard` - Card container
- `.overviewRank` - Ranking list
- `.overviewRank__item` - Ranking item dengan hover effects
- `.overviewRank__name` - Item name
- `.overviewRank__count` - Item count

### 4. Performance Metrics

**Location**: `renderPerformanceMetrics()` method

**Deskripsi**: Menampilkan performance score dan metrics.

**Features**:
- Performance score badge
- Performance metrics (load time, resources, dll)
- Grade indicator (excellent, good, needs improvement, poor)

**CSS Classes**:
- `.overviewPerformanceScore` - Score container
- `.overviewPerformanceScore__badge` - Score badge
- `.overviewPerformanceScore__badge--excellent` - Excellent grade
- `.overviewPerformanceScore__badge--good` - Good grade
- `.overviewPerformanceScore__badge--needs-improvement` - Needs improvement
- `.overviewPerformanceScore__badge--poor` - Poor grade
- `.overviewPerformanceScore__value` - Score value
- `.overviewPerformanceScore__label` - Score label
- `.overviewPerformanceScore__grade` - Grade text

### 5. SEO Analysis

**Location**: `renderSeoAnalysis()` method

**Deskripsi**: Menampilkan SEO analysis dan recommendations.

**Features**:
- SEO score badge
- SEO checks (pass, warning, fail)
- SEO recommendations

**CSS Classes**:
- `.overviewSeoScore` - SEO score container
- `.overviewSeoScore__badge` - Score badge
- `.overviewSeoScore__badge--excellent` - Excellent grade
- `.overviewSeoScore__badge--good` - Good grade
- `.overviewSeoScore__badge--needs-improvement` - Needs improvement
- `.overviewSeoScore__badge--poor` - Poor grade
- `.overviewSeoChecks` - Checks container
- `.overviewSeoCheck` - Individual check
- `.overviewSeoCheck--pass` - Pass status
- `.overviewSeoCheck--warning` - Warning status
- `.overviewSeoCheck--fail` - Fail status
- `.overviewSeoCheck__icon` - Status icon
- `.overviewSeoCheck__content` - Check content
- `.overviewSeoCheck__name` - Check name
- `.overviewSeoCheck__message` - Check message
- `.overviewSeoRecommendations` - Recommendations section

### 6. Chart Visualization

**Location**: Used in various cards

**Deskripsi**: Bar chart untuk visualisasi data.

**CSS Classes**:
- `.overviewChart` - Chart container
- `.overviewChart__bar` - Bar container
- `.overviewChart__fill` - Bar fill
- `.overviewChart__label` - Bar label

### 7. Alerts

**Location**: Used for notifications

**Deskripsi**: Alert components untuk notifications.

**CSS Classes**:
- `.overviewAlerts` - Alerts container
- `.overviewAlert` - Individual alert
- `.overviewAlert--critical` - Critical alert
- `.overviewAlert--warning` - Warning alert
- `.overviewAlert--info` - Info alert
- `.overviewAlert__content` - Alert content
- `.overviewAlert__title` - Alert title
- `.overviewAlert__message` - Alert message

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

**DashboardPage.css**: Styling untuk semua overview components, termasuk:
- Overview header
- Overview cards
- Overview lists
- Overview rankings
- Performance & SEO scores
- Charts
- Alerts

## Responsive Design

Semua komponen fully responsive dengan breakpoints:

- **Mobile** (`max-width: 768px`): Single column layout, stacked cards
- **Tablet** (`768px - 1200px`): 2-column layout
- **Desktop** (`min-width: 1200px`): Multi-column layout dengan sidebar

Media queries menggunakan design system variables:
```css
@media (max-width: 768px) {
  .overviewLayout {
    grid-template-columns: 1fr;
    gap: 0.9rem;
  }
  
  .overviewHeader {
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
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

### Example: Reusing Overview Cards

```tsx
// Revenue card
<div className="overviewCard" aria-label="Revenue">
  <p className="overviewCard__title">Revenue</p>
  {this.renderRevenueRows()}
</div>

// Orders card
<div className="overviewCard" aria-label="Orders">
  <p className="overviewCard__title">Orders</p>
  {this.renderOrderRows()}
</div>
```

## Best Practices

### 1. DRY (Don't Repeat Yourself)

- **CSS Variables**: Semua styling menggunakan design system variables
- **Reusable Methods**: Common rendering logic di-extract ke methods
- **Component Composition**: Reuse components instead of duplicating code

### 2. SOLID Principles

- **Single Responsibility**: Setiap method memiliki satu tanggung jawab
- **Open/Closed**: Extensible melalui props, tidak perlu modify existing code
- **Liskov Substitution**: Components dapat diganti dengan implementasi lain
- **Interface Segregation**: Props interfaces yang spesifik dan minimal
- **Dependency Inversion**: Bergantung pada abstractions (props), bukan concrete implementations

### 3. Performance Optimization

- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive calculations cached
- **Debouncing**: Search input debounced
- **Reduced Motion**: Support untuk `prefers-reduced-motion`

### 4. Accessibility (A11y)

- **ARIA Labels**: Semua interactive elements memiliki aria-label
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Screen Reader Support**: Semantic HTML dan ARIA attributes

## Usage Examples

### Basic Usage

```tsx
// In DashboardPageView component
private renderOverview = (): React.ReactNode => {
  return (
    <>
      {this.renderOverviewHeader()}
      <div className="overviewLayout">
        <div className="overviewCol">
          {this.renderSalesMetrics()}
          {this.renderOverviewInsights()}
        </div>
        <div className="overviewSide">
          {this.renderPerformanceMetrics()}
          {this.renderSeoAnalysis()}
        </div>
      </div>
    </>
  );
};
```

### Custom Overview Card

```tsx
<div className="overviewCard" aria-label="Custom Metric">
  <p className="overviewCard__title">Custom Metric</p>
  <div className="overviewKeyValue">
    <div className="overviewKeyValue__row">
      <span className="overviewKeyValue__key">Label</span>
      <span className="overviewKeyValue__val">Value</span>
    </div>
  </div>
</div>
```

## Component Methods

### Render Methods

1. **renderOverviewHeader()**: Header dengan actions
2. **renderOverviewActions()**: Action buttons
3. **renderSalesMetrics()**: Sales metrics cards
4. **renderRevenueRows()**: Revenue key-value rows
5. **renderOrderRows()**: Order key-value rows
6. **renderOrderStatusItems()**: Order status list
7. **renderPaymentStatusItems()**: Payment status list
8. **renderDataQualityItems()**: Data quality list
9. **renderPerformanceMetrics()**: Performance metrics
10. **renderSeoAnalysis()**: SEO analysis
11. **renderOverviewInsights()**: Overview insights cards
12. **renderExportButtons()**: Export buttons
13. **renderCustomerActions()**: Customer action buttons

## Troubleshooting

### Common Issues

1. **Cards tidak muncul**: Pastikan data props tidak null/undefined
2. **Styling tidak konsisten**: Pastikan `design-system.css` di-import
3. **Responsive tidak bekerja**: Check media queries di CSS
4. **Gradient tidak muncul**: Pastikan browser support `-webkit-background-clip`

### Debug Tips

- Check browser console untuk errors
- Verify props yang dikirim ke components
- Check network tab untuk API calls
- Inspect CSS variables di DevTools
- Verify design system variables tersedia

## Future Enhancements

- [ ] Real-time data updates
- [ ] Customizable dashboard layout
- [ ] Export overview to PDF/Excel
- [ ] Advanced filtering dan sorting
- [ ] Interactive charts dengan tooltips
- [ ] Dark mode support
- [ ] Print-friendly styles

## Contributing

Saat menambahkan fitur baru:

1. **Follow MVC pattern**: Pisahkan Model, View, Controller
2. **Use Design System**: Gunakan CSS variables dari design system
3. **Make it Reusable**: Design components untuk reusable
4. **Add Documentation**: Update README ini
5. **Test Responsive**: Test di mobile, tablet, desktop
6. **Check Accessibility**: Verify keyboard navigation dan screen readers
7. **Follow Naming Convention**: Gunakan prefix `overview` untuk semua classes

---

**Last Updated**: 2024
**Maintainer**: Development Team

