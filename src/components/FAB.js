import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const FAB = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress}>
    <Icon name="plus" color="#fff" size={28} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#2196f3",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
});

export default FAB;
