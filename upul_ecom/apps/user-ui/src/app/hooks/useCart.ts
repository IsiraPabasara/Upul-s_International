// apps/web-storefront/src/hooks/useCart.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axiosInstance from '@/app/utils/axiosInstance';

export interface CartItem {
  sku: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  maxStock?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // Controls the Slider visibility

  // ✅ Add Error State
  validationErrors: Record<string, string>;

  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, qty: number) => void;
  clearCart: () => void;
  syncWithUser: () => Promise<void>; // The magic merge function

  // ✅ Add Actions
  setValidationErrors: (errors: Record<string, string>) => void;
  clearValidationErrors: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // ✅ Initial state
      validationErrors: {},

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.sku === newItem.sku);

          if (existing) {
            // Update quantity if exists
            return {
              items: state.items.map((i) =>
                i.sku === newItem.sku
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
              isOpen: true, // Auto open cart on add
            };
          }

          return { items: [...state.items, newItem], isOpen: true };
        });

        // ✅ Clear errors on modification
        get().clearValidationErrors();
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((i) => i.sku !== sku),
        }));

        // ✅ Clear errors on modification
        get().clearValidationErrors();
      },

      updateQuantity: (sku, qty) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.sku === sku ? { ...i, quantity: qty } : i
          ),
        }));

        // ✅ Clear errors on modification
        get().clearValidationErrors();
      },

      clearCart: () => {
        set({ items: [] });

        // ✅ Clear errors on modification
        get().clearValidationErrors();
      },

      // Call this when user logs in
      syncWithUser: async () => {
        const localItems = get().items;
        try {
          // Send local items to backend to merge
          const res = await axiosInstance.post('/api/cart/merge', { localItems });

          // Update store with the "final" merged list from DB
          set({ items: res.data });

          // ✅ Clear errors because cart is now re-synced
          get().clearValidationErrors();
        } catch (error) {
          console.error('Failed to sync cart', error);
        }
      },

      // ✅ Error actions
      setValidationErrors: (errors) => set({ validationErrors: errors }),
      clearValidationErrors: () => set({ validationErrors: {} }),
    }),
    {
      name: 'eshop-cart-storage', // key in localStorage
      storage: createJSONStorage(() => localStorage),

      // ✅ Only persist items (errors should be checked fresh; cart closed on refresh)
      partialize: (state) => ({ items: state.items }),
    }
  )
);
