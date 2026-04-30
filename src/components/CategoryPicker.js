import React, { memo } from "react";
import { TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "@react-native-vector-icons/material-design-icons";
import { useTheme } from "../theme/ThemeContext";

const CategoryPicker = ({
  categories,
  selectedId,
  onSelect,
  showAllOption = false,
  allLabel = "All",
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {showAllOption ? (
        <TouchableOpacity
          style={[styles.item, selectedId == null && styles.active]}
          onPress={() => onSelect(null)}
        >
          <Icon
            name="tune-variant"
            size={18}
            color={selectedId == null ? theme.text : theme.textMuted}
          />
          <Text
            style={[styles.label, selectedId == null && styles.activeLabel]}
          >
            {allLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.item, selectedId === cat.id && styles.active]}
          onPress={() => onSelect(cat.id)}
        >
          <Icon
            name={cat.icon || "shape"}
            size={18}
            color={selectedId === cat.id ? theme.text : theme.textMuted}
          />
          <Text
            style={[styles.label, selectedId === cat.id && styles.activeLabel]}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    row: {
      paddingVertical: 8,
      paddingRight: 8,
    },
    item: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginRight: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      flexDirection: "row",
      alignItems: "center",
    },
    label: {
      marginLeft: 8,
      color: theme.textMuted,
      fontWeight: "600",
    },
    active: {
      backgroundColor: theme.surfaceStrong,
      borderColor: theme.primary,
      shadowColor: theme.primaryGlow,
      shadowOpacity: 0.3,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    activeLabel: {
      color: theme.text,
    },
  });

export default memo(CategoryPicker);
