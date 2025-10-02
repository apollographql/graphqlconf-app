# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the GraphQLConf mobile application repository containing an Expo/React Native app with Apollo GraphQL integration and an Apollo Router-based backend with MCP server support.

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
# From connector/ directory:
rover dev --supergraph-config supergraph.yaml --router-config router.yaml --mcp mcp.yaml
```

## Architecture

### Expo App Structure

- **File-based routing**: Routes defined in `expo/src/app/` using Expo Router
- **GraphQL Client**: Apollo Client configured in `expo/src/apollo_client.ts` with data masking and fragment registry
- **API Routes**: Server-side API endpoints in `expo/src/app/api/` for chat and conference data
- **TypeScript Path Alias**: `@/` maps to `expo/src/`
- **Environment Variables**:
  - `EXPO_PUBLIC__GRAPHQL_SERVER`: GraphQL endpoint (default: http://localhost:4000/)
  - Automatically adapts for Android emulator (10.0.2.2 instead of localhost)

### GraphQL Code Generation

- Configured in `expo/codegen.ts`
- Generates TypeScript types with Apollo Client data masking support
- Creates typed document nodes for operations
- Generated files placed next to source files with `.generated.ts` extension
- Base types in `expo/src/graphql.generated.ts`

### Apollo Router Configuration

- Supergraph schema: `connector/supergraph.graphql`
- Router config: `connector/router.yaml` (listens on port 4000)
- MCP config: `connector/mcp.yaml` for Model Context Protocol server
- MCP Operations directory: `connector/operations/` (These become available as tools in the app)

## Development Workflow

1. Start the GraphQL router first (required for the app):

   ```bash
   cd connector
   rover dev --supergraph-config supergraph.yaml --router-config router.yaml --mcp mcp.yaml
   ```

1.5 (If developing with a local AI model with ollama): Start the ollama server:

    ```bash
    ollama serve
    ```

2. Start the Expo development server:

   ```bash
   cd expo
   npm start
   ```

3. When modifying GraphQL operations, regenerate types:

   ```bash
   (cd connector; rover graph introspect http://localhost:4000 >| supergraph.graphql)
   (cd expo; npm run codegen)
   ```

4. Before committing, run linting:
   ```bash
   cd expo
   npm run lint
   ```

- The client-side chat integration can be found in the `expo/src/components/Omnibar/` folder, and the agent is in `expo/src/app/api/chat+api.ts`
