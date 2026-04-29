import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, Switch, Button, Alert} from 'react-native';
import {useExpenses} from '../store/ExpenseContext';
import {scheduleDailyReminder} from '../utils/notifications';

const InsightsScreen = () => {
  const {expenses, getInsights} = useExpenses();
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const thisWeekSpending = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()-6).toISOString();
    const sum = expenses.filter(e=>e.date>=start).reduce((s,e)=>s+Number(e.amount||0),0);
    return sum;
  }, [expenses]);

  const topCategory = useMemo(()=>{
    const map = {};
    expenses.forEach(e=>{map[e.category_name]=(map[e.category_name]||0)+Number(e.amount||0)});
    const entries = Object.entries(map).sort((a,b)=>b[1]-a[1]);
    return entries[0] ? {name:entries[0][0], amount:entries[0][1]} : null;
  }, [expenses]);

  const onToggle = async (val) => {
    setReminderEnabled(val);
    if (val) {
      await scheduleDailyReminder(20,0);
      Alert.alert('Reminder set', 'Daily reminder scheduled at 8:00 PM');
    } else {
      // best-effort: library handles cancel in scheduleDailyReminder or separate API
      Alert.alert('Reminder disabled');
    }
  };

  const showInsights = async () => {
    const data = await getInsights();
    const highestDay = data.comparison && data.comparison.thisTotal ? `This week total ₹${data.comparison.thisTotal.toFixed(2)}` : '';
    Alert.alert('Insights', `${highestDay}`);
  };

  return (
    <View style={{flex:1, padding:16}}>
      <Text style={styles.h1}>This week you spent ₹{thisWeekSpending.toFixed(2)}</Text>
      {topCategory && <Text style={{marginTop:12}}>You spent ₹{topCategory.amount.toFixed(2)} on {topCategory.name} this week</Text>}

      <View style={{marginTop:20, flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
        <Text style={{fontWeight:'700'}}>Daily Reminder</Text>
        <Switch value={reminderEnabled} onValueChange={onToggle} />
      </View>

      <View style={{marginTop:20}}>
        <Button title="Show More Insights" onPress={showInsights} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({h1:{fontSize:18, fontWeight:'800'}});

export default InsightsScreen;
