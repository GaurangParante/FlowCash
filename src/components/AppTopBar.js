import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/material-design-icons";
import { useTheme } from "../theme/ThemeContext";
import {
  cancelDailyReminder,
  getDailyReminderEnabled,
  openReminderSettings,
  scheduleDailyReminder,
  syncDailyReminder,
} from "../utils/notifications";

const AppTopBar = () => {
  const { theme, resolvedMode, toggleTheme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadReminderState = async () => {
      try {
        const enabled = await getDailyReminderEnabled();
        if (!isMounted) {
          return;
        }

        setReminderEnabled(enabled);

        if (enabled) {
          const result = await syncDailyReminder(20, 0);
          if (isMounted && !result?.ok) {
            setReminderEnabled(false);
          }
        }
      } catch (error) {
        console.error("Reminder state load failed", error);
      }
    };

    loadReminderState();

    return () => {
      isMounted = false;
    };
  }, []);

  const onToggleReminder = async (value) => {
    if (!value) {
      await cancelDailyReminder();
      setReminderEnabled(false);
      Alert.alert("Reminder disabled", "Daily reminder has been turned off.");
      return;
    }

    try {
      const result = await scheduleDailyReminder(20, 0);

      if (!result?.ok) {
        setReminderEnabled(false);
        Alert.alert(
          "Reminder unavailable",
          result?.reason || "Daily reminder enable nahi ho paya.",
          result?.action
            ? [
                {
                  text: "Not now",
                  style: "cancel",
                },
                {
                  text: "Open settings",
                  onPress: () => openReminderSettings(result.action),
                },
              ]
            : [{ text: "OK" }]
        );
        return;
      }

      setReminderEnabled(true);
      Alert.alert("Reminder set", "Daily reminder scheduled at 8:00 PM.");
    } catch (error) {
      console.error("Daily reminder failed", error);
      setReminderEnabled(false);
      Alert.alert("Reminder error", "The daily reminder could not be enabled.");
    }
  };

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.bar}>
          <View>
            <Text style={styles.appName}>FlowCash</Text>
            <Text style={styles.tagline}>Track smarter. Spend clearer.</Text>
          </View>

          <Pressable
            style={styles.settingsButton}
            onPress={() => setSettingsOpen((current) => !current)}
          >
            <Icon name="cog-outline" size={22} color={theme.text} />
          </Pressable>
        </View>
      </SafeAreaView>

      {settingsOpen ? (
        <>
          <Pressable
            style={styles.backdrop}
            onPress={() => setSettingsOpen(false)}
          />
          <View style={styles.dropdown}>
            <View style={styles.settingRow}>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>Daily Reminder</Text>
                <Text style={styles.settingMeta}>Remind me every evening</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={onToggleReminder}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingMeta}>Current: {resolvedMode}</Text>
              </View>
              <Switch
                value={resolvedMode === "dark"}
                onValueChange={toggleTheme}
              />
            </View>
          </View>
        </>
      ) : null}
    </>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: theme.surface,
      zIndex: 20,
    },
    bar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surface,
    },
    appName: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "800",
    },
    tagline: {
      marginTop: 2,
      color: theme.textSoft,
      fontSize: 12,
    },
    settingsButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.border,
    },
    backdrop: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 15,
      backgroundColor: "transparent",
    },
    dropdown: {
      position: "absolute",
      top: 82,
      right: 16,
      width: 280,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      paddingVertical: 8,
      zIndex: 25,
      shadowColor: theme.shadow,
      shadowOpacity: theme.mode === "dark" ? 0.45 : 0.14,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    settingTextWrap: {
      flex: 1,
      paddingRight: 12,
    },
    settingLabel: {
      color: theme.text,
      fontWeight: "700",
    },
    settingMeta: {
      marginTop: 4,
      color: theme.textSoft,
      fontSize: 12,
      textTransform: "capitalize",
    },
    settingDivider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: 14,
    },
  });

export default AppTopBar;
