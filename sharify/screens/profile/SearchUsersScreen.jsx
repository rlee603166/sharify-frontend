import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { X, UserPlus } from "lucide-react-native";
import { friendTheme } from "../../theme";
import SearchBar from "../../components/friends/SearchBar";
import ProfileIcon from "../../components/main/ProfileIcon";
import { useFriends } from "../../hooks/useFriends";
import { useUser } from "../../services/UserProvider";
import UserService from "../../services/UserService";
import debounce from "lodash/debounce";
import { Image } from "expo-image";

function SearchUsersScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    // Track friend request status per user id; "requested" means a request was sent.
    const [requestStatus, setRequestStatus] = useState({});

    const state = useUser();
    const { friends, addFriend } = useFriends();
    const userService = new UserService();

    console.log(userService.apiURL);

    useEffect(() => {
        debounceQuery(searchQuery);
    }, [searchQuery]);

    const debounceQuery = useCallback(
        debounce(query => {
            if (query.trim().length >= 2) {
                handleSearch(query);
            } else {
                setSearchResults([]);
            }
        }, 300),
        []
    );

    const handleSearch = async query => {
        try {
            setIsSearching(true);
            const data = await userService.search(query);
            setSearchResults((data || []).filter(user => user.id !== state.id));
        } catch (e) {
            console.error("Search error:", e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddFriend = async user => {
        // Prevent sending another request if already requested or added.
        if (friends.some(friend => friend.id === user.id) || requestStatus[user.id] === "requested") {
            return;
        }
        // Set the local state to "requested" immediately.
        setRequestStatus(prev => ({ ...prev, [user.id]: "requested" }));
        const success = await addFriend(user);
        // If the friend request fails, revert back to the Request button.
        if (!success) {
            setRequestStatus(prev => ({ ...prev, [user.id]: undefined }));
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Find People</Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => navigation.goBack()}
                    >
                        <X width={24} height={24} color={friendTheme.colors.gray600} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by name or username..."
                        autoFocus={true}
                    />

                    {isSearching ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={friendTheme.colors.primary} />
                        </View>
                    ) : searchQuery ? (
                        searchResults.length === 0 ? (
                            <View style={styles.noResultsContainer}>
                                <Text style={styles.noResultsText}>No users found</Text>
                            </View>
                        ) : (
                            <ScrollView
                                style={styles.searchResults}
                                showsVerticalScrollIndicator={false}
                            >
                                {searchResults.map(user => {
                                    const isFriend = friends.some(friend => friend.id === user.id);
                                    const isRequested = requestStatus[user.id] === "requested";

                                    return (
                                        <View key={user.id} style={styles.userItem}>
                                            <View style={styles.leftContainer}>
                                                {user.avatar ? (
                                                    <Image
                                                        source={{ uri: user.avatar }}
                                                        style={styles.avatar}
                                                    />
                                                ) : (
                                                    <View style={styles.avatar}>
                                                        <ProfileIcon name={user.name} size={45} />
                                                    </View>
                                                )}
                                                <View style={styles.userInfo}>
                                                    <Text style={styles.userName}>{user.name}</Text>
                                                    <Text style={styles.userUsername}>{`@${user.username}`}</Text>
                                                </View>
                                            </View>
                                            {isFriend ? (
                                                <View style={styles.addedButton}>
                                                    <Text style={styles.addedText}>Added</Text>
                                                </View>
                                            ) : isRequested ? (
                                                <View style={styles.addedButton}>
                                                    <Text style={styles.addedText}>Requested</Text>
                                                </View>
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.addButton}
                                                    onPress={() => handleAddFriend(user)}
                                                >
                                                    <UserPlus
                                                        width={20}
                                                        height={20}
                                                        color={friendTheme.colors.primary}
                                                    />
                                                    <Text style={styles.addButtonText}>Request</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        )
                    ) : null}
                </View>
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
    content: {
        flex: 1,
        padding: friendTheme.spacing[4],
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: friendTheme.spacing[4],
        paddingVertical: friendTheme.spacing[3],
        borderBottomWidth: 1,
        borderBottomColor: friendTheme.colors.gray50,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "600",
        color: friendTheme.colors.gray900,
    },
    closeButton: {
        padding: friendTheme.spacing[2],
    },
    searchResults: {
        flex: 1,
        marginTop: friendTheme.spacing[4],
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    noResultsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: friendTheme.spacing[8],
    },
    noResultsText: {
        fontSize: 16,
        color: friendTheme.colors.gray500,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: friendTheme.spacing[4],
        paddingHorizontal: friendTheme.spacing[2],
        marginBottom: friendTheme.spacing[2],
    },
    leftContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: friendTheme.spacing[3],
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: "500",
        color: friendTheme.colors.gray900,
    },
    userUsername: {
        fontSize: 14,
        color: friendTheme.colors.gray500,
        marginTop: 2,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: friendTheme.colors.indigo50,
        paddingHorizontal: friendTheme.spacing[4],
        paddingVertical: friendTheme.spacing[2],
        borderRadius: 16,
    },
    addButtonText: {
        marginLeft: friendTheme.spacing[2],
        fontSize: 14,
        fontWeight: "500",
        color: friendTheme.colors.primary,
    },
    addedButton: {
        backgroundColor: friendTheme.colors.gray100,
        paddingHorizontal: friendTheme.spacing[4],
        paddingVertical: friendTheme.spacing[2],
        borderRadius: 16,
    },
    addedText: {
        fontSize: 14,
        fontWeight: "500",
        color: friendTheme.colors.gray500,
    },
});

export default SearchUsersScreen;
