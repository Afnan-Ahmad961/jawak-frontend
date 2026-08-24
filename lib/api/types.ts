import type { Role } from "@/lib/config";

/**
 * Domain types mirrored from the Django API (see Overview.md). These are the
 * shapes the frontend relies on; extend them as endpoints are wired up. Status
 * unions match the exact strings the API renders.
 *
 * Fields the serializers may or may not include are marked optional and rendered
 * defensively — we don't control the exact DRF output, so components fall back
 * gracefully rather than assuming a key is present.
 */

export type RequestStatus = "open" | "awarded" | "closed" | "cancelled";
export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type OrderStatus = "active" | "completed" | "disputed" | "cancelled";
export type ProductionStage =
  | "sourcing"
  | "cutting"
  | "sewing"
  | "quality_check"
  | "shipped"
  | "delivered";
export type DisputeStatus = "open" | "under_review" | "resolved" | "rejected";

export const PRODUCTION_STAGES: ProductionStage[] = [
  "sourcing",
  "cutting",
  "sewing",
  "quality_check",
  "shipped",
  "delivered",
];

/** IDs come back as numbers from Django but we don't do math on them. */
export type Id = number | string;

/** DRF `DecimalField` serializes as a string; some views send a number. */
export type Money = string | number;

/**
 * DRF list envelope. List endpoints may paginate (`{ count, results }`) or
 * return a bare array; `unwrapList` in lib/api/pagination.ts handles both.
 */
export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type User = {
  id: Id;
  email: string;
  role: Role;
  username?: string | null;
  name?: string | null;
  avatar?: string | null;
};

/** Lightweight person reference embedded in bids/orders/messages/reviews. */
export type UserSummary = {
  id: Id;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

// --- Vendors --------------------------------------------------------------

export type PortfolioItem = {
  id: Id;
  image: string;
  title?: string | null;
  description?: string | null;
  created_at?: string;
};

export type Vendor = {
  id: Id;
  company_name: string;
  location?: string | null;
  specialties?: string[];
  capacity?: number | string | null;
  bio?: string | null;
  /** Backend field is `avg_rating` (vendor_profile). */
  avg_rating?: number | null;
  review_count?: number | null;
  portfolio?: PortfolioItem[];
  user?: UserSummary;
  created_at?: string;
};

/** Vendor identity as embedded in a bid/order (may be an id or a nested object). */
export type VendorSummary = {
  id: Id;
  company_name?: string | null;
  location?: string | null;
  avg_rating?: number | null;
  review_count?: number | null;
};

// --- Design requests ------------------------------------------------------

export type ReferenceImage = {
  id: Id;
  image: string;
  /** Backend field is `label` (design_reference_image). */
  label?: string | null;
};

export type DesignRequest = {
  id: Id;
  title: string;
  apparel_type: string;
  quantity: number;
  material?: string | null;
  /** `sizes` is a JSONField on the backend — usually a string[] of size labels. */
  sizes?: string[] | string | null;
  color_preferences?: string | null;
  deadline?: string | null;
  description?: string | null;
  status: RequestStatus;
  design_image?: string | null;
  reference_images?: ReferenceImage[];
  client?: UserSummary | Id;
  bids_count?: number;
  created_at?: string;
  updated_at?: string;
};

// --- Bids -----------------------------------------------------------------

export type Bid = {
  id: Id;
  design_request: Id;
  vendor: VendorSummary | Id;
  proposed_price: Money;
  delivery_days: number;
  message?: string | null;
  status: BidStatus;
  created_at?: string;
};

// --- Orders ---------------------------------------------------------------

export type ProductionUpdate = {
  id: Id;
  stage: ProductionStage;
  note?: string | null;
  image?: string | null;
  created_at?: string;
};

export type Order = {
  id: Id;
  design_request: DesignRequest | Id;
  vendor: VendorSummary | Id;
  client?: UserSummary | Id;
  bid?: Bid | Id;
  status: OrderStatus;
  current_stage?: ProductionStage | null;
  production_updates?: ProductionUpdate[];
  /** Backend field is `final_price` (order). */
  final_price?: Money;
  deadline?: string | null;
  has_review?: boolean;
  created_at?: string;
  updated_at?: string;
};

// --- Reviews --------------------------------------------------------------

export type Review = {
  id: Id;
  order: Id;
  rating: number;
  comment?: string | null;
  reviewer?: UserSummary | Id;
  vendor?: VendorSummary | Id;
  created_at?: string;
};

// --- Disputes -------------------------------------------------------------

export type Dispute = {
  id: Id;
  order: Order | Id;
  reason: string;
  description?: string | null;
  status: DisputeStatus;
  resolution?: string | null;
  raised_by?: UserSummary | Id;
  created_at?: string;
  updated_at?: string;
};

// --- Messaging ------------------------------------------------------------

export type Message = {
  id: Id;
  conversation: Id;
  sender: UserSummary | Id;
  /** Backend field is `body` (message). */
  body: string;
  is_read?: boolean;
  created_at?: string;
};

export type Conversation = {
  id: Id;
  design_request: DesignRequest | Id;
  vendor: VendorSummary | Id;
  client?: UserSummary | Id;
  last_message?: Message | null;
  unread_count?: number;
  created_at?: string;
};

// --- Notifications --------------------------------------------------------

export type Notification = {
  id: Id;
  /** Backend field is `notification_type`. */
  notification_type?: string;
  message: string;
  /** Backend field is `is_read`. */
  is_read: boolean;
  /** Optional client-side target; the backend models this as a generic FK. */
  link?: string | null;
  created_at?: string;
};

// --- Request payloads (BFF contracts) -------------------------------------
// These are the JSON bodies the mutation hooks send. Kept here (not derived
// from a UI form type) so the request contract lives in lib/api and can't
// drift when a form changes.

export type CreateReviewRequest = {
  order: Id;
  rating: number;
  comment?: string;
};

export type CreateDisputeRequest = {
  order: Id;
  reason: string;
  description?: string;
};

export type BidStatusUpdate = { status: BidStatus };

export type StartConversationRequest = { design_request: Id; vendor: Id };

export type SendMessageRequest = { body: string };
