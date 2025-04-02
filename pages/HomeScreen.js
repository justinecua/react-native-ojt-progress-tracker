import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  Button,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
  Animated,
  StyleSheet,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {Picker} from '@react-native-picker/picker';
import Svg, {Circle} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HorizontalCalendar from './HorizontalCalendar';
import WeeklyBarChart from './WeeklyBarChart';

const HomeScreen = () => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [viewListModalVisible, setViewListModalVisible] = useState(false);
  const [morningIn, setMorningIn] = useState({hour: 0, minute: 0});
  const [morningOut, setMorningOut] = useState({hour: 0, minute: 0});
  const [afternoonIn, setAfternoonIn] = useState({hour: 0, minute: 0});
  const [afternoonOut, setAfternoonOut] = useState({hour: 0, minute: 0});
  const [requiredOjtHours, setRequiredOjtHours] = useState('');
  const [myTotalOjtHours, setMyTotalOjtHours] = useState([]);
  const [myDaysOfOjt, setMyDaysOfOjt] = useState([]);

  const MOTIVATIONAL_QUOTES = [
    "Let's make tracking your OJT hours effortless!",
    'Every logged hour brings you closer to your goals!',
    'Success starts with good tracking habits!',
    'Your future begins with these OJT hours!',
    "One hour at a time - you've got this!",
    'Tracking made simple for busy trainees!',
    'Watch your progress grow day by day!',
    'Small logs today, big achievements tomorrow!',
    'Be proud of every hour you invest!',
    'Your dedication will shape your career!',
    'Consistency turns hours into achievements!',
    'Every logged hour is a step toward mastery',
    'Progress is built one hour at a time',
    'Small daily tracking leads to big career jumps',
    'Your future self will thank you for these logs',
    'Quality training comes from quality tracking',
    'Be the CEO of your OJT hours',
    'Log now, shine later',
    'Precision tracking = Professional growth',
    'Turn your hours into your superpower',
    "You're doing better than you think!",
    "Your effort today is tomorrow's advantage",
    'Believe in your growth potential',
    'The best investment is in yourself',
    'Your persistence is inspiring!',
    "Growth isn't linear - keep logging!",
    "You're writing your career story hour by hour",
    'Champions track their progress',
    'Your discipline will open doors',
    'The training ground is where stars are made',
    'Skills + Documentation = Career Success',
    "Track like the professional you're becoming",
    'These hours are your career foundation',
    'Professionalism starts with accountability',
    'Your logs are your career receipts',
    'Future employers will admire your diligence',
    'Building habits for career longevity',
    'The mundane work leads to extraordinary careers',
    'Documentation is a professional superpower',
    'Your logs prove your work ethic',
    'Time logged is time respected',
    'Value your time and others will too',
    'Intentional hours create exceptional careers',
    'Time management is future management',
    'Track it to master it',
    'Your hours are your most valuable asset',
    "Don't count hours, make hours count",
    'Time well tracked is time well spent',
    'Efficiency begins with awareness',
    'Every minute matters in your journey',
    'The expert in anything was once a trainee',
    'Success is the sum of small efforts',
    'Discipline is choosing what you want most',
    'The only place success comes before work is the dictionary',
    'Your career is built on invisible hours',
    'Opportunities multiply when tracked',
    "Today's preparation determines tomorrow's achievement",
    'The will to win means nothing without the will to track',
    'Professionalism is in the details',
    'What gets measured gets mastered',
  ];

  const calculateTotalHours = () => {
    let morningTotalMinutes = 0;
    if (morningOut.hour >= morningIn.hour) {
      morningTotalMinutes =
        (morningOut.hour - morningIn.hour) * 60 +
        (morningOut.minute - morningIn.minute);
    }

    let afternoonTotalMinutes = 0;
    if (
      afternoonOut.hour > afternoonIn.hour ||
      (afternoonOut.hour === afternoonIn.hour &&
        afternoonOut.minute > afternoonIn.minute)
    ) {
      afternoonTotalMinutes =
        (afternoonOut.hour - afternoonIn.hour) * 60 +
        (afternoonOut.minute - afternoonIn.minute);
    }

    return morningTotalMinutes + afternoonTotalMinutes;
  };

  const onDayPress = day => {
    console.log('Received date in HomeScreen:', day.dateString);
    setSelectedDate(day.dateString);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (myDaysOfOjt.includes(selectedDate)) {
      Alert.alert('Error', 'Oops, you are working twice a day? Relax a little');
      return;
    }

    const totalMinutesInADay = calculateTotalHours();

    if (totalMinutesInADay <= 0) {
      console.log(`No OJT hours recorded for ${selectedDate}`);
      setModalVisible(false);
      return;
    }

    const hours = Math.floor(totalMinutesInADay / 60);
    const minutes = totalMinutesInADay % 60;

    console.log(
      `Date: ${selectedDate}, Total Hours for the day: ${hours} hours and ${minutes} minutes`,
    );

    setMyTotalOjtHours(prevHours => {
      const newOjtHours = [...prevHours, totalMinutesInADay];
      saveData('myTotalOjtHours', newOjtHours);
      return newOjtHours;
    });

    setMyDaysOfOjt(prevDays => {
      const newDays = [...prevDays, selectedDate];
      saveData('myDaysOfOjt', newDays);
      return newDays;
    });

    setModalVisible(false);
  };

  const handleRemove = async index => {
    const updatedOjtHours = [...myTotalOjtHours];
    updatedOjtHours.splice(index, 1);
    setMyTotalOjtHours(updatedOjtHours);
    saveData('myTotalOjtHours', updatedOjtHours);

    const updatedDays = [...myDaysOfOjt];
    updatedDays.splice(index, 1);
    setMyDaysOfOjt(updatedDays);
    saveData('myDaysOfOjt', updatedDays);
  };

  const calculateRemainingHours = () => {
    if (isNaN(requiredOjtHours) || !Array.isArray(myTotalOjtHours)) {
      return {remainingHours: 0, remainingMinutes: 0};
    }

    const totalMinutes = myTotalOjtHours.reduce(
      (sum, minutes) => sum + minutes,
      0,
    );

    const totalRequiredMinutes = requiredOjtHours * 60;
    const remainingMinutes = totalRequiredMinutes - totalMinutes;

    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingMinutesRemainder = remainingMinutes % 60;

    return {remainingHours, remainingMinutes: remainingMinutesRemainder};
  };

  const calculateRemainingPercentage = () => {
    const totalMinutes = myTotalOjtHours.reduce(
      (sum, minutes) => sum + minutes,
      0,
    );
    const totalRequiredMinutes = requiredOjtHours * 60;

    if (totalRequiredMinutes <= 0) {
      return 0;
    }

    const percentage = (totalMinutes / totalRequiredMinutes) * 100;

    return Math.max(0, Math.min(100, percentage));
  };

  const saveData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const getWeeklyHours = () => {
    const weekDays = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const dayIndex = myDaysOfOjt.indexOf(dateStr);
      const hours = dayIndex !== -1 ? myTotalOjtHours[dayIndex] / 60 : 0;

      weekDays.push({
        day: format(date, 'EEE'),
        date: dateStr,
        hours: parseFloat(hours.toFixed(1)),
      });
    }

    return weekDays;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const ojtHours = await AsyncStorage.getItem('myTotalOjtHours');
        const ojtDays = await AsyncStorage.getItem('myDaysOfOjt');
        const requiredHours = await AsyncStorage.getItem('requiredOjtHours');

        if (ojtHours) {
          setMyTotalOjtHours(JSON.parse(ojtHours));
        }

        if (ojtDays) {
          setMyDaysOfOjt(JSON.parse(ojtDays));
        }

        if (requiredHours) {
          const parsedRequiredHours = Number(requiredHours);
          if (!isNaN(parsedRequiredHours)) {
            setRequiredOjtHours(parsedRequiredHours);
          } else {
            setRequiredOjtHours(0);
          }
        } else {
          setRequiredOjtHours(0);
        }
      } catch (error) {
        console.log('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const saveRequiredHours = async () => {
      if (requiredOjtHours) {
        try {
          await AsyncStorage.setItem(
            'requiredOjtHours',
            JSON.stringify(requiredOjtHours),
          );
        } catch (error) {
          console.log('Error saving required OJT hours:', error);
        }
      }
    };

    saveRequiredHours();
  }, [requiredOjtHours]);

  useEffect(() => {
    const totalMinutes = myTotalOjtHours.reduce(
      (sum, minutes) => sum + minutes,
      0,
    );
    const totalHours = Math.floor(totalMinutes / 60);
    const totalRemainingMinutes = totalMinutes % 60;

    console.log(
      `Total OJT Hours: ${totalHours} hours and ${totalRemainingMinutes} minutes`,
    );
    console.log(`Days with OJT hours: ${myDaysOfOjt.length} days`);
  }, [myTotalOjtHours, myDaysOfOjt]);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  };

  const [currentQuote, setCurrentQuote] = useState(getRandomQuote());

  const fadeAnim = useState(new Animated.Value(1))[0]; // Initial opacity: 1

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentQuote(getRandomQuote());
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 12,
        backgroundColor: 'white',
      }}>
      <View
        style={{
          backgroundColor: '#f5f4f9',
          height: '100%',
          padding: 12,
          borderRadius: 15,
        }}>
        <View
          style={{
            backgroundColor: 'white',
            padding: 16,
            borderRadius: 12,
            marginVertical: 17,
            borderLeftWidth: 4,
            borderLeftColor: '#51459d',
          }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#51459d',
              marginBottom: 4,
            }}>
            👋 Hey there, OJT Trainee!
          </Text>
          <Animated.Text style={[styles.welcomeSubtitle, {opacity: fadeAnim}]}>
            {currentQuote}
          </Animated.Text>
        </View>

        <View>
          <View
            style={{
              width: '100%',
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 15,
            }}>
            <HorizontalCalendar
              selectedDate={selectedDate}
              onDayPress={dateString => onDayPress({dateString})}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>This Week's Summary</Text>
            <View style={styles.chartContainer}>
              <WeeklyBarChart data={getWeeklyHours()} />
            </View>
          </View>
          {/* Circle for Remaining OJT Hours */}
          <View style={styles.progressCard}>
            {/* Progress Circle with Percentage */}
            <View style={styles.circleContainer}>
              <View style={styles.circleWrapper}>
                <Svg width={180} height={180} style={styles.circleSvg}>
                  <Circle
                    cx="90"
                    cy="90"
                    r="75"
                    stroke="#f0f0f0"
                    strokeWidth="12"
                    fill="none"
                  />
                  <Circle
                    cx="90"
                    cy="90"
                    r="75"
                    stroke={
                      calculateRemainingPercentage() > 75
                        ? '#4CAF50'
                        : calculateRemainingPercentage() > 50
                        ? '#FFC107'
                        : '#F44336'
                    }
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="471.24"
                    strokeDashoffset={
                      471.24 - (471.24 * calculateRemainingPercentage()) / 100
                    }
                    strokeLinecap="round"
                  />
                </Svg>
                <View style={styles.percentageContainer}>
                  <Text style={styles.percentageText}>
                    {Math.round(calculateRemainingPercentage())}%
                  </Text>
                </View>
              </View>
              <View style={styles.progressLabelContainer}>
                <Text style={styles.progressLabel}>OJT Progress</Text>
              </View>
            </View>

            {/* Separated Metrics */}
            <View style={styles.metricsContainer}>
              {/* Days Completed */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Days Completed</Text>
                <Text style={[styles.metricValue, styles.blueText]}>
                  {myDaysOfOjt.length}
                </Text>
              </View>

              {/* Required Hours */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Required Hours</Text>
                <TextInput
                  style={[styles.metricValue, styles.purpleText]}
                  keyboardType="numeric"
                  value={String(requiredOjtHours)}
                  onChangeText={text => {
                    const hours = Number(text);
                    if (!isNaN(hours)) {
                      setRequiredOjtHours(hours);
                    }
                  }}
                  underlineColorAndroid="transparent"
                  selectionColor="#51459d"
                />
              </View>

              {/* Remaining Time */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Remaining</Text>
                <View style={styles.timeRow}>
                  <Text style={[styles.metricValue, styles.redText]}>
                    {calculateRemainingHours().remainingHours}h
                  </Text>
                  <Text style={styles.timeSeparator}>•</Text>
                  <Text style={[styles.metricValue, styles.redText]}>
                    {calculateRemainingHours().remainingMinutes}m
                  </Text>
                </View>
              </View>

              {/* Total Logged */}
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Logged</Text>
                <View style={styles.timeRow}>
                  <Text style={[styles.metricValue, styles.greenText]}>
                    {Math.floor(
                      myTotalOjtHours.reduce((sum, m) => sum + m, 0) / 60,
                    )}
                    h
                  </Text>
                  <Text style={styles.timeSeparator}>•</Text>
                  <Text style={[styles.metricValue, styles.greenText]}>
                    {myTotalOjtHours.reduce((sum, m) => sum + m, 0) % 60}m
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.quickLogButton}
            onPress={() => {
              const now = new Date();
              setMorningIn({
                hour:
                  now.getHours() > 12 ? now.getHours() - 12 : now.getHours(),
                minute: now.getMinutes(),
              });
              setModalVisible(true);
            }}>
            <Text style={styles.quickLogText}>Quick Log</Text>
          </TouchableOpacity>

          <Pressable
            style={{
              borderColor: '#51459d',
              padding: 14,
              borderRadius: 5,
              borderWidth: 1,
              alignItems: 'center',
              marginTop: 10,
            }}
            onPress={() => setViewListModalVisible(true)}>
            <Text style={{color: '#51459d', fontSize: 16}}>View Logs</Text>
          </Pressable>

          {/* Modal for selecting times */}
          <Modal
            visible={modalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}>
              <View
                style={{
                  width: '90%',
                  padding: 27,
                  backgroundColor: 'white',
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#51459d',
                  }}>
                  {selectedDate && !isNaN(new Date(selectedDate).getTime())
                    ? format(new Date(selectedDate), 'MMMM d, yyyy')
                    : 'No date selected'}
                </Text>

                {/* Morning Time - In and Out Pickers */}
                <Text
                  style={{marginTop: 20, color: '#51459d', fontWeight: '800'}}>
                  Morning Time:
                </Text>
                <Text>In:</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}>
                  <Picker
                    selectedValue={morningIn.hour}
                    style={{height: 50, width: 100, color: '#51459d'}}
                    onValueChange={itemValue =>
                      setMorningIn({...morningIn, hour: itemValue})
                    }>
                    {[...Array(13)].map((_, index) => (
                      <Picker.Item
                        key={index}
                        label={`${index}`}
                        value={index}
                      />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={morningIn.minute}
                    style={{height: 50, width: 100, color: '#51459d'}}
                    onValueChange={itemValue =>
                      setMorningIn({...morningIn, minute: itemValue})
                    }>
                    {[...Array(60)].map((_, index) => (
                      <Picker.Item
                        key={index}
                        label={`${index}`}
                        value={index}
                      />
                    ))}
                  </Picker>
                </View>

                <Text>Out:</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}>
                  <Picker
                    selectedValue={morningOut.hour}
                    style={{height: 50, width: 100, color: '#51459d'}}
                    onValueChange={itemValue =>
                      setMorningOut({...morningOut, hour: itemValue})
                    }>
                    {[...Array(13)].map((_, index) => (
                      <Picker.Item
                        key={index}
                        label={`${index}`}
                        value={index}
                      />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={morningOut.minute}
                    style={{height: 50, width: 100, color: '#51459d'}}
                    onValueChange={itemValue =>
                      setMorningOut({...morningOut, minute: itemValue})
                    }>
                    {[...Array(60)].map((_, index) => (
                      <Picker.Item
                        key={index}
                        label={`${index}`}
                        value={index}
                      />
                    ))}
                  </Picker>
                </View>

                {/* Afternoon Time - In and Out Pickers */}
                <Text
                  style={{marginTop: 20, color: '#51459d', fontWeight: '800'}}>
                  Afternoon Time:
                </Text>
                <Text>In:</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}>
                  <Picker
                    selectedValue={afternoonIn.hour}
                    style={{height: 50, width: 100, color: '#51459d'}}
                    onValueChange={itemValue =>
                      setAfternoonIn({...afternoonIn, hour: itemValue})
                    }>
                    {[...Array(13)].map((_, index) => (
                      <Picker.Item
                        key={index}
                        label={`${index}`}
                        value={index}
                      />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={afternoonIn.minute}
                    style={{height: 50, width: 100, color: '#51459d'}}
                    onValueChange={itemValue =>
                      setAfternoonIn({...afternoonIn, minute: itemValue})
                    }>
                    {[...Array(60)].map((_, index) => (
                      <Picker.Item
                        key={index}
                        label={`${index}`}
                        value={index}
                      />
                    ))}
                  </Picker>
                </View>

                <Text>Out:</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}>
                  <Picker
                    selectedValue={afternoonOut.hour}
                    style={{height: 50, width: 100, color: '#51459d'}}
                    onValueChange={itemValue =>
                      setAfternoonOut({...afternoonOut, hour: itemValue})
                    }>
                    {[...Array(13)].map((_, index) => (
                      <Picker.Item
                        key={index}
                        label={`${index}`}
                        value={index}
                      />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={afternoonOut.minute}
                    style={{height: 50, width: 100, color: '#51459d'}}
                    onValueChange={itemValue =>
                      setAfternoonOut({...afternoonOut, minute: itemValue})
                    }>
                    {[...Array(60)].map((_, index) => (
                      <Picker.Item
                        key={index}
                        label={`${index}`}
                        value={index}
                      />
                    ))}
                  </Picker>
                </View>

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    width: '100%',
                  }}>
                  <Pressable
                    style={{
                      backgroundColor: '#51459d',
                      padding: 10,
                      borderRadius: 5,
                      alignItems: 'center',
                      width: '50%',
                    }}
                    onPress={handleSave}>
                    <Text style={{color: 'white', fontSize: 16}}>Save </Text>
                  </Pressable>
                  <Pressable
                    style={{
                      backgroundColor: 'white',
                      padding: 10,
                      borderRadius: 5,
                      alignItems: 'center',
                      borderColor: '#51459d',
                      borderWidth: 1,
                      width: '50%',
                    }}
                    onPress={() => setModalVisible(false)}>
                    <Text style={{color: '#51459d', fontSize: 16}}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal to view and remove OJT hours */}
          <Modal
            visible={viewListModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setViewListModalVisible(false)}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}>
              <View
                style={{
                  width: '90%',
                  padding: 20,
                  backgroundColor: 'white',
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#51459d',
                    textAlign: 'center',
                    padding: 4,
                  }}>
                  Logs
                </Text>
                <ScrollView
                  style={{maxHeight: 300}}
                  showsVerticalScrollIndicator={false}>
                  {myTotalOjtHours.length === 0 ? (
                    <View>
                      <Text
                        style={{
                          backgroundColor: 'white',
                          borderRadius: 5,
                          marginTop: 30,
                          fontStyle: 'italic',
                          textAlign: 'center',
                        }}>
                        You don`t have existing logs
                      </Text>
                      <Text
                        style={{
                          backgroundColor: 'white',
                          borderRadius: 5,
                          fontStyle: 'italic',
                          textAlign: 'center',
                          marginBottom: 30,
                        }}>
                        Select a date at the calendar
                      </Text>
                    </View>
                  ) : (
                    myDaysOfOjt
                      .map((date, index) => ({
                        date,
                        hours: myTotalOjtHours[index],
                        index,
                      }))
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(({date, hours, index}, sortedIndex) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: 'row',
                            marginVertical: 10,
                            justifyContent: 'space-between',
                            padding: 10,
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            borderBottomColor: 'gray',
                            borderBottomWidth: 0.4,
                          }}>
                          <Text
                            style={{
                              padding: 5,
                              borderRadius: 5,
                              flexShrink: 1,
                              fontStyle: 'italic',
                            }}>
                            {format(new Date(date), 'MMM d, yyyy')} -{' '}
                            {Math.floor(hours / 60)} hours and {hours % 60} min
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleRemove(index)}
                            style={{
                              marginTop: 5,
                              backgroundColor: '#51459d',
                              paddingTop: 5,
                              paddingBottom: 5,
                              paddingLeft: 10,
                              paddingRight: 10,
                              borderRadius: 5,
                            }}>
                            <Text style={{color: 'white'}}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                  )}
                </ScrollView>
                <Pressable
                  style={{
                    backgroundColor: 'white',
                    padding: 10,
                    borderRadius: 5,
                    alignItems: 'center',
                    borderColor: '#51459d',
                    borderWidth: 1,
                  }}
                  onPress={() => setViewListModalVisible(false)}>
                  <Text style={{color: '#51459d', fontSize: 16}}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  welcomeContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginVertical: 25,
    borderLeftWidth: 4,
    borderLeftColor: '#51459d',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#51459d',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  progressCard: {
    borderRadius: 12,
    marginVertical: 15,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 20,
  },
  circleWrapper: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleSvg: {
    position: 'absolute',
    transform: [{rotate: '-90deg'}],
  },
  percentageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#51459d',
    textAlign: 'center',
    marginTop: 0,
    padding: 0,
    lineHeight: 34,
    zIndex: 1,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelDecoration: {
    width: 20,
    height: 2,
    backgroundColor: '#51459d',
    marginHorizontal: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#51459d',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Update metricCard style
  metricCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    padding: 2,
    margin: 0,
  },
  purpleText: {
    color: '#51459d',
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSeparator: {
    marginHorizontal: 4,
    color: '#999',
  },
  blueText: {
    color: '#0275d8',
  },
  purpleText: {
    color: '#51459d',
  },
  redText: {
    color: '#d9534f',
  },
  greenText: {
    color: '#5cb85c',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#51459d',
    marginBottom: 12,
  },
  weekSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayPill: {
    alignItems: 'center',
  },
  dayPillText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dayPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
  },
  dayPillDotActive: {
    backgroundColor: '#51459d',
  },
  quickLogButton: {
    flexDirection: 'row',
    backgroundColor: '#51459d',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderRadius: 5,
  },
  quickLogText: {
    color: 'white',
    fontSize: 16,
  },
});

export default HomeScreen;
