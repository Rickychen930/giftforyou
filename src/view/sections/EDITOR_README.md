# Admin Editor Components Documentation

## Overview

Admin Editor components adalah kumpulan komponen modular dan reusable untuk mengelola (create, read, update, delete) data bouquet dan collection di admin dashboard. Semua komponen mengikuti prinsip **Luxury & Elegant Design**, **Responsive**, **Efisien & Reusable**, dan menggunakan **Design System** yang konsisten.

## Architecture

### MVC Pattern

Komponen editor mengikuti arsitektur MVC (Model-View-Controller) untuk pemisahan concern yang jelas:

#### **Model** (`src/models/bouquet-editor-model.ts`)
- **Tanggung Jawab**: Hanya untuk data dan business logic
- **Fungsi**:
  - Validasi form (`validateField`, `validateForm`)
  - Image processing (`compressImage`, `isAcceptableImage`)
  - Form data building (`buildFormData`)
  - Utility functions (`formatPrice`, `formatBytes`, dll)
- **Tidak mengandung**: UI logic atau event handlers

#### **View** (`src/view/bouquet-editor-view.tsx`)
- **Tanggung Jawab**: Fokus pada tampilan (presentation)
- **Fungsi**:
  - Render UI components
  - Format display data
  - Handle visual feedback
- **Tidak mengandung**: Business logic atau state management kompleks

#### **Controller** (`src/controllers/bouquet-editor-controller.tsx`)
- **Tanggung Jawab**: Menangani logika interaksi
- **Fungsi**:
  - Event handlers (onChange, onSubmit, dll)
  - State management
  - API calls coordination
  - User interaction logic
- **Tidak mengandung**: Business logic (didelegasikan ke Model)

### Component Structure

```
BouquetEditorSection (Main Container)
├── CollectionListView (List semua collections)
│   └── CollectionCard (Individual collection card)
├── CollectionDetailView (Detail collection dengan bouquets)
│   └── BouquetCard (Individual bouquet card)
└── BouquetEditForm (Form edit bouquet)
    └── BouquetCardEditComponent
        ├── BouquetEditorController (Controller)
        └── BouquetEditorView (View)
```

## Components

### 1. BouquetEditorSection

**File**: `src/view/sections/Bouquet-editor-section.tsx`

**Deskripsi**: Main container component yang mengelola navigasi antara collections, collection detail, dan bouquet edit form.

**Props**:
```typescript
interface Props {
  bouquets: Bouquet[];
  collections: string[] | Collection[];
  onSave: (formData: FormData) => Promise<boolean>;
  onDuplicate?: (bouquetId: string) => Promise<void>;
  onDelete?: (bouquetId: string) => Promise<void>;
  onUpdateCollection?: (collectionId: string, name: string) => Promise<boolean>;
  onMoveBouquet?: (bouquetId: string, targetCollectionId: string) => Promise<boolean>;
  onDeleteCollection?: (collectionId: string) => Promise<boolean>;
}
```

**Features**:
- State management untuk view navigation (collections, collection-detail, bouquet-edit)
- Collection management (create, update, delete)
- Bouquet management (move, delete, duplicate)
- Auto-sync dengan props changes

**Usage**:
```tsx
<BouquetEditorSection
  bouquets={bouquets}
  collections={collections}
  onSave={handleSave}
  onDuplicate={handleDuplicate}
  onDelete={handleDelete}
/>
```

### 2. CollectionListView

**File**: `src/view/sections/CollectionListView.tsx`

**Deskripsi**: Menampilkan daftar semua collections dalam bentuk grid cards.

**Props**:
```typescript
interface Props {
  collections: Collection[];
  onCollectionSelect: (collectionId: string) => void;
  onCollectionUpdate: (collectionId: string, newName: string) => Promise<boolean>;
  onCollectionDelete?: (collectionId: string) => Promise<boolean>;
}
```

**Features**:
- Grid layout dengan responsive design
- Inline editing untuk collection name
- Delete confirmation modal
- Empty state handling

