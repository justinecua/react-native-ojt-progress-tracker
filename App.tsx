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
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {Picker} from '@react-native-picker/picker';
import Svg, {Circle} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';

const App = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [viewListModalVisible, setViewListModalVisible] = useState(false);
  const [morningIn, setMorningIn] = useState({hour: 0, minute: 0});
  const [morningOut, setMorningOut] = useState({hour: 0, minute: 0});
  const [afternoonIn, setAfternoonIn] = useState({hour: 0, minute: 0});
  const [afternoonOut, setAfternoonOut] = useState({hour: 0, minute: 0});
  const [requiredOjtHours, setRequiredOjtHours] = useState(0);
  const [myTotalOjtHours, setMyTotalOjtHours] = useState([]);
  const [myDaysOfOjt, setMyDaysOfOjt] = useState([]);

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

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1, padding: 20}}>
      <View style={{padding: 1, marginBottom: 10, marginTop: 30}}>
        <Text
          style={{
            padding: 1,
            fontSize: 18,
            fontWeight: 800,
            color: '#51459d',
          }}>
          Welcome to WLog!
        </Text>
        <Text
          style={{
            padding: 1,
            fontFamily: 'Roboto',
            fontSize: 16,
            textAlign: 'justify',
            fontStyle: 'italic',
          }}>
          Easily track your OJT hours by logging your shifts
        </Text>
      </View>

      <Text
        style={{
          marginTop: 10,
          height: 30,
          fontWeight: '600',
          color: '#51459d',
          fontSize: 15,
        }}>
        Required OJT Hours:
      </Text>
      <TextInput
        style={{
          borderWidth: 0.5,
          marginBottom: 10,
          borderColor: 'gray',
          borderRadius: 5,
          padding: 10,
        }}
        keyboardType="numeric"
        value={String(requiredOjtHours)}
        onChangeText={text => {
          const hours = Number(text);
          if (!isNaN(hours)) {
            setRequiredOjtHours(hours);
          }
        }}
      />
      <View>
        {/* Circle for Remaining OJT Hours */}
        <View
          style={{
            borderRadius: 0.2,
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: {width: 0.3, height: 0.3},
            shadowOpacity: 0.2,
            shadowRadius: 1,
          }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginVertical: 130,
              position: 'relative',
              marginTop: 10,
            }}>
            <Svg width="170" height="170">
              {' '}
              <Circle
                cx="85"
                cy="85"
                r="60"
                stroke="lightgray"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <Circle
                cx="85"
                cy="85"
                r="60"
                stroke="#51459d"
                strokeWidth="8"
                fill="none"
                strokeDasharray="377" // Updated (2 * π * 60)
                strokeDashoffset={
                  377 - (377 * calculateRemainingPercentage()) / 100
                }
                strokeLinecap="round"
              />
            </Svg>

            {/* Percentage Text */}
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 36, fontWeight: 'bold'}}>
                {' '}
                {Math.round(calculateRemainingPercentage())}%
              </Text>
            </View>
            <Text
              style={{
                fontSize: 19,
                fontWeight: 'bold',
                position: 'absolute',
                bottom: '-20',
                marginBottom: 10,
              }}>
              OJT Progress
            </Text>
            <Text
              style={{
                fontSize: 14,
                position: 'absolute',
                bottom: '-40',
              }}>
              {myDaysOfOjt.length === 1 ? 'Day' : 'Days'}:
              <Text style={{color: '#0275d8', fontWeight: '800'}}>
                {' '}
                {myDaysOfOjt.length}
              </Text>
            </Text>
            <Text
              style={{
                fontSize: 14,
                position: 'absolute',
                bottom: '-60',
              }}>
              Required OJT Hours:
              <Text style={{color: '#51459d', fontWeight: '800'}}>
                {' '}
                {requiredOjtHours}
              </Text>
            </Text>

            <Text
              style={{
                fontSize: 14,
                position: 'absolute',
                bottom: '-80',
              }}>
              Remaining:
              <Text style={{color: '#d9534f', fontWeight: '800'}}>
                {' '}
                {calculateRemainingHours().remainingHours} hours
              </Text>{' '}
              and
              <Text style={{color: '#d9534f', fontWeight: '800'}}>
                {' '}
                {calculateRemainingHours().remainingMinutes} minutes
              </Text>
            </Text>

            <Text
              style={{
                fontSize: 14,
                position: 'absolute',
                bottom: '-100',
              }}>
              Total OJT Hours:
              <Text style={{color: '#5cb85c', fontWeight: '800'}}>
                {' '}
                {Math.floor(
                  myTotalOjtHours.reduce((sum, minutes) => sum + minutes, 0) /
                    60,
                )}
              </Text>{' '}
              hours and
              <Text style={{color: '#5cb85c', fontWeight: '800'}}>
                {' '}
                {myTotalOjtHours.reduce((sum, minutes) => sum + minutes, 0) %
                  60}
              </Text>{' '}
              minutes
            </Text>
          </View>
        </View>

        <View
          style={{
            width: '100%',
            padding: 3,
            borderRadius: 20,
            overflow: 'hidden',
            marginTop: 2,
            marginBottom: 15,
          }}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={{
              [selectedDate]: {selected: true, selectedColor: '#51459d'},
            }}
            theme={{
              selectedDayBackgroundColor: 'blue',
              selectedDayTextColor: 'white',
            }}
            style={{
              borderRadius: 5,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: {width: 1, height: 1},
              shadowOpacity: 0.2,
              shadowRadius: 4,
              padding: 20,
            }}
          />
        </View>

        <Pressable
          style={{
            backgroundColor: '#51459d',
            padding: 10,

            borderRadius: 5,
            alignItems: 'center',
          }}
          onPress={() => setViewListModalVisible(true)}>
          <Text style={{color: 'white', fontSize: 16}}>View Logs</Text>
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
                width: '80%',
                padding: 20,
                backgroundColor: 'white',
                borderRadius: 10,
              }}>
              <Text
                style={{fontSize: 18, fontWeight: 'bold', textAlign: 'center'}}>
                Add Time for {selectedDate}
              </Text>

              {/* Morning Time - In and Out Pickers */}
              <Text
                style={{marginTop: 20, color: '#51459d', fontWeight: '800'}}>
                Morning Time:
              </Text>
              <Text>In:</Text>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Picker
                  selectedValue={morningIn.hour}
                  style={{height: 50, width: 100}}
                  onValueChange={itemValue =>
                    setMorningIn({...morningIn, hour: itemValue})
                  }>
                  {[...Array(13)].map((_, index) => (
                    <Picker.Item key={index} label={`${index}`} value={index} />
                  ))}
                </Picker>
                <Picker
                  selectedValue={morningIn.minute}
                  style={{height: 50, width: 100}}
                  onValueChange={itemValue =>
                    setMorningIn({...morningIn, minute: itemValue})
                  }>
                  {[...Array(60)].map((_, index) => (
                    <Picker.Item key={index} label={`${index}`} value={index} />
                  ))}
                </Picker>
              </View>

              <Text>Out:</Text>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Picker
                  selectedValue={morningOut.hour}
                  style={{height: 50, width: 100}}
                  onValueChange={itemValue =>
                    setMorningOut({...morningOut, hour: itemValue})
                  }>
                  {[...Array(13)].map((_, index) => (
                    <Picker.Item key={index} label={`${index}`} value={index} />
                  ))}
                </Picker>
                <Picker
                  selectedValue={morningOut.minute}
                  style={{height: 50, width: 100}}
                  onValueChange={itemValue =>
                    setMorningOut({...morningOut, minute: itemValue})
                  }>
                  {[...Array(60)].map((_, index) => (
                    <Picker.Item key={index} label={`${index}`} value={index} />
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
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Picker
                  selectedValue={afternoonIn.hour}
                  style={{height: 50, width: 100}}
                  onValueChange={itemValue =>
                    setAfternoonIn({...afternoonIn, hour: itemValue})
                  }>
                  {[...Array(13)].map((_, index) => (
                    <Picker.Item key={index} label={`${index}`} value={index} />
                  ))}
                </Picker>
                <Picker
                  selectedValue={afternoonIn.minute}
                  style={{height: 50, width: 100}}
                  onValueChange={itemValue =>
                    setAfternoonIn({...afternoonIn, minute: itemValue})
                  }>
                  {[...Array(60)].map((_, index) => (
                    <Picker.Item key={index} label={`${index}`} value={index} />
                  ))}
                </Picker>
              </View>

              <Text>Out:</Text>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                <Picker
                  selectedValue={afternoonOut.hour}
                  style={{height: 50, width: 100}}
                  onValueChange={itemValue =>
                    setAfternoonOut({...afternoonOut, hour: itemValue})
                  }>
                  {[...Array(13)].map((_, index) => (
                    <Picker.Item key={index} label={`${index}`} value={index} />
                  ))}
                </Picker>
                <Picker
                  selectedValue={afternoonOut.minute}
                  style={{height: 50, width: 100}}
                  onValueChange={itemValue =>
                    setAfternoonOut({...afternoonOut, minute: itemValue})
                  }>
                  {[...Array(60)].map((_, index) => (
                    <Picker.Item key={index} label={`${index}`} value={index} />
                  ))}
                </Picker>
              </View>

              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                color="white"
              />
              <Pressable
                style={{
                  backgroundColor: '#51459d',
                  padding: 10,
                  borderRadius: 5,
                  alignItems: 'center',
                  marginBottom: '5',
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
                }}
                onPress={() => setModalVisible(false)}>
                <Text style={{color: '#51459d', fontSize: 16}}>Cancel</Text>
              </Pressable>
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
    </ScrollView>
  );
};

export default App;
