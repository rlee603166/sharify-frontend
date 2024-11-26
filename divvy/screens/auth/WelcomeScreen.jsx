import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../../theme';

const WelcomeScreen = ({ navigation }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <View style={styles.container}>
        <View style={styles.spacer} />
      
            <View style={styles.contentContainer}>
                <Text style={styles.welcomeText}>Welcome to</Text>
                <Text style={styles.brandText}>divvy.me</Text>
        
                <Text style={styles.descriptionText}>
                    Easily split bills, track expenses, and settle payments with your group. 
                    Simplify sharing and get back to what matters.
                </Text>
            </View>

        <View style={styles.flex} />

        <View style={styles.dotsContainer}>
            {[...Array(4)].map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        { backgroundColor: index === 0 ? theme.colors.primary : '#D1D1D6' }
                    ]}
                />
            ))}
        </View>

        <View style={styles.buttonContainer}>
            <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            >
            <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.signupButton}
                onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}
            >
            <Text style={styles.signupText}>Sign up</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    spacer: {
        height: 80,
    },
    contentContainer: {
        alignItems: 'center',
        gap: 16,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#000',
    },
    brandText: {
        fontSize: 34,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    descriptionText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    flex: {
        flex: 1,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 24,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    loginButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    signupButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});

export default WelcomeScreen;