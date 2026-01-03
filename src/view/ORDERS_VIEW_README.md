# Admin Orders View Components Documentation

## Overview

Admin Orders View components adalah kumpulan komponen modular dan reusable untuk mengelola orders di admin dashboard. Semua komponen mengikuti prinsip **Luxury & Elegant Design**, **Responsive**, **Efisien & Reusable**, dan menggunakan **Design System** yang konsisten.

## Architecture

### MVC Pattern

Komponen orders view mengikuti arsitektur MVC (Model-View-Controller) untuk pemisahan concern yang jelas:

#### **Model** (`src/models/orders-model.ts`)
- **Tanggung Jawab**: Hanya untuk data dan type definitions
- **Fungsi**:
  - Type definitions untuk Order
  - Data structures untuk order data
  - Utility functions untuk data formatting
- **Tidak mengandung**: UI logic atau event handlers

#### **View** (`src/view/orders-view.tsx`)
- **Tanggung Jawab**: Fokus pada tampilan (presentation)
- **Fungsi**:
  - Render orders list
  - Render order cards
  - Render statistics
  - Render search and filters
  - Render form drawer
  - Format display data
- **Tidak mengandung**: Business logic kompleks (didelegasikan ke Controller)

#### **Controller** (`src/controllers/orders-controller.tsx`)
- **Tanggung Jawab**: Menangani logika interaksi dan state management
- **Fungsi**:
  - Load orders dari API
  - Handle form submissions
  - Handle order updates
  - Handle bulk actions
  - Handle search and filters
  - Validation
- **Tidak mengandung**: Business logic (didelegasikan ke backend)

### Component Structure

```
OrdersSection (Main Entry Point)
└── OrdersController
    └── OrdersView
        ├── Header
        │   ├── Title & Subtitle
        │   └── Actions (Add Order, Refresh, Close)
        ├── Statistics
        │   └── StatCards[] (Total, Belum Bayar, Terkirim, Terlambat, Revenue, Paid)
        ├── Search & Filters
        │   ├── Search Input
        │   ├── Status Filter
        │   ├── Payment Filter
        │   └── Sort Controls
        ├── Order Cards List
        │   └── OrderCard[] (dengan drag & drop support)
        ├── Form Drawer
        │   ├── Customer Selection
        │   ├── Order Form
        │   └── Actions
        └── Invoice Modal
```

## Components

### 1. OrdersSection

**File**: `src/view/sections/orders-section.tsx`

**Deskripsi**: Main entry point yang menghubungkan Controller dan View.

**Props**:
```typescript
interface Props {
  bouquets: Bouquet[];
}
```

**Usage**:
```tsx
<OrdersSection bouquets={bouquets} />
```

### 2. OrdersView

**File**: `src/view/orders-view.tsx`

**Deskripsi**: Main view component yang menangani semua rendering.

**Props**:
```typescript
interface Props {
  controller: OrdersController;
}
```

**Methods**:
- `renderHeader()`: Render header dengan title dan actions
- `renderStatistics()`: Render statistics cards
- `renderSearchAndFilters()`: Render search dan filter controls
- `renderOrderCard()`: Render individual order card
- `renderOrderList()`: Render orders list
- `renderFormDrawer()`: Render form drawer untuk add/edit
- `renderInvoiceModal()`: Render invoice modal

### 3. Order Card

**Deskripsi**: Individual order card dengan luxury styling.

**Features**:
- Buyer name dengan luxury gradient
- Amount dengan luxury gold gradient
- Status badges dengan color coding
- Payment badges
- Action buttons
- Expandable details
- Bulk selection support
- Hover effects dengan luxury styling

**CSS Classes**:
- `.ordersCard` - Main card container dengan luxury styling
- `.ordersCard--selected` - Selected state dengan luxury gold border
- `.ordersCard--danger` - Danger state untuk overdue orders
- `.ordersCard__top` - Card header
- `.ordersCard__buyer` - Buyer info
- `.ordersCard__buyerName` - Buyer name dengan luxury gradient
- `.ordersCard__amount` - Amount display
- `.ordersCard__amountValue` - Amount value dengan luxury gold gradient
- `.ordersCard__main` - Card main content
- `.ordersCard__bouquet` - Bouquet name
- `.ordersCard__chips` - Status chips container
- `.ordersCard__actions` - Action buttons

### 4. Statistics Cards

**Deskripsi**: Statistics cards dengan luxury styling.

