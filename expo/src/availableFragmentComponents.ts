import { TypedDocumentNode } from "@graphql-typed-document-node/core";

import { ScheduleListItem } from "@/screens/Schedule/components/ScheduleListItem";
import { FragmentType } from "@apollo/client";
import { tool } from "ai";
import { z } from "zod/v4";
import { FromParent } from "./apollo_client";

function expose<
  Fragments extends Record<string, TypedDocumentNode>,
  Name extends string,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  ExtraProps extends z.ZodObject = z.ZodObject<{}>,
>(
  Component: React.FunctionComponent<
    {
      -readonly [K in keyof Fragments]:
        | FragmentType<Fragments[K]>
        | FromParent<Fragments[K]>;
    } & NoInfer<z.input<ExtraProps>>
  > & {
    fragments: Fragments;
  },
  {
    name,
    extraProps,
    description,
  }: {
    name: Name;
    description: string;
    extraProps?: ExtraProps;
  }
) {
  const fragmentSchema = z.looseObject(
    Object.fromEntries(
      Object.entries(Component.fragments).map(([key]) => [
        key,
        z.object({ __typename: z.literal(key), id: z.string() }),
      ])
    ) as {
      [K in keyof Fragments & string]: z.ZodObject<{
        __typename: z.ZodLiteral<K>;
        id: z.ZodString;
      }>;
    }
  );

  return {
    Component,
    fragments: Component.fragments,
    name,
    description,
    schema: z.object({
      ...fragmentSchema.shape,
      ...((extraProps?.shape || {}) as ExtraProps extends z.ZodObject<infer P>
        ? P
        : never),
    }),
  };
}

export const availableFragmentComponents = {
  ScheduleListItem: expose(ScheduleListItem, {
    name: "ScheduleListItem" as const,
    description: `Display a schedule item, e.g. a conference talk or any other item with \`__typename\` of \`SchedSession\`.
Will display event name, venue name, time (start and end) as well as event speakers (if available).`,
  }),
};

// // exposing all components via a single tool seems to make tool discovery harder
// export const singleTool = {
//   DisplayChatEmbed: tool({
//     name: "DisplayChatEmbed",
//     description: "Embed a Component in the Chat",
//     inputSchema: z.object({
//       embed: z.union(
//         Object.values(availableFragmentComponents).map((v) =>
//           z
//             .object({
//               component: z.literal(v.Component.name),
//               props: v.schema,
//             })
//             .describe(v.description)
//         )
//       ),
//     }),
//     outputSchema: z.object({}),
//     execute: () => ({}),
//   }),
// };
export const componentTools = mapEntries(
  availableFragmentComponents,
  "ShowEmbed-",
  (v) =>
    tool({
      name: v.name,
      description: v.description,
      inputSchema: v.schema,
    })
);

function mapEntries<In, Out, Keys extends string, Prefix extends string>(
  obj: Record<Keys, In>,
  prefix: Prefix,
  fn: (v: In, k: Keys) => Out
) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [
      `${prefix}${k}`,
      fn(v as In, k as Keys),
    ])
  ) as Record<`${Prefix}${Keys}`, Out>;
}
