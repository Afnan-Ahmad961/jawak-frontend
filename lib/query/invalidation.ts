import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

/**
 * Cascade invalidations for mutations that touch more than one resource. Some
 * backend actions have side effects across domains — invalidating only the
 * obvious key leaves the UI stale. Centralize those fan-outs here so every
 * caller stays honest.
 */
export const invalidate = {
  /**
   * Accepting a bid rejects the sibling bids AND creates an order
   * (Overview.md §Customer step 5). Refresh all three domains.
   */
  async bidAccepted(qc: QueryClient) {
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.bids.all() }),
      qc.invalidateQueries({ queryKey: queryKeys.requests.all() }),
      qc.invalidateQueries({ queryKey: queryKeys.orders.all() }),
    ]);
  },

  /** Posting a production update moves the order's stage. */
  async productionUpdated(qc: QueryClient) {
    await qc.invalidateQueries({ queryKey: queryKeys.orders.all() });
  },

  /** Confirming delivery completes the order and unlocks reviews. */
  async deliveryConfirmed(qc: QueryClient) {
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.orders.all() }),
      qc.invalidateQueries({ queryKey: queryKeys.reviews.all() }),
    ]);
  },

  /** Resolving a dispute returns the order to active and notifies the raiser. */
  async disputeResolved(qc: QueryClient) {
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.disputes.all() }),
      qc.invalidateQueries({ queryKey: queryKeys.orders.all() }),
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() }),
    ]);
  },
};
