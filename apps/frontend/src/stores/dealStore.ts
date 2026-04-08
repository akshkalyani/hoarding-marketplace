import { create } from 'zustand';
import type { Listing } from '@/lib/types';

interface DealItem {
  listing: Listing;
  addedAt: string;
}

interface DealState {
  items: DealItem[];
  addItem: (listing: Listing) => void;
  removeItem: (listingId: string) => void;
  clearItems: () => void;
  totalPrice: () => number;
}

export const useDealStore = create<DealState>((set, get) => ({
  items: [],
  addItem: (listing) => {
    const exists = get().items.some((i) => i.listing.id === listing.id);
    if (!exists) {
      set({ items: [...get().items, { listing, addedAt: new Date().toISOString() }] });
    }
  },
  removeItem: (listingId) => {
    set({ items: get().items.filter((i) => i.listing.id !== listingId) });
  },
  clearItems: () => set({ items: [] }),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.listing.price, 0),
}));
