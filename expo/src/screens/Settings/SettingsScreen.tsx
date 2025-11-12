import { useEffect, useState } from "react";
import {
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { generateAPIUrl } from "@/generateApiUrl";
import { gql } from "@apollo/client";
import { QueryRef, useReadQuery } from "@apollo/client/react";
import { SettingsScreenDocument } from "./SettingsScreen.generated";
import { AiFrameworkSection } from "./components/AiFrameworkSection";
import { ResultOf, VariablesOf } from "@graphql-typed-document-node/core";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query SettingsScreen {
      ...AiFrameworkSection_frameworks
    }
  `;
}

SettingsScreen.Query = SettingsScreenDocument;

interface SettingsScreenProps {
  successMessage?: boolean;
  errorMessage?: string;
  queryRef: QueryRef<
    ResultOf<typeof SettingsScreen.Query>,
    VariablesOf<typeof SettingsScreen.Query>
  >;
}

export function SettingsScreen({
  successMessage,
  errorMessage,
  queryRef,
}: SettingsScreenProps) {
  const { data } = useReadQuery(queryRef);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(generateAPIUrl("/api/mcp-auth/status"));
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [successMessage, errorMessage]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(generateAPIUrl("/api/mcp-auth/login"));
      const data = await response.json();

      if (data.authUrl) {
        // On web, navigate in the same window instead of opening a new tab
        if (Platform.OS === "web") {
          window.location.href = data.authUrl;
        } else {
          // On native, use Linking (which we'd need to import back)
          await Linking.openURL(data.authUrl);
        }
      } else {
        console.error("No auth URL received");
      }
    } catch (error) {
      console.error("Failed to initiate OAuth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await fetch(generateAPIUrl("/api/mcp-auth/status"), {
        method: "DELETE",
      });
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Failed to disconnect:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Settings
      </ThemedText>

      {successMessage && (
        <ThemedView style={styles.successBox}>
          <ThemedText style={styles.successText}>
            ✓ Successfully connected to MCP server!
          </ThemedText>
        </ThemedView>
      )}

      {errorMessage && (
        <ThemedView style={styles.errorBox}>
          <ThemedText style={styles.errorText}>
            ✗ Authentication failed: {errorMessage}
          </ThemedText>
        </ThemedView>
      )}

      <AiFrameworkSection frameworks={data} />

      <ThemedText type="subtitle" style={styles.sectionHeading}>
        External MCP Servers
      </ThemedText>

      <ThemedView style={styles.section}>
        <ThemedText type="defaultSemiBold">
          MCP Builders Event MCP Server
        </ThemedText>
        <ThemedText style={styles.description}>
          Connect to https://events.apollo.dev/mcp to access event tools in the
          chat.
        </ThemedText>

        <ThemedView style={styles.statusRow}>
          <ThemedText>Status:</ThemedText>
          {isAuthenticated === null ? (
            <ActivityIndicator />
          ) : (
            <ThemedText
              style={isAuthenticated ? styles.connected : styles.disconnected}
            >
              {isAuthenticated ? "Connected" : "Not Connected"}
            </ThemedText>
          )}
        </ThemedView>

        {isLoading ? (
          <ActivityIndicator style={styles.button} />
        ) : isAuthenticated ? (
          <Pressable style={styles.button} onPress={handleDisconnect}>
            <ThemedText style={styles.buttonText}>Disconnect</ThemedText>
          </Pressable>
        ) : (
          <Pressable style={styles.button} onPress={handleConnect}>
            <ThemedText style={styles.buttonText}>
              Connect MCP Server
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  sectionHeading: {
    marginTop: 20,
    marginBottom: 10,
  },
  section: {
    gap: 12,
  },
  description: {
    opacity: 0.7,
    fontSize: 14,
  },
  statusRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  connected: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  disconnected: {
    color: "#999",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  successBox: {
    backgroundColor: "#d4edda",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  successText: {
    color: "#155724",
  },
  errorBox: {
    backgroundColor: "#f8d7da",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: "#721c24",
  },
});
