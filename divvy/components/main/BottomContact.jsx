import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Alert,
    ActivityIndicator,
    Image,
    StyleSheet,
} from "react-native";
import * as Contacts from "expo-contacts";

const mockFriends = [
    {
        id: "f1",
        name: "James Wilson",
        phone: "jamo",
        imageUri: null,
        selected: false,
    },
    {
        id: "f2",
        name: "Linda Chen",
        phone: "linChinChin",
        imageUri: null,
        selected: false,
    },
    {
        id: "f3",
        name: "Robert Taylor",
        phone: "robT",
        imageUri: null,
        selected: false,
    },
];

const BottomContactList = ({ setStep, onSelectPeople, type, handleBack, ifModal, groupData }) => {
    // Initialize states with groupData if in modal mode
    const [contacts, setContacts] = useState(ifModal && groupData ? groupData.contacts : []);
    const [friends, setFriends] = useState(ifModal && groupData ? groupData.friends : mockFriends);
    const [groups, setGroups] = useState(
        ifModal && groupData
            ? groupData.groups
            : [
                  {
                      id: "1",
                      name: "Family",
                      members: [
                          { id: "0", name: "James Lee", phone: "jamo", imageUri: null },
                          { id: "1", name: "Ryan Lee", phone: "jamo", imageUri: null },
                          { id: "2", name: "Kodi", phone: "jamo", imageUri: null },
                      ],
                      selected: false,
                  },
                  {
                      id: "2",
                      name: "Work",
                      members: [
                          { id: "3", name: "Dylan Pell", phone: "jamo", imageUri: null },
                          { id: "4", name: "Andrew Yang", phone: "jamo", imageUri: null },
                          { id: "5", name: "Justin Oliak", phone: "jamo", imageUri: null },
                      ],
                      selected: false,
                  },
                  {
                      id: "3",
                      name: "Friends",
                      members: [
                          {
                              id: "6",
                              name: "Christian Huang",
                              phone: "jamo",
                              imageUri: null,
                          },
                          { id: "7", name: "Kaleb Hsieh", phone: "jamo", imageUri: null },
                          {
                              id: "8",
                              name: "Evan Lockwood",
                              phone: "123123123",
                              imageUri: null,
                          },
                      ],
                      selected: false,
                  },
              ]
    );

    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("friends");
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    const fetchFriends = async () => {
        try {
            return mockFriends;
        } catch (error) {
            Alert.alert("Error", "Failed to load friends");
            return [];
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            await loadContacts();
            const friendsData = await fetchFriends();
            setFriends(friendsData);
            setLoading(false);
        };

        if (!ifModal) {
            initializeData();
        } else {
            // Use the provided groupData in modal mode
            setContacts(groupData.contacts || []);
            setFriends(groupData.friends || mockFriends);
            setGroups(groupData.groups || []);
            setFilteredData(groupData.contacts || []);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const currentData =
            selectedTab === "contacts" ? contacts : selectedTab === "friends" ? friends : groups;

        if (searchQuery.trim() === "") {
            setFilteredData(currentData);
        } else {
            const lowercaseQuery = searchQuery.toLowerCase();
            const filtered = currentData.filter(item =>
                selectedTab === "groups"
                    ? item.name.toLowerCase().includes(lowercaseQuery) ||
                      item.members.some(member =>
                          member.name.toLowerCase().includes(lowercaseQuery)
                      )
                    : item.name.toLowerCase().includes(lowercaseQuery) ||
                      (item.phone && item.phone.toLowerCase().includes(lowercaseQuery))
            );
            setFilteredData(filtered);
        }
    }, [selectedTab, contacts, friends, groups, searchQuery]);

    const loadContacts = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                const { data } = await Contacts.getContactsAsync({
                    fields: [
                        Contacts.Fields.Name,
                        Contacts.Fields.PhoneNumbers,
                        Contacts.Fields.Image,
                        Contacts.Fields.ImageAvailable,
                    ],
                });

                if (data.length > 0) {
                    const formattedContacts = data
                        .filter(contact => contact.name)
                        .map(contact => ({
                            id: contact.id,
                            name: contact.name,
                            phone: contact.phoneNumbers?.[0]?.number,
                            imageUri: contact.imageAvailable
                                ? `file://${contact.image?.uri}`
                                : null,
                            selected: false,
                        }))
                        .sort((a, b) => a.name.localeCompare(b.name));

                    setContacts(formattedContacts);
                    setFilteredData(formattedContacts);
                }
            }
        } catch (error) {
            console.error("Contact loading error:", error);
            Alert.alert("Error", "Failed to load contacts");
        }
    };

    const getAllSelectedItems = () => {
        const selectedContacts = contacts.filter(item => item.selected);
        const selectedFriends = friends.filter(item => item.selected);
        const selectedGroups = groups.filter(item => item.selected);
        return [...selectedContacts, ...selectedFriends, ...selectedGroups];
    };

    const hasSelectedItems = () => {
        return getAllSelectedItems().length > 0;
    };

    const toggleSelection = id => {
        const updateList = (list, setList) => {
            const updatedList = list.map(item =>
                item.id === id ? { ...item, selected: !item.selected } : item
            );
            setList(updatedList);
            return updatedList;
        };

        let updatedData;
        switch (selectedTab) {
            case "contacts":
                updatedData = updateList(contacts, setContacts);
                break;
            case "friends":
                updatedData = updateList(friends, setFriends);
                break;
            case "groups":
                updatedData = updateList(groups, setGroups);
                break;
        }

        // Update filtered data to reflect selection changes
        if (searchQuery.trim() === "") {
            setFilteredData(updatedData);
        }
    };

    const onNext = () => {
        const selectedData = {
            contacts,
            friends,
            groups,
        };

        onSelectPeople(selectedData);

        if (!ifModal) {
            setStep(3);
        }
    };

    const CheckIcon = () => <Text style={styles.checkmark}>✓</Text>;

    const ContactImage = ({ imageUri, name }) => (
        <View style={styles.avatarContainer}>
            {imageUri ? (
                <Image
                    source={{ uri: imageUri }}
                    style={styles.avatarImage}
                    onError={error => console.log("Image error:", error, "URI:", imageUri)}
                />
            ) : (
                <View style={styles.avatarFallback}>
                    <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
            )}
        </View>
    );

    const SelectedHeader = () => {
        const allSelectedItems = getAllSelectedItems();

        return (
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={["rgb(255, 255, 255)", "rgba(255, 255, 255, 0)"]}
                    start={[0, 0]}
                    end={[0.7, 0]}
                    style={styles.leftGradient}
                    pointerEvents="none"
                />

                <ScrollView
                    horizontal
                    style={styles.selectedHeader}
                    contentContainerStyle={styles.selectedHeaderContent}
                    showsHorizontalScrollIndicator={false}
                >
                    {allSelectedItems.map(item => (
                        <ContactImage key={item.id} imageUri={item.imageUri} name={item.name} />
                    ))}
                </ScrollView>

                <LinearGradient
                    colors={["rgba(255, 255, 255, 0)", "rgb(255, 255, 255)"]}
                    start={[0.3, 0]}
                    end={[1, 0]}
                    style={styles.rightGradient}
                    pointerEvents="none"
                />
            </View>
        );
    };

    const ContactItem = ({ item }) => (
        <TouchableOpacity style={styles.contactItem} onPress={() => toggleSelection(item.id)}>
            {item.imageUri ? (
                <Image
                    source={{ uri: item.imageUri }}
                    style={styles.avatar}
                    onError={error => console.log("Contact image error:", error)}
                />
            ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
            )}
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactPhone}>
                    {selectedTab === "groups"
                        ? `${item.members?.length || 0} members`
                        : item.phone || ""}
                </Text>
            </View>
            <View style={[styles.checkbox, item.selected && styles.checkboxSelected]}>
                {item.selected && <CheckIcon />}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6466F1" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {type === "Next" ? "Select People" : "Edit People"}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
                    <Text style={styles.closeButtonText}> </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder={`Search ${selectedTab}...`}
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                </View>
            </View>

            {hasSelectedItems() && <SelectedHeader />}

            <View style={styles.tabSection}>
                <View style={styles.tabButtons}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === "friends" && styles.tabButtonActive,
                        ]}
                        onPress={() => setSelectedTab("friends")}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                selectedTab === "friends" && styles.activeButtonText,
                            ]}
                        >
                            Friends
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === "groups" && styles.tabButtonActive,
                        ]}
                        onPress={() => setSelectedTab("groups")}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                selectedTab === "groups" && styles.activeButtonText,
                            ]}
                        >
                            Groups
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === "contacts" && styles.tabButtonActive,
                        ]}
                        onPress={() => setSelectedTab("contacts")}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                selectedTab === "contacts" && styles.activeButtonText,
                            ]}
                        >
                            Contacts
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={filteredData}
                renderItem={({ item }) => <ContactItem item={item} />}
                keyExtractor={item => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
            />

            <View style={styles.floatingButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.floatingButton,
                        !hasSelectedItems() && styles.floatingButtonDisabled,
                    ]}
                    onPress={onNext}
                    disabled={!hasSelectedItems()}
                >
                    <Text style={styles.floatingButtonText}>{type}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 20,
        fontWeight: "300",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "400",
        flex: 1,
        textAlign: "center",
    },
    searchSection: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginVertical: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
        padding: 0,
        height: 24,
    },
    tabSection: {
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    tabButtons: {
        flexDirection: "row",
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        minWidth: 100,
        alignItems: "center",
        borderColor: "#6466F1",
        borderWidth: 1,
    },
    tabButtonActive: {
        backgroundColor: "#6466F1",
    },
    tabButtonText: {
        color: "#6466F1",
        fontSize: 15,
        fontWeight: "400",
    },
    activeButtonText: {
        color: "white",
        fontSize: 15,
        fontWeight: "400",
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 100,
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatarFallback: {
        width: 40,
        height: 40,
        borderRadius: 20, // Make it circular
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#666666",
        fontSize: 16,
        fontWeight: "500",
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 16,
        color: "#000",
        marginBottom: 2,
        fontWeight: "400",
    },
    contactPhone: {
        fontSize: 14,
        color: "#666",
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1.5,
        borderColor: "#D1D1D6",
        borderRadius: 4,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    checkboxSelected: {
        backgroundColor: "#6466F1",
        borderColor: "#6466F1",
    },
    checkmark: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: -2,
    },
    headerContainer: {
        position: "relative",
        height: 55,
        marginTop: 8,
        backgroundColor: "#fff",
    },
    selectedHeader: {
        height: "100%",
    },
    selectedHeaderContent: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 16,
    },
    leftGradient: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 32,
        zIndex: 1,
    },
    rightGradient: {
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 32,
        zIndex: 1,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        marginHorizontal: 4,
    },
    avatarImage: {
        width: 40,
        height: 40,
        borderRadius: 20, // Make it circular
    },
    floatingButtonContainer: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: 20,
    },
    floatingButton: {
        backgroundColor: "#6466F1",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        minWidth: 120,
        alignItems: "center",
    },
    floatingButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    floatingButtonDisabled: {
        backgroundColor: "#A5A6F6",
    },
});

export default ContactList;
