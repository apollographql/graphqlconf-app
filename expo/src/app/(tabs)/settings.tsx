import { useLocalSearchParams } from "expo-router";
import { SettingsScreen } from "@/screens/Settings/SettingsScreen";

export default function Settings() {
  const params = useLocalSearchParams<{
    success?: string;
    error?: string;
  }>();

  return (
    <SettingsScreen
      successMessage={params.success === "true"}
      errorMessage={params.error}
    />
  );
}
