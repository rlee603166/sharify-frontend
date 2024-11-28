import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeNavigator from "./HomeNavigator";
import AuthNavigator from "./AuthNavigator";
import ProfileNavigator from "./ProfileNavigation";

const App = createNativeStackNavigator();

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <App.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <App.Screen name="Profile" component={ProfileNavigator} />
        {/* <App.Screen name="Home" component={HomeNavigator} /> */}
        {/* <App.Screen name="Auth" component={AuthNavigator} /> */}
      </App.Navigator>
    </NavigationContainer>
  );
}
