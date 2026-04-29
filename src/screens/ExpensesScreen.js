import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, FlatList, StyleSheet, TouchableOpacity, Button, Share} from 'react-native';
import {useExpenses} from '../store/ExpenseContext';
import CategoryPicker from '../components/CategoryPicker';
import DateTimePicker from '@react-native-community/datetimepicker';

const ExpenseItem = React.memo(({item}) => (
  <View style={styles.item}>
    <View>
      <Text style={{fontWeight:'700'}}>₹{Number(item.amount).toFixed(2)}</Text>
      <Text style={{color:'#666'}}>{item.category_name || 'Others'} · {new Date(item.date).toLocaleDateString()}</Text>
    </View>
    <Text>{item.note}</Text>
  </View>
));

const ExpensesScreen = ({navigation}) => {
  const {expenses, loadExpenses, categories, exportCSV} = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const refresh = useCallback(() => {
    const filter = {};
    if (selectedCategory) filter.category_id = selectedCategory;
    if (fromDate) filter.from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()).toISOString();
    if (toDate) filter.to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()+1).toISOString();
    loadExpenses(filter);
  }, [selectedCategory, fromDate, toDate]);

  useEffect(() => {refresh();}, [selectedCategory, fromDate, toDate]);

  useEffect(() => {if (categories && categories.length>0 && !selectedCategory) setSelectedCategory(null);}, [categories]);

  const onExport = async () => {
    try {
      const csv = await exportCSV();
      await Share.share({message: csv, title: 'Expenses CSV'});
    } catch (err) {console.error(err)}
  };

  return (
    <View style={{flex:1}}>
      <View style={{padding:12}}>
        <Text style={{fontWeight:'700'}}>Filters</Text>
        <CategoryPicker categories={categories} selectedId={selectedCategory} onSelect={setSelectedCategory} />
        <View style={{flexDirection:'row', marginTop:8}}>
          <TouchableOpacity style={styles.dateBtn} onPress={()=>setShowFromPicker(true)}>
            <Text>{fromDate? fromDate.toDateString() : 'From'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dateBtn,{marginLeft:8}]} onPress={()=>setShowToPicker(true)}>
            <Text>{toDate? toDate.toDateString() : 'To'}</Text>
          </TouchableOpacity>
          <View style={{marginLeft:8}}>
            <Button title="Clear" onPress={()=>{setFromDate(null); setToDate(null); setSelectedCategory(null);}} />
          </View>
        </View>
        <View style={{marginTop:8}}>
          <Button title="Export CSV" onPress={onExport} />
        </View>
      </View>

      <FlatList data={expenses} keyExtractor={i=>i.id.toString()} renderItem={({item}) => <ExpenseItem item={item} />} contentContainerStyle={{padding:16}} />

      {showFromPicker && (
        <DateTimePicker value={fromDate||new Date()} mode="date" display="default" onChange={(e,d)=>{setShowFromPicker(false); if (d) setFromDate(d);}} />
      )}
      {showToPicker && (
        <DateTimePicker value={toDate||new Date()} mode="date" display="default" onChange={(e,d)=>{setShowToPicker(false); if (d) setToDate(d);}} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  item:{padding:12, borderBottomWidth:1, borderColor:'#eee', flexDirection:'row', justifyContent:'space-between', alignItems:'center'},
  dateBtn:{padding:8, borderWidth:1, borderColor:'#ddd', borderRadius:6}
});

export default ExpensesScreen;
