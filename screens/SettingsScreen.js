import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { getReminderTime, saveReminderTime, resetAppData } from '../services/userPreferences';
import { scheduleBatchNotifications } from '../services/notifications';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useTheme } from '../ThemeContext';

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme } = useTheme();
  const [reminderTime, setReminderTime] = useState(5);
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    const loadSettings = async () => {
      const time = await getReminderTime();
      setReminderTime(time);
    };
    loadSettings();
  }, []);

  const handleTimeChange = async (minutes) => {
    setReminderTime(minutes);
    await saveReminderTime(minutes);
    await scheduleBatchNotifications();
  };

  const handleReset = async () => {
    await resetAppData();
    navigation.replace('BatchSelection');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.themeToggle}>
          <Text style={styles.themeToggleText}>Dark Mode</Text>
          <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Reminder</Text>
        <View style={styles.timeOptions}>
          {[5, 10, 15, 30].map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.timeOption,
                reminderTime === minutes && styles.selectedTimeOption
              ]}
              onPress={() => handleTimeChange(minutes)}
            >
              <Text style={[
                styles.timeOptionText,
                reminderTime === minutes && styles.selectedTimeOptionText
              ]}>
                {minutes} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>Reset App & Select Batch Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme) => ({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: theme.text,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: theme.secondary,
  },
  themeToggle: {
    backgroundColor: theme.surface,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeOption: {
    width: '48%',
    padding: 15,
    marginBottom: 10,
    backgroundColor: theme.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: theme.accent,
  },
  timeOptionText: {
    fontSize: 16,
    color: theme.muted,
  },
  selectedTimeOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: theme.danger,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SettingsScreen;