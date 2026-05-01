import React, { useMemo } from "react";
import { Text, StyleSheet, ScrollView, View } from "react-native";
import { useExpenses } from "../store/ExpenseContext";
import { useTheme } from "../theme/ThemeContext";
import BarTrendChart from "../components/BarTrendChart";
import SpendingCategoryChart from "../components/SpendingCategoryChart";

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

  const spendingByCategory = useMemo(() => {
    const categoryTotals = expenses.reduce((totals, expense) => {
      const name = expense.category_name || "Others";
      totals[name] = (totals[name] || 0) + Number(expense.amount || 0);
      return totals;
    }, {});

    const sorted = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const primaryItems = sorted.slice(0, 4);
    const remainingTotal = sorted
      .slice(4)
      .reduce((sum, item) => sum + item.value, 0);

    const items =
      remainingTotal > 0
        ? [
            ...primaryItems.slice(0, 3),
            { name: "Others", value: remainingTotal },
          ]
        : primaryItems;

    return {
      total: sorted.reduce((sum, item) => sum + item.value, 0),
      items,
    };
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

      <Text style={styles.sectionTitle}>Spending by Category</Text>
      <View style={styles.categoryCard}>
        {spendingByCategory.items.length > 0 ? (
          <SpendingCategoryChart
            items={spendingByCategory.items}
            total={spendingByCategory.total}
          />
        ) : (
          <Text style={styles.emptyText}>
            Add a few expenses to see category-wise spending on your dashboard.
          </Text>
        )}
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
    categoryCard: {
      backgroundColor: theme.mode === "dark" ? "#142239" : theme.surface,
      borderColor: theme.mode === "dark" ? "#223655" : theme.border,
      borderWidth: 1,
      borderRadius: 24,
      overflow: "hidden",
      paddingTop: 12,
      paddingBottom: 8,
    },
    emptyText: {
      color: theme.textMuted,
      paddingHorizontal: 16,
      paddingBottom: 14,
      lineHeight: 20,
    },
  });

export default DashboardScreen;
