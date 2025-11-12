import { client } from "@/apollo/client";
import { removeDirectivesFromDocument } from "@apollo/client/utilities/internal";
import { BookmarksScreen } from "@/screens/Bookmarks/BookmarksScreen";
import { HomeScreen } from "@/screens/Home/HomeScreen";
import PlaceDetailScreen from "@/screens/PlaceDetail/PlaceDetailScreen";
import { ScheduleScreen } from "@/screens/Schedule/ScheduleScreen";
import SessionDetailScreen from "@/screens/SessionDetail/SessionDetailScreen";
import { generateQueryJsonSchema } from "@/utils/generateJsonSchema";
import { Schema, tool } from "ai";
import { AgentContext, AgentInternalContext } from "../AgentContext";
import type { JSONSchema7Definition } from "json-schema";
import {
  ExternalPathString,
  HrefInputParams,
  RelativePathString,
} from "expo-router";
import { validatingJSONSchema } from "@/utils/validatingJSONSchema";
import { print } from "graphql";
import {
  TypedDocumentNode,
  VariablesOf,
} from "@graphql-typed-document-node/core";

export type ValidRoute = Exclude<
  HrefInputParams["pathname"],
  RelativePathString | ExternalPathString
>;

const availableRoutes = {
  "/(tabs)": routeDescription({
    name: "Home",
    description: "The home page of the app",
    inputSchema: null,
    // buildVariablesSchema is not implemented in graphql-standard-schema yet, so we manually define the input schemas for routes that require parameters
    query: HomeScreen.Query,
    variables: schema<VariablesOf<typeof HomeScreen.Query>>({
      type: "object",
      properties: {
        eventId: { type: "string" },
      },
      required: ["eventId"],
      additionalProperties: false,
    }),
  }),
  "/(tabs)/schedule": routeDescription({
    name: "Schedule",
    description: "The schedule page showing the list of sessions",
    inputSchema: null,
    query: ScheduleScreen.Query,
    variables: schema<VariablesOf<typeof ScheduleScreen.Query>>({
      type: "object",
      properties: {
        eventId: { type: "string" },
      },
      required: ["eventId"],
      additionalProperties: false,
    }),
  }),
  "/(tabs)/bookmarks": routeDescription({
    name: "Bookmarks",
    description: "The bookmarks page showing the list of bookmarked sessions",
    inputSchema: null,
    query: BookmarksScreen.Query,
    variables: schema<VariablesOf<typeof BookmarksScreen.Query>>({
      type: "object",
      properties: {
        identifiers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              typename: { type: "string" },
            },
            required: ["id", "typename"],
            additionalProperties: false,
          },
        },
      },
      required: [],
      additionalProperties: false,
    }),
  }),
  "/(tabs)/settings": routeDescription({
    name: "Settings",
    description: "The settings page of the app",
    inputSchema: null,
    query: null,
    variables: null,
  }),
  "/session/[id]": routeDescription({
    name: "Session Details",
    description:
      "The details page for a specific session, identified by its ID",
    inputSchema: schema<{ id: string }>({
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    }),
    query: SessionDetailScreen.Query,
    variables: schema<VariablesOf<typeof SessionDetailScreen.Query>>({
      type: "object",
      properties: {
        sessionId: { type: "string" },
      },
      required: ["sessionId"],
      additionalProperties: false,
    }),
  }),
  "/place/[id]": routeDescription({
    name: "Place Details",
    description: "The details page for a specific place, identified by its ID",
    inputSchema: schema<{ id: string }>({
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    }),
    query: PlaceDetailScreen.Query,
    variables: schema<VariablesOf<typeof PlaceDetailScreen.Query>>({
      type: "object",
      properties: {
        placeId: { type: "string" },
      },
      required: ["placeId"],
      additionalProperties: false,
    }),
  }),
} satisfies Partial<Record<ValidRoute, unknown>>;

function schema<T>(
  schema: JSONSchema7Definition
): Schema<T> & JSONSchema7Definition {
  return schema as Schema<T> & JSONSchema7Definition;
}
function routeDescription<
  RouteParams = never,
  TData = never,
  TVariables = never,
>(desc: RouteDescription<RouteParams, TData, TVariables>) {
  return desc;
}
interface RouteDescription<
  RouteParams = never,
  TData = never,
  TVariables = never,
