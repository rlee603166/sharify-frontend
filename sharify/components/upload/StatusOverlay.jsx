import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  StatusBar,
} from "react-native";
import { Feather } from "lucide-react-native"; // or any icon library
import theme from "../../theme";

const StatusOverlay = ({ submissionStatus }) => {
  // Rotation animation value
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200, // ~1.2 seconds per rotation
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  // Convert the 0..1 animated value to 0..360 deg
  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // If there's no status, we don't render the overlay
  if (!submissionStatus) {
    return null;
  }

  return (
    <View style={styles.overlayContainer}>
      <Animated.View
        style={[
          styles.spinner,
          { transform: [{ rotate: rotateInterpolate }] },
        ]}
      >

      </Animated.View>

      {/* The main message */}
      <Text style={styles.statusText}>{submissionStatus}</Text>

      {/* Your simpler disclaimer (optional) */}
      <Text style={styles.disclaimer}>
        Always confirm final costs and payment details directly with all parties involved. 
        Sharify does not verify the accuracy of receipt data or guarantee payment.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1500,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 60,
    paddingHorizontal: 16,
  },
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderTopColor: "white",
    borderRightColor: "white",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  statusText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  disclaimer: {
    position: "absolute",
    bottom: 60,
    fontSize: 12,
    lineHeight: 18,
    color: "white",
    textAlign: "center",
    paddingHorizontal: 16,
  },
});

export default StatusOverlay;