### 3. CollectionDetailView

**File**: `src/view/sections/CollectionDetailView.tsx`

**Deskripsi**: Menampilkan detail collection beserta semua bouquets di dalamnya.

**Props**:
```typescript
interface Props {
  collection: Collection;
  bouquets: Bouquet[];
  allCollections: Collection[];
  onBack: () => void;
  onBouquetSelect: (bouquet: Bouquet) => void;
  onBouquetMove: (bouquetId: string, targetCollectionId: string) => Promise<boolean>;
  onBouquetDelete: (bouquetId: string) => Promise<void>;
  onBouquetDuplicate: (bouquetId: string) => Promise<void>;
}
```

**Features**:
- Grid layout untuk bouquets
- Move bouquet ke collection lain
- Delete bouquet dengan confirmation
- Duplicate bouquet
- PDF export untuk collection

### 4. BouquetEditForm

**File**: `src/view/sections/bouquet-edit-form.tsx`

**Deskripsi**: Form wrapper untuk edit bouquet dengan collection selector.

**Props**:
```typescript
interface Props {
  bouquet: Bouquet;
  collections: Collection[];
  onSave: (formData: FormData) => Promise<boolean>;
  onBack: () => void;
}
```

**Features**:
- Collection selector dropdown
- Form validation
- Auto-save state management

### 5. BouquetCardEditComponent

**File**: `src/components/bouquet-card-edit-component.tsx`

**Deskripsi**: Main entry point yang menghubungkan Controller dan View.

**Props**:
```typescript
interface Props {
  bouquet: Bouquet;
  collections: string[];
  onSave: (formData: FormData) => Promise<boolean> | void;
  onDuplicate?: (bouquetId: string) => Promise<void>;
  onDelete?: (bouquetId: string) => Promise<void>;
}
```

**Architecture**: Mengikuti SOLID principles:
- **Single Responsibility**: Hanya menghubungkan Controller dan View
- **Open/Closed**: Extensible melalui props
- **Dependency Inversion**: Bergantung pada Controller abstraction

### 6. BouquetEditorController

**File**: `src/controllers/bouquet-editor-controller.tsx`

**Deskripsi**: Controller yang menangani semua event handlers dan state management.

**State Management**:
- Form state (initialForm, form)
- UI state (saving, preview, saveStatus, dll)
- Validation state (fieldErrors, touchedFields)
- Dropdown options

**Methods**:
- `handleFieldChange`: Update form field
- `handleImageChange`: Handle image upload
- `handleSave`: Save form data
- `handleDuplicate`: Duplicate bouquet
- `handleDelete`: Delete bouquet
- `validateField`: Validate single field
- `validateForm`: Validate entire form

### 7. BouquetEditorView

**File**: `src/view/bouquet-editor-view.tsx`

**Deskripsi**: View component yang hanya menangani presentation.

**Render Methods**:
- `renderHeader`: Header dengan title dan status
- `renderImageSection`: Image upload dengan drag & drop
- `renderFormFields`: Form fields (name, description, price, dll)
- `renderFooter`: Save button dan status message

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
```

### CSS Files

1. **DashboardEditorSection.css**: Styling untuk search bar, bulk actions, bouquet cards
2. **BouquetEditor.css**: Styling untuk editor section, search, filters, pagination
3. **BouquetCardEditComponent.css**: Styling untuk form fields, image upload, save button
4. **BouquetEditorSection.css**: Container styling
5. **CollectionListView.css**: Collection list grid styling
6. **CollectionDetailView.css**: Collection detail styling
7. **BouquetEditForm.css**: Form wrapper styling

## Responsive Design

Semua komponen fully responsive dengan breakpoints:

- **Mobile** (`max-width: 767px`): Single column layout
- **Tablet** (`768px - 1023px`): 2-column layout
- **Desktop** (`min-width: 1024px`): Multi-column layout

Media queries menggunakan design system variables:
```css
@media (max-width: 767px) {
  /* Mobile styles */
}

