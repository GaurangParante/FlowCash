import React, {useEffect, useState} from 'react';
import {StatusBar, View, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import MainTabs from './src/navigation/MainTabs';
import {ExpenseProvider} from './src/store/ExpenseContext';
import {initDB, seedDefaultCategories} from './src/database/db';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const prepare = async () => {
      try {
        await initDB();
        await seedDefaultCategories();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    prepare();
  }, []);

  if (loading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ExpenseProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <MainTabs />
      </NavigationContainer>
    </ExpenseProvider>
  );
};

export default App;
