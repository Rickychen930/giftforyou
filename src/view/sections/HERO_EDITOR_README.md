# Admin Hero Editor Components Documentation

## Overview

Admin Hero Editor components adalah kumpulan komponen modular dan reusable untuk mengelola hero slider di homepage. Semua komponen mengikuti prinsip **Luxury & Elegant Design**, **Responsive**, **Efisien & Reusable**, dan menggunakan **Design System** yang konsisten.

## Architecture

### MVC Pattern

Komponen hero editor mengikuti arsitektur MVC (Model-View-Controller) untuk pemisahan concern yang jelas:

#### **Model** (Data Types)
- **Tanggung Jawab**: Hanya untuk data dan type definitions
- **Fungsi**:
  - Type definitions untuk HeroSlide, HeroSliderContent
  - Data structures untuk slider content
  - Utility functions untuk data formatting (normalizeImageUrl, buildCollectionHref)
- **Tidak mengandung**: UI logic atau event handlers

#### **View** (`src/view/sections/HeroSliderEditorSection.tsx`)
- **Tanggung Jawab**: Fokus pada tampilan (presentation)
- **Fungsi**:
  - Render hero slider editor form
  - Format display data
  - Handle visual feedback
- **Tidak mengandung**: Business logic kompleks (didelegasikan ke API)

#### **Controller** (Component State Management)
- **Tanggung Jawab**: Menangani logika interaksi dan state management
- **Fungsi**:
  - Load data dari API
  - Handle form updates
  - Drag & drop functionality
  - Image upload dengan progress
  - Save functionality
  - Validation
- **Tidak mengandung**: Business logic (didelegasikan ke backend)

### Component Structure

```
HeroSliderEditorSection (Main Container)
├── Header
│   ├── Title dengan luxury gradient
│   ├── Subtitle
│   ├── Stats (slide count)
│   └── Actions (Clear All, Add Slide, Save)
├── Card Container
│   ├── Heading Input
│   └── Slides List
│       └── SlideCard[] (Drag & drop enabled)
│           ├── Slide Header (Index, ID, Actions)
│           ├── Form Fields
│           │   ├── Collection Link (Quick Fill)
│           │   ├── Badge
│           │   ├── Title
│           │   ├── Subtitle
│           │   └── Image (Upload/URL)
│           ├── CTA Primary Group
│           └── CTA Secondary Group
└── Zoom Modal (Image preview)
```

## Components

### 1. HeroSliderEditorSection

**File**: `src/view/sections/HeroSliderEditorSection.tsx`

**Deskripsi**: Main container component yang mengelola hero slider editor.

**Props**:
```typescript
interface Props {
  collections: string[];
  onSaved?: () => void | Promise<void>;
}
```

**State**:
```typescript
interface HeroSliderEditorSectionState {
  loading: boolean;
  saving: boolean;
  error: string;
  success: string;
  heading: string;
  slides: HeroSlide[];
  uploading: Record<string, boolean>;
  uploadProgress: Record<string, number>;
  uploadError: Record<string, string>;
  draggedIndex: number | null;
  dragOverIndex: number | null;
  deleteConfirm: string | null;
  zoomedImage: string | null;
}
```

**Features**:
- Load hero slider data dari API
- Add/Remove/Duplicate slides
- Drag & drop untuk reorder slides
- Image upload dengan progress bar
- Image preview dengan zoom modal
- Form validation
- Save dengan error handling
- Quick fill dari collections

**Methods**:
- `loadData()`: Load hero slider dari API
- `getValidationError()`: Validate form data
- `updateSlide()`: Update slide data
- `updatePrimaryCta()`: Update primary CTA
- `updateSecondaryCta()`: Update secondary CTA
- `removeSlide()`: Remove slide
- `duplicateSlide()`: Duplicate slide
- `addSlide()`: Add new slide
- `moveSlide()`: Move slide up/down
- `handleDragStart/Over/Leave/Drop/End()`: Drag & drop handlers
- `setSlideCollection()`: Quick fill dari collection
- `uploadSlideImage()`: Upload image dengan progress
- `save()`: Save hero slider
- `clearAll()`: Clear all slides
- `renderSlideCard()`: Render individual slide card

**Usage**:
```tsx
<HeroSliderEditorSection
  collections={collections}
  onSaved={() => {
    // Handle save success
  }}
/>
```

### 2. Slide Card

**Deskripsi**: Individual slide card dengan drag & drop support.

**Features**:
- Drag & drop untuk reorder
- Form fields untuk slide data
- Image upload dengan progress
- Image preview dengan zoom
- Quick fill dari collections
- CTA groups (Primary & Secondary)
- Action buttons (Move, Duplicate, Delete)

