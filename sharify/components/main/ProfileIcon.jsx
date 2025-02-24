import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useUser } from "./../../services/UserProvider";
import { Image } from "expo-image";
import theme from "../../theme";
import { friendTheme, profileTheme } from "../../theme";

const ProfileIcon = ({
    name,
    avatar,
    size = 50,
    backgroundColor = "#F0F0F0",
    textColor = "#666666",
    fontSize = 20,
}) => {

    const getInitials = name => {
        return name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <>
            {avatar ? (
                <Image
                    style={styles.avatar}
                    source={{ uri: avatar }}
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={[
                        styles.container,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.text,
                            {
                                color: textColor,
                                fontSize,
                            },
                        ]}
                    >
                        {name ? getInitials(name) : "?"}
                    </Text>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontWeight: 600,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        // marginRight: 12,
    },
});

export default ProfileIcon;
