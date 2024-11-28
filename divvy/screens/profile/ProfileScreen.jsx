import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { profileTheme } from "../../theme";

import ProfileHeader from "../../components/profile/ProfileHeader";
import BalanceSummary from "../../components/profile/BalanceSummary";
import FriendRequests from "../../components/profile/FriendRequests";
import FriendsSummary from "../../components/profile/FriendsSummary";
import GroupsList from "../../components/profile/GroupsList";


const ProfileScreen = () => {
  const [balance] = useState({
    toReceive: 125.5,
    toPay: 45.75,
  });

  const [showFriendsList, setShowFriendsList] = useState(false);

  const [friendRequests] = useState([
    { id: 1, name: "David Kim", username: "@dkim", mutualFriends: 3 },
    { id: 2, name: "Lisa Chen", username: "@lisac", mutualFriends: 5 },
  ]);

  const [friends] = useState([
    { id: 1, name: "Sarah Miller", username: "@sarahm", status: "active" },
    { id: 2, name: "Mike Chen", username: "@mikechen", status: "active" },
    { id: 3, name: "Jordan Lee", username: "@jlee", status: "active" },
    { id: 4, name: "Emma Wilson", username: "@emmaw", status: "active" },
    { id: 5, name: "Alex Zhang", username: "@azhang", status: "active" },
  ]);

  const [groups] = useState([
    { id: 1, name: "Weekend Squad", members: 5, lastActive: "2024-03-20" },
    { id: 2, name: "Roommates", members: 3, lastActive: "2024-03-19" },
    { id: 3, name: "Family", members: 4, lastActive: "2024-03-15" },
  ]);

  const handleAcceptRequest = (requestId) => {
    // Handle accept logic here
    console.log("Accepted request:", requestId);
  };

  const handleRejectRequest = (requestId) => {
    // Handle reject logic here
    console.log("Rejected request:", requestId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />

        <BalanceSummary balance={balance} />

        {friendRequests.length > 0 && (
          <FriendRequests
            requests={friendRequests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        )}

        <FriendsSummary
          friends={friends}
          onPress={() => setShowFriendsList(true)}
        />

        <GroupsList groups={groups} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: profileTheme.colors.gray[50],
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
