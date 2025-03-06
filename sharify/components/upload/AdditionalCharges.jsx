import React, { useState, useEffect, useCallback } from "react";
import {
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Platform,
    Image,
    Pressable,
} from "react-native";
import theme from "../../theme";

const AdditionalCharges = ({ navigation, route }) => {
    const { onSubmit, additionalCharges, photoUri, subtotal, extractedTax } = route.params || {};

    const [tax, setTax] = useState((extractedTax && extractedTax.toString()) || "");
    const [tip, setTip] = useState("");
    const [misc, setMisc] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    const [bottomOffset, setBottomOffset] = useState(40);

    useEffect(() => {
        console.log(extractedTax);
    }, []);

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const onKeyboardShow = e => {
            setBottomOffset(e.endCoordinates.height + 10);
        };
        const onKeyboardHide = () => {
            setBottomOffset(40);
        };

        const keyboardShowListener = Keyboard.addListener(showEvent, onKeyboardShow);
        const keyboardHideListener = Keyboard.addListener(hideEvent, onKeyboardHide);

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    const handleSubmit = () => {
        const data = {
            tax: Number(tax || 0),
            tip: Number(tip || 0),
            misc: Number(misc || 0),
        };

        if (isNaN(data.tax) || isNaN(data.tip) || isNaN(data.misc)) {
            setErrorMessage("Please enter valid numbers");
            return;
        }
        if (data.tax < 0 || data.tip < 0 || data.misc < 0) {
            setErrorMessage("Values cannot be negative");
            return;
        }
        onSubmit(data);
        navigation.goBack();
    };

    const handleTaxChange = useCallback(text => {
        setTax(text);
        setErrorMessage(null);
    }, []);

    const handleTipChange = useCallback(text => {
        setTip(text);
        setErrorMessage(null);
    }, []);

    const handleMiscChange = useCallback(text => {
        setMisc(text);
        setErrorMessage(null);
    }, []);

    const handleTipPercentage = useCallback(
        percentage => {
            const tipAmount = (subtotal * percentage) / 100;
            setTip(tipAmount.toFixed(2));
        },
        [subtotal]
    );

    const [showPhoto, setShowPhoto] = useState(false);
    const handlePhotoPress = () => {
        setShowPhoto(true);
    };
    const handlePhotoRelease = () => {
        setShowPhoto(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.title}>Add any extra charges:</Text>
                    <View style={styles.inputContainer}>
                        {/* Tax Input */}
                        <View style={styles.contentContainer}>
                            <Text style={styles.title2}>Tax:</Text>
                            <View style={styles.inputWrapper}>
                                <View style={styles.inputWithPrefix}>
                                    {tax !== "" && <Text style={styles.currencySymbol}>$</Text>}
                                    <TextInput
                                        style={[
                                            styles.phoneInput,
                                            Platform.OS === "ios" && styles.iosInput,
                                        ]}
                                        value={tax}
                                        onChangeText={handleTaxChange}
                                        keyboardType="numeric"
                                        placeholder="Tax"
                                        placeholderTextColor="#999"
                                        maxLength={50}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        clearButtonMode="while-editing"
                                        blurOnSubmit={true}
                                        underlineColorAndroid="transparent"
                                        onSubmitEditing={Keyboard.dismiss}
                                    />
                                </View>
                            </View>
                            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                        </View>

                        {/* Tip Input */}
                        <View style={styles.contentContainer}>
                            <Text style={styles.title2}>Tip:</Text>
                            <View style={styles.inputWrapper}>
                                <View style={styles.inputWithPrefix}>
                                    {tip !== "" && <Text style={styles.currencySymbol}>$</Text>}
                                    <TextInput
                                        style={[
                                            styles.phoneInput,
                                            Platform.OS === "ios" && styles.iosInput,
                                        ]}
                                        value={tip}
                                        onChangeText={handleTipChange}
                                        keyboardType="numeric"
                                        placeholder="Tip, Gratuity"
                                        placeholderTextColor="#999"
                                        maxLength={50}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        clearButtonMode="while-editing"
                                        blurOnSubmit={true}
                                        underlineColorAndroid="transparent"
                                        onSubmitEditing={Keyboard.dismiss}
                                    />
                                </View>
                            </View>
                            {/* Tip Percentage Buttons */}
                            <View style={styles.tipPercentageContainer}>
                                <TouchableOpacity
                                    style={styles.tipPercentageButton}
                                    onPress={() => handleTipPercentage(10)}
                                >
                                    <Text style={styles.tipPercentageText}>10%</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.tipPercentageButton}
                                    onPress={() => handleTipPercentage(15)}
                                >
                                    <Text style={styles.tipPercentageText}>15%</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.tipPercentageButton}
                                    onPress={() => handleTipPercentage(20)}
                                >
                                    <Text style={styles.tipPercentageText}>20%</Text>
                                </TouchableOpacity>
                            </View>
                            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                        </View>

                        {/* Misc Input */}
                        <View style={styles.contentContainer}>
                            <Text style={styles.title2}>Misc:</Text>
                            <View style={styles.inputWrapper}>
                                <View style={styles.inputWithPrefix}>
                                    {misc !== "" && <Text style={styles.currencySymbol}>$</Text>}
                                    <TextInput
                                        style={[
                                            styles.phoneInput,
                                            Platform.OS === "ios" && styles.iosInput,
                                        ]}
                                        value={misc}
                                        onChangeText={handleMiscChange}
                                        keyboardType="numeric"
                                        placeholder="ex: Credit Card, Delivery Fees, etc."
                                        placeholderTextColor="#999"
                                        maxLength={50}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        clearButtonMode="while-editing"
                                        blurOnSubmit={true}
                                        underlineColorAndroid="transparent"
                                        onSubmitEditing={Keyboard.dismiss}
                                    />
                                </View>
                            </View>
                            {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            {/* The Done button is absolutely positioned using the state variable */}
            <View style={[styles.doneButtonContainer, { bottom: bottomOffset }]}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonEnabled]}
                    onPress={handleSubmit}
                >
                    <Text style={styles.buttonText}>Done</Text>
                </TouchableOpacity>
            </View>

            {photoUri && (
                <Pressable
                    onPressIn={handlePhotoPress}
                    onPressOut={handlePhotoRelease}
                    style={({ pressed }) => [
                        styles.floatingPhotoButton,
                        { transform: [{ scale: pressed ? 0.98 : 1 }] },
                    ]}
                >
                    <Text style={styles.photoButtonText}>View Receipt</Text>
                </Pressable>
            )}

            {showPhoto && (
                <View style={styles.photoOverlay}>
                    <Image
                        source={{ uri: photoUri }}
                        style={styles.photoPreview}
                        resizeMode="contain"
                    />
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "white",
    },
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    closeButton: {
        paddingTop: 12,
        paddingHorizontal: 4,
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: "300",
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        marginTop: 24,
        marginHorizontal: 24,
    },
    inputContainer: {
        flex: 1,
        paddingVertical: 20,
    },
    contentContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    title2: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 8,
    },
    inputWrapper: {
        paddingBottom: 8,
    },
    inputWithPrefix: {
        flexDirection: "row",
        alignItems: "center",
    },
    currencySymbol: {
        fontSize: 20,
        color: "#000",
        marginRight: 4,
    },
    phoneInput: {
        fontSize: 20,
        color: "#000",
        height: Platform.OS === "ios" ? 48 : 56,
        paddingVertical: Platform.OS === "ios" ? 12 : 8,
        flex: 1,
    },
    iosInput: {
        paddingTop: 12,
        paddingBottom: 12,
    },
    error: {
        color: "red",
        fontSize: 14,
        marginTop: 8,
    },
    doneButtonContainer: {
        position: "absolute",
        left: 24,
        right: 24,
        alignItems: "center",
    },
    button: {
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    buttonEnabled: {
        backgroundColor: theme.colors.primary,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    floatingPhotoButton: {
        position: "absolute",
        right: 16,
        top: 18,
        height: 36,
        paddingHorizontal: 12,
        borderRadius: 18,
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 999,
    },
    photoButtonText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: "500",
    },
    photoOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    photoPreview: {
        width: "90%",
        height: "70%",
        borderRadius: 12,
    },
    tipPercentageContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    tipPercentageButton: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 8,
        backgroundColor: "#EEF2FF",
        borderRadius: 16,
        alignItems: "center",
    },
    tipPercentageText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: "600",
    },
});

export default AdditionalCharges;
