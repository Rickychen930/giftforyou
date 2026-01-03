# Admin Customers Components Documentation

## Overview

Admin Customers components adalah kumpulan komponen modular dan reusable untuk mengelola data customer di admin dashboard. Semua komponen mengikuti prinsip **Luxury & Elegant Design**, **Responsive**, **Efisien & Reusable**, dan menggunakan **Design System** yang konsisten.

## Architecture

### MVC Pattern

Komponen customers mengikuti arsitektur MVC (Model-View-Controller) untuk pemisahan concern yang jelas:

#### **Model** (Data Types)
- **Tanggung Jawab**: Hanya untuk data dan type definitions
- **Fungsi**:
  - Type definitions untuk Customer, CustomerStats, CustomerWithStats
  - Data structures untuk customer information
  - Utility functions untuk data formatting
- **Tidak mengandung**: UI logic atau event handlers

#### **View** (`src/view/sections/customers-section.tsx`)
- **Tanggung Jawab**: Fokus pada tampilan (presentation)
- **Fungsi**:
  - Render customer list dan detail views
  - Format display data
  - Handle visual feedback
- **Tidak mengandung**: Business logic kompleks (didelegasikan ke API)

#### **Controller** (API Integration)
- **Tanggung Jawab**: Menangani logika interaksi dan API calls
- **Fungsi**:
  - Load customers dari API
  - Handle search, filter, sort
  - Export functionality
  - State management
- **Tidak mengandung**: Business logic (didelegasikan ke backend)

### Component Structure

```
CustomersSection (Main Container)
├── renderListView() (List view dengan search, filter, sort)
│   ├── SectionHeader
│   ├── SearchInput
│   ├── Filter & Sort controls
│   └── CustomerCard[] (List of customer cards)
└── renderDetailView() (Detail view untuk selected customer)
    ├── Back button
    ├── Quick Actions (WhatsApp, Call, Orders)
    ├── Customer Info Card
    ├── Stats Card
    ├── Favorites Card
    └── Status Breakdown Card
```

## Components

### 1. CustomersSection

**File**: `src/view/sections/customers-section.tsx`

**Deskripsi**: Main container component yang mengelola customer list dan detail views.

**Props**:
```typescript
interface CustomersSectionProps {
  onSelectCustomer?: (customerId: string) => void;
}
```

**State**:
```typescript
interface CustomersSectionState {
  customers: CustomerWithStats[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  debouncedSearchQuery: string;
  selectedCustomer: CustomerWithStats | null;
  viewMode: "list" | "detail";
  sortBy: "name" | "orders" | "spent" | "date";
  sortDirection: "asc" | "desc";
  filterBy: "all" | "registered" | "guest";
  debounceTimer?: NodeJS.Timeout;
}
```

**Features**:
- Search dengan debounce (300ms)
- Filter by registration status (all, registered, guest)
- Sort by name, orders, spent, date
- Export to CSV
- Detail view dengan stats
- Quick actions (WhatsApp, Call, Orders)

**Methods**:
- `loadCustomers()`: Load customers dari API dengan stats
- `getFilteredAndSortedCustomers()`: Filter dan sort customers
- `handleCustomerClick()`: Handle customer selection
- `handleBackToList()`: Navigate back to list
- `handleExportCSV()`: Export customers to CSV
- `renderListView()`: Render list view
- `renderDetailView()`: Render detail view

**Usage**:
```tsx
<CustomersSection
  onSelectCustomer={(customerId) => {
    // Handle customer selection
  }}
/>
```

### 2. CustomerCard

**File**: `src/components/cards/CustomerCard.tsx`

**Deskripsi**: Reusable card component untuk menampilkan customer dalam list view.

**Props**:
```typescript
interface CustomerCardProps {
  customerId?: string;
  name: string;
  phone: string;
  totalOrders?: number;
  totalSpent?: string | number;
  joinedDate?: string;
  isRegistered?: boolean;
  onClick?: (customerId?: string) => void;
}
```

**Features**:
- Customer name dengan luxury gradient
- Phone number
- Status badge (Registered/Guest)
- Stats (Orders, Total Spent, Joined Date)
- Hover effects dengan luxury styling
- Click handler untuk navigation

**CSS Classes**:
- `.customerCard` - Main card container
- `.customerCard__header` - Header section
- `.customerCard__info` - Customer info
- `.customerCard__name` - Customer name dengan gradient
- `.customerCard__phone` - Phone number
- `.customerCard__badges` - Badges container
- `.customerCard__stats` - Stats grid
- `.customerCard__stat` - Individual stat
- `.customerCard__statLabel` - Stat label
- `.customerCard__statValue` - Stat value dengan gradient

**Usage**:
```tsx
<CustomerCard
  customerId={customer._id}
  name={customer.buyerName}
  phone={customer.phoneNumber}
  totalOrders={customer.stats?.totalOrders || 0}
  totalSpent={formatIDR(customer.stats?.totalSpent || 0)}
  joinedDate={formatDate(customer.createdAt)}
  isRegistered={!!customer.userId}
  onClick={(id) => handleCustomerClick(id)}
/>
```

### 3. List View Components

**Search Input**:
- Debounced search (300ms)
- Luxury styling dengan focus effects
- Real-time filtering

**Filter & Sort**:
- Filter by registration status
- Sort by multiple criteria
- Luxury dropdown styling

**Export Button**:
- Export to CSV functionality
- Luxury gold gradient styling
- Hover effects

### 4. Detail View Components

**Quick Actions**:
- WhatsApp link
- Phone call link
- View orders button
- Luxury styling dengan hover effects

