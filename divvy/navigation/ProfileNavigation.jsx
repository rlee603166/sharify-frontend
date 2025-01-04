import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import FriendsScreen from "../screens/profile/FriendsScreen";

const ProfileStack = createNativeStackNavigator();

export default function ProfileNavigator() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen name="Profile" component={ProfileScreen} />
            <ProfileStack.Screen
                name="Friends"
                component={FriendsScreen}
                options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerShown: false,
                }}
            />
        </ProfileStack.Navigator>
    );
}
