import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';

const GettingStartedScreen = ({navigation}) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.image} />
      <Text style={styles.title}>Welcome to WLog!</Text>
      <Text style={styles.subtitle}>
        Stop counting hours WLog does it for you
      </Text>

      {/* Feature Cards with Emoji Icons */}
      <View style={styles.featureCard}>
        <View style={styles.textContainer}>
          <Text style={styles.featureTitle}>How to Log Hours</Text>
          <Text style={styles.featureText}>
            1. Select a date from the calendar{'\n'}
            2. Enter your time-in and time-out{'\n'}
            3. Save your daily logs automatically
          </Text>
        </View>
      </View>

      <View style={styles.featureCard}>
        <View style={styles.textContainer}>
          <Text style={styles.featureTitle}>Data Privacy</Text>
          <Text style={styles.featureText}>
            • 100% offline - no internet needed{'\n'}• Data never leaves your
            device{'\n'}• No cloud sync or accounts required
          </Text>
        </View>
      </View>

      {/* App Distribution Note */}
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          This is an independent app not available on app stores. Please obtain
          updates only from the original developer.
        </Text>
      </View>

      {/* Get Started Button */}
      <Pressable
        style={({pressed}) => [styles.button, {opacity: pressed ? 0.8 : 1}]}
        onPress={() => navigation.replace('Home')} // Navigate to Home
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
    backgroundColor: '#fff',
  },
  image: {
    width: 70,
    height: 70,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#51459d',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: -5,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f8fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#51459d',
    alignItems: 'center',
  },
  emojiIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#51459d',
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#51459d',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GettingStartedScreen;
