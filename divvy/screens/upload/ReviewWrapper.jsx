import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    Animated,
    PanResponder,
    Dimensions,
    StyleSheet,
    Platform,
    StatusBar,
    TouchableOpacity,
} from "react-native";
import ReviewScreen from "../../components/receipt/ReviewScreen";
import theme from "../../theme";

const SUBMIT_THRESHOLD = -300;
const VELOCITY_THRESHOLD = -1000;
const SCREEN_HEIGHT = Dimensions.get("window").height;

const MOCK_DATA = {
    John: {
        name: "John",
        subtotal: 45.5,
        items: [
            { name: "Burger", price: 15.0, users: 1 },
            { name: "Fries", price: 8.5, users: 2 },
            { name: "Soda", price: 4.0, users: 1 },
            { name: "Salad", price: 18.0, users: 1 },
        ],
    },
    Sarah: {
        name: "Sarah",
        subtotal: 32.25,
        items: [
            { name: "Pasta", price: 22.0, users: 1 },
            { name: "Fries", price: 8.5, users: 2 },
            { name: "Iced Tea", price: 3.75, users: 1 },
        ],
    },
    Mike: {
        name: "Mike",
        subtotal: 28.5,
        items: [
            { name: "Pizza", price: 20.0, users: 1 },
            { name: "Wings", price: 8.5, users: 1 },
        ],
    },
};

const ReviewWrapper = ({ setStep, processed }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [showingConfirmation, setShowingConfirmation] = useState(false);
    const [processedData, setProcessedData] = useState(null);
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        console.log(processed);
        setProcessedData(processed);
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
                const touchY = evt.nativeEvent.pageY;
                const windowHeight = Dimensions.get("window").height;
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

                if (gestureState.dy < SUBMIT_THRESHOLD || gestureState.vy < VELOCITY_THRESHOLD) {
                    // Submit animation
                    Animated.spring(translateY, {
                        toValue: -SCREEN_HEIGHT,
                        useNativeDriver: true,
                        stiffness: 300,
                        damping: 40,
                    }).start(() => {
                        setShowingConfirmation(true);
                        setTimeout(() => {
                            setShowingConfirmation(false);
                            setStep(0); // Navigate back to step 0
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
        <View style={styles.rootContainer}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.primary} />
            <View style={StyleSheet.absoluteFill}>
                <View style={styles.background} />
            </View>
            <View style={styles.innerContainer}>
                <Animated.View
                    style={[styles.contentContainer, { transform: [{ translateY }] }]}
                    {...panResponder.panHandlers}
                >
                   <ReviewScreen isDragging={isDragging} processed={processedData} setStep={setStep} />
                </Animated.View>

                {showingConfirmation && (
                    <View style={styles.confirmationContainer}>
                        <View style={styles.confirmationBox}>
                            <Text style={styles.confirmationText}>Requests have been sent!</Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    background: {
        flex: 1,
        backgroundColor: theme.colors.primary,
    },
    innerContainer: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    contentContainer: {
        flex: 1,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: "hidden",
        backgroundColor: "white",
    },
    confirmationContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 200,
    },
    confirmationBox: {
        backgroundColor: "rgba(34, 197, 94, 0.9)",
        padding: 16,
        borderRadius: 10,
    },
    confirmationText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default ReviewWrapper;
