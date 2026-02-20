export const WISHLIST_UPDATED_EVENT = "stadonclick:wishlist-updated";

const WISHLIST_STORAGE_KEY = "stadonclick:wishlist:v1";

export type StoredWishlistItem = {
  id: string;
  title: string;
  image: string;
  location: string;
  categoryName: string;
  rating: number;
  reviews: number;
};

const sanitize = (value: unknown): StoredWishlistItem[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const candidate = item as Record<string, unknown>;
      const id = typeof candidate.id === "string" ? candidate.id : "";
      if (!id) return null;

      return {
        id,
        title: typeof candidate.title === "string" ? candidate.title : "Service",
        image: typeof candidate.image === "string" ? candidate.image : "",
        location: typeof candidate.location === "string" ? candidate.location : "Unknown location",
        categoryName:
          typeof candidate.categoryName === "string" ? candidate.categoryName : "Service",
        rating: typeof candidate.rating === "number" ? candidate.rating : 0,
        reviews: typeof candidate.reviews === "number" ? candidate.reviews : 0,
      } satisfies StoredWishlistItem;
    })
    .filter((item): item is StoredWishlistItem => Boolean(item));
};

export const getStoredWishlist = (): StoredWishlistItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    return sanitize(JSON.parse(raw));
  } catch {
    return [];
  }
};

const persistWishlist = (items: StoredWishlistItem[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
};

export const isWishlisted = (id: string): boolean => {
  return getStoredWishlist().some((item) => item.id === id);
};

export const toggleWishlist = (item: StoredWishlistItem): boolean => {
  const items = getStoredWishlist();
  const exists = items.some((entry) => entry.id === item.id);
  if (exists) {
    persistWishlist(items.filter((entry) => entry.id !== item.id));
    return false;
  }

  persistWishlist([item, ...items]);
  return true;
};

export const removeWishlistItem = (id: string) => {
  persistWishlist(getStoredWishlist().filter((entry) => entry.id !== id));
};
