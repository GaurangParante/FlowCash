import React, {createContext, useContext, useEffect, useState, useCallback} from 'react';
import {getCategories, getExpenses, addExpense as dbAddExpense, exportExpensesCSV, updateCategory, deleteCategory, getCategoryTotals, getWeeklyTotals, getSpendingComparison} from '../database/db';

const ExpenseContext = createContext();

export const ExpenseProvider = ({children}) => {
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

  const addExpense = async payload => {
    const id = await dbAddExpense(payload);
    await loadExpenses();
    return id;
  };

  const createCategory = async ({name, icon}) => {
    const dbModule = require('../database/db');
    const db = await dbModule.initDB();
    const now = new Date().toISOString();
    await db.executeSql('INSERT INTO categories (name, icon, created_at) VALUES (?, ?, ?)', [name, icon||'shape', now]);
    await loadCategories();
  };

  const editCategory = async (id, data) => {
    await updateCategory(id, data);
    await loadCategories();
  };

  const removeCategory = async id => {
    await deleteCategory(id);
    await loadCategories();
    await loadExpenses();
  };

  const exportCSV = async () => {
    return await exportExpensesCSV();
  };

  const getInsights = async () => {
    const categoryTotals = await getCategoryTotals();
    const weekly = await getWeeklyTotals();
    const comparison = await getSpendingComparison();
    return {categoryTotals, weekly, comparison};
  };

  return (
    <ExpenseContext.Provider value={{categories, expenses, loadCategories, loadExpenses, addExpense}}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => useContext(ExpenseContext);
