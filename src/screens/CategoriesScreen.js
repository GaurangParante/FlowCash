import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Pressable,
  StyleSheet,
} from "react-native";
import { useExpenses } from "../store/ExpenseContext";
import { useTheme } from "../theme/ThemeContext";

const CategoriesScreen = () => {
  const { categories, createCategory, editCategory, removeCategory } =
    useExpenses();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);

  const onAdd = async () => {
    if (!name.trim()) {
      return;
    }

    if (editing) {
      await editCategory(editing, { name: name.trim(), icon: "shape" });
      setEditing(null);
      setName("");
      return;
    }

    await createCategory({ name: name.trim(), icon: "shape" });
    setName("");
  };

  const onEdit = (item) => {
    setEditing(item.id);
    setName(item.name);
  };

  const onDelete = (item) => {
    Alert.alert("Delete category", `Delete ${item.name}?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeCategory(item.id);
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.heading}>Categories</Text>
        <Text style={styles.subheading}>
          Keep your spend lanes clean for quicker tagging.
        </Text>
        <View style={styles.formRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Category name"
            placeholderTextColor={theme.textSoft}
          />
          <Pressable style={styles.primaryButton} onPress={onAdd}>
            <Text style={styles.primaryButtonText}>
              {editing ? "Save" : "Add"}
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemActions}>
              <TouchableOpacity
                onPress={() => onEdit(item)}
                style={styles.editBtn}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        style={styles.list}
      />
    </View>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.background,
    },
    card: {
      backgroundColor: theme.surface,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 24,
      padding: 18,
    },
    heading: {
      fontWeight: "800",
      color: theme.text,
      fontSize: 20,
    },
    subheading: {
      color: theme.textMuted,
      marginTop: 6,
    },
    formRow: {
      flexDirection: "row",
      marginTop: 12,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 12,
      borderRadius: 14,
      color: theme.text,
      backgroundColor: theme.input,
      marginRight: 10,
    },
    primaryButton: {
      backgroundColor: theme.primaryStrong,
      borderRadius: 14,
      paddingHorizontal: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    primaryButtonText: {
      color: theme.mode === "dark" ? "#04101c" : "#fff",
      fontWeight: "800",
    },
    list: {
      marginTop: 16,
    },
    item: {
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 18,
      backgroundColor: theme.surface,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    itemName: {
      fontWeight: "700",
      color: theme.text,
    },
    itemActions: {
      flexDirection: "row",
    },
    editBtn: {
      marginRight: 14,
    },
    editText: {
      color: theme.primary,
      fontWeight: "700",
    },
    deleteText: {
      color: theme.danger,
      fontWeight: "700",
    },
  });

export default CategoriesScreen;
