import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Share,
  TextInput,
} from "react-native";
import { useExpenses } from "../store/ExpenseContext";
import CategoryPicker from "../components/CategoryPicker";

const CURRENCY_SYMBOL = "\u20B9";

const parseDateInput = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const ExpenseItem = React.memo(({ item }) => (
  <View style={styles.item}>
    <View>
      <Text style={styles.itemAmount}>
        {CURRENCY_SYMBOL}
        {Number(item.amount).toFixed(2)}
      </Text>
      <Text style={styles.itemMeta}>
        {item.category_name || "Others"} |{" "}
        {new Date(item.date).toLocaleDateString()}
      </Text>
    </View>
    <Text>{item.note}</Text>
  </View>
));

const ExpensesScreen = () => {
  const { expenses, loadExpenses, categories, exportCSV } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [fromDateInput, setFromDateInput] = useState("");
  const [toDateInput, setToDateInput] = useState("");

  const refresh = useCallback(() => {
    const filter = {};

    if (selectedCategory) {
      filter.category_id = selectedCategory;
    }
    if (fromDate) {
      filter.from = new Date(
        fromDate.getFullYear(),
        fromDate.getMonth(),
        fromDate.getDate()
      ).toISOString();
    }
    if (toDate) {
      filter.to = new Date(
        toDate.getFullYear(),
        toDate.getMonth(),
        toDate.getDate() + 1
      ).toISOString();
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

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        <Text style={styles.filtersTitle}>Filters</Text>
        <CategoryPicker
          categories={categories}
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <View style={styles.filterRow}>
          <TextInput
            value={fromDateInput}
            onChangeText={(text) => {
              setFromDateInput(text);
              setFromDate(parseDateInput(text));
            }}
            placeholder="From YYYY-MM-DD"
            style={styles.dateInput}
          />
          <TextInput
            value={toDateInput}
            onChangeText={(text) => {
              setToDateInput(text);
              setToDate(parseDateInput(text));
            }}
            placeholder="To YYYY-MM-DD"
            style={styles.dateInputWithMargin}
          />
          <View style={styles.clearButtonWrap}>
            <Button
              title="Clear"
              onPress={() => {
                setFromDate(null);
                setToDate(null);
                setFromDateInput("");
                setToDateInput("");
                setSelectedCategory(null);
              }}
            />
          </View>
        </View>
        <View style={styles.exportButtonWrap}>
          <Button title="Export CSV" onPress={onExport} />
        </View>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ExpenseItem item={item} />}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  filters: {
    padding: 12,
  },
  filtersTitle: {
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  dateInput: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
  },
  dateInputWithMargin: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginLeft: 8,
  },
  clearButtonWrap: {
    marginLeft: 8,
  },
  exportButtonWrap: {
    marginTop: 8,
  },
  listContent: {
    padding: 16,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemAmount: {
    fontWeight: "700",
  },
  itemMeta: {
    color: "#666",
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
  },
});

export default ExpensesScreen;
