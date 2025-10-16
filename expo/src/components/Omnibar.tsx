import { lazy } from "react";
import { fragmentRegistry, FromParent } from "@/apollo/client";
import { FragmentType, gql } from "@apollo/client";
import { useSuspenseFragment } from "@apollo/client/react";
import { Omnibar_QueryFragmentDoc } from "./Omnibar.generated";

const VercelOmnibar = lazy(() =>
  import("@/agent/vercelSdk/Omnibar/Omnibar").then((mod) => ({
    default: mod.Omnibar,
  }))
);

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment Omnibar_Query on Query {
      aiFramework @client
    }
  `;
}

Omnibar.fragments = {
  Query: Omnibar_QueryFragmentDoc,
} as const;

fragmentRegistry.register(Omnibar.fragments.Query);

export function Omnibar({
  children,
  parent,
}: {
  children: React.ReactNode;
  parent:
    | FragmentType<typeof Omnibar.fragments.Query>
    | FromParent<typeof Omnibar.fragments.Query>;
}) {
  const { data } = useSuspenseFragment({
    fragment: Omnibar.fragments.Query,
    fragmentName: "Omnibar_Query",
    from: parent,
  });

  switch (data.aiFramework) {
    case "vercel":
      return <VercelOmnibar>{children}</VercelOmnibar>;
    default:
      return children;
  }
}
