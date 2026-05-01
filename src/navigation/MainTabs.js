import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardScreen from "../screens/DashboardScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import InsightsScreen from "../screens/InsightsScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import Icon from "@react-native-vector-icons/material-design-icons";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import AppTopBar from "../components/AppTopBar";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const Tabs = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 78,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarItemStyle: [styles.tabItem, styles.leftPairLead],
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          tabBarItemStyle: [styles.tabItem, styles.leftPairTrail],
          tabBarIcon: ({ color, size }) => (
            <Icon name="format-list-bulleted" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarItemStyle: [styles.tabItem, styles.rightPairLead],
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarItemStyle: [styles.tabItem, styles.rightPairTrail],
          tabBarIcon: ({ color, size }) => (
            <Icon name="shape" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const HomeWrapper = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.shell}>
      <AppTopBar />
      <View style={styles.tabsWrap}>
        <Tabs />
      </View>
      <View style={styles.fabWrap} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate("AddExpense")}
        >
          <Icon
            name="plus"
            color={theme.mode === "dark" ? "#06101d" : "#fff"}
            size={28}
          />
        </TouchableOpacity>
      </View>
    </View>
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

const getStyles = (theme) =>
  StyleSheet.create({
    shell: {
      flex: 1,
      backgroundColor: theme.background,
    },
    tabsWrap: {
      flex: 1,
    },
    fabWrap: { position: "absolute", right: 0, bottom: 0, left: 0, top: 0 },
    fab: {
      position: "absolute",
      left: "50%",
      marginLeft: -29,
      bottom: 28,
      backgroundColor: theme.primary,
      width: 58,
      height: 58,
      borderRadius: 29,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: theme.surface,
      shadowColor: theme.primaryGlow,
      shadowOpacity: 0.28,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 10,
    },
    tabItem: {
      paddingHorizontal: 0,
    },
    leftPairLead: {
      marginRight: -10,
    },
    leftPairTrail: {
      marginLeft: -10,
      marginRight: 14,
    },
    rightPairLead: {
      marginLeft: 14,
      marginRight: -10,
    },
    rightPairTrail: {
      marginLeft: -10,
    },
  });

export default MainTabs;
