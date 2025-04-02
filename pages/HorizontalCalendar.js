import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isValid as isDateValid,
} from 'date-fns';

const HorizontalCalendar = ({selectedDate, onDayPress}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Log the incoming selectedDate prop
  useEffect(() => {
    console.log('Incoming selectedDate prop:', selectedDate);
  }, [selectedDate]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const navigateMonth = direction => {
    setCurrentMonth(
      direction === 'next'
        ? addMonths(currentMonth, 1)
        : subMonths(currentMonth, 1),
    );
  };

  // Safely parse and validate the selected date
  const parsedSelectedDate = selectedDate ? parseISO(selectedDate) : null;
  const isSelectedDateValid =
    parsedSelectedDate && isDateValid(parsedSelectedDate);

  // Log when a day is pressed
  const handleDayPress = dateString => {
    console.log('Day pressed, sending:', dateString);
    onDayPress(dateString);
  };

  return (
    <View style={styles.calendarWrapper}>
      {/* Month and Year Header */}
      <View style={styles.monthHeader}>
        <Text style={styles.monthYearText}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
      </View>

      {/* Calendar with Arrows */}
      <View style={styles.calendarContainer}>
        <TouchableOpacity
          onPress={() => navigateMonth('prev')}
          style={styles.arrowButton}>
          <Text style={styles.arrowText}>←</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}>
          {daysInMonth.map(day => {
            return (
              <TouchableOpacity
                key={day.toString()}
                onPress={() => handleDayPress(format(day, 'yyyy-MM-dd'))}
                style={[
                  styles.dayButton,
                  isSelectedDateValid &&
                    isSameDay(day, parsedSelectedDate) &&
                    styles.selectedDayButton,
                ]}>
                <Text
                  style={[
                    styles.dayNumber,
                    isSelectedDateValid &&
                      isSameDay(day, parsedSelectedDate) &&
                      styles.selectedDayText,
                  ]}>
                  {format(day, 'd')}
                </Text>
                <Text
                  style={[
                    styles.dayName,
                    isSelectedDateValid &&
                      isSameDay(day, parsedSelectedDate) &&
                      styles.selectedDayText,
                  ]}>
                  {format(day, 'EEE')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          onPress={() => navigateMonth('next')}
          style={styles.arrowButton}>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarWrapper: {
    paddingBottom: 5,
  },
  monthHeader: {
    paddingTop: 10,
    paddingBottom: 5,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginHorizontal: 15,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#51459d',
  },
  calendarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  arrowButton: {
    padding: 10,
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: '#51459d',
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
  },
  dayButton: {
    width: 60,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 7,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  selectedDayButton: {
    backgroundColor: '#51459d',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  selectedDayText: {
    color: '#fff',
  },
});

export default HorizontalCalendar;
