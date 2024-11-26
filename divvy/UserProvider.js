import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Children, createContext, useEffect, useState } from "react"

const UserContext = createContext(null);

export const UserProvider = ({ Children }) => {
    
    const apiURL = "http://127.0.0.1:8000/api/v1/"

    const [state, setState] = useState({
        accessToken: null,
        username: null,
        phone: null,
        isAuthenticated: false,
        isLoading: true
    });

    useEffect({

    }, []);

    const checkAuthState = async ()  => {
        const accessToken = await SecureStore.getItemAsync('access_token');
        const refreshToken = await SecureStore.getItemAsync('register_token');

        if (!accessToken || !refreshToken) {
            setState(prev => ({ ...prev, isLoading: false }));
            return;
        }

        const isValidAcessToken = await validateAccessToken(accessToken);

        if (isValidAcessToken) {
            // Load user data / go to home page
            return;
        }

        const isValidRefreshToken = await refreshAccessToken(refreshToken);

        if (isValidRefreshToken) {
            // Get new access token / go to home page
            return;
        }
    }

    const validateAccessToken = async (token) => {
        try {
            const response = await fetch(`${apiURL}/validate-access`, {
                headers: { Authorization: `Bearer: ${token}` }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const refreshAccessToken = async (token) => {
        try {
            const response = await fetch(`${apiURL}/validate-refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            if (!response.ok) {
                return false;
            }

            const data = response.json();

            await SecureStore.setItemAsync('access_token', data.access_token);
            await SecureStore.setItemAsync('refresh_token', data.refresh_token);

            // Load User data
            
            return true;
        } catch (erorr) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

}
