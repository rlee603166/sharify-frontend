import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../../theme';

const UsernameInput = ({ onSubmit }) => {
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    const handleUsernameChange = useCallback((text) => {
        setUsername(text);
        setErrorMessage(null);
    }, []);
    
    const checkUserAndProceed = useCallback(async () => {
        if (!username.trim()) return;
        
        setIsChecking(true);
        setErrorMessage(null);
        
        try {
            await onSubmit(username);
        } catch (error) {
            setErrorMessage(error.message || 'An error occurred');
        } finally {
            setIsChecking(false);
        }
    }, [username, onSubmit]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter your Venmo Username:</Text>

            <TextInput
                style={styles.phoneInput}
                value={username}
                onChangeText={handleUsernameChange}
                keyboardType="default"
                placeholder="Venmo Username"
                placeholderTextColor="#999"
                maxLength={50}
                autoCapitalize="none"
                autoCorrect={false}

            />

            {errorMessage && (
                <Text style={styles.error}>{errorMessage}</Text>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        isChecking ? styles.buttonDisabled : styles.buttonEnabled
                    ]}
                    onPress={checkUserAndProceed}
                    disabled={isChecking || username.length === 0}
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
        paddingHorizontal: 10,
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


export default React.memo(UsernameInput);