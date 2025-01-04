// components/profile/ProfilleHeader.js

// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { User, Settings } from "lucide-react-native";
// import { profileTheme } from "../../theme";

// const ProfileHeader = () => {
//   return (
//     <View style={styles.container}>
//       <View style={styles.userInfo}>
//         <View style={styles.avatar}>
//           <User width={40} height={40} color="white" />
//         </View>
//         <View style={styles.nameContainer}>
//           <Text style={styles.name}>Alex Johnson</Text>
//           <Text style={styles.username}>@alexj</Text>
//         </View>
//       </View>
//       <TouchableOpacity style={styles.settingsButton}>
//         <Settings width={32} height={32} color={profileTheme.colors.secondary} />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },
//   userInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: profileTheme.spacing.lg,
//   },
//   avatar: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: profileTheme.colors.primary,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   nameContainer: {
//     justifyContent: "center",
//   },
//   name: {
//     fontSize: 24,
//     fontWeight: "600",
//     color: profileTheme.colors.text,
//   },
//   username: {
//     fontSize: 18,
//     color: profileTheme.colors.secondary,
//   },
//   settingsButton: {
//     marginTop: profileTheme.spacing.sm,
//     padding: profileTheme.spacing.sm,
//   },
// });

// export default ProfileHeader;

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Settings } from "lucide-react-native";
import { profileTheme } from "../../theme";

const ProfileHeader = () => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const name = "Alex Johnson";

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(name)}
          </Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.username}>@alexj</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.settingsButton}>
        <Settings width={32} height={32} color={profileTheme.colors.secondary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: profileTheme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: profileTheme.colors.gray100,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32, // Larger size for the bigger avatar
    fontWeight: "600",
    color: profileTheme.colors.gray600,
  },
  nameContainer: {
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    color: profileTheme.colors.text,
  },
  username: {
    fontSize: 18,
    color: profileTheme.colors.secondary,
  },
  settingsButton: {
    marginTop: profileTheme.spacing.sm,
    padding: profileTheme.spacing.sm,
  },
});

export default ProfileHeader;