import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SUBMIT_THRESHOLD = -300;
const VELOCITY_THRESHOLD = -1000;

const SwipeReview = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
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
          // Submit animation
          Animated.spring(translateY, {
            toValue: -SCREEN_HEIGHT,
            useNativeDriver: true,
            stiffness: 300,
            damping: 40,
          }).start(() => {
            setShowConfirmation(true);
            setTimeout(() => {
              setShowConfirmation(false);
              Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                stiffness: 300,
                damping: 40,
              }).start();
            }, 2000);
          });
        } else {
          // Reset position
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
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1976d2" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                transform: [{ translateY }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            {/* Review Content */}
            <View style={styles.content}>
              <Text style={styles.title}>Review Your Order</Text>
              
              <View style={styles.orderItem}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                <Text style={styles.itemText}>Item 1 - $10.00</Text>
                <Text style={styles.itemText}>Item 2 - $15.00</Text>
              </View>
              
              <View style={styles.orderItem}>
                <Text style={styles.sectionTitle}>Total</Text>
                <Text style={styles.itemText}>$25.00</Text>
              </View>

              {/* Swipe Indicator */}
              <View style={styles.swipeIndicator}>
                <Animated.View
                  style={[
                    styles.chevronContainer,
                    {
                      opacity: isDragging ? 0 : 1,
                    },
                  ]}
                >
                  <Feather name="chevron-up" size={24} color="#9CA3AF" />
                </Animated.View>
                <Text style={styles.swipeText}>Swipe up to submit</Text>
              </View>
            </View>
          </Animated.View>

          {/* Confirmation Overlay */}
          {showConfirmation && (
            <View style={styles.confirmationContainer}>
              <View style={styles.confirmationBox}>
                <Text style={styles.confirmationText}>
                  Order submitted successfully!
                </Text>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1976d2',
  },
  container: {
    flex: 1,
    backgroundColor: '#1976d2',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  swipeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 24,
  },
  chevronContainer: {
    marginBottom: 8,
  },
  swipeText: {
    fontSize: 14,
    color: '#6B7280',
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

export default SwipeReview;