import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    StatusBar,
    Platform,
    TouchableOpacity,
    Text,
    View,
    RefreshControl,
} from "react-native";
import { profileTheme } from "../../theme";
import ProfileHeader from "../../components/profile/ProfileHeader";
import FriendRequests from "../../components/profile/FriendRequests";
import FriendsSummary from "../../components/profile/FriendsSummary";
import GroupsList from "../../components/profile/GroupsList";
import Ionicons from "@expo/vector-icons/Ionicons";
import theme from "../../theme/index";
import { useFriends } from "../../hooks/useFriends";
import { useGroups } from "../../context/GroupsContext";
import { useUser } from "../../services/UserProvider";

const ProfileScreen = ({ navigation }) => {
    const { requests, loadFriends } = useFriends();
    const { loadGroups } = useGroups();
    const { id, load } = useUser();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        load();
        loadFriends(id);
        loadGroups(id);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([load(), loadFriends(id), loadGroups(id)]);
        } catch (error) {
            console.error("Failed to update friends list:", error);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color={theme.colors.primary} />
                    <Text style={styles.headerTitle}>Back</Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing} // Control the refreshing state
                        onRefresh={onRefresh} // Callback when user pulls to refresh
                        colors={[theme.colors.primary]} // Customize the spinner color
                    />
                }
            >
                <ProfileHeader navigation={navigation} />
                {requests?.length > 0 && <FriendRequests navigation={navigation} />}
                <FriendsSummary navigation={navigation} />
                <GroupsList navigation={navigation} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: profileTheme.colors.gray[50],
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        paddingHorizontal: 16,
        height: 30,
        justifyContent: "center",
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 0,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: theme.colors.primary,
        marginLeft: 0,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: profileTheme.spacing.md,
        gap: profileTheme.spacing.xl,
    },
});

export default ProfileScreen;