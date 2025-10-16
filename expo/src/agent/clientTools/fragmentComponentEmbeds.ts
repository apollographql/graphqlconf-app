import { ScheduleListItem } from "@/components/ListItems/ScheduleListItem";
import { PlacesMap } from "@/components/PlacesMap/PlacesMap";
import { DocumentNode } from "@apollo/client";
import { jsonSchema, tool } from "ai";
import type { JSONSchema7Definition } from "json-schema";
import { firstFragment } from "@/utils/firstFragment";
import { client } from "@/apollo/client";
import { SpeakerListItem } from "@/components/ListItems/SpeakerListItem";
import { PlaceListItem } from "@/components/ListItems/PlaceListItem";
import { mapEntries } from "@/utils/mapEntries";
import { fullFragmentData } from "@/utils/fullFragmentData";

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

function expose<Props extends Record<string, JSONSchema7Definition>>(
  Component: React.FunctionComponent<Record<keyof Props, any>>,
  {
    props,
    description,
    fetchIfMissing,
  }: {
    description: string;
    props: Props;
    fetchIfMissing?: boolean;
  }
) {
  return {
    Component,
    description,
    fetchIfMissing,
    schema: jsonSchema({
      type: "object",
      properties: props,
      required: Object.keys(props),
      additionalProperties: false,
    }),
  };
}

export const availableFragmentComponents = {
  ScheduleListItem: expose(ScheduleListItem, {
    description: `Display a schedule item, e.g. a conference talk or any other item with \`__typename\` of \`SchedSession\`.
Will display event name, venue name, time (start and end) as well as event speakers (if available).`,
    props: {
      SchedSession: fragmentIdentifier(ScheduleListItem.fragments.SchedSession),
    },
    fetchIfMissing: true,
  }),
  SpeakerListItem: expose(SpeakerListItem, {
    description: `Display a speaker item, e.g. a conference speaker or any other item with \`__typename\` of \`SchedSpeaker\`.
Will display speaker name, position and company.`,
    props: {
      SchedSpeaker: fragmentIdentifier(SpeakerListItem.fragments.SchedSpeaker),
    },
  }),
  PlaceListItem: expose(PlaceListItem, {
    description: `Display a place item, e.g. a venue, restaurant, cafe or any other item with \`__typename\` of \`Place\`.
Will display place name and address.
This tool should be used to display places when displaying a list of mixed data types.`,
    props: {
      Place: fragmentIdentifier(PlaceListItem.fragments.Place),
    },
  }),
  PlacesMap: expose(PlacesMap, {
    description: `Display a map with markers for one or more locations.
Will show markers for all locations and automatically center/zoom to fit all markers.
Use this to visualize places on a map, such as nearby restaurants, venues, or conference locations.
This tool should be prioritized when displaying only places, as it provides a better overview than a list.`,
    props: {
      Places: {
        type: "array",
        items: fullFragmentData(PlacesMap.fragments.Places, client),
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

// exposing all components via a single tool seems to make tool discovery harder, so we create one tool per component
export const fragmentComponentEmbeds = mapEntries(
  availableFragmentComponents,
  "ShowEmbed-",
  (v) =>
    tool({
      description: v.description,
      inputSchema: v.schema,
    })
);
