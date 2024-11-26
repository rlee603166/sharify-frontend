import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import WelcomeScreen from './screens/auth/WelcomeScreen';
import LoginScreen from './screens/auth/LoginScreen';

const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// Define a custom theme
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white',
    card: 'white',
    text: 'black',
    border: 'transparent',
    primary: 'black',
  },
};

function AuthNavigator() {
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

function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white'},
      }}
    >
    </MainStack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
          <RootStack.Screen 
            name="Auth"
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="Main"
            component={MainNavigator}
            options={{ headerShown: false }}
          />

      </RootStack.Navigator>
    </NavigationContainer>
  );
}