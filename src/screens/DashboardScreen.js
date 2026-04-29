import React, { useEffect, useMemo, useState } from "react";
import { Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import { useExpenses } from "../store/ExpenseContext";

const screenWidth = Dimensions.get("window").width - 32;
const CURRENCY_SYMBOL = "\u20B9";

const DashboardScreen = () => {
  const { expenses, loadExpenses } = useExpenses();
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    const today = new Date();
    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString();
    const total = expenses
      .filter((e) => e.date >= start)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    setTodayTotal(total);
  }, [expenses]);

  const pieData = useMemo(() => {
    const totalsByCategory = {};

    expenses.forEach((expense) => {
      const categoryName = expense.category_name || "Others";
      totalsByCategory[categoryName] =
        (totalsByCategory[categoryName] || 0) + Number(expense.amount || 0);
    });

    const colors = [
      "#f44336",
      "#2196f3",
      "#4caf50",
      "#ff9800",
      "#9c27b0",
      "#607d8b",
    ];

    return Object.keys(totalsByCategory).map((categoryName, index) => ({
      name: categoryName,
      population: totalsByCategory[categoryName],
      color: colors[index % colors.length],
      legendFontColor: "#333",
      legendFontSize: 12,
    }));
  }, [expenses]);

  const barData = useMemo(() => {
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      labels.push(day.toDateString().slice(0, 3));
      const total = expenses
        .filter((expense) => expense.date.slice(0, 10) === key)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      data.push(total);
    }

    return { labels, datasets: [{ data }] };
  }, [expenses]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.total}>
        {CURRENCY_SYMBOL}
        {todayTotal.toFixed(2)}
      </Text>

      <Text style={styles.sectionTitle}>Spending by Category</Text>
      {pieData.length > 0 ? (
        <PieChart
          data={pieData}
          width={screenWidth}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      ) : (
        <Text style={styles.emptyText}>
          Add a few expenses to unlock the charts.
        </Text>
      )}

      <Text style={styles.sectionTitle}>Last 7 Days</Text>
      <BarChart
        data={barData}
        width={screenWidth}
        height={220}
        fromZero
        chartConfig={styles.chartConfig}
        style={styles.chart}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  total: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
  },
  chart: {
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 12,
    color: "#666",
  },
  chartConfig: {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: () => "#333",
  },
});

export default DashboardScreen;
