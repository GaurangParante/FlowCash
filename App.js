import React, { useCallback, useEffect, useState } from "react";
import { StatusBar, View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import MainTabs from "./src/navigation/MainTabs";
import { ExpenseProvider } from "./src/store/ExpenseContext";
import { initDB, seedDefaultCategories } from "./src/database/db";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";
import { getNavigationTheme } from "./src/theme/navigationTheme";
import AppErrorBoundary from "./src/components/AppErrorBoundary";
import ErrorScreen from "./src/screens/ErrorScreen";

const AppShell = () => {
  const { theme } = useTheme();

  return (
    <ExpenseProvider>
      <AppErrorBoundary>
        <NavigationContainer theme={getNavigationTheme(theme)}>
          <StatusBar
            barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
            backgroundColor={theme.background}
          />
          <MainTabs />
        </NavigationContainer>
      </AppErrorBoundary>
    </ExpenseProvider>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  const prepare = useCallback(async () => {
    setLoading(true);
    setInitError(null);

    try {
      await initDB();
      await seedDefaultCategories();
    } catch (err) {
      console.error(err);
      setInitError(
        "Unable to initialize local storage. Please restart the app."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    prepare();
  }, [prepare]);

  return (
    <ThemeProvider>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : initError ? (
        <ErrorScreen
          title="Startup error"
          message={initError}
          onRetry={prepare}
        />
      ) : (
        <AppShell />
      )}
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
});

export default App;