**Customer Info Card**:
- Name, phone, address
- Registration status badge
- User ID (if registered)
- Join date
- Saved addresses list

**Stats Card**:
- Total orders
- Total spent dengan luxury gradient
- Last order date

**Favorites Card**:
- Favorite bouquets list
- Order count per bouquet
- Luxury card styling

**Status Breakdown Card**:
- Order status breakdown
- Count per status
- Luxury grid layout

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

### CSS Files

1. **CustomersSection.css**: Styling untuk main section, list view, detail view, cards, stats
2. **CustomerCard.css**: Styling untuk customer card component

## Responsive Design

Semua komponen fully responsive dengan breakpoints:

- **Mobile** (`max-width: 768px`): Single column layout, stacked controls
- **Tablet** (`768px - 1024px`): 2-column layout
- **Desktop** (`min-width: 1024px`): Multi-column layout

Media queries menggunakan design system variables:
```css
@media (max-width: 768px) {
  .customersSection {
    padding: 1rem;
  }
  
  .customersSection__header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .customersSection__list {
    grid-template-columns: 1fr;
  }
}
```

## Reusability

### Modular Components

Setiap komponen dirancang untuk reusable:

1. **Props-based configuration**: Semua behavior dikonfigurasi melalui props
2. **No hardcoded dependencies**: Tidak ada hardcoded API calls atau business logic
3. **Composition over inheritance**: Menggunakan composition pattern
4. **Single Responsibility**: Setiap komponen memiliki satu tanggung jawab

### Example: Reusing CustomerCard

```tsx
// Di customers section
<CustomerCard
  customerId={customer._id}
  name={customer.buyerName}
  phone={customer.phoneNumber}
  totalOrders={customer.stats?.totalOrders || 0}
  onClick={handleClick}
/>

// Di orders section (dengan customer info)
<CustomerCard
  customerId={order.customerId}
  name={order.buyerName}
  phone={order.phoneNumber}
  totalOrders={undefined}
  onClick={handleCustomerClick}
/>
```

## Best Practices

### 1. DRY (Don't Repeat Yourself)

- **CSS Variables**: Semua styling menggunakan design system variables
- **Reusable Components**: CustomerCard dapat digunakan di berbagai tempat
- **Utility Functions**: formatDate, formatIDR digunakan secara konsisten

### 2. SOLID Principles

- **Single Responsibility**: Setiap komponen/method memiliki satu tanggung jawab
- **Open/Closed**: Extensible melalui props, tidak perlu modify existing code
- **Liskov Substitution**: Components dapat diganti dengan implementasi lain
- **Interface Segregation**: Props interfaces yang spesifik dan minimal
- **Dependency Inversion**: Bergantung pada abstractions (props), bukan concrete implementations

### 3. Performance Optimization

- **Debouncing**: Search input debounced (300ms)
- **Lazy Loading**: Stats loaded on demand
- **Memoization**: Filtered and sorted results cached
- **Reduced Motion**: Support untuk `prefers-reduced-motion`

### 4. Accessibility (A11y)

- **ARIA Labels**: Semua interactive elements memiliki aria-label
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Screen Reader Support**: Semantic HTML dan ARIA attributes

## Usage Examples

### Basic Usage

```tsx
import CustomersSection from './sections/customers-section';

function AdminDashboard() {
  return (
    <CustomersSection
      onSelectCustomer={(customerId) => {
        console.log('Selected customer:', customerId);
      }}
    />
  );
}
```

### With Custom Handler

```tsx
<CustomersSection
  onSelectCustomer={(customerId) => {
    // Navigate to customer detail page
    navigate(`/admin/customers/${customerId}`);
  }}
/>
```

## API Integration

### Endpoints Used

1. **GET `/api/customers`**: Get customers list
   - Query params: `q` (search query), `limit` (max results)
   - Returns: Array of Customer objects

2. **GET `/api/orders?customerId={id}`**: Get orders for customer
   - Used to calculate customer stats
   - Returns: Array of Order objects

### Data Flow

```
User Action → Component State → API Call → Data Processing → State Update → UI Render
```

## Troubleshooting

### Common Issues

1. **Customers tidak muncul**: Check API endpoint dan authentication
2. **Search tidak bekerja**: Check debounce timer dan API query params
3. **Stats tidak muncul**: Check orders API endpoint
4. **Styling tidak konsisten**: Pastikan `design-system.css` di-import
5. **Export tidak bekerja**: Check browser console untuk errors

### Debug Tips

- Check browser console untuk errors
- Verify API responses di Network tab
- Check state updates di React DevTools
- Inspect CSS variables di DevTools
- Verify design system variables tersedia

## Future Enhancements

- [ ] Pagination untuk large customer lists
- [ ] Advanced filtering (by date range, order count, etc.)
- [ ] Bulk actions (export selected, tag customers, etc.)
- [ ] Customer notes/remarks
- [ ] Customer segmentation
- [ ] Customer analytics dashboard
- [ ] Integration dengan CRM systems
- [ ] Email/SMS notifications
- [ ] Customer loyalty program integration

## Contributing

Saat menambahkan fitur baru:

1. **Follow MVC pattern**: Pisahkan Model, View, Controller
2. **Use Design System**: Gunakan CSS variables dari design system
3. **Make it Reusable**: Design components untuk reusable
4. **Add Documentation**: Update README ini
5. **Test Responsive**: Test di mobile, tablet, desktop
6. **Check Accessibility**: Verify keyboard navigation dan screen readers
7. **Follow Naming Convention**: Gunakan prefix `customers` untuk section classes, `customerCard` untuk card classes

---

**Last Updated**: 2024
**Maintainer**: Development Team

