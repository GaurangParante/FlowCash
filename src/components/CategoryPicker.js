import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "@react-native-vector-icons/material-design-icons";

const CategoryPicker = ({ categories, selectedId, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: 8 }}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.item, selectedId === cat.id && styles.active]}
          onPress={() => onSelect(cat.id)}
        >
          <Icon name={cat.icon || "shape"} size={18} />
          <Text style={styles.label}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  label: { marginLeft: 6 },
  active: { backgroundColor: "#eef", borderColor: "#99f" },
});

export default CategoryPicker;