**CSS Classes**:
- `.hsSlideCard` - Main card container
- `.hsSlideCard--dragging` - Dragging state
- `.hsSlideCard--dragover` - Drag over state
- `.hsSlideCard__top` - Card header
- `.hsSlideCard__meta` - Slide metadata
- `.hsSlideCard__index` - Slide index dengan gradient
- `.hsSlideCard__id` - Slide ID
- `.hsSlideCard__actions` - Action buttons container
- `.hsSlideCard__grid` - Form fields grid

### 3. Form Fields

**Input Fields**:
- Collection link dropdown (quick fill)
- Badge input
- Title input (required)
- Subtitle textarea
- Image file input atau URL input

**CSS Classes**:
- `.hsField` - Field container
- `.hsField--full` - Full width field
- `.hsLabel` - Field label dengan bullet
- `.hsLabel--sub` - Sub label
- `.hsAltSource` - Alternative source container

### 4. CTA Groups

**Primary CTA**:
- Label input (required)
- Href input (required)

**Secondary CTA** (Optional):
- Label input
- Href input

**CSS Classes**:
- `.hsFieldGroup` - CTA group container
- `.hsGroupTitle` - Group title dengan gradient

### 5. Image Upload

**Features**:
- File upload dengan validation
- Progress bar dengan animation
- Error handling
- URL/path alternative input
- Image preview dengan zoom

**CSS Classes**:
- `.hsUploadProgress` - Progress container
- `.hsUploadProgress__bar` - Progress bar
- `.hsUploadProgress__fill` - Progress fill dengan gradient
- `.hsUploadProgress__text` - Progress text
- `.hsPreviewRow` - Preview row
- `.hsPreviewLabel` - Preview label
- `.hsPreviewWrapper` - Preview wrapper
- `.hsPreview` - Preview image
- `.hsPreviewOverlay` - Preview overlay dengan zoom icon

### 6. Zoom Modal

**Features**:
- Full screen image preview
- Click outside to close
- Escape key to close
- Close button dengan luxury styling

**CSS Classes**:
- `.hsZoomModal` - Modal container
- `.hsZoomModal__content` - Modal content
- `.hsZoomModal__close` - Close button

### 7. Buttons

**Primary Button**:
- Save button dengan luxury gold gradient
- Loading state dengan spinner

**Secondary Buttons**:
- Add Slide button
- Clear All button (ghost variant)

**Mini Buttons**:
- Move up/down
- Duplicate
- Delete (danger variant)

**CSS Classes**:
- `.hsEditor__btn` - Main button
- `.hsEditor__btn--primary` - Primary button dengan luxury gold
- `.hsEditor__btn--ghost` - Ghost button
- `.hsMiniBtn` - Mini button
- `.hsMiniBtn--secondary` - Secondary variant
- `.hsMiniBtn--danger` - Danger variant

### 8. Alerts & States

**Success Alert**:
- Luxury gold styling
- Auto-dismiss setelah 5 detik

**Error Alert**:
- Error styling dengan border

**Loading State**:
- Spinner dengan luxury styling

**Empty State**:
- Empty state dengan icon dan message

**CSS Classes**:
- `.hsAlert` - Alert container
- `.hsAlert--success` - Success variant dengan luxury gold
- `.hsAlert--error` - Error variant
- `.hsAlert--small` - Small variant
- `.hsState` - Loading state
- `.hsState--small` - Small loading state
- `.hsEmpty` - Empty state

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

**HeroSliderEditorSection.css**: Styling untuk semua hero editor components, termasuk:
- Main editor container
- Header dengan title gradient
- Buttons dengan luxury styling
- Form fields
- Slide cards dengan drag & drop
- Image upload dengan progress
- Zoom modal
- Alerts & states

## Responsive Design

Semua komponen fully responsive dengan breakpoints:

- **Mobile** (`max-width: 640px`): Single column layout, stacked controls
- **Tablet** (`640px - 1024px`): 2-column layout untuk form fields
- **Desktop** (`min-width: 1024px`): Multi-column layout

