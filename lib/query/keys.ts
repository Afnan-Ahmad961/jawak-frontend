/**
 * Single source of truth for TanStack Query keys. NEVER inline a key array in a
 * hook — always go through this factory so invalidation stays consistent.
 *
 * Filters that live in the URL (nuqs) should be passed here so the key reflects
 * the visible view: `queryKeys.bids.list({ request: id })`.
 */

type Filters = Record<string, unknown> | undefined;

export const queryKeys = {
  me: () => ["me"] as const,

  requests: {
    all: () => ["requests"] as const,
    list: (filters?: Filters) => ["requests", "list", filters ?? {}] as const,
    detail: (id: string | number) => ["requests", "detail", id] as const,
  },

  bids: {
    all: () => ["bids"] as const,
    list: (filters?: Filters) => ["bids", "list", filters ?? {}] as const,
    detail: (id: string | number) => ["bids", "detail", id] as const,
  },

  orders: {
    all: () => ["orders"] as const,
    list: (filters?: Filters) => ["orders", "list", filters ?? {}] as const,
    detail: (id: string | number) => ["orders", "detail", id] as const,
  },

  vendors: {
    all: () => ["vendors"] as const,
    list: (filters?: Filters) => ["vendors", "list", filters ?? {}] as const,
    detail: (id: string | number) => ["vendors", "detail", id] as const,
    me: () => ["vendors", "me"] as const,
  },

  reviews: {
    all: () => ["reviews"] as const,
    list: (filters?: Filters) => ["reviews", "list", filters ?? {}] as const,
  },

  disputes: {
    all: () => ["disputes"] as const,
    list: (filters?: Filters) => ["disputes", "list", filters ?? {}] as const,
    detail: (id: string | number) => ["disputes", "detail", id] as const,
  },

  conversations: {
    all: () => ["conversations"] as const,
    list: () => ["conversations", "list"] as const,
    messages: (id: string | number) => ["conversations", id, "messages"] as const,
  },

  notifications: {
    all: () => ["notifications"] as const,
    list: (filters?: Filters) =>
      ["notifications", "list", filters ?? {}] as const,
  },

  analytics: {
    overview: () => ["analytics", "overview"] as const,
  },
} as const;
