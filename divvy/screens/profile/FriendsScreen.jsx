// src/screens/Friends/FriendsScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    TouchableWithoutFeedback,
} from "react-native";
import { X, UserPlus } from "lucide-react-native";
import { friendTheme } from "../../theme";
import SearchBar from "../../components/friends/SearchBar";
import { AddFriendModal } from "../../components/friends/AddFriendModal";
import { FriendListItem } from "../../components/friends/FriendListItem";
import { useFriends } from "../../hooks/useFriends";

const initialFriends = [
    { id: 1, name: "Sarah Miller", username: "@sarahm", status: "active" },
    { id: 2, name: "Mike Chen", username: "@mikechen", status: "active" },
    { id: 3, name: "Jordan Lee", username: "@jlee", status: "active" },
    { id: 4, name: "Emma Wilson", username: "@emmaw", status: "active" },
    { id: 5, name: "Alex Zhang", username: "@azhang", status: "active" },
    { id: 6, name: "Alex Chi", username: "@achi", status: "active" },
];

export default function FriendsScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newFriendName, setNewFriendName] = useState("");
    const [newFriendUsername, setNewFriendUsername] = useState("");

    const { friends, addFriend, deleteFriend } = useFriends(initialFriends);

    const filteredFriends = friends.filter(
        friend =>
            friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddFriend = () => {
        if (addFriend(newFriendName, newFriendUsername)) {
            setNewFriendName("");
            setNewFriendUsername("");
            setIsModalVisible(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setNewFriendName("");
        setNewFriendUsername("");
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Friends</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <X width={24} height={24} color={friendTheme.colors.gray600} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search friends..."
                    />

                    <TouchableOpacity
                        style={styles.addFriendButton}
                        activeOpacity={0.7}
                        onPress={() => setIsModalVisible(true)}
                    >
                        <UserPlus width={20} height={20} color={friendTheme.colors.primary} />
                        <Text style={styles.addFriendText}>Add New Friend</Text>
                    </TouchableOpacity>

                    <Text style={styles.listHeader}>All Friends • {friends.length}</Text>

                    <View style={styles.friendsList}>
                        {filteredFriends.map(friend => (
                            <FriendListItem
                                key={friend.id}
                                friend={friend}
                                onPress={friend => console.log("Friend pressed:", friend)}
                                onDelete={deleteFriend}
                            />
                        ))}
                    </View>
                </ScrollView>

                <AddFriendModal
                    visible={isModalVisible}
                    onClose={handleCloseModal}
                    onAdd={handleAddFriend}
                    newFriendName={newFriendName}
                    setNewFriendName={setNewFriendName}
                    newFriendUsername={newFriendUsername}
                    setNewFriendUsername={setNewFriendUsername}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: friendTheme.colors.white,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: friendTheme.spacing[4],
        paddingVertical: friendTheme.spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: friendTheme.colors.gray50,
        backgroundColor: friendTheme.colors.white,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: friendTheme.colors.gray900,
    },
    closeButton: {
        padding: friendTheme.spacing[2],
        borderRadius: 9999,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: friendTheme.spacing[4],
    },
    addFriendButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: friendTheme.colors.indigo50,
        padding: friendTheme.spacing[4],
        borderRadius: 16,
        marginBottom: friendTheme.spacing[4],
    },
    addFriendText: {
        marginLeft: friendTheme.spacing[2],
        fontSize: 16,
        fontWeight: "500",
        color: friendTheme.colors.primary,
    },
    listHeader: {
        fontSize: 14,
        fontWeight: "500",
        color: friendTheme.colors.gray500,
        marginBottom: friendTheme.spacing[4],
    },
    friendsList: {
        gap: friendTheme.spacing[2],
    },
});
