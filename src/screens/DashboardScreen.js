import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useExpenses} from '../store/ExpenseContext';
import {PieChart, BarChart} from 'react-native-chart-kit';
import {Dimensions} from 'react-native';

const screenWidth = Dimensions.get('window').width - 32;

const DashboardScreen = ({navigation}) => {
  const {categories, expenses, loadExpenses} = useExpenses();
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const total = expenses.filter(e => e.date >= start).reduce((s, e) => s + Number(e.amount || 0), 0);
    setTodayTotal(total);
  }, [expenses]);

  const pieData = useMemo(() => {
    const map = {};
    expenses.forEach(e => {
      const cat = e.category_name || 'Others';
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });
    const colors = ['#f44336','#2196f3','#4caf50','#ff9800','#9c27b0','#607d8b'];
    return Object.keys(map).map((k,i)=>({name:k, population:map[k], color: colors[i%colors.length], legendFontColor:'#333', legendFontSize:12}));
  }, [expenses]);

  const barData = useMemo(() => {
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0,10);
      labels.push(d.toDateString().slice(0,3));
      const total = expenses.filter(e => e.date.slice(0,10) === key).reduce((s, e) => s + Number(e.amount || 0), 0);
      data.push(total);
    }
    return {labels, datasets:[{data}]};
  }, [expenses]);

  return (
    <ScrollView contentContainerStyle={{padding:16}}>
      <Text style={styles.title}>Today</Text>
      <Text style={styles.total}>₹{todayTotal.toFixed(2)}</Text>

      <Text style={[styles.title, {marginTop:16}]}>Spending by Category</Text>
      {pieData.length>0 && (
        <PieChart data={pieData} width={screenWidth} height={220} accessor="population" backgroundColor="transparent" paddingLeft="15" />
      )}

      <Text style={[styles.title, {marginTop:16}]}>Last 7 Days</Text>
      <BarChart data={barData} width={screenWidth} height={220} fromZero chartConfig={{backgroundGradientFrom:'#fff', backgroundGradientTo:'#fff', decimalPlaces:0, color:(opacity=1)=>`rgba(33,150,243,${opacity})`, labelColor:(o)=>`#333`}} style={{borderRadius:8}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title:{fontSize:16, fontWeight:'700'},
  total:{fontSize:28, fontWeight:'800', marginTop:8}
});

export default DashboardScreen;
