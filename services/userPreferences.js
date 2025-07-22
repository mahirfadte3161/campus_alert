import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_BATCH_KEY = '@user_batch';
const REMINDER_TIME_KEY = '@reminder_time';

export const getSelectedBatch = async () => {
  try {
    return await AsyncStorage.getItem(USER_BATCH_KEY);
  } catch (e) {
    console.error('Failed to load batch preference', e);
    return null;
  }
};

export const saveSelectedBatch = async (batch) => {
  try {
    await AsyncStorage.setItem(USER_BATCH_KEY, batch);
  } catch (e) {
    console.error('Failed to save batch preference', e);
  }
};

export const getReminderTime = async () => {
  try {
    const time = await AsyncStorage.getItem(REMINDER_TIME_KEY);
    return time ? parseInt(time) : 5;
  } catch (e) {
    console.error('Failed to load reminder time', e);
    return 5;
  }
};

export const saveReminderTime = async (minutes) => {
  try {
    await AsyncStorage.setItem(REMINDER_TIME_KEY, minutes.toString());
  } catch (e) {
    console.error('Failed to save reminder time', e);
  }
};

export const resetAppData = async () => {
  try {
    await AsyncStorage.multiRemove([USER_BATCH_KEY, REMINDER_TIME_KEY]);
  } catch (e) {
    console.error('Failed to reset app data', e);
  }
};