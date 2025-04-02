import React, {useEffect} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import SplashScreen from 'react-native-splash-screen';

const Splash = ({navigation}) => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
      navigation.replace('Home');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});

export default Splash;
