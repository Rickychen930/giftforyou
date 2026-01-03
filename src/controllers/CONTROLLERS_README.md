# Controllers Documentation

## Overview

Semua controller telah direfactor untuk mengikuti prinsip **SOLID**, **DRY**, **OOP**, dan **MVC** dengan menggunakan base classes yang reusable.

## Architecture

### Frontend Controllers (`src/controllers/`)

Semua frontend controllers sekarang extend `BaseController` yang menyediakan:
- **AbortController management** - Otomatis cleanup saat unmount
- **Error handling** - Standardized error handling dengan user-friendly messages
- **SEO management** - Centralized SEO initialization dan updates
- **Luxury enhancements** - Fade-in, reveal-on-scroll, lazy loading images
- **Lifecycle management** - Proper cleanup untuk mencegah memory leaks

### Backend API Controllers (`src/api/controllers/`)

Semua backend controllers sekarang extend `BaseApiController` yang menyediakan:
- **Standardized responses** - Consistent API response format
- **Error handling** - User-friendly error messages dengan proper status codes
- **Input validation** - Reusable validation helpers
- **Logging** - Centralized error logging

## Base Classes

### BaseController

**Location**: `src/controllers/base/BaseController.tsx`

**Features**:
- AbortController management
- SEO initialization dan updates
- Luxury enhancements (fade-in, reveal-on-scroll, lazy loading)
- Error handling dengan user-friendly messages
- Safe fetch wrapper dengan AbortController support
- Safe JSON parsing

**Usage**:
```tsx
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";

interface MyControllerProps extends BaseControllerProps {}
interface MyControllerState extends BaseControllerState {
  // Your state
}

class MyController extends BaseController<MyControllerProps, MyControllerState> {
  constructor(props: MyControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_SEO,
    };
    
    super(props, seoConfig, {
      enableFadeIn: true,
      enableRevealOnScroll: true,
      enableLazyLoadImages: true,
    });
  }

  componentDidMount(): void {
    super.componentDidMount(); // Initialize SEO and luxury enhancements
    // Your initialization code
  }

  componentWillUnmount(): void {
    super.componentWillUnmount(); // Cleanup AbortController and observers
    // Your cleanup code
  }
}
```

### BaseApiController

**Location**: `src/api/controllers/base/BaseApiController.ts`

**Features**:
- Standardized success/error responses
- User-friendly error formatting
- Input validation helpers
- Client IP detection
- Rate limiting support

**Usage**:
```ts
import { BaseApiController } from "./base/BaseApiController";

class MyApiController extends BaseApiController {
  async myMethod(req: Request, res: Response): Promise<void> {
    try {
      // Your logic
      this.sendSuccess(res, data, "Success message");
    } catch (error) {
      this.sendError(res, error instanceof Error ? error : new Error("Error message"));
    }
  }
}

const controller = new MyApiController();
export const myMethod = (req: Request, res: Response): Promise<void> =>
  controller.myMethod(req, res);
```

### BaseService

**Location**: `src/services/base/BaseService.ts`

**Features**:
- HTTP request wrapper dengan error handling
- Auth headers management
- AbortSignal support
- FormData handling

**Usage**:
```ts
import { BaseService } from "./base/BaseService";

class MyService extends BaseService {
  async getData(id: string, signal?: AbortSignal): Promise<MyData> {
    return this.get<MyData>(`/api/data/${id}`, signal);
  }

  async createData(data: MyData, signal?: AbortSignal): Promise<MyData> {
    return this.post<MyData>("/api/data", data, signal);
  }
}
```

## SOLID Principles Applied

### Single Responsibility Principle (SRP)
- **BaseController**: Hanya handle common controller functionality
- **BaseApiController**: Hanya handle common API functionality
- **BaseService**: Hanya handle HTTP requests
- **Individual Controllers**: Hanya handle business logic untuk specific page/feature

### Open/Closed Principle (OCP)
- Base classes dapat di-extend tanpa modification
- New controllers dapat ditambahkan dengan extend base classes
- New functionality dapat ditambahkan melalui inheritance atau composition

### Liskov Substitution Principle (LSP)
- Semua controllers yang extend BaseController dapat digunakan sebagai BaseController
- Semua API controllers yang extend BaseApiController dapat digunakan sebagai BaseApiController

