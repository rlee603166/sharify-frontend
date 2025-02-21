import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/upload/HomeScreen";
import ReceiptView from "../screens/upload/ReceiptView";
import TestScreen from "../screens/upload/TestScreen";

const HomeStack = createNativeStackNavigator();

export default function HomeNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <HomeStack.Screen 
          name="HomeScreen"
          component={HomeScreen}
        />      
      {/* <HomeStack.Screen 
          name="Receipt"
          component={ReceiptView}
        /> */}

      {/* <HomeStack.Screen name="Test" component={TestScreen} /> */}
    </HomeStack.Navigator>
  );
}
