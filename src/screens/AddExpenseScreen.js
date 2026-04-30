import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useExpenses } from "../store/ExpenseContext";
import { parseSmartInput } from "../utils/parseInput";
import CategoryPicker from "../components/CategoryPicker";

const formatDateInput = (value) => value.toISOString().slice(0, 10);

const AddExpenseScreen = ({ navigation }) => {
  const { categories, addExpense } = useExpenses();
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [note, setNote] = useState("");
  const [dateInput, setDateInput] = useState(formatDateInput(new Date()));

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const onChangeSmart = (text) => {
    setNote(text);
    const parsed = parseSmartInput(text);

    if (parsed.amount) {
      setAmount(parsed.amount.toString());
    }

    if (parsed.remainder && !categoryId) {
      const remainder = parsed.remainder.toLowerCase();
      const found = categories.find((category) =>
        remainder.includes(category.name.toLowerCase())
      );

      if (found) {
        setCategoryId(found.id);
      }
    }
  };

  const onSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || Number.isNaN(parsedAmount)) {
      Alert.alert("Invalid amount", "Please enter a valid amount");
      return;
    }

    if (!categoryId) {
      Alert.alert("Missing category", "Please choose a category");
      return;
    }

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
        date: parsedDate.toISOString(),
      });
      navigation.goBack();
    } catch (error) {
      console.error("Save expense failed", error);
      Alert.alert(
        "Save failed",
        "The expense could not be saved. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
        style={styles.input}
      />

      <Text style={styles.label}>Category</Text>
      <CategoryPicker
        categories={categories}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />

      <Text style={styles.label}>Note / Smart Input</Text>
      <TextInput
        value={note}
        onChangeText={onChangeSmart}
        placeholder="e.g., 200 pizza"
        style={styles.input}
      />

      <Text style={styles.label}>Date</Text>
      <TextInput
        value={dateInput}
        onChangeText={(text) => {
          setDateInput(text);
        }}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
        style={styles.input}
      />

      <View style={styles.buttonWrap}>
        <Button title="Save" onPress={onSave} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "600",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  buttonWrap: {
    marginTop: 20,
  },
});

export default AddExpenseScreen;
