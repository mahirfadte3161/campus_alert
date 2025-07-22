import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getSelectedBatch } from '../services/userPreferences';
import timetableData from '../data/timetableData';
import { Ionicons } from '@expo/vector-icons';

const WeeklyViewScreen = ({ navigation }) => {
  const [batch, setBatch] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const weekdayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  // Helper function to convert timetable time to actual hours (accounting for PM times)
  const convertToActualTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    // Convert afternoon times (12:15-05:00) to PM hours
    if (hours >= 12 || (hours >= 1 && hours <= 5)) {
      if (hours >= 1 && hours <= 5) {
        return [(hours + 12), minutes]; // 1:00 -> 13:00 (1 PM)
      }
      return [hours, minutes]; // 12:15 stays 12:15 (12:15 PM)
    }
    return [hours, minutes]; // Morning times stay the same
  };

  // Helper function to format time for display with AM/PM
  const formatDisplayTime = (timeRange) => {
    const [startTime, endTime] = timeRange.split('-');
    const [startHour, startMinute] = convertToActualTime(startTime);
    const [endHour, endMinute] = convertToActualTime(endTime);
    
    const formatTime = (hour, minute) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
    };
    
    return `${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`;
  };

  // Helper function to check if a class is currently active
  const isCurrentClass = (timeRange, dayIndex) => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentDayIndex = today === 0 ? -1 : today - 1; // Convert to our 0-4 weekday index

    if (dayIndex !== currentDayIndex) return false;

    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startTime, endTime] = timeRange.split('-');
    const [startHour, startMinute] = convertToActualTime(startTime);
    const [endHour, endMinute] = convertToActualTime(endTime);

    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
  };

  const isUpcomingClass = (timeRange, dayIndex) => {
    const today = new Date().getDay();
    const currentDayIndex = today === 0 ? -1 : today - 1;

    if (dayIndex !== currentDayIndex) return false;

    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startTime] = timeRange.split('-');
    const [startHour, startMinute] = convertToActualTime(startTime);
    const startTimeInMinutes = startHour * 60 + startMinute;

    return startTimeInMinutes > currentTimeInMinutes && startTimeInMinutes <= currentTimeInMinutes + 30;
  };

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    navigation.setOptions({
      title: 'Weekly Schedule',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} style={{ marginRight: 15 }} />
        </TouchableOpacity>
      ),
    });

    const loadBatch = async () => {
      const selectedBatch = await getSelectedBatch();
      setBatch(selectedBatch);
      
      // Set today as default selected day
      const today = new Date().getDay();
      if (today >= 1 && today <= 5) {
        setSelectedDay(today - 1); // Convert to 0-4 index
      }
    };

    loadBatch();
    return () => clearInterval(timeInterval);
  }, [navigation]);

  const getDayClasses = (dayIndex) => {
    const dayName = weekdays[dayIndex];
    const allClasses = timetableData.timetable[dayName]?.[batch] || [];
    
    // Return all classes for the selected batch (no filtering needed anymore)
    return allClasses;
  };

  const renderClassItem = ({ item, index }) => {
    const isCurrent = isCurrentClass(item.time, selectedDay);
    const isUpcoming = isUpcomingClass(item.time, selectedDay);

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
          ]}>{formatDisplayTime(item.time)}</Text>
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
  };

  if (!batch) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Weekly Schedule ({batch})</Text>
      
      {/* Day Selector */}
      <View style={{ height: 50, marginBottom: 20 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {weekdayShort.map((day, index) => {
          const isToday = new Date().getDay() === index + 1;
          const isSelected = selectedDay === index;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                isSelected && styles.selectedDayButton,
                isToday && styles.todayButton
              ]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[
                styles.dayButtonText,
                isSelected && styles.selectedDayButtonText,
                isToday && styles.todayButtonText
              ]}>
                {day}
              </Text>
              {isToday && <View style={styles.todayIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
       </View>
      {/* Selected Day Classes */}
      <View style={styles.selectedDayContainer}>
        <Text style={styles.selectedDayTitle}>
          {weekdays[selectedDay]}
          {new Date().getDay() === selectedDay + 1 && ' (Today)'}
        </Text>
        
        <FlatList
          data={getDayClasses(selectedDay)}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderClassItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.noClassesText}>No classes scheduled for {weekdays[selectedDay]}</Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  daySelector: {
    marginBottom: 20,
    
  },
  dayButton: {
    
    paddingHorizontal: 17,
    paddingVertical: 4,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#ecf0f1',
    alignItems: 'center',
    minWidth: 45,
    position: 'relative',
  },
  selectedDayButton: {
    backgroundColor: '#94c2d9',
  },
  todayButton: {
    borderWidth: 1.5,
    borderColor: '#27ae60',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  selectedDayButtonText: {
    color: 'white',
  },
  todayButtonText: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#27ae60',
  },
  selectedDayContainer: {
    flex: 1,
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  classItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2c3e50',
  },
  subjectText: {
    fontSize: 18,
    marginVertical: 5,
    color: '#2c3e50',
  },
  detailText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  currentClass: {
    backgroundColor: '#e8f5e8',
    borderLeftColor: '#27ae60',
    borderWidth: 2,
    borderColor: '#27ae60',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  upcomingClass: {
    backgroundColor: '#fff3cd',
    borderLeftColor: '#f39c12',
    borderWidth: 1,
    borderColor: '#f39c12',
  },
  currentTimeText: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  currentSubjectText: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  liveBadge: {
    backgroundColor: '#e74c3c',
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
    backgroundColor: '#f39c12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noClassesText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#7f8c8d',
    fontSize: 16,
  },
});

export default WeeklyViewScreen;
