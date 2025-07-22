# Bug Reproduction Results - findNextLecture Function

## 🐛 **BUG DISCOVERED**

**Issue:** Incorrect time parsing and next lecture selection

### Bug Details:
The `findNextLecture` function has a critical bug in how it handles time ranges that cross 12:00 PM (noon). 

### **Evidence from Console Logs:**

**Test Scenario:** Current time: 12:11:22 AM (11 minutes after midnight)

**Problematic Time Parsing:**
```
Class 4: OS Lab (P)
  Time: 12:15-01:15
  Start minutes: 735    ← 12:15 PM (correct)
  End minutes: 75       ← 01:15 AM (WRONG! Should be 01:15 PM = 795)
  
Class 5: OS Lab (P)  
  Time: 01:15-02:00
  Start minutes: 75     ← 01:15 AM (WRONG! Should be 01:15 PM = 795)
  End minutes: 120      ← 02:00 AM (WRONG! Should be 02:00 PM = 840)
```

**Result:** The algorithm incorrectly selects "OS Lab (P) 01:15-02:00" as the next lecture instead of "WT (L) 09:00-10:00".

## Root Cause Analysis

**Problem:** The time parsing logic doesn't properly handle 24-hour time conversion for afternoon classes. Times like `01:15` are being interpreted as 1:15 AM instead of 1:15 PM when they appear after `12:15`.

**Current Logic Issues:**
1. `12:15` correctly converts to 735 minutes (12:15 PM)
2. `01:15` incorrectly converts to 75 minutes (1:15 AM) instead of 795 minutes (1:15 PM)
3. This causes afternoon classes to be sorted incorrectly as if they occur early morning

## Time Scenarios to Test

### Scenario 1: Before First Class (8:30 AM)
- **Expected:** Next lecture should be "WT (L) 09:00-10:00"
- **Current Bug:** Might select afternoon class incorrectly

### Scenario 2: Between Classes (10:30 AM)
- **Expected:** Next lecture should be "CE (L) 11:15-12:15"
- **Current Bug:** Time parsing should work correctly for morning hours

### Scenario 3: During a Class (10:30 AM during 10:00-11:00 class)
- **Expected:** Current class should be marked as "LIVE", next should be "CE (L) 11:15-12:15"
- **Current Bug:** May show incorrect upcoming class

### Scenario 4: After Last Class (5:30 PM)
- **Expected:** No next lecture should be shown
- **Current Bug:** May incorrectly show early morning classes as "upcoming"

### Scenario 5: Around Noon Time (12:30 PM)
- **Expected:** Should correctly handle 12:15 PM classes and afternoon classes
- **Current Bug:** ✅ **CONFIRMED** - Afternoon classes are parsed as morning classes

## Impact of the Bug

1. **Incorrect Next Lecture Display:** Users see wrong upcoming classes
2. **Poor User Experience:** Students may miss actual classes or go to wrong rooms
3. **Time Management Issues:** Countdown timers show incorrect values
4. **Notification Problems:** Push notifications likely fire at wrong times

## Reproduction Steps

1. ✅ Run the app at any time
2. ✅ Check console logs for time parsing
3. ✅ Observe incorrect minute calculations for afternoon classes
4. ✅ Notice wrong "next lecture" selection

## Debugging Logs Added

Added comprehensive console.log statements to track:
- ✅ Current time in minutes
- ✅ Each class start/end time in minutes  
- ✅ Upcoming classes array
- ✅ Selected next lecture
- ✅ Time update triggers

## Next Steps for Fix

1. **Fix time parsing logic** to properly handle 12-hour to 24-hour conversion
2. **Add proper PM/AM context** for time ranges
3. **Test with different time scenarios** after fix
4. **Validate countdown calculations** are correct
