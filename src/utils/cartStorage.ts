export const CART_STORAGE_KEY = "stadonclick.shoppingCart";
export const CART_UPDATED_EVENT = "stadonclick:cart-updated";

export type StoredCartItem = {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type StoredCart = {
  items: StoredCartItem[];
  updatedAt: string;
};

const isBrowser = typeof window !== "undefined";

export function getStoredCart(): StoredCart {
  if (!isBrowser) {
    return { items: [], updatedAt: "" };
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return { items: [], updatedAt: "" };
    }
    const parsed = JSON.parse(raw) as Partial<StoredCart>;
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    return {
      items: items.filter(
        (item): item is StoredCartItem =>
          Boolean(item) &&
          typeof item.id === "string" &&
          typeof item.title === "string" &&
          typeof item.quantity === "number" &&
          typeof item.unitPrice === "number" &&
          typeof item.totalPrice === "number",
      ),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
  } catch {
    return { items: [], updatedAt: "" };
  }
}

export function setStoredCart(items: StoredCartItem[]) {
  if (!isBrowser) return;

  const payload: StoredCart = {
    items,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function clearStoredCart() {
  if (!isBrowser) return;

  window.localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartItemCount(cart: StoredCart) {
  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(cart: StoredCart) {
  return cart.items.reduce((total, item) => total + item.totalPrice, 0);
}
