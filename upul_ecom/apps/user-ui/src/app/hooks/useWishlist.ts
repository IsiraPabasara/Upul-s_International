import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axiosInstance from '@/app/utils/axiosInstance';

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncWithUser: () => Promise<void>;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      // Helper to check if item exists (for Heart icon color)
      isInWishlist: (id) => !!get().items.find(i => i.productId === id),

      toggleItem: (item) => {
        set((state) => {
          const exists = state.items.find((i) => i.productId === item.productId);
          if (exists) {
            return { items: state.items.filter((i) => i.productId !== item.productId) };
          }
          return { items: [...state.items, item] };
        });
      },

      clearWishlist: () => set({ items: [] }),

      // The Magic Merge (Call on Login)
      syncWithUser: async () => {
    // 1. Get current guest items from the local store
    const localItems = get().items; 

    // 2. If there are local items, send them to the backend to merge
    if (localItems.length > 0) {
        try {
            await axiosInstance.post('/api/wishlist/merge', { 
                localItems: localItems
            });
            // The backend should take these items, add them to the DB, 
            // and ignore duplicates.
        } catch (error) {
            console.error("Failed to merge wishlist:", error);
        }
    }

    // 3. Fetch the final authoritative list from the server
    // This ensures the UI shows the combined list (Old DB items + New Guest items)
    try {
        const { data } = await axiosInstance.get('/api/wishlist');
        set({ items: data }); // Update local store with server data
    } catch (error) {
        console.error("Failed to fetch wishlist:", error);
    }
},
    }),
    {
      name: 'eshop-wishlist-storage', // Unique Key
      storage: createJSONStorage(() => localStorage),
    }
  )
);