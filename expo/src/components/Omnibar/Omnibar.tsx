import { lazy } from "react";
import { fragmentRegistry, FromParent } from "@/apollo/client";
import { FragmentType, gql } from "@apollo/client";
import { useSuspenseFragment } from "@apollo/client/react";
import { Omnibar_FrameworksFragmentDoc } from "./Omnibar.generated";

const VercelOmnibar = lazy(() =>
  import("@/agent/vercelSdk/Omnibar/Omnibar").then((mod) => ({
    default: mod.Omnibar,
  }))
);

const CopilotKitOmnibar = lazy(() =>
  import("@/agent/copilotkit/Omnibar").then((mod) => ({
    default: mod.Omnibar,
  }))
);

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment Omnibar_frameworks on Query {
      aiFramework @client
    }
  `;
}

Omnibar.fragments = {
  frameworks: Omnibar_FrameworksFragmentDoc,
} as const;

fragmentRegistry.register(Omnibar.fragments.frameworks);

export function Omnibar({
  children,
  frameworks,
}: {
  children: React.ReactNode;
  frameworks:
    | FragmentType<typeof Omnibar.fragments.frameworks>
    | FromParent<typeof Omnibar.fragments.frameworks>;
}) {
  const { data } = useSuspenseFragment({
    fragment: Omnibar.fragments.frameworks,
    fragmentName: "Omnibar_frameworks",
    from: frameworks,
  });

  switch (data.aiFramework) {
    case "vercel":
      return <VercelOmnibar>{children}</VercelOmnibar>;
    case "copilotkit":
      return <CopilotKitOmnibar>{children}</CopilotKitOmnibar>;
    default:
      return children;
  }
}
