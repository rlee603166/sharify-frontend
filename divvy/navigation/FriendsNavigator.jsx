// src/navigation/FriendsNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FriendsScreen from '../screens/profile/FriendsScreen';

const Stack = createStackNavigator();

// export function FriendsNavigator() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="FriendsList" component={FriendsScreen} />
//       {/* Add other friend-related screens here */}
//     </Stack.Navigator>
//   );
// }
