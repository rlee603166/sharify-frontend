import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UploadScreen from "../screens/upload/UploadScreen";
import SnapTab from "./SnapTab";
import TabNavigator from "./TabNavigator";
import UploadNavigator from "./UploadNavigator";
import ContactList from "../components/main/ContactList";
import AuthNavigator from "./AuthNavigator";
import { useUser } from "../UserProvider";

const App = createNativeStackNavigator();

export default function AppNavigation() {
    const { isAuthenticated } = useUser();

    return (
        <NavigationContainer>
            <App.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <App.Screen name="Main" component={TabNavigator} />
                ) : (
                    <App.Screen name="Auth" component={AuthNavigator} />
                )}
            </App.Navigator>
        </NavigationContainer>
    );
}