**Features**:
- Total Order
- Belum Bayar (warning)
- Terkirim (success)
- Terlambat (danger)
- Total Revenue (luxury gold)
- Sudah Dibayar (luxury gold)

**CSS Classes**:
- `.ordersStats` - Statistics container
- `.ordersStats__grid` - Statistics grid
- `.ordersStatCard` - Stat card dengan luxury styling
- `.ordersStatCard__label` - Stat label
- `.ordersStatCard__value` - Stat value dengan luxury gradient
- `.ordersStatCard--success` - Success variant
- `.ordersStatCard--warning` - Warning variant
- `.ordersStatCard--danger` - Danger variant
- `.ordersStatCard--revenue` - Revenue variant dengan luxury gold

### 5. Search & Filters

**Deskripsi**: Search input dan filter controls dengan luxury styling.

**Features**:
- Search input dengan icon
- Status filter dropdown
- Payment filter dropdown
- Sort controls
- Clear filters button

**CSS Classes**:
- `.ordersListSearch` - Search container
- `.ordersListSearch__icon` - Search icon
- `.ordersListSearch__clear` - Clear button
- `.ordersList__filters` - Filters container dengan luxury styling
- `.ordersFilters` - Filters wrapper
- `.ordersFilterGroup` - Filter group
- `.ordersFilterLabel` - Filter label
- `.ordersFilterSelect` - Filter select dengan luxury styling
- `.ordersSortGroup` - Sort group
- `.ordersSortBtn` - Sort button
- `.ordersFilterClear` - Clear filters button

### 6. Form Drawer

**Deskripsi**: Side drawer untuk add/edit order dengan luxury styling.

**Features**:
- Slide-in animation
- Customer selection
- Order form fields
- Sticky action bar
- Luxury glass morphism

**CSS Classes**:
- `.ordersDrawerOverlay` - Drawer overlay
- `.ordersDrawer` - Drawer container dengan luxury styling
- `.ordersDrawer__head` - Drawer header
- `.ordersDrawer__title` - Drawer title dengan luxury gradient
- `.ordersDrawer__body` - Drawer body
- `.ordersActions` - Actions bar

### 7. Buttons

**Primary Button**:
- Luxury gold gradient
- Hover effects dengan luxury shadows

**Secondary Buttons**:
- Luxury gold subtle background
- Hover effects

**Danger Button**:
- Error styling dengan gradients

**CSS Classes**:
- `.ordersBtn` - Main button dengan luxury styling
- `.ordersBtn--primary` - Primary button dengan luxury gold
- `.ordersBtn--danger` - Danger button
- `.ordersBtn--sm` - Small variant
- `.overviewActionBtn` - Action button dengan luxury styling
- `.overviewActionBtn--primary` - Primary action button

### 8. Form Fields

**Input Fields**:
- Luxury borders dan shadows
- Hover effects dengan luxury gold
- Focus states dengan luxury gold

**CSS Classes**:
- `.ordersInput` - Input field dengan luxury styling
- `.ordersTextarea` - Textarea dengan luxury styling
- `.ordersSelect` - Select dengan luxury styling
- `.ordersField` - Field container
- `.ordersLabel` - Field label dengan bullet

### 9. Chips & Badges

**Status Chips**:
- Success, Warning, Danger, Muted variants
- Luxury styling dengan gradients

**CSS Classes**:
- `.ordersChip` - Chip dengan luxury styling
- `.ordersChip--muted` - Muted variant
- `.ordersChip--danger` - Danger variant
- `.ordersChip--success` - Success variant
- `.ordersChip--warning` - Warning variant
- `.ordersBadge` - Badge component

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

**OrdersSection.css**: Styling untuk semua orders components, termasuk:
- Main layout
- Header dengan luxury styling
- Statistics cards dengan luxury gradients
- Order cards dengan luxury styling
- Search & filters dengan luxury styling
- Form drawer dengan luxury glass morphism
- Buttons dengan luxury gold
- Form fields dengan luxury borders
- Chips & badges dengan luxury styling
- Responsive adjustments

## Responsive Design

Semua komponen fully responsive dengan breakpoints:

- **Mobile** (`max-width: 640px`): Single column layout, stacked controls, full-width drawer
- **Tablet** (`640px - 1024px`): 2-column layout untuk statistics, single column untuk cards
- **Desktop** (`min-width: 1024px`): Multi-column layout

