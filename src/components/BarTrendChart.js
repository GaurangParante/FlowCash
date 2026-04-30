import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

const CURRENCY_SYMBOL = "\u20B9";

const BarTrendChart = ({ labels, data, height = 180, yTicks = 4 }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, height), [theme, height]);
  const maxValue = Math.max(...data, 0);
  const chartMax =
    maxValue > 0 ? Math.ceil(maxValue / yTicks / 50) * yTicks * 50 : 100;
  const ticks = Array.from({ length: yTicks + 1 }, (_, index) =>
    Math.round((chartMax / yTicks) * (yTicks - index))
  );
  const hasData = data.some((value) => value > 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.gridArea}>
        {ticks.map((tick) => (
          <View key={tick} style={styles.gridRow}>
            <Text style={styles.tickLabel}>{tick}</Text>
            <View style={styles.gridLine} />
          </View>
        ))}
      </View>

      <View style={styles.columnsRow}>
        {data.map((value, index) => {
          const ratio = chartMax > 0 ? value / chartMax : 0;
          const barHeight = Math.max(ratio * height, value > 0 ? 8 : 4);

          return (
            <View key={`${labels[index]}-${index}`} style={styles.column}>
              <Text style={styles.valueLabel}>
                {value > 0 ? `${CURRENCY_SYMBOL}${Math.round(value)}` : ""}
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height: barHeight }]} />
              </View>
              <Text style={styles.xLabel}>{labels[index]}</Text>
            </View>
          );
        })}
      </View>

      {!hasData ? (
        <Text style={styles.emptyHint}>No spending in this range yet.</Text>
      ) : null}
    </View>
  );
};

const getStyles = (theme, height) =>
  StyleSheet.create({
    wrap: {
      paddingHorizontal: 14,
      paddingBottom: 8,
      paddingTop: 4,
    },
    gridArea: {
      position: "absolute",
      top: 4,
      right: 14,
      bottom: 38,
      left: 14,
      justifyContent: "space-between",
    },
    gridRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    tickLabel: {
      width: 36,
      color: theme.textSoft,
      fontSize: 11,
    },
    gridLine: {
      flex: 1,
      height: 1,
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: theme.border,
      opacity: 0.7,
    },
    columnsRow: {
      height: height + 48,
      flexDirection: "row",
      alignItems: "flex-end",
      paddingLeft: 36,
    },
    column: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
    },
    valueLabel: {
      minHeight: 18,
      color: theme.primary,
      fontSize: 11,
      fontWeight: "700",
      marginBottom: 6,
    },
    barTrack: {
      width: "66%",
      height: height,
      justifyContent: "flex-end",
      alignItems: "center",
    },
    bar: {
      width: "100%",
      minHeight: 4,
      borderRadius: 14,
      backgroundColor: theme.primaryStrong,
      shadowColor: theme.primaryGlow,
      shadowOpacity: theme.mode === "dark" ? 0.28 : 0.18,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    xLabel: {
      marginTop: 10,
      color: theme.textMuted,
      fontSize: 11,
      fontWeight: "700",
    },
    emptyHint: {
      marginTop: 8,
      color: theme.textSoft,
      fontSize: 12,
      textAlign: "center",
    },
  });

export default BarTrendChart;
