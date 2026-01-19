import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import HomeScreen from './src/screens/HomeScreen';
import OtpScreen from './src/screens/OtpScreen';
import PermissionsScreen from './src/screens/PermissionsScreen';
import CameraScreen from './src/screens/CameraScreen';
import ExaminationScreen from './src/screens/ExaminationScreen';
import ProgramDetailsScreen from './src/screens/ProgramDetailsScreen';
import QuestionsScreen from './src/screens/QuestionsScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import ResultScreen from './src/screens/ResultScreen';

const Stack = createStackNavigator();

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  useEffect(() => {
    async function unlockOrientation() {
      await ScreenOrientation.unlockAsync();
    }
    unlockOrientation();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Otp" component={OtpScreen} />
          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="Camera" component={CameraScreen} />
          <Stack.Screen name="Examination" component={ExaminationScreen} />
          <Stack.Screen name="ProgramDetails" component={ProgramDetailsScreen} />
          <Stack.Screen name="Questions" component={QuestionsScreen} />
          <Stack.Screen name="Review" component={ReviewScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
