import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TextInput, Button, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useExpenses} from '../store/ExpenseContext';

const CategoriesScreen = () => {
  const {categories, createCategory, editCategory, removeCategory} = useExpenses();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);

  const onAdd = async () => {
    if (!name.trim()) return;
    if (editing) {
      await editCategory(editing, {name: name.trim(), icon: 'shape'});
      setEditing(null);
      setName('');
      return;
    }
    await createCategory({name: name.trim(), icon: 'shape'});
    setName('');
  };

  const onEdit = (item) => {setEditing(item.id); setName(item.name);};

  const onDelete = (item) => {
    Alert.alert('Delete category', `Delete ${item.name}?`, [{text:'Cancel'},{text:'Delete', style:'destructive', onPress: async ()=>{await removeCategory(item.id);}}]);
  };

  return (
    <View style={{flex:1, padding:16}}>
      <Text style={{fontWeight:'700'}}>Add / Edit Category</Text>
      <View style={{flexDirection:'row', marginTop:8}}>
        <TextInput value={name} onChangeText={setName} style={{flex:1, borderWidth:1, borderColor:'#ddd', padding:8, borderRadius:6}} placeholder="Category name" />
        <Button title={editing? 'Save': 'Add'} onPress={onAdd} />
      </View>

      <FlatList data={categories} keyExtractor={c=>c.id.toString()} renderItem={({item}) => (
        <View style={{padding:12, borderBottomWidth:1, borderColor:'#eee', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
          <Text style={{fontWeight:'700'}}>{item.name}</Text>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity onPress={() => onEdit(item)} style={{marginRight:12}}><Text style={{color:'#2196f3'}}>Edit</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item)}><Text style={{color:'#e53935'}}>Delete</Text></TouchableOpacity>
          </View>
        </View>
      )} style={{marginTop:16}} />
    </View>
  );
};

export default CategoriesScreen;
