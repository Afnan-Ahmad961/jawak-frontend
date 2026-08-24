"use client";

import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * quiet. Used to keep an input responsive (bound to the live value) while the
 * expensive consumer — e.g. a query key — trails behind. The state update
 * happens inside the timeout callback, so it doesn't run synchronously in the
 * effect body.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
