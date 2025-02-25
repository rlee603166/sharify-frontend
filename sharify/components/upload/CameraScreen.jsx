// CameraView.js
import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Camera as CameraIcon, Image as ImageIcon, Flashlight, PenLine } from "lucide-react-native";
import ProfileIcon from "./../main/ProfileIcon";
import { useUser } from "../../services/UserProvider";

const CameraScreen = ({ navigation, onPictureTaken }) => {
    const [facing, setFacing] = useState("back");
    const [flash, setFlash] = useState("off");
    const [permission, requestPermission] = useCameraPermissions();
    const [galleryPermission, requestGalleryPermission] = ImagePicker.useMediaLibraryPermissions();
    const cameraRef = useRef(null);
    const { name, avatar } = useUser();

    // Request permissions on component mount
    useEffect(() => {
        (async () => {
            if (!permission?.granted) {
                await requestPermission();
            }
            if (!galleryPermission?.granted) {
                await requestGalleryPermission();
            }
        })();
    }, []);

    // Show black screen while permissions are being checked or not granted
    if (!permission || !galleryPermission || !permission.granted || !galleryPermission.granted) {
        return <SafeAreaView style={styles.container} />;
    }

    const toggleCameraType = () => {
        setFacing(current => (current === "back" ? "front" : "back"));
    };

    const toggleFlash = () => {
        setFlash(current => (current === "off" ? "on" : "off"));
    };

    const getFlashIcon = () => {
        return {
            color: flash === "on" ? "#ffd700" : "white",
            size: 24,
        };
    };

    const handleCapture = async () => {
        if (!cameraRef.current) return;

        try {
            const photo = await cameraRef.current.takePictureAsync({
                flashMode: flash,
                quality: 1,
            });

            onPictureTaken(photo.uri);
        } catch (error) {
            console.error("Error taking photo:", error);
        }
    };

    const handleManualInput = () => {
        onPictureTaken(null, "manual");
    };

    const handleGalleryPick = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                onPictureTaken(result.assets[0].uri, "gallery");
            }
        } catch (error) {
            console.error("Error picking image:", error);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                flash={flash}
                enableTorch={flash === "on"}
            >
                {/* Top Controls */}
                <SafeAreaView style={styles.topControls}>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate("Profile")}
                    >
                        <ProfileIcon name={name} avatar={avatar} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.topButton} onPress={toggleFlash}>
                        <Flashlight {...getFlashIcon()} />
                    </TouchableOpacity>
                </SafeAreaView>

                {/* Bottom Controls */}
                <View style={styles.controls}>
                    <TouchableOpacity style={styles.sideButton} onPress={handleGalleryPick}>
                        <ImageIcon color="white" size={24} />
                        <Text style={styles.buttonText}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={handleCapture}
                        activeOpacity={0.7}
                    ></TouchableOpacity>

                    <TouchableOpacity style={styles.sideButton} onPress={handleManualInput}>
                        <PenLine color="white" size={22} />
                        <Text style={styles.topButtonText}>Manual</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
};

// Styles remain mostly the same
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    camera: {
        flex: 1,
    },
    topControls: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 20,
        marginHorizontal: 20,
    },
    topButton: {
        width: 50,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 25,
        marginTop: 10,
        marginRight: 12,
    },
    profileButton: {
        width: 50,
        height: 50,
        marginTop: 10,
        marginLeft: 12,
    },
    topButtonText: {
        color: "white",
        fontSize: 10,
        marginTop: 2,
    },
    controls: {
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingHorizontal: 20,
    },
    sideButton: {
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 12,
        marginTop: 4,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "transparent",
        borderWidth: 4,
        borderColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },
});

export default CameraScreen;
