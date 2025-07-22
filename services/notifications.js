import * as Notifications from 'expo-notifications';
import { getSelectedBatch, getReminderTime } from './userPreferences';
import timetableData from '../data/timetableData';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const parseClassTime = (timeStr) => {
  const [start] = timeStr.split('-');
  const [hours, minutes] = start.split(':').map(Number);
  
  // Convert afternoon times (12:15-05:00) to correct PM hours
  let actualHours = hours;
  if (hours >= 12 || (hours >= 1 && hours <= 5)) {
    if (hours >= 1 && hours <= 5) {
      actualHours = hours + 12; // 1:00 -> 13:00 (1 PM)
    }
    // hours >= 12 stays the same (12:15 PM)
  }
  
  const date = new Date();
  date.setHours(actualHours, minutes, 0, 0);
  return date;
};

export const scheduleBatchNotifications = async () => {
  const batch = await getSelectedBatch();
  const reminderMinutes = await getReminderTime();
  
  if (!batch) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  const currentDay = days[today];

  if (!timetableData.timetable[currentDay]?.[batch]) return;

  for (const cls of timetableData.timetable[currentDay][batch]) {
    const classTime = parseClassTime(cls.time);
    const notificationTime = new Date(classTime);
    notificationTime.setMinutes(notificationTime.getMinutes() - reminderMinutes);

    if (notificationTime < new Date()) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Class in ${reminderMinutes} min: ${cls.subject}`,
        body: `Room: ${cls.lab || 'Classroom'} | Faculty: ${cls.faculty}`,
        sound: true,
        data: { classDetails: JSON.stringify(cls) },
      },
      trigger: notificationTime,
    });
  }
};

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const checkNotificationPermissions = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};