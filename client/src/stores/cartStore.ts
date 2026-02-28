import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  projectId: string;
  title: string;
  slug: string;
  price: number;
  thumbnailUrl?: string;
  sellerId: string;
  sellerUsername: string;
}

interface CartState {
  items: CartItem[];
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (projectId: string) => void;
  clearCart: () => void;
  
  // Computed
  getItemCount: () => number;
  getTotalPrice: () => number;
  hasItem: (projectId: string) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        // Don't add duplicates
        if (state.items.some((i) => i.projectId === item.projectId)) {
          return state;
        }
        return { items: [...state.items, item] };
      }),

      removeItem: (projectId) => set((state) => ({
        items: state.items.filter((i) => i.projectId !== projectId)
      })),

      clearCart: () => set({ items: [] }),

      getItemCount: () => get().items.length,

      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price, 0),

      hasItem: (projectId) => get().items.some((i) => i.projectId === projectId),
    }),
    {
      name: 'projecthub-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Selector hooks
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () => useCartStore((state) => state.items.length);
export const useCartTotal = () => useCartStore((state) => 
  state.items.reduce((sum, item) => sum + item.price, 0)
);
