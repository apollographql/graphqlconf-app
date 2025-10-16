import type { LocalState } from "@apollo/client/local-state";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AI_FRAMEWORK_KEY = "@graphqlconf:aiFramework";

export type AiFramework = "none" | "vercel";

export const aiFrameworkResolvers = {
  Query: {
    aiFramework: async (): Promise<AiFramework> => {
      try {
        const value = (await AsyncStorage.getItem(
          AI_FRAMEWORK_KEY
        )) as AiFramework | null;
        return value || "none";
      } catch (error) {
        console.error("Failed to get AI framework:", error);
        return "none";
      }
    },
  },

  Mutation: {
    chooseAiFramework: async (
      _root: unknown,
      args: { framework: AiFramework },
      { client }
    ): Promise<AiFramework> => {
      try {
        await AsyncStorage.setItem(AI_FRAMEWORK_KEY, args.framework);
        client.cache.evict({ fieldName: "aiFramework" });
        return args.framework;
      } catch (error) {
        console.error("Failed to set AI framework:", error);
        throw new Error("Failed to update AI framework preference");
      }
    },
  },
} satisfies LocalState.Resolvers;
