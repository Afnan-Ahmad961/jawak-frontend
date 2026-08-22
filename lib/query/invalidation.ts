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

  /** Creating/editing/deleting a request refreshes lists and its detail. */
  async requestMutated(qc: QueryClient) {
    await qc.invalidateQueries({ queryKey: queryKeys.requests.all() });
  },

  /** Withdrawing a bid updates the vendor's bid list and the request's bids. */
  async bidWithdrawn(qc: QueryClient) {
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.bids.all() }),
      qc.invalidateQueries({ queryKey: queryKeys.requests.all() }),
    ]);
  },

  /** A submitted review is visible on the order and on the vendor's profile. */
  async reviewCreated(qc: QueryClient) {
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.reviews.all() }),
      qc.invalidateQueries({ queryKey: queryKeys.orders.all() }),
      qc.invalidateQueries({ queryKey: queryKeys.vendors.all() }),
    ]);
  },

  /** Raising a dispute moves the order to `disputed`. */
  async disputeCreated(qc: QueryClient) {
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.disputes.all() }),
      qc.invalidateQueries({ queryKey: queryKeys.orders.all() }),
    ]);
  },

  /** A sent message updates the thread and the conversation list preview. */
  async messageSent(qc: QueryClient, conversationId: string | number) {
    await Promise.all([
      qc.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      }),
      qc.invalidateQueries({ queryKey: queryKeys.conversations.list() }),
    ]);
  },

  /** Marking notifications read updates the list and the bell's unread count. */
  async notificationsRead(qc: QueryClient) {
    await qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
  },
};
