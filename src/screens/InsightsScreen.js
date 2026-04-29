import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Switch, Button, Alert } from "react-native";
import { useExpenses } from "../store/ExpenseContext";
import { scheduleDailyReminder } from "../utils/notifications";

const CURRENCY_SYMBOL = "\u20B9";

const InsightsScreen = () => {
  const { expenses, getInsights } = useExpenses();
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const thisWeekSpending = useMemo(() => {
    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 6
    ).toISOString();

    return expenses
      .filter((expense) => expense.date >= start)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  }, [expenses]);

  const topCategory = useMemo(() => {
    const totalsByCategory = {};

    expenses.forEach((expense) => {
      const categoryName = expense.category_name || "Others";
      totalsByCategory[categoryName] =
        (totalsByCategory[categoryName] || 0) + Number(expense.amount || 0);
    });

    const entries = Object.entries(totalsByCategory).sort(
      (a, b) => b[1] - a[1]
    );
    return entries[0] ? { name: entries[0][0], amount: entries[0][1] } : null;
  }, [expenses]);

  const onToggle = async (value) => {
    setReminderEnabled(value);
    if (value) {
      await scheduleDailyReminder(20, 0);
      Alert.alert("Reminder set", "Daily reminder scheduled at 8:00 PM");
      return;
    }

    Alert.alert("Reminder disabled");
  };

  const showInsights = async () => {
    const data = await getInsights();
    const comparisonText = data.comparison
      ? `This week: ${CURRENCY_SYMBOL}${data.comparison.thisTotal.toFixed(
          2
        )}\nLast week: ${CURRENCY_SYMBOL}${data.comparison.lastTotal.toFixed(
          2
        )}`
      : "No comparison data available yet.";
    Alert.alert("Insights", comparisonText);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        This week you spent {CURRENCY_SYMBOL}
        {thisWeekSpending.toFixed(2)}
      </Text>
      {topCategory ? (
        <Text style={styles.topCategory}>
          You spent {CURRENCY_SYMBOL}
          {topCategory.amount.toFixed(2)} on {topCategory.name} this week
        </Text>
      ) : (
        <Text style={styles.topCategory}>
          Start logging expenses to see insights.
        </Text>
      )}

      <View style={styles.reminderRow}>
        <Text style={styles.reminderLabel}>Daily Reminder</Text>
        <Switch value={reminderEnabled} onValueChange={onToggle} />
      </View>

      <View style={styles.buttonWrap}>
        <Button title="Show More Insights" onPress={showInsights} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "800",
  },
  topCategory: {
    marginTop: 12,
  },
  reminderRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reminderLabel: {
    fontWeight: "700",
  },
  buttonWrap: {
    marginTop: 20,
  },
});

export default InsightsScreen;
