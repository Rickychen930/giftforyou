# Store Location Section Upgrade - Luxury & Elegant

## Overview
Store Location Section telah di-upgrade menjadi lebih luxury, elegant, UI/UX clean, dan responsive di semua device dengan menggunakan prinsip MVP, OOP, DRY, dan SOLID.

## Architecture

### Component Structure (OOP & SOLID)
Store Location Section menggunakan component-based architecture dengan reusable components:

1. **StoreLocationSection** (Main View Component)
   - **Responsibility**: Orchestrates all sub-components and displays store information
   - **Location**: `src/view/sections/StoreLocationSection.tsx`
   - **Extends**: React.Component
   - **MVC Pattern**: View layer - only handles presentation

2. **StoreMap** (NEW - Reusable Component)
   - **Responsibility**: Displays Google Maps embed with loading states and directions button
   - **Location**: `src/components/store-location/StoreMap.tsx`
   - **Props**: `embedUrl`, `directionsUrl`, `title`, `className`
   - **Single Responsibility**: Only handles map rendering

3. **StoreLocationCard** (Reusable Component)
   - **Responsibility**: Base card component for all store information cards
   - **Location**: `src/components/store-location/StoreLocationCard.tsx`
   - **Props**: `icon`, `title`, `children`, `variant`, `className`
   - **Single Responsibility**: Only handles card structure

4. **StoreAddressCard** (Reusable Component)
   - **Responsibility**: Displays store address with copy and directions actions
   - **Location**: `src/components/store-location/StoreAddressCard.tsx`
   - **Props**: `name`, `address`, `city`, `mapDirectionsUrl`
   - **Single Responsibility**: Only handles address display

5. **StoreContactCard** (Reusable Component)
   - **Responsibility**: Displays contact information (phone, email, WhatsApp)
   - **Location**: `src/components/store-location/StoreContactCard.tsx`
   - **Props**: `phone`, `email`, `whatsappUrl`
   - **Single Responsibility**: Only handles contact display

6. **StoreHoursCard** (Reusable Component)
   - **Responsibility**: Displays store operating hours
   - **Location**: `src/components/store-location/StoreHoursCard.tsx`
   - **Props**: `hours`
   - **Single Responsibility**: Only handles hours display

7. **StoreSocialLinks** (Reusable Component)
   - **Responsibility**: Displays social media links (Instagram, TikTok)
   - **Location**: `src/components/store-location/StoreSocialLinks.tsx`
   - **Props**: `instagram`, `tiktok`, `className`
   - **Single Responsibility**: Only handles social links display

## Design System Integration

### CSS Variables Used
- `--gradient-elegant-surface`: Card backgrounds
- `--border-luxury`: Card borders
- `--brand-rose-border`: Border colors
- `--shadow-luxury-*`: Luxury shadows
- `--backdrop-blur-*`: Glass morphism effects
- `--luxury-gold-*`: Gold accents
- `--brand-rose-*`: Brand colors
- `--transition-elegant`: Smooth transitions
- `--radius-*`: Border radius
- `--space-*`: Spacing system

### Luxury Features
1. **Glass Morphism**: Backdrop blur effects on cards and buttons
2. **Gradient Overlays**: Elegant gradient backgrounds
3. **Smooth Animations**: Cubic-bezier transitions
4. **Hover Effects**: Transform and shadow enhancements
5. **Gold Accents**: Luxury gold color scheme
6. **Premium Typography**: Elegant font weights and spacing
7. **Map Integration**: Luxury-styled Google Maps embed

## Responsive Design

### Breakpoints
- **Desktop** (>1024px): 2-column grid, sticky map, full spacing
- **Tablet** (768-1024px): 2-column grid, static map, medium spacing
- **Mobile** (<768px): 1-column grid, map first, compact spacing
- **Small Mobile** (<640px): Single column, minimal spacing

### Responsive Features
1. **Grid Layout**: Responsive grid with `clamp()` for fluid sizing
2. **Sticky Map**: Map stays visible on desktop while scrolling
3. **Touch Support**: Mobile-specific styles
4. **Reduced Motion**: Respects `prefers-reduced-motion`
5. **Flexible Layouts**: Uses `clamp()` and `minmax()` for optimal sizing

