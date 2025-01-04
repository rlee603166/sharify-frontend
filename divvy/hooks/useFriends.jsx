// src/hooks/useFriends.js
import { useState } from 'react';
import { Alert } from 'react-native';

export function useFriends(initialFriends = []) {
  const [friends, setFriends] = useState(
    initialFriends.sort((a, b) => a.name.localeCompare(b.name))
  );

  const addFriend = (name, username) => {
    if (!name.trim() || !username.trim()) {
      Alert.alert('Error', 'Please fill in both name and username');
      return false;
    }

    // Format username to include @ if it doesn't
    const formattedUsername = username.trim().startsWith('@') 
      ? username.trim() 
      : `@${username.trim()}`;

    // Check for duplicate username
    if (friends.some(friend => friend.username.toLowerCase() === formattedUsername.toLowerCase())) {
      Alert.alert('Error', 'This username already exists');
      return false;
    }

    const newFriend = {
      id: Math.max(...friends.map(f => f.id), 0) + 1,
      name: name.trim(),
      username: formattedUsername,
      status: "active"
    };

    setFriends(prevFriends => 
      [...prevFriends, newFriend].sort((a, b) => a.name.localeCompare(b.name))
    );
    return true;
  };

  const deleteFriend = (friendId) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFriends(prevFriends => 
              prevFriends.filter(friend => friend.id !== friendId)
            );
          },
        },
      ]
    );
  };

  return {
    friends,
    addFriend,
    deleteFriend,
  };
}