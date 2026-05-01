import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";

const CURRENCY_SYMBOL = "\u20B9";
const CHART_COLORS = ["#28c85e", "#3b82f6", "#a855f7", "#f59e0b", "#94a3b8"];
const CHART_SIZE = 144;
const STROKE_WIDTH = 28;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  const digits = Number.isInteger(amount) ? 0 : 2;

  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
};

const SpendingCategoryChart = ({ items, total }) => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const styles = useMemo(() => getStyles(theme, isCompact), [theme, isCompact]);

  const segments = useMemo(() => {
    let offset = 0;

    return items.map((item, index) => {
      const share = total > 0 ? item.value / total : 0;
      const segmentLength = CIRCUMFERENCE * share;
      const strokeDasharray = `${segmentLength} ${CIRCUMFERENCE}`;
      const strokeDashoffset = -offset;
      offset += segmentLength;

      return {
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
        share,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [items, total]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.chartSection}>
        <View style={styles.chartWrap}>
          <Svg
            width={CHART_SIZE}
            height={CHART_SIZE}
            viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          >
            <Circle
              cx={CHART_SIZE / 2}
              cy={CHART_SIZE / 2}
              r={RADIUS}
              stroke={theme.surfaceStrong}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {segments.map((segment) => (
              <Circle
                key={segment.name}
                cx={CHART_SIZE / 2}
                cy={CHART_SIZE / 2}
                r={RADIUS}
                stroke={segment.color}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeLinecap="butt"
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                rotation={-90}
                origin={`${CHART_SIZE / 2}, ${CHART_SIZE / 2}`}
              />
            ))}
          </Svg>

          <View style={styles.centerLabel}>
            <Text style={styles.centerValue}>{formatCurrency(total)}</Text>
            <Text style={styles.centerCaption}>Total</Text>
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        {segments.map((segment) => (
          <View key={segment.name} style={styles.legendRow}>
            <View style={styles.legendNameWrap}>
              <View
                style={[styles.legendDot, { backgroundColor: segment.color }]}
              />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {segment.name}
              </Text>
            </View>
            <Text style={styles.legendShare}>
              {(segment.share * 100).toFixed(0)}%
            </Text>
            <Text style={styles.legendValue}>
              {formatCurrency(segment.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const getStyles = (theme, isCompact) =>
  StyleSheet.create({
    wrapper: {
      flexDirection: isCompact ? "column" : "row",
      alignItems: isCompact ? "stretch" : "center",
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    chartSection: {
      width: isCompact ? "100%" : 170,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: isCompact ? 14 : 0,
    },
    chartWrap: {
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    centerLabel: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
    },
    centerValue: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "800",
    },
    centerCaption: {
      marginTop: 2,
      color: theme.textSoft,
      fontSize: 12,
    },
    legend: {
      flex: 1,
      width: "100%",
      paddingLeft: isCompact ? 0 : 12,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    legendNameWrap: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      minWidth: 0,
    },
    legendDot: {
      width: 9,
      height: 9,
      borderRadius: 999,
      marginRight: 8,
    },
    legendLabel: {
      flexShrink: 1,
      color: theme.text,
      fontSize: 12,
      fontWeight: "600",
    },
    legendShare: {
      width: isCompact ? 44 : 38,
      color: theme.textSoft,
      fontSize: 12,
      textAlign: "right",
      marginRight: 10,
    },
    legendValue: {
      width: isCompact ? 86 : 74,
      color: theme.text,
      fontSize: 12,
      fontWeight: "700",
      textAlign: "right",
    },
  });

export default SpendingCategoryChart;
