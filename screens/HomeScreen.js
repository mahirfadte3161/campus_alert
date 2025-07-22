import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { getSelectedBatch } from '../services/userPreferences';
import timetableData from '../data/timetableData';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useTheme } from '../ThemeContext';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [batch, setBatch] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWeekend, setIsWeekend] = useState(false);
  const [nextDayClasses, setNextDayClasses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [nextLecture, setNextLecture] = useState(null);
  
  const styles = useThemedStyles(createStyles);

  // Helper function to check if a class is currently active
  const isCurrentClass = (timeRange) => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Parse time range using improved parsing
    const [startTime, endTime] = timeRange.split('-');
    const startTimeInMinutes = parseTimeToMinutes(startTime);
    const endTimeInMinutes = parseTimeToMinutes(endTime);

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
  };

  // Helper function to check if a class is upcoming (within next 30 minutes)
  const isUpcomingClass = (timeRange) => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startTime] = timeRange.split('-');
    const startTimeInMinutes = parseTimeToMinutes(startTime);

    return startTimeInMinutes > currentTimeInMinutes && startTimeInMinutes <= currentTimeInMinutes + 30;
  };

  // Helper function to convert time string to 24-hour minutes
  const parseTimeToMinutes = (timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    
    // Convert to 24-hour format
    // Times from 01:00-05:00 are assumed to be PM (13:00-17:00)
    // Times from 09:00-12:59 are assumed to be AM/PM as written
    let hour24;
    if (hour >= 1 && hour <= 5) {
      // Afternoon classes: 01:00 PM = 13:00, 02:00 PM = 14:00, etc.
      hour24 = hour + 12;
    } else if (hour === 12) {
      // 12:xx is 12:xx PM (noon hour)
      hour24 = 12;
    } else {
      // Morning classes: 09:00 AM = 09:00, 10:00 AM = 10:00, etc.
      hour24 = hour;
    }
    
    return hour24 * 60 + minute;
  };

  // Helper function to find the next lecture
  const findNextLecture = (classes, selectedBatch) => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    console.log('=== DEBUGGING findNextLecture ===');
    console.log('Current time:', now.toLocaleTimeString());
    console.log('Current time in minutes:', currentTimeInMinutes);
    console.log('Selected batch:', selectedBatch);
    console.log('Total classes for today:', classes.length);
    
    // Log each class with start/end times
    classes.forEach((classItem, index) => {
      const [startTime, endTime] = classItem.time.split('-');
      const startTimeInMinutes = parseTimeToMinutes(startTime);
      const endTimeInMinutes = parseTimeToMinutes(endTime);
      
      console.log(`Class ${index + 1}: ${classItem.subject}`);
      console.log(`  Time: ${classItem.time}`);
      console.log(`  Start minutes: ${startTimeInMinutes} (${Math.floor(startTimeInMinutes/60)}:${(startTimeInMinutes%60).toString().padStart(2,'0')})`);
      console.log(`  End minutes: ${endTimeInMinutes} (${Math.floor(endTimeInMinutes/60)}:${(endTimeInMinutes%60).toString().padStart(2,'0')})`);
      console.log(`  Faculty: ${classItem.faculty}`);
      console.log(`  Is upcoming: ${startTimeInMinutes > currentTimeInMinutes}`);
      if (classItem.batch) console.log(`  Batch: ${classItem.batch}`);
      if (classItem.lab) console.log(`  Lab: ${classItem.lab}`);
      console.log('---');
    });
    
    // Filter and sort classes by start time
    const upcomingClasses = classes.filter(classItem => {
      const [startTime] = classItem.time.split('-');
      const startTimeInMinutes = parseTimeToMinutes(startTime);
      
      return startTimeInMinutes > currentTimeInMinutes;
    }).sort((a, b) => {
      const [aStartTime] = a.time.split('-');
      const [bStartTime] = b.time.split('-');
      const aMinutes = parseTimeToMinutes(aStartTime);
      const bMinutes = parseTimeToMinutes(bStartTime);
      return aMinutes - bMinutes;
    });
    
    console.log('Upcoming classes count:', upcomingClasses.length);
    console.log('Upcoming classes array:', upcomingClasses.map(c => ({ 
      subject: c.subject, 
      time: c.time, 
      faculty: c.faculty,
      batch: c.batch || 'N/A',
      lab: c.lab || 'N/A',
      startMinutes: parseTimeToMinutes(c.time.split('-')[0])
    })));
    
    const nextLecture = upcomingClasses.length > 0 ? upcomingClasses[0] : null;
    console.log('Selected next lecture:', nextLecture ? {
      subject: nextLecture.subject,
      time: nextLecture.time,
      faculty: nextLecture.faculty,
      batch: nextLecture.batch || 'N/A',
      lab: nextLecture.lab || 'N/A',
      startMinutes: parseTimeToMinutes(nextLecture.time.split('-')[0])
    } : 'None');
    console.log('=== END DEBUGGING ===');
    
    return nextLecture;
  };

  // Helper function to get time until next lecture
  const getTimeUntilNext = (nextClass) => {
    if (!nextClass) return null;
    
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    const [startTime] = nextClass.time.split('-');
    const startTimeInMinutes = parseTimeToMinutes(startTime);
    
    const diffMinutes = startTimeInMinutes - currentTimeInMinutes;
    
    // Handle negative values (shouldn't happen with correct logic, but just in case)
    if (diffMinutes <= 0) {
      return "0m";
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    
    // Update current time
    setCurrentTime(new Date());
    
    // Reload timetable data
    const selectedBatch = await getSelectedBatch();
    if (selectedBatch) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = new Date().getDay();
      const currentDay = days[today];
      
      const isWeekendDay = today === 0 || today === 6;
      setIsWeekend(isWeekendDay);
      
      const allClasses = timetableData.timetable[currentDay]?.[selectedBatch] || [];
      
      // Filter classes based on batch for lab sessions
      const filteredClasses = allClasses.filter(classItem => {
        // If it's a lab session (has batch property), check if it matches user's sub-batch
        if (classItem.batch) {
          if (selectedBatch === 'COMP A') {
            return classItem.batch === 'P1' || classItem.batch === 'P2';
          } else if (selectedBatch === 'COMP B') {
            return classItem.batch === 'P3' || classItem.batch === 'P4';
          }
          return false;
        }
        // Show all lectures (non-lab classes)
        return true;
      });
      
      setTodayClasses(filteredClasses);
      
      if (isWeekendDay) {
        const mondayClasses = timetableData.timetable['Monday']?.[selectedBatch] || [];
        setNextDayClasses(mondayClasses.slice(0, 3));
      }
    }
    
    setRefreshing(false);
  };

  useEffect(() => {
    // Update time every minute
    const timeInterval = setInterval(() => {
      console.log('🕐 Time interval triggered - updating currentTime');
      const newTime = new Date();
      console.log('🕐 New current time:', newTime.toLocaleTimeString());
      setCurrentTime(newTime);
    }, 60000);

    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('WeeklyView')} 
            style={{ marginRight: 15 }}
          >
            <Ionicons name="calendar-outline" size={24} color="#3498db" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings" size={24} style={{ marginRight: 15 }} />
          </TouchableOpacity>
        </View>
      ),
    });

    const loadTimetable = async () => {
      const selectedBatch = await getSelectedBatch();
      setBatch(selectedBatch);
      
      if (selectedBatch) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date().getDay();
        const currentDay = days[today];
        
        // Check if it's weekend
        const isWeekendDay = today === 0 || today === 6; // Sunday = 0, Saturday = 6
        setIsWeekend(isWeekendDay);
        
        const allClasses = timetableData.timetable[currentDay]?.[selectedBatch] || [];
        
        // Filter classes based on batch for lab sessions
        const filteredClasses = allClasses.filter(classItem => {
          // If it's a lab session (has batch property), check if it matches user's sub-batch
          if (classItem.batch) {
            if (selectedBatch === 'COMP A') {
              return classItem.batch === 'P1' || classItem.batch === 'P2';
            } else if (selectedBatch === 'COMP B') {
              return classItem.batch === 'P3' || classItem.batch === 'P4';
            }
            return false;
          }
          // Show all lectures (non-lab classes)
          return true;
        });
        
        setTodayClasses(filteredClasses);
        
        // Find next lecture
        const nextClass = findNextLecture(filteredClasses, selectedBatch);
        setNextLecture(nextClass);
        
        // If it's weekend, get next Monday's schedule for preview
        if (isWeekendDay) {
          const mondayClasses = timetableData.timetable['Monday']?.[selectedBatch] || [];
          setNextDayClasses(mondayClasses.slice(0, 3)); // Show first 3 classes
        }
      }
    };
    
    loadTimetable();

    return () => clearInterval(timeInterval);
  }, [navigation]);

  // useEffect to update next lecture when time changes
  useEffect(() => {
    if (todayClasses.length > 0 && batch) {
      console.log('⏰ Time changed - recalculating next lecture');
      const nextClass = findNextLecture(todayClasses, batch);
      setNextLecture(nextClass);
    }
  }, [currentTime, todayClasses, batch]);

  if (!batch) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Today's Schedule ({batch})</Text>
      
      {/* Next Lecture Card */}
      {nextLecture && !isWeekend && (
        <View style={styles.nextLectureCard}>
          <View style={styles.nextLectureHeader}>
            <Ionicons name="time-outline" size={20} color="#8e44ad" />
            <Text style={styles.nextLectureTitle}>Next Lecture</Text>
          </View>
          <View style={styles.nextLectureContent}>
            <Text style={styles.nextLectureSubject}>{nextLecture.subject}</Text>
            <View style={styles.nextLectureDetails}>
              <Text style={styles.nextLectureTime}>{nextLecture.time}</Text>
              <Text style={styles.nextLectureCountdown}>in {getTimeUntilNext(nextLecture)}</Text>
            </View>
            <Text style={styles.nextLectureFaculty}>Faculty: {nextLecture.faculty}</Text>
            {nextLecture.lab && <Text style={styles.nextLectureFaculty}>Lab: {nextLecture.lab}</Text>}
            {nextLecture.batch && <Text style={styles.nextLectureFaculty}>Batch: {nextLecture.batch}</Text>}
          </View>
        </View>
      )}
      
      <FlatList
        data={todayClasses}
        keyExtractor={(item, index) => index.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor={'#3498db'}
          />
        }
        renderItem={({ item }) => {
          const isCurrent = isCurrentClass(item.time);
          const isUpcoming = isUpcomingClass(item.time);
          
          return (
            <View style={[
              styles.classItem,
              isCurrent && styles.currentClass,
              isUpcoming && styles.upcomingClass
            ]}>
              <View style={styles.classHeader}>
                <Text style={[
                  styles.timeText,
                  isCurrent && styles.currentTimeText
                ]}>{item.time}</Text>
                {isCurrent && (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                )}
                {isUpcoming && (
                  <View style={styles.upcomingBadge}>
                    <Text style={styles.upcomingBadgeText}>UPCOMING</Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.subjectText,
                isCurrent && styles.currentSubjectText
              ]}>{item.subject}</Text>
              <Text style={styles.detailText}>Faculty: {item.faculty}</Text>
              {item.lab && <Text style={styles.detailText}>Lab: {item.lab}</Text>}
              {item.batch && <Text style={styles.detailText}>Batch: {item.batch}</Text>}
            </View>
          );
        }}
        ListEmptyComponent={
          isWeekend ? (
            <View style={styles.weekendContainer}>
              <Ionicons name="sunny-outline" size={60} color="#f39c12" style={styles.weekendIcon} />
              <Text style={styles.weekendTitle}>Enjoy Your Weekend! 🎉</Text>
              <Text style={styles.weekendMessage}>
                Time to relax and recharge. Classes resume on Monday!
              </Text>
              
              {nextDayClasses.length > 0 && (
                <View style={styles.mondayPreview}>
                  <Text style={styles.previewTitle}>📅 Monday Preview</Text>
                  {nextDayClasses.map((item, index) => (
                    <View key={index} style={styles.previewItem}>
                      <Text style={styles.previewTime}>{item.time}</Text>
                      <Text style={styles.previewSubject}>{item.subject}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.weekendTips}>
                <Text style={styles.tipsTitle}>💡 Weekend Study Tips:</Text>
              <Text style={{ color: '#F2F2F2' }}>• Review this week's notes</Text>
                <Text style={{ color: '#F2F2F2' }}>• Prepare for Monday's classes</Text>
               <Text style={{ color: '#F2F2F2' }}>• Take breaks and stay healthy</Text>

              </View>
            </View>
          ) : (
            <Text style={styles.noClassesText}>No classes scheduled for today</Text>
          )
        }
      />
    </View>
  );
};

const createStyles = (theme) => ({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: theme.background,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.secondary,
  },
  classItem: {
    backgroundColor: theme.surface,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.accent,
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.secondary,
  },
  subjectText: {
    fontSize: 18,
    marginVertical: 5,
    color: theme.secondary,
  },
  detailText: {
    color: theme.muted,
    fontSize: 14,
  },
  noClassesText: {
    textAlign: 'center',
    marginTop: 20,
    color: theme.muted,
    fontSize: 16,
  },
  currentClass: {
    backgroundColor: theme === 'light' ? '#e8f5e8' : '#1a3d1a',
    borderLeftColor: theme.success,
    borderWidth: 2,
    borderColor: theme.success,
    shadowColor: theme.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  upcomingClass: {
    backgroundColor: theme === 'light' ? '#fff3cd' : '#3d3315',
    borderLeftColor: theme.warning,
    borderWidth: 1,
    borderColor: theme.warning,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  currentTimeText: {
    color: theme.success,
    fontWeight: 'bold',
  },
  currentSubjectText: {
    color: theme.success,
    fontWeight: 'bold',
  },
  liveBadge: {
    backgroundColor: theme.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  upcomingBadge: {
    backgroundColor: theme.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Weekend Styles
  weekendContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  weekendIcon: {
    marginBottom: 15,
  },
  weekendTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.secondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  weekendMessage: {
    fontSize: 16,
    color: theme.muted,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  mondayPreview: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: theme.accent,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.secondary,
    marginBottom: 10,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  previewTime: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.accent,
  },
  previewSubject: {
    fontSize: 14,
    color: theme.secondary,
    flex: 1,
    textAlign: 'right',
  },
  weekendTips: {
    backgroundColor: theme === 'light' ? '#e8f5e8' : '#1a3d1a',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: theme.success,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.success,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: theme.secondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  // Next Lecture Styles
  nextLectureCard: {
    backgroundColor: theme === 'light' ? '#f4f1ff' : '#2a1d3d',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8e44ad',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextLectureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextLectureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e44ad',
    marginLeft: 8,
  },
  nextLectureContent: {
    marginLeft: 4,
  },
  nextLectureSubject: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  nextLectureDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextLectureTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8e44ad',
  },
  nextLectureCountdown: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.danger,
    backgroundColor: theme === 'light' ? '#ffebee' : '#3d1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nextLectureFaculty: {
    fontSize: 14,
    color: theme.muted,
    marginBottom: 2,
  },
});

export default HomeScreen;