Media queries menggunakan design system variables:
```css
@media (max-width: 768px) {
  .hsEditor {
    padding: clamp(1rem, 2vw, 1.5rem);
    border-radius: 20px;
  }
  
  .hsSlideCard__grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .hsFieldGroup {
    grid-template-columns: 1fr;
    gap: 1.1rem;
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

### Example: Reusing Slide Card Structure

```tsx
// Slide card dapat digunakan di berbagai konteks
private renderSlideCard(slide: HeroSlide, index: number): React.ReactNode {
  return (
    <article className="hsSlideCard">
      {/* Slide content */}
    </article>
  );
}
```

## Best Practices

### 1. DRY (Don't Repeat Yourself)

- **CSS Variables**: Semua styling menggunakan design system variables
- **Reusable Methods**: Common rendering logic di-extract ke methods
- **Utility Functions**: normalizeImageUrl, buildCollectionHref digunakan secara konsisten

### 2. SOLID Principles

- **Single Responsibility**: Setiap method memiliki satu tanggung jawab
- **Open/Closed**: Extensible melalui props, tidak perlu modify existing code
- **Liskov Substitution**: Components dapat diganti dengan implementasi lain
- **Interface Segregation**: Props interfaces yang spesifik dan minimal
- **Dependency Inversion**: Bergantung pada abstractions (props), bukan concrete implementations

### 3. Performance Optimization

- **Debouncing**: Upload progress updates debounced
- **Lazy Loading**: Images loaded on demand
- **Memoization**: Expensive calculations cached
- **Reduced Motion**: Support untuk `prefers-reduced-motion`
- **Will-change**: CSS property untuk smooth animations

### 4. Accessibility (A11y)

- **ARIA Labels**: Semua interactive elements memiliki aria-label
- **Keyboard Navigation**: Full keyboard support (Enter, Space, Escape)
- **Focus Management**: Proper focus handling
- **Screen Reader Support**: Semantic HTML dan ARIA attributes
- **Drag & Drop**: Keyboard accessible dengan Enter/Space

## Usage Examples

### Basic Usage

```tsx
import HeroSliderEditorSection from './sections/HeroSliderEditorSection';

function AdminDashboard() {
  const collections = ["Best Sellers", "Wedding Collection", "New Edition"];
  
  return (
    <HeroSliderEditorSection
      collections={collections}
      onSaved={() => {
        console.log('Hero slider saved!');
      }}
    />
  );
}
```

### With Custom Handler

```tsx
<HeroSliderEditorSection
  collections={collections}
  onSaved={async () => {
    // Refresh page data
    await refreshHomepage();
    // Show success notification
    showNotification('Hero slider berhasil disimpan!');
  }}
/>
```

## API Integration

### Endpoints Used

1. **GET `/api/hero-slider/home`**: Get hero slider content
   - Returns: HeroSliderContent object dengan heading dan slides

2. **PUT `/api/hero-slider/home`**: Save hero slider content
   - Body: HeroSliderContent object
   - Returns: Success/error response

3. **POST `/api/hero-slider/home/upload`**: Upload slide image
   - Body: FormData dengan image file
   - Returns: { path: string } - Image path

### Data Flow

```
User Action → Component State → API Call → Data Processing → State Update → UI Render
```

## Drag & Drop

### Implementation

- Native HTML5 Drag & Drop API
- Visual feedback dengan CSS classes
- Keyboard accessible dengan Enter/Space
- Smooth animations dengan CSS transitions

### States

- `draggedIndex`: Index dari slide yang sedang di-drag
- `dragOverIndex`: Index dari slide yang sedang di-drag over
- CSS classes: `.hsSlideCard--dragging`, `.hsSlideCard--dragover`

## Image Upload

### Features

- File validation (size, type)
- Progress bar dengan animation
- Error handling
- Alternative URL/path input
- Image preview dengan zoom

### Supported Formats

- JPEG/JPG
- PNG
- WebP
- HEIC/HEIF

### Max Size

- 5MB per file

## Troubleshooting

### Common Issues

1. **Slides tidak muncul**: Check API endpoint dan response format
2. **Image tidak upload**: Check file size dan format
3. **Drag & drop tidak bekerja**: Check browser support untuk HTML5 Drag & Drop
4. **Styling tidak konsisten**: Pastikan `design-system.css` di-import
5. **Validation error**: Check required fields (title, image, primary CTA)

### Debug Tips

- Check browser console untuk errors
- Verify API responses di Network tab
- Check state updates di React DevTools
- Inspect CSS variables di DevTools
- Verify design system variables tersedia
- Test drag & drop di berbagai browsers

## Future Enhancements

- [ ] Image cropping/resizing sebelum upload
- [ ] Multiple image formats support
- [ ] Slide templates/presets
- [ ] Preview mode (lihat seperti di homepage)
- [ ] Animation settings per slide
- [ ] Video support untuk slides
- [ ] A/B testing untuk different hero sliders
- [ ] Scheduled publishing
- [ ] Analytics integration

## Contributing

Saat menambahkan fitur baru:

1. **Follow MVC pattern**: Pisahkan Model, View, Controller
2. **Use Design System**: Gunakan CSS variables dari design system
3. **Make it Reusable**: Design components untuk reusable
4. **Add Documentation**: Update README ini
5. **Test Responsive**: Test di mobile, tablet, desktop
6. **Check Accessibility**: Verify keyboard navigation dan screen readers
7. **Follow Naming Convention**: Gunakan prefix `hs` untuk semua classes
8. **Test Drag & Drop**: Verify di berbagai browsers

---

**Last Updated**: 2024
**Maintainer**: Development Team

