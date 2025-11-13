import { ApolloServer, HeaderMap } from "@apollo/server";
import type { HTTPGraphQLRequest } from "@apollo/server";
import { gql } from "@apollo/client";
import { buildSubgraphSchema } from "@apollo/subgraph";
import type { GraphQLSchema } from "graphql";

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.10"
      import: ["@key", "@external"]
    )

  type Query {
    entities(identifiers: [EntityIdentifier!]!): [Entity!]!
  }

  input EntityIdentifier {
    typename: String!
    id: String!
  }

  interface Entity {
    id: String!
  }

  extend type SchedSession implements Entity @key(fields: "id") {
    id: String! @external
  }

  extend type SchedSpeaker implements Entity @key(fields: "id") {
    id: String! @external
  }

  extend type SchedEvent implements Entity @key(fields: "id") {
    id: String! @external
  }

  extend type SchedVenue implements Entity @key(fields: "id") {
    id: String! @external
  }

  extend type Place implements Entity @key(fields: "id") {
    id: String! @external
  }
`;

const resolvers = {
  Query: {
    entities: (
      _: unknown,
      { identifiers }: { identifiers: { typename: string; id: string }[] }
    ) => {
      return identifiers.map(({ typename, id }) => ({
        __typename: typename,
        id,
      }));
    },
  },
};

const schema = buildSubgraphSchema({ typeDefs, resolvers });

declare global {
  var __apolloServer:
    | (ApolloServer<any> & {
        creationSchema: GraphQLSchema;
        started: Promise<ApolloServer>;
      })
    | undefined;
}

async function getServer() {
  // Singleton pattern to ensure we only create one ApolloServer instance, even when Expo hot-reloads modules.
  let server = global.__apolloServer;
  if (!server) {
    console.log("Starting new ApolloServer instance");
    const plainServer = new ApolloServer({
      schema,
    });
    global.__apolloServer = server = Object.assign(plainServer, {
      creationSchema: schema,
      started: plainServer.start().then(() => plainServer),
    });
  }
  return server.started;
}

async function handler(request: Request) {
  const server = await getServer();
  const headers = new HeaderMap();
  request.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  const httpGraphQLRequest: HTTPGraphQLRequest = {
    method: request.method.toUpperCase(),
    headers,
    body: request.method === "POST" ? await request.json() : undefined,
    search: new URL(request.url).search,
  };

  const result = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest,
    context: async () => ({}),
  });

  return new Response(
    result.body.kind === "complete"
      ? result.body.string
      : (ReadableStream as any).from(result.body.asyncIterator),
    {
      status: result.status || 200,
      headers: Object.fromEntries(result.headers),
    }
  );
}

export async function POST(request: Request) {
  return handler(request);
}

export async function GET(request: Request) {
  return handler(request);
}
