// components/profile/GroupsList.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Users, Plus } from "lucide-react-native";
import { profileTheme } from "../../theme";

const GroupsList = ({ groups }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Groups</Text>
        <TouchableOpacity style={styles.createButton}>
          <Plus width={16} height={16} color={profileTheme.colors.primary} />
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.groupsList}>
        {groups.map((group) => (
          <TouchableOpacity key={group.id} style={styles.groupItem}>
            <View style={styles.groupAvatar}>
              <Users width={24} height={24} color="white" />
            </View>
            <View style={styles.groupInfo}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.membersCount}>{group.members} members</Text>
              </View>
              <Text style={styles.lastActive}>
                Last active {new Date(group.lastActive).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: profileTheme.spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: profileTheme.colors.text,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  createButtonText: {
    fontSize: 14,
    color: profileTheme.colors.primary,
  },
  groupsList: {
    gap: profileTheme.spacing.sm,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: profileTheme.spacing.md,
    padding: profileTheme.spacing.md,
    backgroundColor: profileTheme.colors.background,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: profileTheme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "500",
    color: profileTheme.colors.text,
  },
  membersCount: {
    fontSize: 14,
    color: profileTheme.colors.secondary,
  },
  lastActive: {
    fontSize: 14,
    color: profileTheme.colors.secondary,
  },
});

export default GroupsList;
