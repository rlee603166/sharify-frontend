import { useState } from "react";
import { StyleSheet, View } from "react-native";
import UsernameInput from "../../components/auth/UsernameInput";
import Venmo from "../../components/auth/Venmo";
import SMSVerificationView from "../../components/auth/SMSVerificationView";
import PhoneInputView from "../../components/auth/PhoneInput";
import { Header } from "./LoginScreen";
import theme from "../../theme/index.js";

const SignUpScreen = ({ navigation }) => {
    const [newUser, setNewUser] = useState({});
    const [step, setStep] = useState(0);
    const prompt = "Enter your Venmo username:";

    const handlePhone = async phone => {
        console.log(phone);
        setNewUser(prev => ({
            ...prev,
            phone,
        }));
        setStep(1);
    };

    const handleSMS = async code => {
        setStep(2);
    };

    const handleVenmo = async username => {
        setNewUser(prev => ({
            ...prev,
            username
        }));
        setStep(3);
    };

    const handleBack = () => {
        if (!step) {
            navigation.pop();
        }
        setStep(step - 1);
    };

    const handleLogin = ( user ) => {

    }

    const render = () => {
        switch (step) {
            case 0:
                return ( 
                    <PhoneInputView onNext={handlePhone} /> 
                );
            case 1:
                return ( 
                    <SMSVerificationView 
                        phone={newUser.phone} 
                        onNext={handleSMS} 
                    /> 
                );
            case 2:
                return ( 
                    <UsernameInput 
                        onSubmit={handleVenmo} 
                        prompt={prompt} 
                    /> 
                );

            case 3:
                return ( 
                    <Venmo 
                        username={newUser.username} 
                        onConfirm={handleLogin}
                        onDeny={handleBack}
                    /> 
                );
            default:
                return;
        }
    };

    return (
        <View style={styles.root}>
            <Header handleBack={handleBack} step={step} />
            {render()}
        </View>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        backgroundColor: "white",
    },
    headerContainer: {
        backgroundColor: "white",
    },
    headerButton: {
        paddingHorizontal: 20,
        paddingTop: 20,
        alignSelf: "flex-start",
    },
    headerButtonText: {
        fontSize: 24,
        color: theme.colors.primary,
        lineHeight: 22,
    },
    closeButton: {
        fontSize: 24,
        color: "#666",
        lineHeight: 24,
    },
    closeButtonText: {
        fontSize: 18,
        color: theme.colors.primary,
        lineHeight: 24,
    },
    slideContainer: {
        flex: 1,
        overflow: "hidden",
    },
});

export default SignUpScreen;
