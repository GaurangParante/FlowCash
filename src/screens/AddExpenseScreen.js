import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useExpenses } from "../store/ExpenseContext";
import { parseSmartInput } from "../utils/parseInput";
import CategoryPicker from "../components/CategoryPicker";
import DateField from "../components/DateField";
import Icon from "@react-native-vector-icons/material-design-icons";
import { useTheme } from "../theme/ThemeContext";

const formatDateInput = (value) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value) =>
  value.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const buildStoredDate = (dateValue) => `${dateValue}T12:00:00`;
const QUICK_AMOUNTS = ["50", "100", "250", "500"];
const DATE_PRESETS = [
  { label: "Today", offset: 0 },
  { label: "Yesterday", offset: -1 },
];

const AddExpenseScreen = ({ navigation }) => {
  const { categories, addExpense } = useExpenses();
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [note, setNote] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const amountRef = useRef(null);
  const noteRef = useRef(null);

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const categoryLookup = useMemo(
    () =>
      categories.reduce((lookup, category) => {
        lookup[category.name.toLowerCase()] = category.id;
        return lookup;
      }, {}),
    [categories]
  );

  const onChangeSmart = (text) => {
    setNote(text);
    const parsed = parseSmartInput(text);

    if (parsed.amount) {
      setAmount(parsed.amount.toString());
    }

    if (parsed.remainder) {
      const remainder = parsed.remainder.toLowerCase();
      const foundEntry = Object.entries(categoryLookup).find(([name]) =>
        remainder.includes(name)
      );

      if (foundEntry) {
        setCategoryId(foundEntry[1]);
      }
    }
  };

  const resetForm = () => {
    setAmount("");
    setNote("");
    setSelectedDate(new Date());
    if (categories.length > 0) {
      setCategoryId(categories[0].id);
    }
    amountRef.current?.focus();
  };

  const submitExpense = async (shouldClose) => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || Number.isNaN(parsedAmount)) {
      Alert.alert("Invalid amount", "Please enter a valid amount");
      return;
    }

    if (!categoryId) {
      Alert.alert("Missing category", "Please choose a category");
      return;
    }

    const dateInput = formatDateInput(selectedDate);
    const parsedDate = new Date(`${dateInput}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert(
        "Invalid date",
        "Please enter a valid date in YYYY-MM-DD format"
      );
      return;
    }

    try {
      await addExpense({
        amount: parsedAmount,
        category_id: categoryId,
        note,
        date: buildStoredDate(dateInput),
      });
      if (shouldClose) {
        navigation.goBack();
        return;
      }

      resetForm();
    } catch (error) {
      console.error("Save expense failed", error);
      Alert.alert(
        "Save failed",
        "The expense could not be saved. Please try again."
      );
    }
  };

  const quickDateSelect = (offset) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + offset);
    setSelectedDate(nextDate);
  };

  const shiftDate = (offset) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + offset);
    setSelectedDate(nextDate);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Add Expense</Text>
          <Text style={styles.title}>Track a spend in a few taps.</Text>
          <Text style={styles.subtitle}>
            Type `450 sushi` or tap a quick amount, category, and date.
          </Text>

          <View style={styles.amountWrap}>
            <Text style={styles.currency}>₹</Text>
            <TextInput
              ref={amountRef}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.textSoft}
              style={styles.amountInput}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => noteRef.current?.focus()}
            />
          </View>

          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((value) => (
              <Pressable
                key={value}
                style={styles.quickChip}
                onPress={() => setAmount(value)}
              >
                <Text style={styles.quickChipText}>₹{value}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Smart note</Text>
          <View style={styles.inputCard}>
            <Icon name="sparkles" size={18} color={theme.primary} />
            <TextInput
              ref={noteRef}
              value={note}
              onChangeText={onChangeSmart}
              placeholder="Lunch, cab, coffee, groceries..."
              placeholderTextColor={theme.textSoft}
              style={styles.noteInput}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <CategoryPicker
            categories={categories}
            selectedId={categoryId}
            onSelect={setCategoryId}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Date</Text>
            <View style={styles.quickDateRow}>
              {DATE_PRESETS.map((preset) => (
                <Pressable
                  key={preset.label}
                  style={styles.dateChip}
                  onPress={() => quickDateSelect(preset.offset)}
                >
                  <Text style={styles.dateChipText}>{preset.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.dateSelector}>
            <Pressable style={styles.dateArrow} onPress={() => shiftDate(-1)}>
              <Icon name="chevron-left" size={22} color={theme.text} />
            </Pressable>
            <View style={styles.dateInfo}>
              <Text style={styles.dateDisplay}>
                {formatDateLabel(selectedDate)}
              </Text>
              <Text style={styles.dateValue}>
                {formatDateInput(selectedDate)}
              </Text>
            </View>
            <Pressable style={styles.dateArrow} onPress={() => shiftDate(1)}>
              <Icon name="chevron-right" size={22} color={theme.text} />
            </Pressable>
          </View>
          <View style={styles.calendarWrap}>
            <DateField value={selectedDate} onChange={setSelectedDate} />
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={resetForm}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>
          <Pressable
            style={styles.primaryButton}
            onPress={() => submitExpense(true)}
          >
            <Text style={styles.primaryButtonText}>Save expense</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.inlineAction}
          onPress={() => submitExpense(false)}
        >
          <Icon name="plus-circle-outline" size={18} color={theme.primary} />
          <Text style={styles.inlineActionText}>Save and add another</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      padding: 18,
      paddingBottom: 32,
    },
    heroCard: {
      padding: 20,
      borderRadius: 28,
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
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
      color: theme.text,
      fontSize: 28,
      fontWeight: "800",
      marginTop: 8,
    },
    subtitle: {
      color: theme.textMuted,
      marginTop: 8,
      lineHeight: 20,
    },
    amountWrap: {
      marginTop: 22,
      backgroundColor: theme.input,
      borderRadius: 22,
      paddingHorizontal: 18,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      alignItems: "center",
    },
    currency: {
      color: theme.primary,
      fontSize: 28,
      fontWeight: "800",
      marginRight: 8,
    },
    amountInput: {
      flex: 1,
      color: theme.text,
      fontSize: 34,
      fontWeight: "800",
      padding: 0,
    },
    quickRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 16,
    },
    quickChip: {
      backgroundColor: theme.surfaceMuted,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginRight: 10,
      marginBottom: 10,
    },
    quickChipText: {
      color: theme.text,
      fontWeight: "700",
    },
    section: {
      marginTop: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
    },
    sectionLabel: {
      color: theme.text,
      fontWeight: "700",
      marginBottom: 8,
    },
    inputCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 4,
    },
    noteInput: {
      flex: 1,
      color: theme.text,
      paddingHorizontal: 10,
      paddingVertical: 12,
    },
    quickDateRow: {
      flexDirection: "row",
    },
    dateChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.surfaceMuted,
      marginLeft: 8,
    },
    dateChipText: {
      color: theme.textMuted,
      fontWeight: "700",
      fontSize: 12,
    },
    dateSelector: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      marginTop: 4,
      backgroundColor: theme.surface,
      paddingHorizontal: 10,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateArrow: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
    },
    dateInfo: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: 10,
    },
    dateDisplay: {
      color: theme.text,
      fontWeight: "800",
      fontSize: 15,
    },
    dateValue: {
      marginTop: 4,
      color: theme.textSoft,
      fontSize: 12,
    },
    calendarWrap: {
      marginTop: 10,
    },
    actions: {
      flexDirection: "row",
      marginTop: 26,
    },
    secondaryButton: {
      flex: 1,
      marginRight: 10,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: "center",
      backgroundColor: theme.surface,
    },
    secondaryButtonText: {
      color: theme.text,
      fontWeight: "700",
    },
    primaryButton: {
      flex: 1.4,
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: "center",
      backgroundColor: theme.primaryStrong,
      shadowColor: theme.primaryGlow,
      shadowOpacity: 0.35,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
    primaryButtonText: {
      color: theme.mode === "dark" ? "#04101c" : "#fff",
      fontWeight: "800",
    },
    inlineAction: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    inlineActionText: {
      color: theme.primary,
      fontWeight: "700",
      marginLeft: 8,
    },
  });

export default AddExpenseScreen;
