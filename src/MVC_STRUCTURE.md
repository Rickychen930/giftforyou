# MVC Structure Documentation

Aplikasi ini menggunakan pattern **MVC (Model-View-Controller)** yang jelas untuk memisahkan concerns dan meningkatkan maintainability.

## Struktur Folder

```
src/
├── api/                 # Backend API (Express) - SEMUA backend code
│   ├── controllers/    # Backend controllers (Express Request/Response handlers)
│   ├── routes/         # Backend API routes
│   └── middleware/     # Backend middleware
│
├── models/              # Data models, domain models, business logic
│   ├── domain/         # Domain models (Bouquet, Collection, etc.)
│   └── *.ts            # Model definitions
│
├── view/                # Presentation layer (React pages)
│   └── *.tsx           # View components (pages)
│
├── controllers/         # Frontend controllers (React) - HANYA .tsx files
│   └── *.tsx           # Controllers yang menghubungkan models dan views
│
├── routes/              # Frontend routes (React Router)
│   └── *.tsx           # Route wrappers untuk React Router
│
├── components/          # Reusable UI components
├── services/            # Business logic services
├── utils/               # Utility functions
├── hooks/               # React custom hooks
├── config/              # Configuration files
├── constants/           # Constants
├── types/               # TypeScript type definitions
├── styles/              # CSS files
├── seed/                # Database seed scripts
└── server/              # Server entry point
    └── server.ts        # Express server setup
```

## Separation of Concerns

### Models (`src/models/`)
- **Purpose**: Data structure definitions, domain models, business logic
- **Files**: `bouquet-model.ts`, `collection-model.ts`, `order-model.ts`, etc.
- **Domain Models**: `domain/bouquet.ts`, `domain/collection.ts`
- **Responsibilities**:
  - Define data structures
  - Business logic validation
  - Data transformation

### Views (`src/views/`)
- **Purpose**: Presentation layer - pure React components for UI
- **Files**: `bouquet-catalog-page.tsx`, `bouquet-detail-page.tsx`, `home-page.tsx`, etc.
- **Responsibilities**:
  - Render UI
  - Handle user interactions (UI level)
  - Display data from controllers
  - **NOT responsible for**: Data fetching, business logic, state management

### Controllers (`src/controllers/`)
- **Purpose**: Frontend controllers - connect models and views
- **Files**: `bouquet-catalog-page-controller.tsx`, `bouquet-detail-controller.tsx`, etc.
- **Responsibilities**:
  - Fetch data from API
  - Manage component state
  - Handle business logic
  - Pass data to views
  - Handle user actions and events

### API Backend (`src/api/`)
- **Purpose**: Backend API (Express) - separate from frontend
- **Structure**:
  - `controllers/`: Express Request/Response handlers
  - `routes/`: API route definitions
  - `middleware/`: Express middleware (auth, validation, etc.)

## Flow Example: Bouquet Catalog

```
User Action
    ↓
View (bouquet-catalog-page.tsx)
    ↓ (calls controller methods)
Controller (bouquet-catalog-page-controller.tsx)
    ↓ (fetches data, manages state)
API Backend (src/api/routes/bouquet-routes.ts)
    ↓ (handles request)
Backend Controller (src/api/controllers/bouquet-controller.ts)
    ↓ (uses)
Model (src/models/bouquet-model.ts)
    ↓ (returns data)
Controller → View → User
```

## Migration Notes

### Backend Files
Backend files telah dipindahkan dan duplikat dihapus:
- ✅ `src/api/controllers/` - Backend controllers (digunakan oleh server)
- ✅ `src/api/routes/` - Backend API routes (digunakan oleh server)
- ✅ `src/api/middleware/` - Backend middleware (digunakan oleh server)
- ❌ `src/controllers/*.ts` (backend) - DIHAPUS (duplikat)
- ❌ `src/routes/*.ts` (backend) - DIHAPUS (duplikat)
- ❌ `src/middleware/*.ts` (backend) - DIHAPUS (duplikat)

### Frontend Files
Frontend files tetap di:
- ✅ `src/controllers/*.tsx` (frontend React controllers)
- ✅ `src/view/*.tsx` (React view components)
- ✅ `src/routes/*.tsx` (frontend React Router routes)

## Best Practices

1. **Models**: Pure data structures, no UI logic
2. **Views**: Pure presentation, no data fetching
3. **Controllers**: Handle data fetching, state management, business logic
4. **API Backend**: Separate from frontend, handles HTTP requests/responses
5. **Components**: Reusable UI components, can be used in views

## Import Paths

### From Views/Controllers
```typescript
// Import models
import type { Bouquet } from "../models/domain/bouquet";

// Import services
import { getCollections } from "../services/collection.service";

// Import utils
import { formatIDR } from "../utils/money";
```

### From API Controllers
```typescript
// Import models
import { BouquetModel } from "../../models/bouquet-model";

// Import middleware
import { authenticate } from "../middleware/auth-middleware";

// Import utils
import { normalizeString } from "../../utils/validation";
```

### From API Routes
```typescript
// Import controllers
import { getBouquets } from "../controllers/bouquet-controller";

// Import middleware
import { authenticate } from "../middleware/auth-middleware";
```

## File Naming Conventions

- **Models**: `*-model.ts` (e.g., `bouquet-model.ts`)
- **Views**: `*-page.tsx` (e.g., `bouquet-catalog-page.tsx`)
- **Frontend Controllers**: `*-controller.tsx` (e.g., `bouquet-catalog-page-controller.tsx`)
- **Backend Controllers**: `*-controller.ts` (e.g., `bouquet-controller.ts`)
- **Routes**: `*-routes.ts` (e.g., `bouquet-routes.ts`)

## Benefits of MVC Structure

1. **Separation of Concerns**: Clear boundaries between data, presentation, and logic
2. **Maintainability**: Easy to find and modify code
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Easy to add new features without affecting existing code
5. **Reusability**: Components and utilities can be reused across views

