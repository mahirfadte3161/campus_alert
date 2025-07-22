import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { getSelectedBatch } from '../services/userPreferences';
import { useEffect, useState } from 'react';
import BatchSelectionScreen from '../screens/BatchSelectionScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WeeklyViewScreen from '../screens/WeeklyViewScreen';
import { useTheme } from '../ThemeContext';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState('BatchSelection');
  const { theme } = useTheme();

  useEffect(() => {
    const checkBatch = async () => {
      const batch = await getSelectedBatch();
      if (batch) {
        setInitialRoute('Home');
      }
    };
    checkBatch();
  }, []);

  const LightNav = DefaultTheme;
  const DarkNav = DarkTheme;

  return (
    <NavigationContainer theme={theme === 'dark' ? DarkNav : LightNav}>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen 
          name="BatchSelection" 
          component={BatchSelectionScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Class Reminder' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }}
        />
        <Stack.Screen 
          name="WeeklyView" 
          component={WeeklyViewScreen} 
          options={{ title: 'Weekly Schedule' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;