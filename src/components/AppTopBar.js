import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/material-design-icons";
import { useTheme } from "../theme/ThemeContext";
import {
  cancelDailyReminder,
  getDailyReminderEnabled,
  getDailyReminderTime,
  openReminderSettings,
  saveDailyReminderTime,
  scheduleDailyReminder,
  syncDailyReminder,
} from "../utils/notifications";

const formatReminderTime = ({ hour, minute }) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const shiftTimeValue = (current, delta, max) => {
  const next = current + delta;

  if (next < 0) {
    return max;
  }

  if (next > max) {
    return 0;
  }

  return next;
};

const AppTopBar = () => {
  const { theme, resolvedMode, toggleTheme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState({ hour: 20, minute: 0 });
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [draftReminderTime, setDraftReminderTime] = useState({
    hour: 20,
    minute: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const loadReminderState = async () => {
      try {
        const [enabled, storedTime] = await Promise.all([
          getDailyReminderEnabled(),
          getDailyReminderTime(),
        ]);
        if (!isMounted) {
          return;
        }

        setReminderEnabled(enabled);
        setReminderTime(storedTime);
        setDraftReminderTime(storedTime);

        if (enabled) {
          const result = await syncDailyReminder();
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
      const result = await scheduleDailyReminder(
        reminderTime.hour,
        reminderTime.minute
      );

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
      Alert.alert(
        "Reminder set",
        `Daily reminder scheduled at ${formatReminderTime(reminderTime)}.`
      );
    } catch (error) {
      console.error("Daily reminder failed", error);
      setReminderEnabled(false);
      Alert.alert("Reminder error", "The daily reminder could not be enabled.");
    }
  };

  const openTimeModal = () => {
    setDraftReminderTime(reminderTime);
    setTimeModalOpen(true);
  };

  const updateDraftTime = (key, delta, max) => {
    setDraftReminderTime((current) => ({
      ...current,
      [key]: shiftTimeValue(current[key], delta, max),
    }));
  };

  const saveReminderTime = async () => {
    try {
      const savedTime = await saveDailyReminderTime(
        draftReminderTime.hour,
        draftReminderTime.minute
      );
      setReminderTime(savedTime);
      setTimeModalOpen(false);

      if (!reminderEnabled) {
        Alert.alert(
          "Reminder time saved",
          `Daily reminder time set to ${formatReminderTime(savedTime)}.`
        );
        return;
      }

      const result = await scheduleDailyReminder(
        savedTime.hour,
        savedTime.minute
      );

      if (!result?.ok) {
        Alert.alert(
          "Reminder unavailable",
          result?.reason || "Daily reminder reschedule nahi ho paya.",
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

      Alert.alert(
        "Reminder updated",
        `Daily reminder moved to ${formatReminderTime(savedTime)}.`
      );
    } catch (error) {
      console.error("Reminder time save failed", error);
      Alert.alert("Reminder error", "Reminder time save nahi ho paya.");
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

            <Pressable style={styles.settingRow} onPress={openTimeModal}>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>Reminder Time</Text>
                <Text style={styles.settingMeta}>
                  {formatReminderTime(reminderTime)}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.textMuted} />
            </Pressable>

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

      <Modal
        visible={timeModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setTimeModalOpen(false)}
          />
          <View style={styles.timeModal}>
            <View style={styles.timeModalHeader}>
              <Text style={styles.timeModalTitle}>Reminder Time</Text>
              <Pressable onPress={() => setTimeModalOpen(false)}>
                <Icon name="close" size={20} color={theme.text} />
              </Pressable>
            </View>

            <Text style={styles.timeModalMeta}>
              Daily reminder will ring at{" "}
              {formatReminderTime(draftReminderTime)}.
            </Text>

            <View style={styles.timePickerRow}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeBlockLabel}>Hour</Text>
                <Pressable
                  style={styles.timeAdjustButton}
                  onPress={() => updateDraftTime("hour", 1, 23)}
                >
                  <Icon name="chevron-up" size={20} color={theme.text} />
                </Pressable>
                <Text style={styles.timeValue}>
                  {String(draftReminderTime.hour).padStart(2, "0")}
                </Text>
                <Pressable
                  style={styles.timeAdjustButton}
                  onPress={() => updateDraftTime("hour", -1, 23)}
                >
                  <Icon name="chevron-down" size={20} color={theme.text} />
                </Pressable>
              </View>

              <Text style={styles.timeColon}>:</Text>

              <View style={styles.timeBlock}>
                <Text style={styles.timeBlockLabel}>Minute</Text>
                <Pressable
                  style={styles.timeAdjustButton}
                  onPress={() => updateDraftTime("minute", 5, 59)}
                >
                  <Icon name="chevron-up" size={20} color={theme.text} />
                </Pressable>
                <Text style={styles.timeValue}>
                  {String(draftReminderTime.minute).padStart(2, "0")}
                </Text>
                <Pressable
                  style={styles.timeAdjustButton}
                  onPress={() => updateDraftTime("minute", -5, 59)}
                >
                  <Icon name="chevron-down" size={20} color={theme.text} />
                </Pressable>
              </View>
            </View>

            <View style={styles.timeModalActions}>
              <Pressable
                style={styles.timeSecondaryButton}
                onPress={() => setTimeModalOpen(false)}
              >
                <Text style={styles.timeSecondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.timePrimaryButton}
                onPress={saveReminderTime}
              >
                <Text style={styles.timePrimaryButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 18,
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(6, 12, 20, 0.38)",
    },
    timeModal: {
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      padding: 18,
      zIndex: 30,
      shadowColor: theme.shadow,
      shadowOpacity: theme.mode === "dark" ? 0.45 : 0.16,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 12 },
      elevation: 14,
    },
    timeModalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    timeModalTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "800",
    },
    timeModalMeta: {
      color: theme.textSoft,
      marginTop: 8,
      lineHeight: 20,
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
    timePickerRow: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    timeBlock: {
      width: 112,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surfaceMuted,
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: "center",
    },
    timeBlockLabel: {
      color: theme.textSoft,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    timeAdjustButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    timeValue: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "800",
      marginTop: 10,
    },
    timeColon: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "800",
      marginHorizontal: 12,
    },
    timeModalActions: {
      flexDirection: "row",
      marginTop: 20,
    },
    timeSecondaryButton: {
      flex: 1,
      marginRight: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surfaceMuted,
      paddingVertical: 14,
      alignItems: "center",
    },
    timeSecondaryButtonText: {
      color: theme.text,
      fontWeight: "700",
    },
    timePrimaryButton: {
      flex: 1.2,
      borderRadius: 16,
      backgroundColor: theme.primaryStrong,
      paddingVertical: 14,
      alignItems: "center",
    },
    timePrimaryButtonText: {
      color: theme.mode === "dark" ? "#04101c" : "#fff",
      fontWeight: "800",
    },
  });

export default AppTopBar;
