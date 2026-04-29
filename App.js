import React, { useEffect, useState } from "react";
import {
  StatusBar,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import MainTabs from "./src/navigation/MainTabs";
import { ExpenseProvider } from "./src/store/ExpenseContext";
import { initDB, seedDefaultCategories } from "./src/database/db";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const prepare = async () => {
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
    };
    prepare();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>FlowCash</Text>
        <Text style={styles.errorText}>{initError}</Text>
      </View>
    );
  }

  return (
    <ExpenseProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <MainTabs />
      </NavigationContainer>
    </ExpenseProvider>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorText: {
    textAlign: "center",
    color: "#666",
  },
});

export default App;
