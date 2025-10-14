# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the GraphQLConf mobile application repository containing an Expo/React Native app with Apollo GraphQL integration and an Apollo Router-based backend with MCP server support.

**For detailed GraphQL integration patterns (fragment colocation, type safety, data masking), see [PATTERNS.md](./PATTERNS.md).**

## Important Directories to Focus On

- `expo/` - Main Expo React Native application
- `connector/` - Apollo Router and MCP server configuration

## Directories to Ignore

- `ios/` - Native iOS app (separate from Expo)
- `kotlin/` - Native Android/Kotlin app (separate from Expo)

## Commands

### Expo App Development

```bash
# From expo/ directory:
npm install              # Install dependencies
npm start                # Start Expo development server
npm run ios             # Run on iOS simulator
npm run android         # Run on Android emulator
npm run web             # Run on web
npm run lint            # Run ESLint
npm run codegen         # Generate GraphQL types from operations
```

### GraphQL Router & MCP Server

```bash
# From root directory:
npm run start_rover
```

## Architecture

This project consists of two main parts: the GraphQL backend infrastructure and the Expo mobile application.

---

## GraphQL Backend (Federated Supergraph)

Located in the `connector/` directory.

### Supergraph Architecture

- **Federated GraphQL**: Multiple subgraphs unified into a single supergraph
- **Apollo Router**: Routes queries to appropriate subgraphs (runs on port 4000)
- **Configuration**: `connector/router.yaml`
- **Supergraph Schema**: `connector/supergraph.graphql` (generated from subgraph schemas)

### Subgraphs and Connectors

The supergraph consists of several subgraphs using Apollo Connectors:

1. **Local API Connector** - Conference schedule data
   - Provides types: `SchedEvent`, `SchedSession`, `SchedSpeaker`, `SchedVenue`
   - Configured via Apollo Connectors to fetch from a locally running API
   - Contains conference-specific data and relationships

2. **Google Maps Connector** - Place data and nearby search
   - Provides type: `Place` with location, displayName, formattedAddress
   - Operations: `nearbyPlaces` for searching locations
   - Configured via Apollo Connectors to use Google Maps Places API

3. **Entities Resolver** - Unified entity lookup
   - `entities(identifiers: [EntityIdentifier!]!)` field accepts mixed entity types
   - Returns union of all entity types from different subgraphs
   - Used for fetching heterogeneous lists (e.g., bookmarks of different types)

### Apollo MCP Server

The Model Context Protocol (MCP) server exposes GraphQL operations as tools for AI agents:

- **Configuration**: `connector/mcp.yaml`
- **Operations Directory**: `connector/operations/*.graphql`
  - Each `.graphql` file becomes an MCP tool
  - Operations can include comments (using `#`) for documentation
  - Triple-quote descriptions (`"""`) require MCP server v1.0+ (not supported in Rover 0.36.2)
- **Hot Reloading**: Operations are automatically reloaded when files change
- **Transport**: HTTP Streamable transport on port 5000

**Available MCP Operations:**

- `getEvents.graphql` - Fetch conference events
- `getSessions.graphql` - Fetch conference sessions
- `getEntities.graphql` - Fetch mixed entity types by ID and typename
- `getNearbyPlaces.graphql` - Search for nearby places using Google Maps
- `googleMapsGetPlaceDetails.graphql` - Get detailed place information

### Running the Backend

```bash
npm run start_rover  # From project root
```

**Important**: The Expo dev server must be running on port 8081 before starting Rover.

---

## Expo App and Server

Located in the `expo/` directory.

### App Structure

- **File-based Routing**: Routes in `expo/src/app/` using Expo Router
- **Tabs**: Main navigation in `expo/src/app/(tabs)/` (Home, Schedule, Bookmarks, Settings)
- **Screens**: Organized in `expo/src/screens/`
- **Components**: Reusable UI in `expo/src/components/`
- **TypeScript Path Alias**: `@/` maps to `expo/src/`

### Apollo Client Setup

**Configuration**: `expo/src/apollo/client.ts`

- **Data Masking**: Enabled for fragment isolation and type safety
- **Fragment Registry**: Centralized registry for all fragments
- **Local State**: Uses `LocalState` for client-side fields like `isBookmarked @client`
- **Cache Policies**: Type policies for local-only fields and bookmarks

### GraphQL Code Generation

**Configuration**: `expo/codegen.ts`

- **Generated Files**: Placed next to source files with `.generated.ts` extension
- **Base Types**: `expo/src/graphql.generated.ts`
- **Fragment Types**: Each component with fragments gets a `.generated.ts` file
- **Data Masking Support**: Generated types support Apollo Client data masking

### Component Patterns

**Fragment-based List Items**: Located in `expo/src/components/ListItems/`

- `ScheduleListItem.tsx` - Displays SchedSession with fragment
- `SpeakerListItem.tsx` - Displays SchedSpeaker with fragment
- `PlaceListItem.tsx` - Displays Place with fragment

**Shared Components**:

