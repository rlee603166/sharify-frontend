import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { User, Users, ChevronRight } from "lucide-react-native";
import { profileTheme } from "../../theme";

const FriendsSummary = ({ friends, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.friendsList}>
          {friends.slice(0, 5).map((friend) => (
            <View key={friend.id} style={styles.friendItem}>
              <View style={styles.avatar}>
                <User width={28} height={28} color="white" />
              </View>
              <Text style={styles.friendName} numberOfLines={1}>
                {friend.name.split(" ")[0]}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Users width={20} height={20} color={profileTheme.colors.text} />
          <Text style={styles.footerText}>My Friends</Text>
        </View>
        <ChevronRight width={20} height={20} color={profileTheme.colors.text} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: profileTheme.colors.background,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollView: {
    padding: profileTheme.spacing.md,
  },
  friendsList: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "space-around",
    gap: profileTheme.spacing.md - 4,
  },
  friendItem: {
    alignItems: "center",
    width: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: profileTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: profileTheme.spacing.sm,
  },
  friendName: {
    fontSize: 14,
    color: profileTheme.colors.secondary,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: profileTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: profileTheme.colors.border,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: profileTheme.spacing.sm,
  },
  footerText: {
    fontWeight: "500",
    color: profileTheme.colors.text,
  },
});

export default FriendsSummary;
