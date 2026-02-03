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
  isOpen: boolean;
  validationErrors: Record<string, string>;
  toggleCart: () => void;
  addItem: (item: CartItem, openCart?: boolean) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, qty: number) => void;
  clearCart: () => void;
  syncWithUser: () => Promise<void>;
  setValidationErrors: (errors: Record<string, string>) => void;
  clearValidationErrors: () => void;
  // NEW ACTION
  updatePrices: (priceUpdates: Record<string, number>) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      validationErrors: {},

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem, openCart = true) => {
        set((state) => {
          const existing = state.items.find((i) => i.sku === newItem.sku);
          const nextIsOpen = openCart ? true : state.isOpen;
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.sku === newItem.sku ? { ...i, quantity: i.quantity + newItem.quantity } : i
              ),
              isOpen: nextIsOpen,
            };
          }
          return { items: [...state.items, newItem], isOpen: nextIsOpen };
        });
        get().clearValidationErrors();
      },

      updatePrices: (priceUpdates) => {
        set((state) => ({
          items: state.items.map((item) =>
            priceUpdates[item.sku] !== undefined 
              ? { ...item, price: priceUpdates[item.sku] } 
              : item
          ),
        }));
      },

      removeItem: (sku) => {
        set((state) => ({ items: state.items.filter((i) => i.sku !== sku) }));
        get().clearValidationErrors();
      },

      updateQuantity: (sku, qty) => {
        set((state) => ({
          items: state.items.map((i) => i.sku === sku ? { ...i, quantity: qty } : i),
        }));
        get().clearValidationErrors();
      },

      clearCart: () => set({ items: [], validationErrors: {} }),

      syncWithUser: async () => {
        const localItems = get().items;
        try {
          const res = await axiosInstance.post('/api/cart/merge', { localItems });
          set({ items: res.data });
          get().clearValidationErrors();
        } catch (error) {
          console.error('Failed to sync cart', error);
        }
      },

      setValidationErrors: (errors) => set({ validationErrors: errors }),
      clearValidationErrors: () => set({ validationErrors: {} }),
    }),
    {
      name: 'eshop-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);