- `BookmarkIcon.tsx` - Reusable bookmark toggle with mutation logic
- `PlacesMap/` - Map component with markers (web and native implementations)
- `Omnibar/` - AI chat interface

### Local State and Bookmarks

- **Client-side fields**: `isBookmarked @client` on all bookmarkable types
- **Local state**: `bookmarks @client` returns array of bookmarked entities
- **Mutations**: `ToggleBookmark` mutation adds/removes bookmarks
- **@export Directive**: `BookmarksScreen` uses `@export` to pass local bookmarks to server queries

### AI Integration (Omnibar)

**Location**: `expo/src/components/Omnibar/`

- **Component**: `Omnibar.tsx` - Chat UI with typing indicator
- **Agent Backend**: `expo/src/app/api/chat+api.ts` - Server-side chat endpoint
- **Transport**: `GraphQLToolChatTransport.ts` - Custom transport integrating GraphQL tools
- **Agent Logic**: See `expo/src/agent/` for complete agent implementation

### AI Agent (`expo/src/agent/`)

The agent provides intelligent assistance using multiple tool sources and OpenAI's GPT-4.

#### Core Files

- **`agent.ts`** - Main agent orchestration
  - Combines tools from multiple sources (MCP servers, client tools, embed tools)
  - Configures OpenAI model (GPT-4o)
  - Handles message streaming with smooth streaming
  - Injects context (current time, event, location) into system messages
  - Limits conversation to 10 steps per interaction

- **`prompt.ts`** - System prompt
  - Defines agent behavior and personality
  - Instructions for using embed tools to show rich UI
  - Default context: GraphQLConf 2025
  - Guidance on conversational tone

#### Tool Sources

**1. Client Tools** (`clientTools/bookmarks.ts`)

- `getBookmarks` - Retrieve all bookmarked items with optional typename filtering
- `toggleBookmarks` - Add/remove bookmarks for entities

**2. Embed Tools** (`clientTools/embeds/fragments.ts`)

- Exposes React components as MCP tools for displaying rich content
- `ShowEmbed-ScheduleListItem` - Display conference sessions
- `ShowEmbed-SpeakerListItem` - Display speakers
- `ShowEmbed-PlaceListItem` - Display places
- `ShowEmbed-PlacesMap` - Display places on a map
- Uses `fragmentSchemaGenerator.ts` to generate JSON schemas from GraphQL fragments

**3. Supergraph MCP Tools** (`mcp/supergraphMcp.ts`)

- Connects to local MCP server at `http://127.0.0.1:5000/mcp`
- Exposes all operations from `connector/operations/` directory
- Adds custom `getCurrentEvent` tool that wraps `GetEvents` with current event ID
- Uses Streamable HTTP transport

**4. Remote Events MCP** (`mcp/buildersMcp.ts`)

- Optional connection to `https://events.apollo.dev/mcp`
- Requires OAuth authentication
- Provides access to remote event data
- Gracefully degrades if authentication fails or server unavailable

#### OAuth Support (`utils/oauth/`)

Complete OAuth 2.0 flow for authenticating with external MCP servers:

- `create.ts` - OAuth client factory
- `login.ts` - Initiate OAuth flow
- `callback.ts` - Handle OAuth callback
- `refresh.ts` - Refresh access tokens
- `status.ts` - Check authentication status
- `middleware.ts` - Request authentication middleware
- Cookie-based token storage with configurable prefixes

#### Agent Context

Context injected into every conversation:

```typescript
interface AgentContext {
  currentTime: string; // ISO timestamp
  currentEvent: string; // Event ID from EXPO_PUBLIC_CURRENT_EVENT
  location: string; // User location info or default message
}
```

### Environment Variables

- `EXPO_PUBLIC_GRAPHQL_SERVER` - GraphQL endpoint (default: `http://localhost:4000/`)
- `EXPO_PUBLIC_CURRENT_EVENT` - Current event ID for context
- Platform adaptations: Android emulator uses `10.0.2.2` instead of `localhost`

## Development Workflow

### Using VSCode Run Configurations (Recommended)

Use the pre-configured VSCode launch configurations:

1. Press **F5** or open **Run and Debug** (Cmd/Ctrl+Shift+D)
2. Select "**Start All Dev Servers**" from the dropdown
3. This will automatically start Expo first, then Rover, then Codegen watch

Or run individual services:

- "Start Expo Dev Server"
- "Start Rover (MCP Server)"
- "Watch GraphQL Codegen"
- "Start MCP Inspector"

### Manual Setup

1. Start the Expo development server first (port 8081 required):

   ```bash
   cd expo
   npm start
   ```

2. Start the GraphQL router (requires Expo to be running):

   ```bash
   npm run start_rover
   ```

3. (Optional) If developing with a local AI model with ollama:

   ```bash
   ollama serve
   ```

4. When modifying GraphQL operations, regenerate types:

   ```bash
   cd expo
   npm run codegen
   ```

### Key Notes

- Expo must be running on port 8081 before Rover starts
- VSCode configurations handle the startup order automatically
- GraphQL codegen can run in watch mode for automatic updates
- MCP operations are hot-reloaded automatically
