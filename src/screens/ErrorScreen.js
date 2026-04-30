import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "../theme/ThemeContext";

const ErrorScreen = ({
  title = "Something went wrong",
  message = "The app hit an unexpected error.",
  details,
  onRetry,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>FlowCash</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {details ? <Text style={styles.details}>{details}</Text> : null}
        {onRetry ? (
          <Pressable style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: theme.background,
    },
    card: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 24,
      shadowColor: theme.shadow,
      shadowOpacity: theme.mode === "dark" ? 0.4 : 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 6,
    },
    eyebrow: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    title: {
      marginTop: 8,
      fontSize: 26,
      fontWeight: "800",
      color: theme.text,
    },
    message: {
      marginTop: 12,
      color: theme.textMuted,
      lineHeight: 22,
    },
    details: {
      marginTop: 14,
      color: theme.textSoft,
      lineHeight: 20,
    },
    button: {
      marginTop: 22,
      borderRadius: 18,
      paddingVertical: 15,
      alignItems: "center",
      backgroundColor: theme.primaryStrong,
    },
    buttonText: {
      color: theme.mode === "dark" ? "#04101c" : "#fff",
      fontWeight: "800",
    },
  });

export default ErrorScreen;
