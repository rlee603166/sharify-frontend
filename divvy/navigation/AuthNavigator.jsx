import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';

const AuthStack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
      <AuthStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'white' },
        }}
      >
        <AuthStack.Screen 
          name="Welcome" 
          component={WelcomeScreen} 
        />
        <AuthStack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </AuthStack.Navigator>
    );
  }