Media queries menggunakan design system variables:
```css
@media (max-width: 768px) {
  .ordersCard {
    padding: 1rem;
    border-radius: 18px;
  }
  
  .ordersStats__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .ordersDrawer {
    width: 100vw;
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

### Example: Reusing Order Card

```tsx
// Order card dapat digunakan di berbagai konteks
private renderOrderCard(order: Order): React.ReactNode {
  return (
    <div className="ordersCard">
      {/* Order card content */}
    </div>
  );
}
```

## Best Practices

### 1. DRY (Don't Repeat Yourself)

- **CSS Variables**: Semua styling menggunakan design system variables
- **Reusable Methods**: Common rendering logic di-extract ke methods
- **Utility Functions**: formatIDR, formatShortDateTime digunakan secara konsisten

### 2. SOLID Principles

- **Single Responsibility**: Setiap method memiliki satu tanggung jawab
- **Open/Closed**: Extensible melalui props, tidak perlu modify existing code
- **Liskov Substitution**: Components dapat diganti dengan implementasi lain
- **Interface Segregation**: Props interfaces yang spesifik dan minimal
- **Dependency Inversion**: Bergantung pada abstractions (controller), bukan concrete implementations

### 3. Performance Optimization

- **Lazy Loading**: Data loaded on demand
- **Memoization**: Expensive calculations cached
- **Reduced Motion**: Support untuk `prefers-reduced-motion`
- **Will-change**: CSS property untuk smooth animations

### 4. Accessibility (A11y)

- **ARIA Labels**: Semua interactive elements memiliki aria-label
- **Keyboard Navigation**: Full keyboard support (Enter, Space, Escape)
- **Focus Management**: Proper focus handling
- **Screen Reader Support**: Semantic HTML dan ARIA attributes
- **Drag & Drop**: Keyboard accessible

## Usage Examples

### Basic Usage

```tsx
import OrdersSection from './sections/orders-section';

function AdminDashboard() {
  const bouquets = [
    { _id: "1", name: "Rose Bouquet", price: 100000 },
    // ...
  ];
  
  return (
    <OrdersSection bouquets={bouquets} />
  );
}
```

### With Custom Controller

```tsx
import { OrdersController } from '../controllers/orders-controller';
import OrdersView from '../view/orders-view';

function CustomOrdersPage() {
  const controller = new OrdersController({ bouquets });
  
  return (
    <OrdersView controller={controller} />
  );
}
```

## API Integration

### Endpoints Used

1. **GET `/api/orders`**: Get orders list
   - Query params: `limit`, `customerId`, `orderStatus`, `paymentStatus`
   - Returns: Array of Order objects

2. **POST `/api/orders`**: Create new order
   - Body: Order object
   - Returns: Created order

3. **PATCH `/api/orders/:id`**: Update order
   - Body: Partial Order object
   - Returns: Updated order

4. **DELETE `/api/orders/:id`**: Delete order
   - Returns: Success/error response

### Data Flow

```
User Action → View → Controller → API Call → Data Processing → State Update → View Render
```

## Troubleshooting

### Common Issues

1. **Orders tidak muncul**: Check API endpoint dan response format
2. **Form tidak submit**: Check validation dan error handling
3. **Drawer tidak terbuka**: Check state management dan event handlers
4. **Styling tidak konsisten**: Pastikan `design-system.css` di-import
5. **Bulk actions tidak bekerja**: Check selection state management

### Debug Tips

- Check browser console untuk errors
- Verify API responses di Network tab
- Check state updates di React DevTools
- Inspect CSS variables di DevTools
- Verify design system variables tersedia
- Test responsive layout di berbagai screen sizes

## Future Enhancements

- [ ] Real-time order updates
- [ ] Order status timeline visualization
- [ ] Advanced filtering dengan date range
- [ ] Export orders ke CSV/PDF
- [ ] Order templates/presets
- [ ] Bulk status update
- [ ] Order analytics dashboard
- [ ] Print invoice directly
- [ ] Order notes dan history
- [ ] Customer quick actions dari order card

## Contributing

Saat menambahkan fitur baru:

1. **Follow MVC pattern**: Pisahkan Model, View, Controller
2. **Use Design System**: Gunakan CSS variables dari design system
3. **Make it Reusable**: Design components untuk reusable
4. **Add Documentation**: Update README ini
5. **Test Responsive**: Test di mobile, tablet, desktop
6. **Check Accessibility**: Verify keyboard navigation dan screen readers
7. **Follow Naming Convention**: Gunakan prefix `orders` untuk semua classes
8. **Test API Integration**: Verify dengan mock data dan real API

---

**Last Updated**: 2024
**Maintainer**: Development Team

