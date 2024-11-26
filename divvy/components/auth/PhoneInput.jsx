import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../../theme';

const PhoneInput = ({ onSubmit }) => {
    const [countryCode, setCountryCode] = useState('1');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const countryCodeRef = useRef(null);
    const phoneNumberRef = useRef(null);

    const formatPhoneNumber = (text) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 3) return `(${cleaned}`;
        if (cleaned.length <= 6) return `(${cleaned.slice(0,3)}) ${cleaned.slice(3)}`;
        return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6,10)}`;
    };
      
    const handlePhoneChange = (text) => {
        const cleaned = text.replace(/\D/g, '');
        
        if (cleaned.length <= 10) {
            setPhoneNumber(cleaned);
        }
    };

    const checkPhoneAndProceed = async () => {
        setIsChecking(true);
        setErrorMessage(null);
        
        try {
            const formattedPhone = `+${countryCode}${phoneNumber}`;
            await onSubmit(formattedPhone);
        } catch (error) {
            setErrorMessage(error.message || 'An error occurred');
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter your phone</Text>

            <TextInput
                ref={phoneNumberRef}
                style={styles.phoneInput}
                value={phoneNumber === '' ? '' : formatPhoneNumber(phoneNumber)}
                onChangeText={handlePhoneChange}
                keyboardType="numeric"
                placeholder="Mobile Number"
                placeholderTextColor="#999"
            />

            {errorMessage && (
                <Text style={styles.error}>{errorMessage}</Text>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        phoneNumber.length === 10 && !isChecking
                        ? styles.buttonEnabled
                        : styles.buttonDisabled
                    ]}
                    onPress={checkPhoneAndProceed}
                    disabled={phoneNumber.length !== 10 || isChecking}
                >
                <Text style={styles.buttonText}>
                    {isChecking ? 'Checking...' : 'Next'}
                </Text>
                </TouchableOpacity>
            </View>
        </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 24,
    },
    inputWrapper: {
        borderBottomWidth: 1,
        borderColor: '#E5E5E5',
        paddingBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    plus: {
        fontSize: 24,
        color: '#666',
        marginRight: 2,
    },
    countryCodeInput: {
        fontSize: 24,
        width: 40,
        color: '#000',
    },
    phoneInputContainer: {
        flex: 1,
    },
    placeholder: {
        position: 'absolute',
        fontSize: 24,
        color: '#999',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    phoneInput: {
        fontSize: 24,
        color: '#000',
    }, 
    transparentInput: {
        opacity: 0.25,
    },
    error: {
        color: 'red',
        fontSize: 14,
        marginTop: 8,
    },
    buttonContainer: {
        marginTop: 'auto',
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    button: {
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonEnabled: {
        backgroundColor: theme.colors.primary,
    },
    buttonDisabled: {
        backgroundColor: '#666',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyInput: {
        color: 'transparent',
    }
});

export default PhoneInput;