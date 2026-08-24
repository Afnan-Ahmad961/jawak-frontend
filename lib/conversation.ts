import { asObjectRef } from "@/lib/api/refs";
import type {
  Conversation,
  DesignRequest,
  UserSummary,
  VendorSummary,
} from "@/lib/api/types";

/**
 * A conversation is shared between a client and a vendor. The "other party"
 * depends on who's looking: the client talks to the vendor; the vendor talks to
 * the client (derived from the design request's owner). These helpers pick the
 * right counterparty so one messages UI serves both roles.
 */
export type ChatPerspective = "client" | "vendor";

export function conversationCounterpartyName(
  conversation: Conversation,
  perspective: ChatPerspective,
): string {
  if (perspective === "client") {
    return (
      asObjectRef<VendorSummary>(conversation.vendor)?.company_name || "Vendor"
    );
  }
  const request = asObjectRef<DesignRequest>(conversation.design_request);
  const client = asObjectRef<UserSummary>(request?.client);
  return client?.name || client?.username || client?.email || "Client";
}

export function conversationRequestTitle(
  conversation: Conversation,
): string | undefined {
  return asObjectRef<DesignRequest>(conversation.design_request)?.title ?? undefined;
}
