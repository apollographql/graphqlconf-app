import { lazy } from "react";

const VercelOmnibar = lazy(() =>
  import("@/agent/vercelSdk/Omnibar/Omnibar").then((mod) => ({
    default: mod.Omnibar,
  }))
);

export function Omnibar({ children }: { children: React.ReactNode }) {
  return <VercelOmnibar>{children}</VercelOmnibar>;
}
