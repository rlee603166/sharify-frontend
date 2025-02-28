// CameraScreen.js
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

    // Handle permissions independently
    const hasCameraPermission = permission?.granted;
    const hasGalleryPermission = galleryPermission?.granted;

    const toggleCameraType = () => {
        if (!hasCameraPermission) return;
        setFacing(current => (current === "back" ? "front" : "back"));
    };

    const toggleFlash = () => {
        if (!hasCameraPermission) return;
        setFlash(current => (current === "off" ? "on" : "off"));
    };

    const getFlashIcon = () => {
        return {
            color: flash === "on" ? "#ffd700" : "white",
            size: 24,
        };
    };

    const handleCapture = async () => {
        if (!hasCameraPermission || !cameraRef.current) return;

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
        if (!hasGalleryPermission) return;

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

    // UI Controls - rendered regardless of permissions
    const renderControls = () => (
        <>
            {/* Top Controls */}
            <SafeAreaView style={styles.topControls}>
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate("Profile")}
                >
                    <ProfileIcon name={name} avatar={avatar} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.topButton}
                    onPress={toggleFlash}
                    disabled={!hasCameraPermission}
                >
                    <Flashlight {...getFlashIcon()} />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Bottom Controls */}
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.sideButton, !hasGalleryPermission && styles.disabledButtonText]}
                    onPress={handleGalleryPick}
                    disabled={!hasGalleryPermission}
                >
                    <ImageIcon
                        color={hasGalleryPermission ? "white" : "rgba(255, 255, 255, 0.5)"}
                        size={24}
                    />
                    <Text
                        style={[
                            styles.buttonText,
                            !hasGalleryPermission && styles.disabledButtonText,
                        ]}
                    >
                        Gallery
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.captureButton, !hasCameraPermission && styles.disabledButton]}
                    onPress={handleCapture}
                    activeOpacity={hasCameraPermission ? 0.7 : 1}
                    disabled={!hasCameraPermission}
                ></TouchableOpacity>

                <TouchableOpacity style={styles.sideButton} onPress={handleManualInput}>
                    <PenLine color="white" size={22} />
                    <Text style={styles.topButtonText}>Manual</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    // Use a state to track initial rendering
    const [isInitializing, setIsInitializing] = useState(true);

    // Use an effect to handle initialization state
    useEffect(() => {
        // Longer timeout to ensure consistent behavior in TestFlight/production
        const timer = setTimeout(() => {
            setIsInitializing(false);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            {hasCameraPermission ? (
                <CameraView
                    ref={cameraRef}
                    style={styles.camera}
                    facing={facing}
                    flash={flash}
                    enableTorch={flash === "on"}
                >
                    {renderControls()}
                </CameraView>
            ) : (
                // Render a black background with controls when camera permission not granted
                <View style={styles.noPermissionContainer}>
                    {renderControls()}
                    {/* Only show permission messages after initialization */}
                    {!isInitializing && (
                        <>
                            <Text style={styles.permissionText}>Camera access denied</Text>
                            {!hasGalleryPermission && (
                                <Text style={styles.permissionText}>Gallery access denied</Text>
                            )}
                        </>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    camera: {
        flex: 1,
    },
    noPermissionContainer: {
        flex: 1,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    permissionText: {
        color: "white",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 8,
    },
    disabledButtonText: {
        color: "rgba(255, 255, 255, 0.5)",
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
        zIndex: 10,
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
        zIndex: 10,
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
    disabledButton: {
        borderColor: "rgba(255, 255, 255, 0.5)",
    },
});

export default CameraScreen;
