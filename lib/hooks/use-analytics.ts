"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import type { AnalyticsOverview } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";

/** Admin-only marketplace analytics (volume metrics; no money figures yet). */
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: queryKeys.analytics.overview(),
    queryFn: () => api.get<AnalyticsOverview>("analytics/overview/"),
  });
}
