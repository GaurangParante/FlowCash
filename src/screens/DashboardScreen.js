import React, { useMemo } from "react";
import { Text, StyleSheet, ScrollView, View } from "react-native";
import { useExpenses } from "../store/ExpenseContext";
import { useTheme } from "../theme/ThemeContext";
import BarTrendChart from "../components/BarTrendChart";

const CURRENCY_SYMBOL = "\u20B9";
const getLocalDateKey = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getChartDateLabel = (value) => {
  const date = new Date(value);
  return `${date.getDate()}/${date.getMonth() + 1}`;
};

const DashboardScreen = () => {
  const { expenses } = useExpenses();
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const todayTotal = useMemo(() => {
    const todayKey = getLocalDateKey(new Date());
    const total = expenses
      .filter((expense) => getLocalDateKey(expense.date) === todayKey)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    return total;
  }, [expenses]);

  const barData = useMemo(() => {
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const key = getLocalDateKey(day);
      labels.push(getChartDateLabel(day));
      const total = expenses
        .filter((expense) => getLocalDateKey(expense.date) === key)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      data.push(total);
    }

    return { labels, datasets: [{ data }] };
  }, [expenses]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.title}>Today</Text>
        <Text style={styles.total}>
          {CURRENCY_SYMBOL}
          {todayTotal.toFixed(2)}
        </Text>
        <Text style={styles.caption}>
          Live pulse of your cash flow across the day.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Last 7 Days</Text>
      <View style={styles.chartCard}>
        <BarTrendChart
          labels={barData.labels}
          data={barData.datasets[0].data}
        />
      </View>
    </ScrollView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      padding: 16,
      paddingBottom: 32,
    },
    heroCard: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 28,
      padding: 20,
    },
    title: {
      fontSize: 14,
      fontWeight: "800",
      color: theme.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    total: {
      fontSize: 34,
      fontWeight: "800",
      marginTop: 8,
      color: theme.text,
    },
    caption: {
      color: theme.textMuted,
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginTop: 18,
      marginBottom: 10,
      color: theme.text,
    },
    chartCard: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 24,
      overflow: "hidden",
      paddingTop: 14,
      paddingBottom: 10,
    },
  });

export default DashboardScreen;
