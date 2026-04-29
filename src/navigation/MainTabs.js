import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/DashboardScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import InsightsScreen from "../screens/InsightsScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TouchableOpacity, View, StyleSheet } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Tabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="view-dashboard" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Expenses"
      component={ExpensesScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="format-list-bulleted" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Insights"
      component={InsightsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="chart-line" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Categories"
      component={CategoriesScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="shape" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

const HomeWrapper = ({ navigation }) => {
  return (
    <>
      <Tabs />
      <View style={styles.fabWrap} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddExpense")}
        >
          <Icon name="plus" color="#fff" size={28} />
        </TouchableOpacity>
      </View>
    </>
  );
};

const MainTabs = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={HomeWrapper} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  fabWrap: { position: "absolute", right: 0, bottom: 0, left: 0, top: 0 },
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
    elevation: 6,
  },
});

export default MainTabs;
