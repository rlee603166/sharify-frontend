import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Settings } from "lucide-react-native";
import { profileTheme } from "../../theme";
import { useUser } from "../../services/UserProvider";
import { Image } from "expo-image";

const ProfileHeader = ({ navigation }) => {
    const { name, username, avatar } = useUser();

    const getInitials = name => {
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase();
    };

    return (
        <View style={styles.container}>
            <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarInitials}>
                            <Text style={styles.avatarText}>{getInitials(name)}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.username}>{`@${username}`}</Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate("Settings")}
            >
                <Settings width={32} height={32} color={profileTheme.colors.secondary} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: profileTheme.spacing.md,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: profileTheme.spacing.lg,
    },
    avatarContainer: {
        width: 80,
        height: 80,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    avatarInitials: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#F0F0F0",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 32,
        fontWeight: "600",
        color: "#666666",
    },
    nameContainer: {
        justifyContent: "center",
    },
    name: {
        fontSize: 24,
        fontWeight: "600",
        color: profileTheme.colors.text,
    },
    username: {
        fontSize: 18,
        color: profileTheme.colors.secondary,
    },
    settingsButton: {
        marginTop: profileTheme.spacing.sm,
        padding: profileTheme.spacing.sm,
    },
});

export default ProfileHeader;
