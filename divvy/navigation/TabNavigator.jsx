import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeNavigator from "./HomeNavigator";
import ProfileNavigator from "./ProfileNavigation";
import UploadNavigator from "./UploadNavigator";
import theme from "../theme/index.js";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="HomeNavigator"
            screenOptions={({ route }) => ({
                tabBarShowLabel: true,
                tabBarActiveTintColor: theme.colors.primary, 
                tabBarStyle: {
                    height: 90,
                    paddingBottom: 30,
                    paddingTop: 10,
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="HomeNavigator"
                component={HomeNavigator}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={24}
                            color={theme.colors.primary}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="UploadNavigator"
                component={UploadNavigator}
                options={{
                    tabBarLabel: "Upload",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "add-circle" : "add-circle-outline"}
                            size={24}
                            color={theme.colors.primary}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="ProfileNavigator"
                component={ProfileNavigator}
                options={{
                    tabBarLabel: "Profile",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={24}
                            color={theme.colors.primary}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
