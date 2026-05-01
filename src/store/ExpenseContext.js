import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  getCategories,
  getExpenses,
  addExpense as dbAddExpense,
  updateExpense as dbUpdateExpense,
  deleteExpense as dbDeleteExpense,
  exportExpensesCSV,
  updateCategory,
  deleteCategory,
  getCategoryTotals,
  getWeeklyTotals,
  getSpendingComparison,
} from "../database/db";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const loadCategories = useCallback(async () => {
    const cats = await getCategories();
    setCategories(cats);
  }, []);

  const loadExpenses = useCallback(async (filter = {}) => {
    const ex = await getExpenses(filter);
    setExpenses(ex);
  }, []);

  useEffect(() => {
    loadCategories();
    loadExpenses();
  }, [loadCategories, loadExpenses]);

  const addExpense = useCallback(async (payload) => {
    const expense = await dbAddExpense(payload);
    setExpenses((currentExpenses) => [expense, ...currentExpenses]);
    return expense;
  }, []);

  const editExpense = useCallback(async (id, payload) => {
    const expense = await dbUpdateExpense(id, payload);
    setExpenses((currentExpenses) =>
      currentExpenses.map((currentExpense) =>
        currentExpense.id === id ? expense : currentExpense
      )
    );
    return expense;
  }, []);

  const removeExpense = useCallback(async (id) => {
    const removed = await dbDeleteExpense(id);
    if (removed) {
      setExpenses((currentExpenses) =>
        currentExpenses.filter((currentExpense) => currentExpense.id !== id)
      );
    }
    return removed;
  }, []);

  const createCategory = useCallback(
    async ({ name, icon }) => {
      const dbModule = require("../database/db");
      const db = await dbModule.initDB();
      const now = new Date().toISOString();
      await db.executeSql(
        "INSERT INTO categories (name, icon, created_at) VALUES (?, ?, ?)",
        [name, icon || "shape", now]
      );
      await loadCategories();
    },
    [loadCategories]
  );

  const editCategory = useCallback(
    async (id, data) => {
      await updateCategory(id, data);
      await loadCategories();
      await loadExpenses();
    },
    [loadCategories, loadExpenses]
  );

  const removeCategory = useCallback(
    async (id) => {
      await deleteCategory(id);
      await loadCategories();
      await loadExpenses();
    },
    [loadCategories, loadExpenses]
  );

  const exportCSV = useCallback(async () => {
    return await exportExpensesCSV();
  }, []);

  const getInsights = useCallback(async () => {
    const categoryTotals = await getCategoryTotals();
    const weekly = await getWeeklyTotals();
    const comparison = await getSpendingComparison();
    return { categoryTotals, weekly, comparison };
  }, []);

  const value = useMemo(
    () => ({
      categories,
      expenses,
      loadCategories,
      loadExpenses,
      addExpense,
      editExpense,
      removeExpense,
      createCategory,
      editCategory,
      removeCategory,
      exportCSV,
      getInsights,
    }),
    [
      categories,
      expenses,
      loadCategories,
      loadExpenses,
      addExpense,
      editExpense,
      removeExpense,
      createCategory,
      editCategory,
      removeCategory,
      exportCSV,
      getInsights,
    ]
  );

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
