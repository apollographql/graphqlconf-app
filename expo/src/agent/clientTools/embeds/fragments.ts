import { ScheduleListItem } from "@/screens/Schedule/components/ScheduleListItem";
import { PlacesMap } from "@/components/PlacesMap/PlacesMap";
import { DocumentNode } from "@apollo/client";
import { jsonSchema, tool } from "ai";
import { getFragmentJSONSchema } from "./fragmentSchemaGenerator";
import type { JSONSchema7Definition } from "json-schema";
import { firstFragment } from "@/utils/firstFragment";
import { client } from "@/apollo/client";

function fragmentIdentifier(fragmentDoc: DocumentNode): JSONSchema7Definition {
  const fragment = firstFragment(fragmentDoc);
  const __typename = fragment.typeCondition.name.value;

  return {
    type: "object" as const,
    properties: {
      __typename: { type: "string" as const, const: __typename },
      id: { type: "string" as const },
    },
    required: ["__typename", "id"],
    additionalProperties: false,
  };
}

function fullFragmentData(fragmentDoc: DocumentNode) {
  const fragment = firstFragment(
    client.documentTransform.transformDocument(fragmentDoc)
  );
  return getFragmentJSONSchema(fragmentDoc, fragment.name.value);
}

function expose<
  Name extends string,
  Props extends Record<string, JSONSchema7Definition>,
>(
  Component: React.FunctionComponent<Record<keyof Props, any>>,
  {
    name,
    props,
    description,
  }: {
    name: Name;
    description: string;
    props: Props;
  }
) {
  return {
    Component,
    name,
    description,
    schema: jsonSchema({
      type: "object",
      properties: props,
      required: Object.keys(props),
      additionalProperties: false,
    }),
  };
}

console.log(fullFragmentData(PlacesMap.fragments.Places));

export const availableFragmentComponents = {
  ScheduleListItem: expose(ScheduleListItem, {
    name: "ScheduleListItem" as const,
    description: `Display a schedule item, e.g. a conference talk or any other item with \`__typename\` of \`SchedSession\`.
Will display event name, venue name, time (start and end) as well as event speakers (if available).`,
    props: {
      SchedSession: fragmentIdentifier(ScheduleListItem.fragments.SchedSession),
    },
  }),
  PlacesMap: expose(PlacesMap, {
    name: "PlacesMap",
    description: `Display a map with markers for one or more locations.
Will show markers for all locations and automatically center/zoom to fit all markers.
Use this to visualize places on a map, such as nearby restaurants, venues, or conference locations.`,
    props: {
      Places: {
        type: "array",
        items: fullFragmentData(PlacesMap.fragments.Places),
        description: "Array of locations to show on the map",
      },
      height: {
        type: "number",
        description: "Height of the map in pixels",
        default: 300,
      },
    },
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
