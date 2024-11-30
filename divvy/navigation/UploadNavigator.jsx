import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TestScreen from "../screens/main/TestScreen";

const UploadStack = createNativeStackNavigator();

export default function UploadNavigator() {
  return (
    <UploadStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
      }}
    >
      {/* <UploadStack.Screen 
          name="Home"
          component={HomeScreen}
        />       */}
      {/* <UploadStack.Screen 
          name="Receipt"
          component={ReceiptView}
        /> */}

      <UploadStack.Screen name="Test" component={TestScreen} />
    </UploadStack.Navigator>
  );
}
