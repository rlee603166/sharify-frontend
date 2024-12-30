import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as Contacts from "expo-contacts";
import theme from "../../theme";

const SearchIcon = () => <Text style={styles.searchIcon}>🔍</Text>;
 
const ContactList = ({ setStep, onSelectPeople, type }) => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([
    { id: "1", name: "Family", members: ["John", "Kate", "Mike"] },
    { id: "2", name: "Work", members: ["Anna", "David", "Sarah"] },
    { id: "3", name: "Friends", members: ["Tom", "Alex", "Emma"] },
  ]);
  const [loading, setLoading] = useState(true);
  const [amount] = useState("8");
  const [selectedTab, setSelectedTab] = useState("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    const currentData = selectedTab === "contacts" ? contacts : groups;
    if (searchQuery.trim() === "") {
      setFilteredData(currentData);
    } else {
      // Apply current search query to new tab data
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = currentData.filter((item) =>
        selectedTab === "contacts"
          ? item.name?.toLowerCase().includes(lowercaseQuery) ||
            (item.phone && item.phone.includes(lowercaseQuery))
          : item.name?.toLowerCase().includes(lowercaseQuery) ||
            item.members.some((member) =>
              member.toLowerCase().includes(lowercaseQuery)
            )
      );
      setFilteredData(filtered);
    }
  }, [selectedTab, contacts, groups]);

  const loadContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Image, // Add this to get contact photos
            Contacts.Fields.ImageAvailable,
          ],
        });

        if (data.length > 0) {
          const formattedContacts = data
            .filter((contact) => contact.name)
            .map((contact) => ({
              id: contact.id,
              name: contact.name,
              phone: contact.phoneNumbers?.[0]?.number,
              imageUri: contact.image?.uri, // Store the image URI
              selected: false,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          setContacts(formattedContacts);
          setFilteredData(formattedContacts);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentData = selectedTab === "contacts" ? contacts : groups;
    setFilteredData(currentData);
    setSearchQuery("");
  }, [selectedTab]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      // If search is empty, show all data
      setFilteredData(selectedTab === "contacts" ? contacts : groups);
    } else {
      const searchTerm = searchQuery.toLowerCase().trim();

      if (selectedTab === "contacts") {
        // Filter contacts based on name or phone number
        const filtered = contacts.filter(
          (contact) =>
            contact.name?.toLowerCase().includes(searchTerm) ||
            contact.phone?.toLowerCase().includes(searchTerm)
        );
        setFilteredData(filtered);
      } else {
        // Filter groups based on name or members
        const filtered = groups.filter(
          (group) =>
            group.name.toLowerCase().includes(searchTerm) ||
            group.members.some((member) =>
              member.toLowerCase().includes(searchTerm)
            )
        );
        setFilteredData(filtered);
      }
    }
  }, [searchQuery, contacts, groups, selectedTab]);

  const toggleSelection = (id) => {
    if (selectedTab === "contacts") {
      setContacts(
        contacts.map((contact) =>
          contact.id === id
            ? { ...contact, selected: !contact.selected }
            : contact
        )
      );
    } else {
      setGroups(
        groups.map((group) =>
          group.id === id ? { ...group, selected: !group.selected } : group
        )
      );
    }
  };

  const onNext = () => {
    const selectedPeople = selectedTab === "contacts"
      ? contacts.filter(contact => contact.selected)
      : groups.filter(group => group.selected);

    onSelectPeople({
      type: selectedTab,
      selectedItem: selectedPeople
    });

    setStep(3);
  }

  const CheckIcon = () => <Text style={styles.checkmark}>✓</Text>;

  const ContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => toggleSelection(item.id)}
    >
      <View style={styles.avatar}>
        {selectedTab === "contacts" && item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.avatarImage}
            onError={() => {
              // This will handle any image loading errors
              console.log("Image failed to load for:", item.name);
            }}
          />
        ) : (
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>
          {selectedTab === "contacts"
            ? item.phone || ""
            : `${item.members?.length || 0} members`}
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
        <ActivityIndicator size="large" color="#00C244" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.amount}>{type === "Next" ? "Select People" : "Edit People"}</Text>
        <TouchableOpacity style={styles.payButton} onPress={onNext}>
          <Text style={styles.payButtonText}>{type}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <SearchIcon />
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

      <View style={styles.tabSection}>
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "contacts" && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab("contacts")}
          >
            <Text style={styles.tabButtonText}>Contacts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "groups" && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab("groups")}
          >
            <Text style={styles.tabButtonText}>Groups</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredData}
        renderItem={ContactItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: "300",
  },
  amount: {
    fontSize: 24,
    fontWeight: "400",
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: "#666",
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
    marginBottom: 12,
  },
  tabButtons: {
    flexDirection: "row",
    gap: 8,
  },
  tabButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "400",
  },
  tabButton: {
    backgroundColor: "grey",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    minWidth: 100,
    alignItems: "center",
  },
  tabButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },

  list: {
    flex: 1,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.smth,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
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
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: -2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default ContactList;
