import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { User, UserPlus, Check, X } from "lucide-react-native";
import { profileTheme } from "../../theme";
import { useFriends } from "../../hooks/useFriends";
import ProfileIcon from "./../main/ProfileIcon";

const FriendRequests = () => {
    const { requests, accept, reject } = useFriends();

    const onAccept = ( request ) => {
        accept(request);
    };

    const onReject = ( request ) => {
        reject(request);
    };

    return (
        <View style={styles.wrapper}>
            <Text style={styles.headerTitle}>Friend Requests ({requests?.length || 0})</Text>
            <View style={styles.container}>
                {requests?.length > 0 ? (
                    <View style={styles.contentContainer}>
                        <View style={styles.requestsList}>
                            {requests.map(request => (
                                <View key={request.friend_id} style={styles.requestItem}>
                                    <View style={styles.userInfo}>
                                        <View style={styles.avatar}>
                                            <ProfileIcon name={request.name} avatar={request.avatar} />
                                        </View>
                                        <View>
                                            <Text style={styles.name}>{request.name}</Text>
                                            <Text style={styles.mutualFriends}>
                                                {request.mutualFriends
                                                    ? `${request.mutualFriends} mutual friends`
                                                    : `@${request.username}`}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => onAccept?.(request)}
                                        >
                                            <Check
                                                width={24}
                                                height={24}
                                                color={profileTheme.colors.green}
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => onReject?.(request)}
                                        >
                                            <X
                                                width={24}
                                                height={24}
                                                color={profileTheme.colors.red}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <UserPlus width={32} height={32} color={profileTheme.colors.gray300} />
                        <View style={styles.emptyTextContainer}>
                            <Text style={styles.emptyTitle}>No friend requests</Text>
                            <Text style={styles.emptySubtext}>
                                When someone adds you, they'll appear here
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        gap: profileTheme.spacing.md,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: profileTheme.colors.gray700,
    },
    container: {
        backgroundColor: profileTheme.colors.background,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    contentContainer: {
        padding: profileTheme.spacing.md,
        // Optionally, set a max height if you want a scrollable list:
        // maxHeight: 400,
    },
    requestsList: {
        gap: profileTheme.spacing.md,
    },
    requestItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: profileTheme.spacing.sm,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: profileTheme.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    name: {
        fontWeight: "500",
        color: profileTheme.colors.text,
    },
    mutualFriends: {
        fontSize: 14,
        color: profileTheme.colors.secondary,
    },
    actions: {
        flexDirection: "row",
        gap: profileTheme.spacing.sm,
    },
    actionButton: {
        padding: profileTheme.spacing.sm,
    },
    emptyStateContainer: {
        padding: profileTheme.spacing.xl,
        flexDirection: "row",
        alignItems: "center",
        gap: profileTheme.spacing.md,
    },
    emptyTextContainer: {
        flex: 1,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: profileTheme.colors.gray700,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: profileTheme.colors.gray500,
    },
});

export default FriendRequests;
