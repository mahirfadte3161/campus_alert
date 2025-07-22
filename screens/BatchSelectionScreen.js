import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { saveSelectedBatch } from '../services/userPreferences';
import { requestNotificationPermissions, scheduleBatchNotifications } from '../services/notifications';
import { useThemedStyles } from '../hooks/useThemedStyles';

const BatchSelectionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const styles = useThemedStyles(createStyles);

  const selectBatch = async (batch) => {
    setLoading(true);
    try {
      await saveSelectedBatch(batch);
      const granted = await requestNotificationPermissions();
      
      if (granted) {
        await scheduleBatchNotifications();
        navigation.replace('Home');
      } else {
        alert('Please enable notifications to receive class reminders');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Batch</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]}
        onPress={() => selectBatch('COMP A')}
        disabled={loading}
      >
        <Text style={styles.buttonText}>COMPUTER A</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]}
        onPress={() => selectBatch('COMP B')}
        disabled={loading}
      >
        <Text style={styles.buttonText}>COMPUTER B</Text>
      </TouchableOpacity>
      
      {loading && <ActivityIndicator size="large" style={styles.loader} />}
    </View>
  );
};

const createStyles = (theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: theme.text,
  },
  button: {
    backgroundColor: theme.accent,
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    backgroundColor: theme.muted,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
});

export default BatchSelectionScreen;