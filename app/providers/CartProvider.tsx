"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "@/app/lib/api";
import type { Cart, CartItem } from "@/app/lib/types";
import { useAuth } from "./AuthProvider";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  /** Cart drawer visibility, shared so any page can open it. */
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (foodId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearLocal: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async () => {
    // Signed out, or an admin (who has no shopping cart) — nothing to hold.
    if (!user || user.role === "admin") {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { cart } = await api<{ cart: Cart }>("/cart", { auth: true });
      setItems(cart?.items ?? []);
    } catch {
      // A failed refresh shouldn't blank the cart the user is looking at.
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load on sign-in; refresh() clears the cart on sign-out or for admins.
  useEffect(() => {
    if (authLoading) return;
    // Syncing cart state with the API — state is set from the async result.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [authLoading, refresh]);

  // Close the drawer on Escape.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const add = useCallback(async (foodId: string, quantity = 1) => {
    const { cart } = await api<{ cart: Cart }>("/cart", {
      method: "POST",
      auth: true,
      body: { foodId, quantity },
    });
    setItems(cart?.items ?? []);
  }, []);

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      // Optimistic — the stepper feels instant, then reconciles.
      setItems((current) =>
        current.map((item) =>
          item._id === itemId ? { ...item, quantity } : item
        )
      );

      try {
        const { cart } = await api<{ cart: Cart }>(`/cart/${itemId}`, {
          method: "PUT",
          auth: true,
          body: { quantity },
        });
        setItems(cart?.items ?? []);
      } catch (error) {
        await refresh();
        throw error;
      }
    },
    [refresh]
  );

  const remove = useCallback(async (itemId: string) => {
    const { cart } = await api<{ cart: Cart }>(`/cart/${itemId}`, {
      method: "DELETE",
      auth: true,
    });
    setItems(cart?.items ?? []);
  }, []);

  const clearLocal = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;

    for (const item of items) {
      count += item.quantity;
      subtotal += (item.food?.price ?? 0) * item.quantity;
    }

    return { count, subtotal };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      loading,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add,
      updateQuantity,
      remove,
      refresh,
      clearLocal,
    }),
    [
      items,
      count,
      subtotal,
      loading,
      isOpen,
      add,
      updateQuantity,
      remove,
      refresh,
      clearLocal,
    ]
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return context;
}
