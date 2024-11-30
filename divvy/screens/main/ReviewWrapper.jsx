import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from 'react-native';
import ReviewScreen from '../../components/receipt/ReviewScreen';

const SUBMIT_THRESHOLD = -300;
const VELOCITY_THRESHOLD = -1000;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const ReviewWrapper = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [showingConfirmation, setShowingConfirmation] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        const touchY = evt.nativeEvent.pageY;
        const windowHeight = Dimensions.get('window').height;
        const summaryHeight = 220;
        return touchY > windowHeight - summaryHeight && gestureState.dy < 0;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        
        if (
          gestureState.dy < SUBMIT_THRESHOLD ||
          gestureState.vy < VELOCITY_THRESHOLD
        ) {
          Animated.spring(translateY, {
            toValue: -SCREEN_HEIGHT,
            useNativeDriver: true,
            stiffness: 300,
            damping: 40,
          }).start(() => {
            setShowingConfirmation(true);
            setTimeout(() => {
              setShowingConfirmation(false);
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                stiffness: 300,
                damping: 40,
              }).start();
            }, 2000);
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            stiffness: 300,
            damping: 40,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <ReviewScreen />
      </Animated.View>

      <Text style={[
        styles.swipeText,
        { opacity: isDragging ? 1 : 0 }
      ]}>
        Swipe up to Submit
      </Text>

      {showingConfirmation && (
        <View style={styles.confirmationContainer}>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmationText}>
              Requests have been sent!
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1976d2',
  },
  contentContainer: {
    flex: 1,
    marginBottom: 60, // Add margin to show swipe text
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  swipeText: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    color: 'white',
    fontSize: 14,
  },
  confirmationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 200,
  },
  confirmationBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    padding: 16,
    borderRadius: 10,
  },
  confirmationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReviewWrapper;