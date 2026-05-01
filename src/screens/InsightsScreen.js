import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useExpenses } from "../store/ExpenseContext";
import { useTheme } from "../theme/ThemeContext";
import BarTrendChart from "../components/BarTrendChart";

const CURRENCY_SYMBOL = "\u20B9";
const PERIOD_OPTIONS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

const formatCurrency = (value) =>
  `${CURRENCY_SYMBOL}${Number(value || 0).toFixed(2)}`;

const formatLabelDate = (date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const formatShortChartDate = (date) =>
  `${date.getDate()}/${date.getMonth() + 1}`;

const getWeekStart = (date) => {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  value.setHours(0, 0, 0, 0);
  return value;
};

const getMonthStart = (date) => {
  const value = new Date(date);
  value.setDate(1);
  value.setHours(0, 0, 0, 0);
  return value;
};

const buildPeriodConfig = (period) => {
  const now = new Date();

  if (period === "day") {
    const buckets = [];
    for (let i = 6; i >= 0; i -= 1) {
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - i
      );
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      buckets.push({
        key: start.toISOString().slice(0, 10),
        shortLabel: formatShortChartDate(start),
        fullLabel: formatLabelDate(start),
        start,
        end,
      });
    }
    return { title: "Daily Flow", subtitle: "Last 7 days", buckets };
  }

  if (period === "week") {
    const currentWeekStart = getWeekStart(now);
    const buckets = [];
    for (let i = 7; i >= 0; i -= 1) {
      const start = new Date(currentWeekStart);
      start.setDate(start.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      buckets.push({
        key: start.toISOString().slice(0, 10),
        shortLabel: `W${8 - i}`,
        fullLabel: `${formatLabelDate(start)} - ${formatLabelDate(
          new Date(end.getTime() - 86400000)
        )}`,
        start,
        end,
      });
    }
    return { title: "Weekly Rhythm", subtitle: "Last 8 weeks", buckets };
  }

  const currentMonthStart = getMonthStart(now);
  const buckets = [];
  for (let i = 5; i >= 0; i -= 1) {
    const start = new Date(currentMonthStart);
    start.setMonth(start.getMonth() - i);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    buckets.push({
      key: `${start.getFullYear()}-${start.getMonth() + 1}`,
      shortLabel: start.toLocaleDateString("en-IN", { month: "short" }),
      fullLabel: start.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      }),
      start,
      end,
    });
  }
  return { title: "Monthly Pace", subtitle: "Last 6 months", buckets };
};