@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

## Reusability

### Modular Components

Setiap komponen dirancang untuk reusable:

1. **Props-based configuration**: Semua behavior dikonfigurasi melalui props
2. **No hardcoded dependencies**: Tidak ada hardcoded API calls atau business logic
3. **Composition over inheritance**: Menggunakan composition pattern
4. **Single Responsibility**: Setiap komponen memiliki satu tanggung jawab

### Example: Reusing BouquetCardEditComponent

```tsx
// Di dashboard
<BouquetCardEditComponent
  bouquet={bouquet}
  collections={collections}
  onSave={handleSave}
/>

// Di collection detail
<BouquetCardEditComponent
  bouquet={bouquet}
  collections={collections}
  onSave={handleSave}
  onDuplicate={handleDuplicate}
  onDelete={handleDelete}
/>
```

## Best Practices

### 1. DRY (Don't Repeat Yourself)

- **CSS Variables**: Semua styling menggunakan design system variables
- **Utility Functions**: Reusable functions di `bouquet-editor-model.ts`
- **Component Composition**: Reuse components instead of duplicating code

### 2. SOLID Principles

- **Single Responsibility**: Setiap komponen/class memiliki satu tanggung jawab
- **Open/Closed**: Extensible melalui props, tidak perlu modify existing code
- **Liskov Substitution**: Components dapat diganti dengan implementasi lain
- **Interface Segregation**: Props interfaces yang spesifik dan minimal
- **Dependency Inversion**: Bergantung pada abstractions (props), bukan concrete implementations

### 3. Performance Optimization

- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive calculations cached
- **Debouncing**: Search input debounced
- **Image Compression**: Images compressed before upload
- **Reduced Motion**: Support untuk `prefers-reduced-motion`

### 4. Accessibility (A11y)

- **ARIA Labels**: Semua interactive elements memiliki aria-label
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Proper focus handling
- **Screen Reader Support**: Semantic HTML dan ARIA attributes

## Usage Examples

### Basic Usage

```tsx
import BouquetEditorSection from './sections/Bouquet-editor-section';

function AdminDashboard() {
  const handleSave = async (formData: FormData) => {
    // Save logic
    return true;
  };

  return (
    <BouquetEditorSection
      bouquets={bouquets}
      collections={collections}
      onSave={handleSave}
    />
  );
}
```

### With All Features

```tsx
<BouquetEditorSection
  bouquets={bouquets}
  collections={collections}
  onSave={handleSave}
  onDuplicate={handleDuplicate}
  onDelete={handleDelete}
  onUpdateCollection={handleUpdateCollection}
  onMoveBouquet={handleMoveBouquet}
  onDeleteCollection={handleDeleteCollection}
/>
```

## Troubleshooting

### Common Issues

1. **Form tidak save**: Pastikan `onSave` return `Promise<boolean>`
2. **Image tidak upload**: Check file size dan format (max 5MB, JPG/PNG)
3. **Collection tidak muncul**: Pastikan collections array tidak empty
4. **Styling tidak konsisten**: Pastikan `design-system.css` di-import

### Debug Tips

- Check browser console untuk errors
- Verify props yang dikirim ke components
- Check network tab untuk API calls
- Inspect CSS variables di DevTools

## Future Enhancements

- [ ] Bulk edit multiple bouquets
- [ ] Advanced filtering dan sorting
- [ ] Image gallery dengan preview
- [ ] Undo/Redo functionality
- [ ] Auto-save draft
- [ ] Export/Import collections

## Contributing

Saat menambahkan fitur baru:

1. **Follow MVC pattern**: Pisahkan Model, View, Controller
2. **Use Design System**: Gunakan CSS variables dari design system
3. **Make it Reusable**: Design components untuk reusable
4. **Add Documentation**: Update README ini
5. **Test Responsive**: Test di mobile, tablet, desktop
6. **Check Accessibility**: Verify keyboard navigation dan screen readers

---

**Last Updated**: 2024
**Maintainer**: Development Team

