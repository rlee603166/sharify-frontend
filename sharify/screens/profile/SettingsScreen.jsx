import React from "react";
import {
    Alert,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StatusBar,
} from "react-native";
import { X, Camera, Trash2, LogOut } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { profileTheme } from "../../theme";
import { useUser } from "../../services/UserProvider";
import { Image } from "expo-image";

const SettingsScreen = ({ navigation }) => {
    const {
        username,
        phone,
        name,
        avatar,
        updateProfileImage,
        removeProfileImage,
        logout,
        deleteAccount,
    } = useUser();

    console.log("SettingsScreen rendered with username:", username);

    const getInitials = name => {
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase();
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Sorry, we need camera roll permissions to change your profile picture.",
                    [{ text: "OK" }]
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                updateProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to select image. Please try again.");
        }
    };

    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Log Out",
                style: "destructive",
                onPress: () => logout(),
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteAccount(),
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => navigation.goBack()}
                    >
                        <X width={24} height={24} color={profileTheme.colors.secondary} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Profile Image Section */}
                    <View style={styles.imageSection}>
                        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                            {avatar ? (
                                <Image source={{ uri: avatar }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Text style={styles.initialsText}>{getInitials(name)}</Text>
                                </View>
                            )}
                            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                        </TouchableOpacity>
                        {avatar && (
                            <TouchableOpacity
                                style={styles.removePhotoButton}
                                onPress={removeProfileImage}
                            >
                                <Trash2 size={16} color={profileTheme.colors.red} />
                                <Text style={styles.removePhotoText}>Remove Photo</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Account Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account</Text>
                        <View style={styles.sectionContent}>
                            <View style={styles.settingsItem}>
                                <Text style={styles.settingsItemLabel}>Name</Text>
                                <Text style={styles.settingsItemValue}>{name}</Text>
                            </View>
                            <View style={styles.settingsItem}>
                                <Text style={styles.settingsItemLabel}>Username</Text>
                                <Text style={styles.settingsItemValue}>
                                    {`@${username}` || "Not set"}
                                </Text>
                            </View>
                            <View style={styles.settingsItem}>
                                <Text style={styles.settingsItemLabel}>Phone</Text>
                                <Text style={styles.settingsItemValue}>
                                    {`(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}` ||
                                        "Not set"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Log Out and Delete Account Buttons */}
                    <View style={styles.actionsSection}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <LogOut size={20} color={profileTheme.colors.red} />
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.deleteAccountButton}
                            onPress={handleDeleteAccount}
                        >
                            <Trash2 size={20} color={profileTheme.colors.red} />
                            <Text style={styles.deleteAccountText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: profileTheme.colors.background,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        paddingHorizontal: profileTheme.spacing.lg,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: profileTheme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: profileTheme.colors.gray[50],
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: profileTheme.colors.text,
    },
    closeButton: {
        padding: profileTheme.spacing.sm,
    },
    content: {
        flex: 1,
        justifyContent: "space-between", // Distribute space evenly
    },
    imageSection: {
        alignItems: "center",
        marginTop: profileTheme.spacing.xl,
    },
    imageContainer: {
        alignItems: "center",
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: profileTheme.spacing.md,
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: profileTheme.colors.gray[100],
        alignItems: "center",
        justifyContent: "center",
        marginBottom: profileTheme.spacing.md,
    },
    initialsText: {
        fontSize: 48,
        fontWeight: "600",
        color: profileTheme.colors.secondary,
    },
    changePhotoText: {
        color: profileTheme.colors.primary,
        fontSize: 16,
        fontWeight: "500",
    },
    removePhotoButton: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: profileTheme.spacing.md,
        padding: profileTheme.spacing.sm,
    },
    removePhotoText: {
        color: profileTheme.colors.red,
        marginLeft: profileTheme.spacing.xs,
        fontSize: 14,
        fontWeight: "500",
    },
    section: {
        marginTop: profileTheme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: profileTheme.colors.secondary,
        marginBottom: profileTheme.spacing.sm,
    },
    sectionContent: {
        backgroundColor: profileTheme.colors.background,
    },
    settingsItem: {
        paddingVertical: profileTheme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: profileTheme.colors.gray[50],
    },
    settingsItemLabel: {
        fontSize: 14,
        color: profileTheme.colors.secondary,
        marginBottom: 4,
    },
    settingsItemValue: {
        fontSize: 16,
        color: profileTheme.colors.text,
        fontWeight: "500",
    },
    actionsSection: {
        marginBottom: profileTheme.spacing.xl,
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: profileTheme.spacing.lg,
    },
    logoutText: {
        color: profileTheme.colors.red,
        fontSize: 16,
        fontWeight: "500",
        marginLeft: profileTheme.spacing.sm,
    },
    deleteAccountButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: profileTheme.spacing.lg,
    },
    deleteAccountText: {
        color: profileTheme.colors.red,
        fontSize: 16,
        fontWeight: "500",
        marginLeft: profileTheme.spacing.sm,
    },
});

export default SettingsScreen;