const InsightsScreen = () => {
  const { expenses } = useExpenses();
  const [period, setPeriod] = useState("day");
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const analytics = useMemo(() => {
    const config = buildPeriodConfig(period);
    const buckets = config.buckets.map((bucket) => ({
      ...bucket,
      total: 0,
      count: 0,
      categoryTotals: {},
    }));

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const amount = Number(expense.amount || 0);
      const categoryName = expense.category_name || "Others";
      const bucket = buckets.find(
        (entry) => expenseDate >= entry.start && expenseDate < entry.end
      );

      if (!bucket) {
        return;
      }

      bucket.total += amount;
      bucket.count += 1;
      bucket.categoryTotals[categoryName] =
        (bucket.categoryTotals[categoryName] || 0) + amount;
    });

    const labels = buckets.map((bucket) => bucket.shortLabel);
    const data = buckets.map((bucket) => Number(bucket.total.toFixed(2)));
    const total = data.reduce((sum, value) => sum + value, 0);
    const average = buckets.length ? total / buckets.length : 0;
    const activeBuckets = buckets.filter((bucket) => bucket.total > 0);
    const peakBucket = activeBuckets.reduce(
      (current, bucket) =>
        !current || bucket.total > current.total ? bucket : current,
      null
    );
    const quietBucket = activeBuckets.reduce(
      (current, bucket) =>
        !current || bucket.total < current.total ? bucket : current,
      null
    );
    const latestBucket = buckets[buckets.length - 1];
    const previousBucket = buckets[buckets.length - 2] || null;
    const change = previousBucket
      ? latestBucket.total - previousBucket.total
      : 0;
    const comparisonLabel =
      {
        day: "vs yesterday",
        week: "vs last week",
        month: "vs last month",
      }[period] || "";

    const categoryTotals = {};
    buckets.forEach((bucket) => {
      Object.entries(bucket.categoryTotals).forEach(([name, value]) => {
        categoryTotals[name] = (categoryTotals[name] || 0) + value;
      });
    });

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, value]) => ({
        name,
        value,
        share: total > 0 ? (value / total) * 100 : 0,
      }));

    return {
      title: config.title,
      subtitle: config.subtitle,
      buckets,
      labels,
      data,
      total,
      average,
      peakBucket,
      quietBucket,
      latestBucket,
      change,
      comparisonLabel,
      topCategories,
    };
  }, [expenses, period]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Analytics</Text>
        <Text style={styles.heroTitle}>{analytics.title}</Text>
        <Text style={styles.heroValue}>{formatCurrency(analytics.total)}</Text>
        <Text style={styles.heroSubtext}>
          {analytics.subtitle} | Avg {formatCurrency(analytics.average)} per{" "}
          {period}
        </Text>
      </View>

      <View style={styles.segmentWrap}>
        {PERIOD_OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            style={[
              styles.segmentButton,
              period === option.key && styles.segmentButtonActive,
            ]}
            onPress={() => setPeriod(option.key)}
          >
            <Text
              style={[
                styles.segmentText,
                period === option.key && styles.segmentTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardLeft]}>
          <Text style={styles.statLabel}>Current</Text>
          <Text style={styles.statValue}>
            {formatCurrency(analytics.latestBucket?.total)}
          </Text>
          <Text style={styles.statMeta}>
            {analytics.latestBucket?.fullLabel}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Change</Text>
          <Text
            style={[
              styles.statValue,
              analytics.change >= 0 ? styles.dangerText : styles.successText,
            ]}
          >
            {analytics.change >= 0 ? "+" : "-"}
            {formatCurrency(Math.abs(analytics.change))}
          </Text>
          <Text style={styles.statMeta}>{analytics.comparisonLabel}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardLeft]}>
          <Text style={styles.statLabel}>Peak</Text>
          <Text style={styles.statValue}>
            {analytics.peakBucket
              ? formatCurrency(analytics.peakBucket.total)
              : formatCurrency(0)}
          </Text>
          <Text style={styles.statMeta}>
            {analytics.peakBucket?.fullLabel || "No data yet"}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Quietest</Text>
          <Text style={styles.statValue}>
            {analytics.quietBucket
              ? formatCurrency(analytics.quietBucket.total)
              : formatCurrency(0)}
          </Text>
          <Text style={styles.statMeta}>
            {analytics.quietBucket?.fullLabel || "No data yet"}
          </Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trend</Text>
          <Text style={styles.sectionMeta}>{analytics.subtitle}</Text>
        </View>
        <BarTrendChart labels={analytics.labels} data={analytics.data} />
      </View>

      <View style={styles.chartCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <Text style={styles.sectionMeta}>For selected range</Text>
        </View>
        {analytics.topCategories.length > 0 ? (
          analytics.topCategories.map((category) => (
            <View key={category.name} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryValue}>
                  {formatCurrency(category.value)}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(category.share, 6)}%` },
                  ]}
                />
              </View>
              <Text style={styles.categoryMeta}>
                {category.share.toFixed(0)}% of selected {period} spending
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            Start adding expenses to unlock day-wise, week-wise, and month-wise
            insights.
          </Text>
        )}
      </View>

      <View style={styles.chartCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Period Breakdown</Text>
          <Text style={styles.sectionMeta}>Every bucket in view</Text>
        </View>
        {analytics.buckets.map((bucket) => (
          <View key={bucket.key} style={styles.breakdownRow}>
            <View>
              <Text style={styles.breakdownLabel}>{bucket.fullLabel}</Text>
              <Text style={styles.breakdownMeta}>
                {bucket.count} {bucket.count === 1 ? "entry" : "entries"}
              </Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatCurrency(bucket.total)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    heroCard: {
      backgroundColor: theme.surface,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 20,
    },
    eyebrow: {
      color: theme.primary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    heroTitle: {
      marginTop: 8,
      fontSize: 26,
      fontWeight: "800",
      color: theme.text,
    },
    heroValue: {
      marginTop: 10,
      fontSize: 34,
      fontWeight: "800",
      color: theme.text,
    },
    heroSubtext: {
      marginTop: 8,
      color: theme.textMuted,
      lineHeight: 20,
    },
    segmentWrap: {
      marginTop: 16,
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 6,
    },
    segmentButton: {
      flex: 1,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: "center",
    },
    segmentButtonActive: {
      backgroundColor: theme.surfaceStrong,
    },
    segmentText: {
      color: theme.textSoft,
      fontWeight: "700",
    },
    segmentTextActive: {
      color: theme.text,
    },
    statsRow: {
      flexDirection: "row",
      marginTop: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 16,
    },
    statCardLeft: {
      marginRight: 12,
    },
    statLabel: {
      color: theme.textSoft,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    statValue: {
      marginTop: 10,
      color: theme.text,
      fontSize: 22,
      fontWeight: "800",
    },
    statMeta: {
      marginTop: 8,
      color: theme.textMuted,
      lineHeight: 18,
    },
    successText: {
      color: theme.success,
    },
    dangerText: {
      color: theme.danger,
    },
    chartCard: {
      marginTop: 16,
      backgroundColor: theme.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
      paddingVertical: 16,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      marginBottom: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 17,
      fontWeight: "800",
    },
    sectionMeta: {
      color: theme.textSoft,
      fontSize: 12,
      fontWeight: "600",
    },
    categoryRow: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 14,
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    categoryName: {
      color: theme.text,
      fontWeight: "700",
    },
    categoryValue: {
      color: theme.text,
      fontWeight: "800",
    },
    progressTrack: {
      marginTop: 10,
      height: 10,
      borderRadius: 999,
      backgroundColor: theme.surfaceMuted,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: theme.primaryStrong,
    },
    categoryMeta: {
      marginTop: 8,
      color: theme.textSoft,
      fontSize: 12,
    },
    emptyText: {
      paddingHorizontal: 16,
      color: theme.textMuted,
      lineHeight: 20,
    },
    breakdownRow: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    breakdownLabel: {
      color: theme.text,
      fontWeight: "700",
    },
    breakdownMeta: {
      marginTop: 4,
      color: theme.textSoft,
      fontSize: 12,
    },
    breakdownValue: {
      color: theme.text,
      fontWeight: "800",
    },
  });

export default InsightsScreen;