### Interface Segregation Principle (ISP)
- BaseController hanya menyediakan methods yang diperlukan
- BaseApiController hanya menyediakan methods yang diperlukan
- Controllers tidak dipaksa untuk implement methods yang tidak digunakan

### Dependency Inversion Principle (DIP)
- Controllers depend pada abstractions (BaseController, BaseService)
- Services depend pada abstractions (BaseService)
- Dependencies dapat di-inject atau di-override

## DRY (Don't Repeat Yourself)

### Common Functionality yang Di-share:

1. **AbortController Management**
   - Semua controllers menggunakan BaseController untuk AbortController
   - Otomatis cleanup saat unmount

2. **Error Handling**
   - Standardized error handling di BaseController dan BaseApiController
   - User-friendly error messages

3. **SEO Management**
   - Centralized SEO initialization
   - Dynamic SEO updates

4. **Luxury Enhancements**
   - Centralized initialization dan cleanup
   - Configurable per controller

5. **API Responses**
   - Standardized response format
   - Consistent error handling

## MVC Architecture

### Model
- **Location**: `src/models/`
- **Purpose**: Data structures dan initial state
- **No business logic** - Hanya data

### View
- **Location**: `src/view/`
- **Purpose**: Pure presentation components
- **No business logic** - Hanya rendering

### Controller
- **Location**: `src/controllers/` (frontend), `src/api/controllers/` (backend)
- **Purpose**: Business logic, state management, data fetching
- **Extends BaseController/BaseApiController** untuk common functionality

## Refactored Controllers

### Frontend Controllers
1. ✅ **HomePageController** - Extends BaseController
2. ✅ **CartPageController** - Extends BaseController
3. ⏳ **HeaderController** - Needs refactoring
4. ⏳ **BouquetDetailPageController** - Needs refactoring
5. ⏳ **Other controllers** - Needs refactoring

### Backend API Controllers
1. ✅ **BouquetController** - Extends BaseApiController
2. ✅ **AuthController** - Extends BaseApiController
3. ⏳ **Other API controllers** - Needs refactoring

## Best Practices

### 1. Always Extend Base Classes
```tsx
// ✅ Good
class MyController extends BaseController<Props, State> {
  // ...
}

// ❌ Bad
class MyController extends Component<Props, State> {
  // Duplicates AbortController, SEO, luxury enhancements logic
}
```

### 2. Use BaseController Methods
```tsx
// ✅ Good
this.safeFetch(url, options);
this.setError(error, "Default message");
this.setLoading(true);

// ❌ Bad
// Manual fetch with try-catch
// Manual error state management
```

### 3. Use BaseApiController Methods
```ts
// ✅ Good
this.sendSuccess(res, data, "Message");
this.sendError(res, error);
this.sendBadRequest(res, "Validation error");

// ❌ Bad
res.status(200).json({ data });
res.status(500).json({ error: "Error" });
```

### 4. Proper Cleanup
```tsx
// ✅ Good
componentWillUnmount(): void {
  super.componentWillUnmount(); // Cleanup base resources
  // Cleanup specific resources
}

// ❌ Bad
componentWillUnmount(): void {
  // Missing base cleanup
}
```

## Testing

Semua controllers harus di-test untuk memastikan:
1. ✅ Function berjalan dengan baik
2. ✅ Error handling bekerja dengan benar
3. ✅ Cleanup dilakukan dengan proper
4. ✅ No memory leaks
5. ✅ AbortController bekerja dengan benar

## Migration Guide

Untuk migrate existing controller ke BaseController:

1. Import BaseController
2. Extend BaseController instead of Component
3. Pass seoConfig dan luxuryConfig ke constructor
4. Call `super.componentDidMount()` dan `super.componentWillUnmount()`
5. Remove duplicate AbortController, SEO, luxury enhancements code
6. Use BaseController methods (safeFetch, setError, setLoading)

## Future Improvements

1. **Service Layer**: Create service abstractions untuk dependency injection
2. **Error Boundaries**: Add error boundaries untuk better error handling
3. **Caching**: Add caching layer untuk API calls
4. **State Management**: Consider using state management library untuk complex state
5. **Testing**: Add comprehensive unit tests untuk all controllers

