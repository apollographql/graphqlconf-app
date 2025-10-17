import { client } from "@/apollo/client";
import { BookmarksScreen } from "@/screens/Bookmarks/BookmarksScreen";
import { HomeScreen } from "@/screens/Home/HomeScreen";
import PlaceDetailScreen from "@/screens/PlaceDetail/PlaceDetailScreen";
import { ScheduleScreen } from "@/screens/Schedule/ScheduleScreen";
import SessionDetailScreen from "@/screens/SessionDetail/SessionDetailScreen";
import { generateQueryJsonSchema } from "@/utils/generateJsonSchema";
import { tool } from "ai";
import { AgentContext } from "../AgentContext";
import type { JSONSchema7Definition } from "json-schema";
import {
  ExternalPathString,
  HrefInputParams,
  RelativePathString,
} from "expo-router";
import { validatingJSONSchema } from "@/utils/validatingJSONSchema";

export type ValidRoute = Exclude<
  HrefInputParams["pathname"],
  RelativePathString | ExternalPathString
>;

const availableRoutes = {
  "(tabs)": {
    name: "Home",
    description: "The home page of the app",
    inputSchema: null,
    query: HomeScreen.Query,
  },
  "(tabs)/schedule": {
    name: "Schedule",
    description: "The schedule page showing the list of sessions",
    inputSchema: null,
    query: ScheduleScreen.Query,
  },
  "(tabs)/bookmarks": {
    name: "Bookmarks",
    description: "The bookmarks page showing the list of bookmarked sessions",
    inputSchema: null,
    query: BookmarksScreen.Query,
  },
  "(tabs)/settings": {
    name: "Settings",
    description: "The settings page of the app",
    inputSchema: null,
    query: null,
  },
  "/session/[id]": {
    name: "Session Details",
    description:
      "The details page for a specific session, identified by its ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    query: SessionDetailScreen.Query,
  },
  "/place/[id]": {
    name: "Place Details",
    description: "The details page for a specific place, identified by its ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
    query: PlaceDetailScreen.Query,
  },
} as const satisfies Record<ValidRoute, unknown>;

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
    routeDescription: HrefInputParams;
  }>({
    type: "object",
    properties: {
      routeDescription: {
        oneOf: Object.entries(availableRoutes).map<JSONSchema7Definition>(
          ([key, route]) => ({
            type: "object",
            properties: {
              pathname: { type: "string", const: key },
              params: (route.inputSchema as JSONSchema7Definition | null) ?? {
                type: "object",
              },
            },
            required: ["pathname", "params"],
          })
        ),
      },
    },
    required: ["routeDescription"],
    additionalProperties: false,
  }),
});

const navigateToRoute = tool({
  name: "navigateToRoute",
  description: `Navigate to a specific route in the app, given the route and its parameters. This will change the current route in the app to the specified route. Use this tool sparingly, and only when you are certain that the user wants to navigate within the app. If you're not sure, ask them for permission.`,
  inputSchema: getRouteData.inputSchema,
});

export type NavigateToRouteTool = typeof navigateToRoute;

export const routes = {
  getRouteInformation,
  getCurrentRouteInformation,
  getRouteData,
  navigateToRoute,
};
