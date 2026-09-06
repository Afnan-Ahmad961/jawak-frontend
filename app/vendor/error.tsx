"use client";

import { RouteError } from "@/components/shared/route-error";

export default function VendorError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteError {...props} title="Something went wrong" />;
}
