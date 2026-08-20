import { redirect } from "next/navigation";
import { LOGIN_PATH } from "@/lib/config";

/**
 * Root. In practice proxy.ts intercepts `/` and redirects to the caller's role
 * home (or /login). This is the safety net if proxy is ever bypassed.
 */
export default function RootPage() {
  redirect(LOGIN_PATH);
}
