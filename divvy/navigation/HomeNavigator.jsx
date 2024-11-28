
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/main/HomeScreen';
import ReceiptView from '../screens/main/ReceiptView';
import TestScreen from '../screens/main/TestScreen';

const HomeStack = createNativeStackNavigator();

export default function HomeNavigator() {
    return (
      <HomeStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'white'},
        }}
      >
        {/* <HomeStack.Screen 
          name="Home"
          component={HomeScreen}
        />       */}
        {/* <HomeStack.Screen 
          name="Receipt"
          component={ReceiptView}
        /> */}
  
        <HomeStack.Screen
          name="Test"
          component={TestScreen}
        />
      </HomeStack.Navigator>
    )
  }