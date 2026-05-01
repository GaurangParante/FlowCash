import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Share,
  Pressable,
  Alert,
} from "react-native";
import { useExpenses } from "../store/ExpenseContext";
import CategoryPicker from "../components/CategoryPicker";
import DateField from "../components/DateField";
import { useTheme } from "../theme/ThemeContext";
import Icon from "@react-native-vector-icons/material-design-icons";

const CURRENCY_SYMBOL = "\u20B9";

const buildLocalDateTime = (date, hourOffset = 0) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hour = `${hourOffset}`.padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:00:00`;
};

const ExpenseItem = React.memo(({ item, theme, onEdit, onDelete }) => {
  const styles = getStyles(theme);

  return (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.itemAmount}>
          {CURRENCY_SYMBOL}
          {Number(item.amount).toFixed(2)}
        </Text>
        <Text style={styles.itemMeta}>
          {item.category_name || "Others"} |{" "}
          {new Date(item.date).toLocaleDateString()}
        </Text>
        <Text style={styles.itemNote}>{item.note || "No note"}</Text>
      </View>
      <View style={styles.itemActions}>
        <Pressable
          onPress={() => onEdit(item)}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={`Edit expense of ${Number(item.amount).toFixed(
            2
          )}`}
        >
          <Icon name="pencil-outline" size={20} color={theme.primary} />
        </Pressable>
        <Pressable
          onPress={() => onDelete(item)}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={`Delete expense of ${Number(item.amount).toFixed(
            2
          )}`}
        >
          <Icon name="trash-can-outline" size={20} color={theme.danger} />
        </Pressable>
      </View>
    </View>
  );
});

const ExpensesScreen = ({ navigation }) => {
  const { expenses, loadExpenses, categories, exportCSV, removeExpense } =
    useExpenses();
  const { theme } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const refresh = useCallback(() => {
    const filter = {};

    if (selectedCategory) {
      filter.category_id = selectedCategory;
    }
    if (fromDate) {
      filter.from = buildLocalDateTime(fromDate, 0);
    }
    if (toDate) {
      const nextDate = new Date(toDate);
      nextDate.setDate(nextDate.getDate() + 1);
      filter.to = buildLocalDateTime(nextDate, 0);
    }

    loadExpenses(filter);
  }, [selectedCategory, fromDate, toDate, loadExpenses]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onExport = async () => {
    try {
      const csv = await exportCSV();
      await Share.share({ message: csv, title: "Expenses CSV" });
    } catch (err) {
      console.error(err);
    }
  };

  const onEditExpense = useCallback(
    (item) => {
      navigation.navigate("AddExpense", { expense: item });
    },
    [navigation]
  );

  const onDeleteExpense = useCallback(
    (item) => {
      Alert.alert(
        "Delete expense",
        `Are you sure you want to delete ${CURRENCY_SYMBOL}${Number(
          item.amount
        ).toFixed(2)}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await removeExpense(item.id);
            },
          },
        ]
      );
    },
    [removeExpense]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        <Text style={styles.filtersTitle}>Filters</Text>
        <CategoryPicker
          categories={categories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
          showAllOption
        />
        <View style={styles.filterRow}>
          <View style={styles.dateFieldWrap}>
            <DateField
              value={fromDate}
              onChange={setFromDate}
              placeholder="From date"
            />
          </View>
          <View style={styles.dateFieldWrapWithMargin}>
            <DateField
              value={toDate}
              onChange={setToDate}
              placeholder="To date"
            />
          </View>
        </View>
        <View style={styles.actionsRow}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setFromDate(null);
              setToDate(null);
              setSelectedCategory(null);
            }}
          >
            <Text style={styles.secondaryButtonText}>Clear</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={onExport}>
            <Text style={styles.primaryButtonText}>Export CSV</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExpenseItem
            item={item}
            theme={theme}
            onEdit={onEditExpense}
            onDelete={onDeleteExpense}
          />
        )}
        contentContainerStyle={
          expenses.length === 0 ? styles.emptyList : styles.listContent
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No expenses found for the current filters.
          </Text>
        }
      />
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    filters: {
      padding: 14,
      backgroundColor: theme.surface,
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
    },
    filtersTitle: {
      fontWeight: "800",
      color: theme.text,
      fontSize: 18,
    },
    filterRow: {
      flexDirection: "row",
      marginTop: 8,
    },
    dateFieldWrap: {
      flex: 1,
    },
    dateFieldWrapWithMargin: {
      flex: 1,
      marginLeft: 8,
    },
    actionsRow: {
      flexDirection: "row",
      marginTop: 10,
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 13,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      marginRight: 8,
      backgroundColor: theme.surfaceMuted,
    },
    secondaryButtonText: {
      color: theme.text,
      fontWeight: "700",
    },
    primaryButton: {
      flex: 1.2,
      paddingVertical: 13,
      alignItems: "center",
      borderRadius: 14,
      backgroundColor: theme.primaryStrong,
    },
    primaryButtonText: {
      color: theme.mode === "dark" ? "#04101c" : "#fff",
      fontWeight: "800",
    },
    listContent: {
      padding: 16,
    },
    item: {
      padding: 14,
      marginBottom: 12,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    itemContent: {
      flex: 1,
      paddingRight: 12,
    },
    itemAmount: {
      fontWeight: "800",
      color: theme.text,
      fontSize: 18,
    },
    itemMeta: {
      color: theme.textMuted,
      marginTop: 4,
    },
    itemNote: {
      color: theme.textSoft,
      marginTop: 8,
    },
    itemActions: {
      flexDirection: "row",
      marginTop: 2,
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.surfaceMuted,
      marginLeft: 8,
    },
    emptyList: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    emptyText: {
      color: theme.textMuted,
      textAlign: "center",
    },
  });

export default ExpensesScreen;
