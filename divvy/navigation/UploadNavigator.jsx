import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TestScreen from "../screens/upload/TestScreen";
import CameraScreen from "../components/upload/CameraView";
import ImagePreview from "../components/upload/ImagePreview";
import PhotoReviewScreen from "../screens/upload/PhotoReviewScreen";

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
        
      <UploadStack.Screen name="Camera" component={CameraScreen} />
      <UploadStack.Screen name="PhotoReview" component={PhotoReviewScreen} />
      {/* <UploadStack.Screen name="ImagePreview" component={ImagePreview} /> */}
      {/* <UploadStack.Screen name="Test" component={TestScreen} /> */}
    </UploadStack.Navigator>
  );
}
