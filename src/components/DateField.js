import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "@react-native-vector-icons/material-design-icons";
import { useTheme } from "../theme/ThemeContext";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const formatDisplayDate = (value) =>
  value
    ? value.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Select date";

const startOfMonth = (value) =>
  new Date(value.getFullYear(), value.getMonth(), 1);

const isSameDay = (left, right) =>
  left &&
  right &&
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const buildCalendarDays = (monthDate) => {
  const firstDay = startOfMonth(monthDate);
  const startWeekDay = firstDay.getDay();
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0
  ).getDate();
  const days = [];

  for (let i = 0; i < startWeekDay; i += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
};

const DateField = ({ value, onChange, placeholder = "Select date" }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [visible, setVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(value || new Date());

  const openPicker = () => {
    setCalendarMonth(value || new Date());
    setVisible(true);
  };

  const monthLabel = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const calendarDays = buildCalendarDays(calendarMonth);

  return (
    <View>
      <Pressable style={styles.field} onPress={openPicker}>
        <View>
          <Text style={styles.valueText}>
            {value ? formatDisplayDate(value) : placeholder}
          </Text>
          {value ? (
            <Text style={styles.metaText}>
              {value.getDate()}/{value.getMonth() + 1}/{value.getFullYear()}
            </Text>
          ) : null}
        </View>
        <Icon name="calendar-month-outline" size={20} color={theme.text} />
      </Pressable>

      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setVisible(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select date</Text>
              <Pressable onPress={() => setVisible(false)}>
                <Icon name="close" size={20} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.monthNav}>
              <Pressable
                style={styles.monthButton}
                onPress={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() - 1,
                      1
                    )
                  )
                }
              >
                <Icon name="chevron-left" size={20} color={theme.text} />
              </Pressable>
              <Text style={styles.monthLabel}>{monthLabel}</Text>
              <Pressable
                style={styles.monthButton}
                onPress={() =>
                  setCalendarMonth(
                    new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth() + 1,
                      1
                    )
                  )
                }
              >
                <Icon name="chevron-right" size={20} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map((label) => (
                <Text key={label} style={styles.weekLabel}>
                  {label}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((day, index) =>
                day ? (
                  <Pressable
                    key={`${day.toISOString()}-${index}`}
                    style={[
                      styles.dayCell,
                      isSameDay(day, value) && styles.dayCellActive,
                    ]}
                    onPress={() => {
                      onChange(day);
                      setVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSameDay(day, value) && styles.dayTextActive,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </Pressable>
                ) : (
                  <View key={`empty-${index}`} style={styles.dayCell} />
                )
              )}
            </View>

            <View style={styles.footerRow}>
              <Pressable
                style={styles.footerButton}
                onPress={() => {
                  onChange(new Date());
                  setVisible(false);
                }}
              >
                <Text style={styles.footerButtonText}>Today</Text>
              </Pressable>
              <Pressable
                style={styles.footerPrimaryButton}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.footerPrimaryText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    field: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      backgroundColor: theme.surface,
      paddingHorizontal: 14,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    valueText: {
      color: theme.text,
      fontWeight: "700",
    },
    metaText: {
      marginTop: 4,
      color: theme.textSoft,
      fontSize: 12,
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: "rgba(0, 0, 0, 0.32)",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    modalCard: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 18,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    modalTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "800",
    },
    monthNav: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    monthButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
    },
    monthLabel: {
      color: theme.text,
      fontWeight: "800",
      fontSize: 16,
    },
    weekRow: {
      marginTop: 18,
      flexDirection: "row",
    },
    weekLabel: {
      flex: 1,
      textAlign: "center",
      color: theme.textSoft,
      fontWeight: "700",
      fontSize: 12,
    },
    daysGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 8,
    },
    dayCell: {
      width: "14.2857%",
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      marginTop: 6,
    },
    dayCellActive: {
      backgroundColor: theme.primaryStrong,
    },
    dayText: {
      color: theme.text,
      fontWeight: "700",
    },
    dayTextActive: {
      color: theme.mode === "dark" ? "#04101c" : "#fff",
    },
    footerRow: {
      marginTop: 18,
      flexDirection: "row",
    },
    footerButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingVertical: 13,
      alignItems: "center",
      marginRight: 10,
      backgroundColor: theme.surfaceMuted,
    },
    footerButtonText: {
      color: theme.text,
      fontWeight: "700",
    },
    footerPrimaryButton: {
      flex: 1.2,
      borderRadius: 16,
      paddingVertical: 13,
      alignItems: "center",
      backgroundColor: theme.primaryStrong,
    },
    footerPrimaryText: {
      color: theme.mode === "dark" ? "#04101c" : "#fff",
      fontWeight: "800",
    },
  });

export default DateField;
