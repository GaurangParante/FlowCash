import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useExpenses} from '../store/ExpenseContext';
import {parseSmartInput} from '../utils/parseInput';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CategoryPicker from '../components/CategoryPicker';

const AddExpenseScreen = ({navigation}) => {
  const {categories, addExpense, loadCategories} = useExpenses();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (categories && categories.length > 0 && !categoryId) setCategoryId(categories[0].id);
  }, [categories]);

  const onChangeSmart = (text) => {
    setNote(text);
    const parsed = parseSmartInput(text);
    if (parsed.amount) setAmount(parsed.amount.toString());
    if (parsed.remainder && !categoryId) {
      // attempt to match category name heuristically
      const rem = parsed.remainder.toLowerCase();
      const found = categories.find(c => rem.includes(c.name.toLowerCase()));
      if (found) setCategoryId(found.id);
    }
  };

  const onSave = async () => {
    const amt = parseFloat(amount);
    if (!amt || isNaN(amt)) {
      alert('Please enter a valid amount');
      return;
    }
    await addExpense({amount: amt, category_id: categoryId, note, date: new Date(date).toISOString()});
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="0.00"
        style={styles.input}
      />

      <Text style={styles.label}>Category</Text>
      <CategoryPicker categories={categories} selectedId={categoryId} onSelect={setCategoryId} />

      <Text style={styles.label}>Note / Smart Input</Text>
      <TextInput
        value={note}
        onChangeText={onChangeSmart}
        placeholder="e.g., 200 pizza"
        style={styles.input}
      />

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(e, d) => {setShowPicker(false); if (d) setDate(d);}} />
      )}

      <View style={{marginTop:20}}>
        <Button title="Save" onPress={onSave} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex:1, padding:16, backgroundColor:'#fff'},
  label:{fontWeight:'600', marginTop:12},
  input:{borderWidth:1, borderColor:'#ddd', padding:12, borderRadius:8, marginTop:6},
  pickerRow:{flexDirection:'row', flexWrap:'wrap', marginTop:8},
  catBtn:{flexDirection:'row', alignItems:'center', padding:8, marginRight:8, borderWidth:1, borderColor:'#eee', borderRadius:8},
  catText:{marginLeft:6},
  catBtnActive:{backgroundColor:'#eef', borderColor:'#99f'}
});

export default AddExpenseScreen;
