// Cart management utility for customer shopping cart

export interface CartItem {
  bouquetId: string;
  bouquetName: string;
  bouquetPrice: number;
  quantity: number;
  image?: string;
  addedAt: number;
}

const CART_STORAGE_KEY = "customer_cart";

/**
 * Get all items in cart
 */
export function getCartItems(): CartItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const items = JSON.parse(saved);
      return Array.isArray(items) ? items : [];
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to load cart:", error);
    }
  }
  return [];
}

/**
 * Add item to cart
 */
export function addToCart(item: Omit<CartItem, "addedAt">): void {
  try {
    const items = getCartItems();
    const existingIndex = items.findIndex((i) => i.bouquetId === item.bouquetId);

    if (existingIndex >= 0) {
      // Update quantity if item already exists
      items[existingIndex].quantity += item.quantity;
    } else {
      // Add new item
      items.push({
        ...item,
        addedAt: Date.now(),
      });
    }

    if (typeof localStorage === "undefined" || typeof window === "undefined") return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to add to cart:", error);
    }
  }
}

/**
 * Remove item from cart
 */
export function removeFromCart(bouquetId: string): void {
  try {
    const items = getCartItems().filter((item) => item.bouquetId !== bouquetId);
    if (typeof localStorage === "undefined" || typeof window === "undefined") return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to remove from cart:", error);
    }
  }
}

/**
 * Update item quantity in cart
 */
export function updateCartItemQuantity(bouquetId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(bouquetId);
    return;
  }

  try {
    if (typeof localStorage === "undefined" || typeof window === "undefined") return;
    const items = getCartItems();
    const item = items.find((i) => i.bouquetId === bouquetId);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to update cart:", error);
    }
  }
}

/**
 * Clear all items from cart
 */
export function clearCart(): void {
  if (typeof localStorage === "undefined" || typeof window === "undefined") return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to clear cart:", error);
    }
  }
}

/**
 * Get cart total count
 */
export function getCartCount(): number {
  const items = getCartItems();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Get cart total price
 */
export function getCartTotal(): number {
  const items = getCartItems();
  return items.reduce((sum, item) => sum + item.bouquetPrice * item.quantity, 0);
}

/**
 * Check if cart is empty
 */
export function isCartEmpty(): boolean {
  return getCartItems().length === 0;
}

