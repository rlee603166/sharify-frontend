import FormData from "form-data";
import { useUser } from "./UserProvider";

class UserService {
    constructor() {
        // this.apiURL = "http://127.0.0.1:8000/api/v1";
        this.apiURL = "http://47.144.148.193:8000/api/v1";
        this.state = useUser();
    }

    async getFriends(userID) {
        try {
            const url = `${this.apiURL}/users/friends/${userID}`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    async getFriendRequests(userID) {
        try {
            const url = `${this.apiURL}/users/friend-requests/${userID}`;
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    async acceptFriend(request) {
        try {
            const url = `${this.apiURL}/users/friend`;
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_1: request.id,
                    user_2: this.state.id,
                    status: "accepted",
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    async rejectFriend(request) {
        try {
            const url = `${this.apiURL}/users/friend`;
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_1: request.id,
                    user_2: this.state.id,
                }),
            });
            const data = await response.json();
            return data;
        } catch (error) {}
    }

    async addFriend(userID) {
        try {
            const url = `${this.apiURL}/users/friend`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_1: this.state.id,
                    user_2: userID,
                }),
            });
        } catch (error) {
            console.error(error);
        }
    }

    async removeFriend(userID) {
        try {
            const url = `${this.apiURL}/users/friend`;
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_1: this.state.id,
                    user_2: userID,
                }),
            });
        } catch (error) {}
    }

    async getGroups(userID) {
        try {
            const response = await fetch(`${this.apiURL}/groups/user/${userID}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    async uploadGroupImage(photoUri) {
        try {
            const response = await fetch(photoUri);
            const blob = await response.blob();

            const formData = new FormData();
            const fileExtension = photoUri.split(".").pop() || "jpg";

            formData.append("image", {
                uri: photoUri,
                type: "image/*",
                name: `receipt.${fileExtension}`,
            });

            const uploadResponse = await fetch(`${this.apiURL}/groups/upload-image`, {
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                body: formData,
            });

            const data = await uploadResponse.json();
            return data.filepath;
        } catch (error) {}
    }

    async updateGroupImage(group_id, photoUri) {
        try {
            let filepath = null;
            if (photoUri) {
                filepath = await this.uploadGroupImage(photoUri);
            }

            const url = `${this.apiURL}/groups/${group_id}`;
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ imageUri: filepath || null }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            // Handle the error appropriately
            console.error("Error updating group image:", error);
            throw error;
        }
    }

    async createGroup(data) {
        try {
            const formattedGroup = {
                group_name: data.name,
                imageUri: data.groupImage,
                members: data.members.map(member => ({
                    user_id: member.id,
                })),
            };

            if (formattedGroup.imageUri) {
                const filepath = await this.uploadGroupImage(formattedGroup.imageUri);
                formattedGroup.imageUri = filepath;
            }

            const url = `${this.apiURL}/groups/`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formattedGroup),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const newGroup = await response.json();

            return newGroup;
        } catch (error) {
            console.error("Error updating group:", error);
            throw error;
        }
    }

    async updateGroupName(groupID, groupName) {
        try {
            const url = `${this.apiURL}/groups/${groupID}`;
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ group_name: groupName }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const updatedGroup = await response.json();
            return updatedGroup;
        } catch (error) {
            console.error("Error updating group:", error);
            throw error;
        }
    }

    async deleteGroup(groupID) {
        try {
            const url = `${this.apiURL}/groups/user`;
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: this.state.id,
                    group_id: groupID,
                }),
            });
        } catch (error) {}
    }

    async search(query) {
        console.log(`fetching ${query}`);
        const response = await fetch(`${this.apiURL}/users/search/${query}`);
        const searchData = await response.json();
        console.log(searchData);
        const data = (searchData || []).map((friend, index) => {
            let isLocalImage;
            let isNull;
            if (friend.imageUri && friend.imageUri !== "null") {
                isLocalImage = !friend.imageUri.startsWith("http");
            }

            if (friend.imageUri == "null") {
                isNull = true;
            }

            const avatar = isNull
                ? null
                : isLocalImage
                  ? `${this.apiURL}/images/pfp/${friend.imageUri}`
                  : friend.imageUri;

            console.log(avatar);

            return {
                id: friend.user_id,
                friend_id: friend.friend_id,
                name: friend.name,
                phone: `${friend.username}` || "",
                username: `${friend.username}` || "",
                avatar: avatar || null,
                selected: false,
            };
        });

        console.log(data);
        return data;
    }

    async getSMS(phone) {
        try {
            const url = `${this.apiURL}/users/sms`;
            console.log(url);
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phone: phone }),
            });

            const data = response.json();
            return data;
        } catch {
            console.error(error);
            return false;
        }
    }
}

export default UserService;
