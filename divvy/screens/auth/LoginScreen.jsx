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
import UsernameInput from "../../components/auth/UsernameInput";
import SMSVerificationView from "../../components/auth/SMSVerificationView";
import { useUser } from "../../UserProvider";

const LoginScreen = ({ navigation }) => {
    const { requestVerificationCode, login } = useUser();
    const [step, setStep] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [user, setUser] = useState({
        username: '',
        phone: '',
    })

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

    const handleUsernameSubmit = async (username) => {
        try {
            const data = await requestVerificationCode(username);
            
            if (!data || data.status === "failed") {
                console.error("Failed to verify username:", data);
                return;
            }
    
            await new Promise(resolve => {
                setUser(prev => {
                    resolve();
                    return {
                        ...prev,
                        username,
                        phone: data.phone_number
                    };
                });
            });
    
            setStep(1);
        } catch (error) {
            console.error("Error in handleUsernameSubmit:", error);
        }
    };
    const handleSMS = async (code) => {
        console.log(user)
        const success = await login(
            user.username,
            user.phone,
            code
        )

        if (success) return
    }

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <UsernameInput
                        onSubmit={handleUsernameSubmit}
                    />
                );
            case 1:
                return (
                    <SMSVerificationView
                        phone={user.phone}
                        onNext={handleSMS}
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