import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Platform 
} from "react-native";
import PhoneInput from "../../components/auth/PhoneInput";

const LoginScreen = ({ navigation }) => {
    const [step, setStep] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState('');

    const Header = () => (
        <SafeAreaView style={styles.header}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );

    const handlePhoneSubmit = async (phone) => {
        setStep(1);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <PhoneInput
                        onSubmit={handlePhoneSubmit}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <View style={styles.container}>
                <Header />
                <View style={styles.content}>
                    {renderStep()}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        backgroundColor: 'white',
    },
    closeButton: {
        padding: 16,
        alignSelf: 'flex-end',
    },
    closeButtonText: {
        fontSize: 24,
        color: '#666',
        lineHeight: 24,
    },
});

export default LoginScreen;