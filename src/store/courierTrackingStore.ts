import { create } from 'zustand';
import type { LatLng } from '@/types/order';

interface CourierTrackingState {
  /** Accumulated path points per order: { [orderId]: LatLng[] } */
  paths: Record<number, LatLng[]>;

  /** Vendor IDs that have been picked up per order */
  visitedVendors: Record<number, Set<number>>;

  /** Push a new courier location point for a specific order */
  addPoint: (orderId: number, point: LatLng) => void;

  /** Mark a vendor as visited (picked up) for a specific order */
  markVendorVisited: (orderId: number, vendorId: number) => void;

  /** Check if a vendor has been visited for a specific order */
  isVendorVisited: (orderId: number, vendorId: number) => boolean;

  /** Clear tracking data for an order (e.g. when delivered) */
  clearOrder: (orderId: number) => void;
}

export const useCourierTrackingStore = create<CourierTrackingState>((set, get) => ({
  paths: {},
  visitedVendors: {},

  addPoint: (orderId, point) => {
    set((state) => {
      const existing = state.paths[orderId] || [];
      return {
        paths: {
          ...state.paths,
          [orderId]: [...existing, point],
        },
      };
    });
  },

  markVendorVisited: (orderId, vendorId) => {
    set((state) => {
      const existing = state.visitedVendors[orderId] || new Set<number>();
      const updated = new Set(existing);
      updated.add(vendorId);
      return {
        visitedVendors: {
          ...state.visitedVendors,
          [orderId]: updated,
        },
      };
    });
  },

  isVendorVisited: (orderId, vendorId) => {
    return get().visitedVendors[orderId]?.has(vendorId) ?? false;
  },

  clearOrder: (orderId) => {
    set((state) => {
      const { [orderId]: _p, ...restPaths } = state.paths;
      const { [orderId]: _v, ...restVendors } = state.visitedVendors;
      return { paths: restPaths, visitedVendors: restVendors };
    });
  },
}));
