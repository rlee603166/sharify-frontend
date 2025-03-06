import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { Image } from "expo-image";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    // const apiURL = "http://localhost:8000/api/v1";
    const apiURL = "http://47.144.148.193:8000/api/v1";

    const [state, setState] = useState({});

    // Debug useEffect to track state changes
    useEffect(() => {
        console.log("Auth State Changed:", {
            username: state.username,
            isAuthenticated: state.isAuthenticated,
            isLoading: state.isLoading,
        });
    }, [state.username, state.isAuthenticated, state.isLoading]);

    useEffect(() => {
        checkAuthState();
    }, []);

    const preLoadUser = async url => {
        try {
            if (url && typeof url === "string" && url.startsWith("http")) {
                await Image.prefetch(url);
                console.log("successfully fetched user pfp");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateProfileImage = async imageUri => {
        setState(prev => ({
            ...prev,
            avatar: imageUri,
        }));

        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();

            const formData = new FormData();
            const fileExtension = imageUri.split(".").pop() || "jpg";

            formData.append("image", {
                uri: imageUri,
                type: "image/*",
                name: `receipt.${fileExtension}`,
            });

            const uploadResponse = await fetch(`${apiURL}/users/pfp/${state.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                body: formData,
            });

            const data = await uploadResponse.json();
            const path = data.filepath;
            let isLocalImage;
            if (path) {
                isLocalImage = !path.startsWith("http");
            }
            const avatar = isLocalImage ? `${apiURL}/images/pfp/${path}` : path;
            preLoadUser(avatar);
            setState(prev => ({
                ...prev,
                avatar: avatar,
            }));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const removeProfileImage = async () => {
        Alert.alert(
            "Remove Profile Picture",
            "Are you sure you want to remove your profile picture?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const url = `${apiURL}/users/pfp/${state.id}`;
                            const response = await fetch(url, {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ imageUri: null }), // Assuming you want to set imageUri to null
                            });

                            const data = await response.json();

                            if (response.ok) {
                                // Update state only if the API call is successful
                                setState(prev => ({
                                    ...prev,
                                    avatar: null,
                                }));
                            } else {
                                // Handle API error
                                console.error("Failed to remove profile picture:", data);
                            }
                        } catch (error) {
                            console.error("Error removing profile picture:", error);
                        }
                    },
                },
            ]
        );
    };

    const loadStoredUsername = async () => {
        try {
            const username = await SecureStore.getItemAsync("username");
            console.log("Loaded stored username:", username);
            return username;
        } catch (error) {
            console.error("Failed to load stored username:", error);
            return null;
        }
    };

    const saveUsername = async username => {
        try {
            await SecureStore.setItemAsync("username", username);
            console.log("Saved username to storage:", username);
        } catch (error) {
            console.error("Failed to save username:", error);
        }
    };

    const checkAuthState = async () => {
        try {
            const accessToken = await SecureStore.getItemAsync("access_token");
            const refreshToken = await SecureStore.getItemAsync("refresh_token");
            console.log(`refresh: ${JSON.stringify(refreshToken, null, 2)}`);
            const username = await loadStoredUsername();

            console.log("Stored credentials:", {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                storedUsername: username,
            });

            if (!accessToken || !refreshToken) {
                console.log("No tokens found, setting initial state");
                setState(prev => ({
                    ...prev,
                    username: prev.username || username,
                    isLoading: false,
                }));
                return;
            }

            const isValidAccessToken = await validateAccessToken(accessToken);
            console.log("Access token validation:", isValidAccessToken);

            if (isValidAccessToken) {
                await loadUserData(accessToken);
                return;
            }

            console.log("fetching refresh tokens");
            const newTokens = await refreshAccessToken(refreshToken);
            console.log(`newTokens: ${JSON.stringify(newTokens, null, 2)}`);

            if (newTokens) {
                await loadUserData(newTokens.access_token);
            } else {
                console.log("Token refresh failed, logging out");
                await logout();
            }
        } catch (error) {
            console.error("Auth state check failed:", error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: "Authentication check failed",
            }));
        }
    };

    const loadUserData = async token => {
        try {
            console.log("Loading user data with token...");
            const response = await fetch(`${apiURL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const userData = await response.json();
            if (response.ok && userData) {
                console.log("User data loaded:", userData);
                let isLocalImage;
                if (userData?.imageUri) {
                    isLocalImage = !userData?.imageUri.startsWith("http");
                }
                const avatar = isLocalImage
                    ? `${apiURL}/images/pfp/${userData?.imageUri}`
                    : userData?.imageUri;

                setState(prev => ({
                    ...prev,
                    id: userData?.user_id,
                    username: userData?.username,
                    name: userData?.name,
                    phone: userData?.phone,
                    accessToken: token,
                    avatar: avatar,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                }));

                if (avatar) preLoadUser(avatar);
            }
        } catch (error) {
            console.error("Loading user data failed:", error);
        }
    };

    const validateAccessToken = async token => {
        try {
            const response = await fetch(`${apiURL}/auth/validate-access`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.status === "success") return true;

            return false;
        } catch (error) {
            return false;
        }
    };

    const refreshAccessToken = async refreshToken => {
        try {
            const username = await SecureStore.getItemAsync("username");
            const response = await fetch(`${apiURL}/auth/refresh?username=${username}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            console.log(JSON.stringify(data, null, 2));

            await SecureStore.setItemAsync("access_token", data.access_token);
            await SecureStore.setItemAsync("refresh_token", data.refresh_token);

            return data;
        } catch (error) {
            console.error("Token refresh failed:", error);
            return false;
        }
    };

    const register = async (name, username, phone, imageUri) => {
        try {
            const response = await fetch(`${apiURL}/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    username: username,
                    phone: phone,
                    imageUri: imageUri,
                }),
            });
            const data = await response.json();

            const userInfo = data.user;

            await SecureStore.setItemAsync("access_token", data.access_token);
            await SecureStore.setItemAsync("refresh_token", data.refresh_token);
            await saveUsername(userInfo.username);

            setState(prev => ({
                id: userInfo.user_id,
                name: userInfo.name,
                username: userInfo.username,
                phone: userInfo.phone,
                avatar: userInfo.imageUri,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            }));
        } catch {}
    };

    const login = async (username, phone, code) => {
        try {
            const response = await fetch(`${apiURL}/auth/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    username,
                    phone,
                    code,
                }),
            });

            const data = await response.json();

            console.log(`token: ${JSON.stringify(data, null, 2)}`);

            await SecureStore.setItemAsync("access_token", data.access_token);
            await SecureStore.setItemAsync("refresh_token", data.refresh_token);
            await saveUsername(username);

            setState(prev => ({
                ...prev,
                accessToken: data.access_token,
                username,
                phone,
                error: null,
            }));

            return true;
        } catch (error) {
            console.error("Login failed:", error);
            setState(prev => ({
                ...prev,
                error: "Login failed",
            }));
            return false;
        } finally {
            await checkAuthState();
        }
    };

    const requestVerificationCode = async phoneNumber => {
        try {
            const response = await fetch(`${apiURL}/auth/request-code`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    phone: phoneNumber,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to send verification code");
            }

            const data = response.json();
            return data;
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: "Failed to send verification code",
            }));
            return false;
        }
    };

    const logout = async () => {
        try {
            console.log("Logging out...");
            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("refresh_token");
            await SecureStore.deleteItemAsync("username");
            setState({
                accessToken: null,
                username: null,
                phone: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
                name: "Alex Johnson",
                avatar: null,
            });
            console.log("Logout complete");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const deleteAccount = async () => {
        try {
            const url = `${apiURL}/users/me`;
            const accessToken = await SecureStore.getItemAsync("access_token");
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken.trim()}`,
                },
            });

            const data = await response.json();
            console.log(JSON.stringify(data, null, 2));
            logout();
        } catch (error) {
            console.error("Deleting failed: ", error);
        }
    };

    const load = async () => {
        try {
            const accessToken = await SecureStore.getItemAsync("access_token");
            await loadUserData(accessToken);
        } catch (error) {}
    };

    const value = {
        ...state,
        load,
        login,
        logout,
        register,
        deleteAccount,
        requestVerificationCode,
        refreshAccessToken,
        validateAccessToken,
        updateProfileImage,
        removeProfileImage,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