> {
  name: string;
  description: string;
  inputSchema: [RouteParams] extends [never] ? null : Schema<RouteParams>;
  query: [TData] extends [never] ? null : TypedDocumentNode<TData, TVariables>;
  // This is not really fully what I want right now. Maybe a function `RouteParams => TVariables` would be better?
  variables: [TData] extends [never]
    ? null
    : Schema<TVariables> & JSONSchema7Definition;
}

const getRouteInformation = tool({
  //   name: "getRouteInformation",
  description: `Get information about a specific route in the app.`,
  inputSchema: validatingJSONSchema<{ route: string }>({
    type: "object",
    properties: {
      route: {
        type: "string",
        oneOf: Object.keys(availableRoutes).map((route) => ({ const: route })),
        description: `The route to get information about. Param-like route segments are to be taken literal, so keep placeholders like "[id]" and don't fill in values.`,
      },
    },
    required: ["route"],
    additionalProperties: false,
  }),
  execute({ route }) {
    const routeInfo = availableRoutes[route as keyof typeof availableRoutes];
    if (!routeInfo) {
      throw new Error(
        `Route "${route}" not found. Available routes are: ${Object.keys(
          availableRoutes
        ).join(", ")}`
      );
    }
    return {
      pathname: route,
      name: routeInfo.name,
      description: routeInfo.description,
      params: routeInfo.inputSchema || null,
      dataShape: routeInfo.query
        ? generateQueryJsonSchema(routeInfo.query, client)
        : null,
    };
  },
});

const getCurrentRouteInformation = tool({
  name: "getCurrentRouteInformation",
  description: `Get information about the current route the user is on, including the expected params and the shape of the data returned by the route's query.`,
  inputSchema: validatingJSONSchema({
    type: "object",
    properties: {},
  }),
  async execute(_input, options) {
    const route = (options.experimental_context as AgentContext).route;
    if (!route) {
      throw new Error(
        `No current route found in the context. Make sure to provide the current route in the AgentContext when calling the agent.`
      );
    }
    return getRouteInformation.execute!({ route }, options);
  },
});

const getRouteData = tool({
  name: "getRouteData",
  description: `Get the data for a specific route in the app, given the route and its parameters. The data returned matches the shape of the data returned by the route's query. Keep in mind that this might be a lot of data, so use it only when necessary.`,
  inputSchema: validatingJSONSchema<{
    routeDescription: {
      pathname: HrefInputParams["pathname"];
      queryVariables?: Record<string, unknown>;
    };
  }>({
    type: "object",
    properties: {
      routeDescription: {
        oneOf: Object.entries(availableRoutes).map<JSONSchema7Definition>(
          ([key, route]) =>
            route.variables
              ? ({
                  type: "object",
                  properties: {
                    pathname: { type: "string", const: key },
                    queryVariables: route.variables,
                  },
                  required: ["pathname", "queryVariables"],
                  additionalProperties: false,
                } satisfies JSONSchema7Definition as JSONSchema7Definition)
              : ({
                  type: "object",
                  properties: {
                    pathname: { type: "string", const: key },
                  },
                  required: ["pathname"],
                  additionalProperties: false,
                } satisfies JSONSchema7Definition)
        ),
      },
    },
    required: ["routeDescription"],
    additionalProperties: false,
  }),
  execute: async ({ routeDescription }, options) => {
    const experimental_context =
      options.experimental_context as AgentInternalContext;
    const { pathname } = routeDescription;
    const routeInfo = availableRoutes[pathname as keyof typeof availableRoutes];
    if (!routeInfo) {
      throw new Error(
        `Route "${pathname}" not found. Available routes are: ${Object.keys(
          availableRoutes
        ).join(", ")}`
      );
    }
    const query = routeInfo.query;
    if (!query) {
      return {};
    }
    return experimental_context.executeQuery(
      print(
        removeDirectivesFromDocument([{ name: "client", remove: true }], query)!
      ),
      routeDescription.queryVariables
    );
  },
});

const navigateToRoute = tool({
  name: "navigateToRoute",
  description: `
Navigate to a specific route in the app, given the route and its parameters.
This will change the current route in the app to the specified route.
Use this tool sparingly, and only when you are certain that the user wants to navigate within the app. If you're not sure, ask them for permission.
Note that after using this tool, if the tool call returns 'success: true', you can assume that the navigation succeeded.
Even though the context now might state that the user is on the target route, do not assume that the user was already on that route before the navigation.
`,
  inputSchema: getRouteData.inputSchema,
});

export type NavigateToRouteTool = typeof navigateToRoute;

export const routes = {
  getRouteInformation,
  getCurrentRouteInformation,
  getRouteData,
  navigateToRoute,
};