## Functions & Interactions

### Core Functions
1. **Map Loading**: Skeleton display while loading, fade-in when loaded
2. **Copy Address**: Copy button functionality
3. **Directions**: Opens Google Maps directions
4. **Contact Links**: Phone, email, WhatsApp integration
5. **Social Links**: Instagram and TikTok integration
6. **Hover Effects**: Interactive card animations

### Event Handlers
- Map iframe `onLoad`: Tracks loading state
- Copy button: Handles address copying
- Directions link: Opens Google Maps
- Contact links: Phone/email/WhatsApp actions
- Social links: External navigation

## Performance Optimizations

1. **Lazy Loading**: Map iframe uses `loading="lazy"`
2. **Skeleton States**: Loading indicators for map
3. **CSS Containment**: Uses `isolation: isolate` for performance
4. **Will-Change**: Optimizes transform animations
5. **Sticky Positioning**: Efficient map positioning on desktop

## Accessibility (A11y)

### ARIA Labels
- `aria-label`: Descriptive labels for all interactive elements
- `aria-labelledby`: Section labeling
- `aria-hidden`: Hides decorative elements

### Keyboard Navigation
- Focus states: Visible focus rings
- Tab order: Logical navigation flow
- Enter/Space keys: Support for interactive elements

### Screen Reader Support
- Descriptive labels for all links and buttons
- Proper semantic HTML
- Map iframe with descriptive title

## File Structure

```
src/view/sections/
├── StoreLocationSection.tsx (Main view - updated)

src/components/store-location/
├── StoreMap.tsx (NEW)
├── StoreLocationCard.tsx (Updated)
├── StoreAddressCard.tsx (Updated)
├── StoreContactCard.tsx (Updated)
├── StoreHoursCard.tsx (Updated)
└── StoreSocialLinks.tsx (Updated)

src/styles/
├── StoreLocationSection.css (Updated)
└── store-location/
    ├── StoreMap.css (NEW)
    ├── StoreLocationCard.css (Updated)
    ├── StoreAddressCard.css (Updated)
    ├── StoreContactCard.css (Updated)
    ├── StoreHoursCard.css (Updated)
    └── StoreSocialLinks.css (Updated)
```

## Usage Example

```tsx
import StoreLocationSection from "./view/sections/StoreLocationSection";
import { storeData } from "./models/store-model";

<StoreLocationSection data={storeData} />
```

## Testing Checklist

### Desktop Testing (>1024px)
- [x] 2-column layout displays correctly
- [x] Map is sticky and visible
- [x] Cards display in grid
- [x] Hover effects work
- [x] All interactions functional
- [x] Map loads properly

### Tablet Testing (768-1024px)
- [x] 2-column layout
- [x] Map displays correctly
- [x] Cards readable
- [x] Touch interactions work
- [x] Performance good

### Mobile Testing (<768px)
- [x] 1-column layout
- [x] Map appears first
- [x] Cards stack vertically
- [x] Touch-friendly buttons
- [x] No horizontal scroll
- [x] Performance optimal

### Function Testing
- [x] Map loading works
- [x] Copy address works
- [x] Directions link works
- [x] Contact links work
- [x] Social links work
- [x] Hover effects work

## Browser Compatibility

### Modern Browsers
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

### CSS Features Used
- ✅ CSS Grid
- ✅ CSS Variables
- ✅ Backdrop Filter
- ✅ Sticky Positioning
- ✅ CSS Animations

## Conclusion

Store Location Section telah di-upgrade dengan:
- ✅ **Luxury & Elegant**: Premium design dengan glass morphism dan gold accents
- ✅ **UI/UX Clean**: Clean interface dengan clear hierarchy
- ✅ **Efficient**: Reusable components dengan single responsibility
- ✅ **Responsive**: Fully responsive di semua devices
- ✅ **OOP**: Class-based components dengan proper encapsulation
- ✅ **SOLID**: Single responsibility untuk setiap component
- ✅ **DRY**: Reusable components menghindari code duplication
- ✅ **MVP**: Clear separation antara Model (data), View (components), Controller (logic)

Semua functions berjalan dengan baik dan responsive di semua device.

