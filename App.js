import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import OtpScreen from './src/screens/OtpScreen';
import PermissionsScreen from './src/screens/PermissionsScreen';
import ProgramDetailsScreen from './src/screens/ProgramDetailsScreen';
import ExaminationScreen from './src/screens/ExaminationScreen';
import QuestionsScreen from './src/screens/QuestionsScreen';
import ResultScreen from './src/screens/ResultScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import CameraScreen from './src/screens/CameraScreen';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Otp"
                    component={OtpScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Permissions"
                    component={PermissionsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ProgramDetails"
                    component={ProgramDetailsScreen}
                    options={{ title: 'Program Details' }}
                />
                <Stack.Screen
                    name="Examination"
                    component={ExaminationScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Questions"
                    component={QuestionsScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Result"
                    component={ResultScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Review"
                    component={ReviewScreen}
                    options={{ title: 'Review Answers' }}
                />
                <Stack.Screen
                    name="Camera"
                    component={CameraScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
