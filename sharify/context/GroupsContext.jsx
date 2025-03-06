// src/context/GroupsContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import UserService from "../services/UserService";
import { useUser } from "../services/UserProvider";
import { Alert } from "react-native";
import { v4 as uuidv4 } from "uuid";
import { Image } from "expo-image";

const GroupsContext = createContext();

const GroupsProvider = ({ children, initialGroups = [] }) => {
    const [groups, setGroups] = useState(() =>
        [...initialGroups].sort((a, b) => a.name.localeCompare(b.name))
    );
    const [isLoading, setIsLoading] = useState(false);

    const userService = new UserService();
    const { id, name, username, profileImage } = useUser();

    const user = {
        id: id,
        name: name,
        username: username,
        avatar: profileImage,
    };

    useEffect(() => {
        if (id) {
            loadGroups(id);
        }
    }, [id]);

    const prefetchGroupsImage = async groupData => {
        const data = (groupData || [])
            .map(group => group.groupImage)
            .filter(groupImage => groupImage != null);
        try {
            await Promise.all(data.map(group => Image.prefetch(group)));
            console.log("successfully fetched groups");
        } catch (error) {
            console.error(error);
        }
    };

    const loadGroups = useCallback(
        async userId => {
            if (!userId) return;

            setIsLoading(true);
            try {
                const groupsData = await userService.getGroups(userId);

                console.log("groupsData:", groupsData, "Type:", typeof groupsData);

                const data = Array.isArray(groupsData)
                    ? groupsData.map(group => {
                          const members = Array.isArray(group.members)
                              ? group.members.map(member => {
                                    if (member.users && typeof member.users === "object") {
                                        let isLocalImage;
                                        if (member.users.imageUri) {
                                            isLocalImage =
                                                !member.users.imageUri.startsWith("http");
                                        }

                                        const avatar = isLocalImage
                                            ? `${userService.apiURL}/images/pfp/${member.users.imageUri}`
                                            : member.users.imageUri;

                                        return {
                                            id: member.user_id,
                                            name: member.users.name || "",
                                            username: member.users.username || "",
                                            phone: member.users.phone || "",
                                            avatar: avatar || null,
                                        };
                                    } else {
                                        return {
                                            id: member.user_id || "",
                                            name: "",
                                            username: "",
                                            phone: "",
                                            avatar: null,
                                        };
                                    }
                                })
                              : [];

                          return {
                              id: group.group_id,
                              name: group.name || "",
                              groupImage: group.imageUri
                                  ? `${userService.apiURL}/images/groups/${group.imageUri}`
                                  : null,
                              members: members,
                          };
                      })
                    : [];

                const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
                setGroups(sortedData);
                prefetchGroupsImage(sortedData);
            } catch (error) {
                console.error("Failed to load groups:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [userService, id]
    );

    const createGroup = async (name, selectedFriends, groupImage = null) => {
        if (!name.trim()) {
            Alert.alert("Error", "Please enter a group name");
            return false;
        }

        if (selectedFriends.length === 0) {
            Alert.alert("Error", "Please select at least one friend");
            return false;
        }

        if (groups.some(group => group.name.toLowerCase() === name.toLowerCase())) {
            Alert.alert("Error", "A group with this name already exists");
            return false;
        }

        setIsLoading(true);

        // Use a real temp id (negative integer) not random
        const tempId = Date.now() * -1;

        // Ensure current user avatar is properly formatted and matches what ProfileIcon expects
        let avatarUrl = user.avatar;
        if (avatarUrl && !avatarUrl.startsWith("http") && avatarUrl !== null) {
            avatarUrl = `${userService.apiURL}/images/pfp/${avatarUrl}`;
        }

        const newGroup = {
            id: tempId,
            name: name.trim(),
            members: [
                ...selectedFriends.map(friend => ({
                    ...friend,
                    username: friend.username.trim().startsWith("@")
                        ? friend.username.trim().slice(1)
                        : friend.username.trim(),
                })),
                {
                    ...user,
                    username: user.username.trim().startsWith("@")
                        ? user.username.trim().slice(1)
                        : user.username.trim(),
                    avatar: avatarUrl, // Use consistently formatted avatar URL
                },
            ],
            groupImage: groupImage,
        };

        // Prefetch the current user's avatar
        if (avatarUrl) {
            try {
                await Image.prefetch(avatarUrl);
                console.log("User avatar prefetched for group");
            } catch (err) {
                console.log("Avatar prefetch error:", err);
            }
        }

        console.log("Creating new group:", JSON.stringify(newGroup, null, 2));

        // First add the temp group to state
        setGroups(prevGroups =>
            [...prevGroups, newGroup].sort((a, b) => a.name.localeCompare(b.name))
        );

        try {
            // Then make the API call
            const createdGroup = await userService.createGroup(newGroup);

            if (!createdGroup || !createdGroup.group_id) {
                throw new Error("Failed to get group ID from server");
            }

            console.log("Group created successfully with ID:", createdGroup.group_id);

            // Update the group with the real ID
            setGroups(prevGroups =>
                prevGroups
                    .map(group =>
                        group.id === tempId ? { ...group, id: createdGroup.group_id } : group
                    )
                    .sort((a, b) => a.name.localeCompare(b.name))
            );

            setIsLoading(false);
            return createdGroup.group_id; // Return the real ID
        } catch (error) {
            console.error("Failed to create group:", error);

            // Remove the temp group from state
            setGroups(prevGroups => prevGroups.filter(group => group.id !== tempId));

            Alert.alert("Error", "Failed to create group. Please try again.");
            setIsLoading(false);
            return false;
        }
    };

    const updateGroupName = async (groupId, newName) => {
        if (!newName.trim()) {
            Alert.alert("Error", "Group name cannot be empty");
            return false;
        }

        if (
            groups.some(
                group => group.id !== groupId && group.name.toLowerCase() === newName.toLowerCase()
            )
        ) {
            Alert.alert("Error", "One of your groups already have this name");
            return false;
        }

        // Update locally first
        setGroups(prevGroups =>
            prevGroups
                .map(group => (group.id === groupId ? { ...group, name: newName.trim() } : group))
                .sort((a, b) => a.name.localeCompare(b.name))
        );

        try {
            // Then update on the server
            await userService.updateGroupName(groupId, newName);
            return true;
        } catch (error) {
            console.error("Failed to update group name:", error);

            // Reload groups to reset state on error
            loadGroups(id);
            return false;
        }
    };

    const updateGroupImage = async (groupId, imageUri) => {
        // Update locally first
        setGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId ? { ...group, groupImage: imageUri } : group
            )
        );

        try {
            // Then update on the server
            await userService.updateGroupImage(groupId, imageUri);
            return true;
        } catch (error) {
            console.error("Failed to update group image:", error);

            // Reload groups to reset state on error
            loadGroups(id);
            return false;
        }
    };

    const removeGroupImage = async groupId => {
        // Update locally first
        setGroups(prevGroups =>
            prevGroups.map(group => (group.id === groupId ? { ...group, groupImage: null } : group))
        );

        try {
            // Then update on the server
            await userService.updateGroupImage(groupId, null);
            return true;
        } catch (error) {
            console.error("Failed to remove group image:", error);

            // Reload groups to reset state on error
            loadGroups(id);
            return false;
        }
    };

    const deleteGroup = async groupId => {
        // Store the group to restore it if the API call fails
        const groupToDelete = groups.find(group => group.id === groupId);

        // Update locally first
        setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));

        try {
            // Then update on the server
            await userService.deleteGroup(groupId);
            return true;
        } catch (error) {
            console.error("Failed to delete group:", error);

            // Restore the group if the API call failed
            if (groupToDelete) {
                setGroups(prev =>
                    [...prev, groupToDelete].sort((a, b) => a.name.localeCompare(b.name))
                );
            }

            Alert.alert("Error", "Failed to leave the group. Please try again.");
            return false;
        }
    };

    const updateGroupMembers = (groupId, newMembers) => {
        setGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId
                    ? {
                          ...group,
                          membersList: newMembers,
                          members: newMembers.length + 1, // +1 for current user
                          lastActive: new Date().toISOString(),
                      }
                    : group
            )
        );
    };

    const updateGroupLastActive = groupId => {
        setGroups(prevGroups =>
            prevGroups.map(group =>
                group.id === groupId ? { ...group, lastActive: new Date().toISOString() } : group
            )
        );
    };

    const getGroupById = useCallback(
        groupId => {
            if (!groupId) return null;
            return groups.find(group => group.id === groupId) || null;
        },
        [groups]
    );

    return (
        <GroupsContext.Provider
            value={{
                groups,
                isLoading,
                loadGroups,
                createGroup,
                deleteGroup,
                updateGroupImage,
                removeGroupImage,
                updateGroupName,
                updateGroupMembers,
                updateGroupLastActive,
                getGroupById,
            }}
        >
            {children}
        </GroupsContext.Provider>
    );
};

const useGroups = () => {
    const context = useContext(GroupsContext);
    if (!context) {
        throw new Error("useGroups must be used within a GroupsProvider");
    }
    return context;
};

export { GroupsProvider, useGroups };
