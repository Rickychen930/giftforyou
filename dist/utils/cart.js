"use strict";
// Cart management utility for customer shopping cart
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartItems = getCartItems;
exports.addToCart = addToCart;
exports.removeFromCart = removeFromCart;
exports.updateCartItemQuantity = updateCartItemQuantity;
exports.clearCart = clearCart;
exports.getCartCount = getCartCount;
exports.getCartTotal = getCartTotal;
exports.isCartEmpty = isCartEmpty;
const CART_STORAGE_KEY = "customer_cart";
/**
 * Get all items in cart
 */
function getCartItems() {
    if (typeof localStorage === "undefined")
        return [];
    try {
        const storage = localStorage;
        const saved = storage.getItem(CART_STORAGE_KEY);
        if (saved) {
            const items = JSON.parse(saved);
            return Array.isArray(items) ? items : [];
        }
    }
    catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Failed to load cart:", error);
        }
    }
    return [];
}
/**
 * Add item to cart
 */
function addToCart(item) {
    try {
        const items = getCartItems();
        const existingIndex = items.findIndex((i) => i.bouquetId === item.bouquetId);
        if (existingIndex >= 0) {
            // Update quantity if item already exists
            items[existingIndex].quantity += item.quantity;
        }
        else {
            // Add new item
            items.push({
                ...item,
                addedAt: Date.now(),
            });
        }
        if (typeof localStorage === "undefined" || typeof window === "undefined")
            return;
        const storage = localStorage;
        const win = window;
        storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        win.dispatchEvent(new CustomEvent("cartUpdated"));
    }
    catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Failed to add to cart:", error);
        }
    }
}
/**
 * Remove item from cart
 */
function removeFromCart(bouquetId) {
    try {
        const items = getCartItems().filter((item) => item.bouquetId !== bouquetId);
        if (typeof localStorage === "undefined" || typeof window === "undefined")
            return;
        const storage = localStorage;
        const win = window;
        storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        win.dispatchEvent(new CustomEvent("cartUpdated"));
    }
    catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Failed to remove from cart:", error);
        }
    }
}
/**
 * Update item quantity in cart
 */
function updateCartItemQuantity(bouquetId, quantity) {
    if (quantity <= 0) {
        removeFromCart(bouquetId);
        return;
    }
    try {
        if (typeof localStorage === "undefined" || typeof window === "undefined")
            return;
        const storage = localStorage;
        const win = window;
        const items = getCartItems();
        const item = items.find((i) => i.bouquetId === bouquetId);
        if (item) {
            item.quantity = quantity;
            storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
            win.dispatchEvent(new CustomEvent("cartUpdated"));
        }
    }
    catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Failed to update cart:", error);
        }
    }
}
/**
 * Clear all items from cart
 */
function clearCart() {
    if (typeof localStorage === "undefined" || typeof window === "undefined")
        return;
    try {
        const storage = localStorage;
        const win = window;
        storage.removeItem(CART_STORAGE_KEY);
        win.dispatchEvent(new CustomEvent("cartUpdated"));
    }
    catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Failed to clear cart:", error);
        }
    }
}
/**
 * Get cart total count
 */
function getCartCount() {
    const items = getCartItems();
    return items.reduce((sum, item) => sum + item.quantity, 0);
}
/**
 * Get cart total price
 */
function getCartTotal() {
    const items = getCartItems();
    return items.reduce((sum, item) => sum + item.bouquetPrice * item.quantity, 0);
}
/**
 * Check if cart is empty
 */
function isCartEmpty() {
    return getCartItems().length === 0;
}
//# sourceMappingURL=cart.js.map