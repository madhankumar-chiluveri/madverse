import { DEFAULT_WORKSPACE_ROUTE } from "@/lib/routes";

const STABLE_WORKSPACE_SEGMENTS = new Set([
  "overview",
  "feed",
  "brain",
  "ledger",
  "ai",
  "settings",
  "trash",
]);

export function getWorkspaceSwitchTarget(pathname: string | null | undefined) {
  if (!pathname || !pathname.startsWith("/workspace")) {
    return DEFAULT_WORKSPACE_ROUTE;
  }

  const segment = pathname.split("/")[2] ?? "";
  if (STABLE_WORKSPACE_SEGMENTS.has(segment)) {
    return pathname;
  }

  return DEFAULT_WORKSPACE_ROUTE;
}
