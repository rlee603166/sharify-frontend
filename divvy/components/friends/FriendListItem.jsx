// components/friends/FriendListItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SwipeableRow from './SwipeableRow';
import { friendTheme } from '../../theme';

export function FriendListItem({ friend, onPress, onDelete }) {
  // Get initials from friend's name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return friendTheme.colors.green500;
      case 'inactive':
        return friendTheme.colors.gray300;
      default:
        return friendTheme.colors.gray300;
    }
  };

  return (
    <SwipeableRow onDelete={() => onDelete(friend.id)}>
      <TouchableOpacity 
        onPress={() => onPress(friend)}
        activeOpacity={0.7}
        style={styles.friendItem}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {getInitials(friend.name)}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {friend.name}
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            {friend.username}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(friend.status) }
            ]} 
          />
          <Text style={styles.statusText}>
            {friend.status.charAt(0).toUpperCase() + friend.status.slice(1)}
          </Text>
        </View>
      </TouchableOpacity>
    </SwipeableRow>
  );
}

const styles = StyleSheet.create({
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: friendTheme.spacing[3],
    backgroundColor: friendTheme.colors.white,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: friendTheme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: friendTheme.spacing[3],
    // borderWidth: 1,                              // Add border width
    // borderColor: friendTheme.colors.gray300,     // Add border color
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: friendTheme.colors.gray600,
  },
  infoContainer: {
    flex: 1,
    marginRight: friendTheme.spacing[3],
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: friendTheme.colors.gray900,
    marginBottom: friendTheme.spacing[1],
  },
  username: {
    fontSize: 14,
    color: friendTheme.colors.gray500,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: friendTheme.spacing[2],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: friendTheme.spacing[1],
  },
  statusText: {
    fontSize: 12,
    color: friendTheme.colors.gray500,
    textTransform: 'capitalize',
  },
});

export default FriendListItem;

