import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Platform, ActivityIndicator, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { globalStyles } from '../styles';
import { API_URL } from '../config';

export default function CameraScreen({ route, navigation }) {
    const { name, email, phone } = route.params || {};
    const [permission, requestPermission] = ImagePicker.useCameraPermissions();
    const [scannedImage, setScannedImage] = useState(null);
    const isLaunching = useRef(false);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        } else if (permission.granted && !scannedImage) {
            // Auto-launch camera if permission is granted and no image is captured
            takePicture();
        }
    }, [permission, scannedImage]);

    const takePicture = async () => {
        if (isLaunching.current) return; // Prevent double trigger
        isLaunching.current = true;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 0.5,
                base64: true,
                cameraType: ImagePicker.CameraType.front,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setScannedImage(result.assets[0]);
            } else {
                // If cancelled, go back to previous screen
                navigation.goBack();
            }
        } catch (error) {
            console.error("Camera launch error:", error);
            Alert.alert("Error", "Failed to launch camera.");
            navigation.goBack();
        } finally {
            // Delay resetting flag slightly to avoid rapid re-trigger by generic state updates if any
            setTimeout(() => {
                isLaunching.current = false;
            }, 500);
        }
    };

    const retakePicture = () => {
        setScannedImage(null);
        // Effect will auto-trigger takePicture since scannedImage becomes null
    };

    const handleProceed = async () => {
        if (!scannedImage) return;

        try {
            // Resize and compress image further if needed, though launchCameraAsync quality handles some
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                scannedImage.uri,
                [{ resize: { width: 600 } }],
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
            );

            const response = await fetch(`${API_URL}/api/upload-photo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    photo: `data:image/jpeg;base64,${manipulatedImage.base64.replace(/(\r\n|\n|\r)/gm, "")}`
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Examination', params: { name, email, phone } }],
                });
            } else {
                Alert.alert('Error', 'Failed to upload photo.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Server upload failed.');
        }
    };

    if (!permission) {
        return <View style={globalStyles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={[globalStyles.container, styles.centerMsg]}>
                <Text style={styles.title}>Camera Access</Text>
                <Text style={styles.subtitle}>Camera access is required to capture your photo for identity verification. Please enable it in settings.</Text>
                <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 20 }]} onPress={() => Linking.openSettings()}>
                    <Text style={globalStyles.btnText}>Open Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.goBack()}>
                    <Text style={{ color: '#666', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={[globalStyles.container, { padding: 0, alignItems: 'center', backgroundColor: '#fff' }]}>
            <StatusBar style="dark" translucent />


            <View style={styles.contentContainer}>
                {scannedImage ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: scannedImage.uri }} style={styles.previewImage} />
                    </View>
                ) : (
                    <ActivityIndicator size="large" color="#1a7161" />
                )}
            </View>

            <View style={styles.controls}>
                {scannedImage && (
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.actionBtn} onPress={retakePicture}>
                            <Text style={styles.actionBtnText}>TAKE SELFIE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleProceed}>
                            <Text style={styles.actionBtnText}>SUBMIT SELFIE</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#fff',
    },
    previewContainer: {
        width: 300,
        height: 300,
        marginBottom: 20,
        backgroundColor: '#f0f0f0',
        elevation: 5, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', // Or 'cover' depending on preference, 'contain' keeps aspect ratio visible
    },
    controls: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 20, // Requires newer RN, fallback with margin if fails? Expo 54 should support gap.
    },
    actionBtn: {
        flex: 1,
        backgroundColor: '#00695c', // Darker green like screenshot
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    centerMsg: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    title: { // Keeping these for permission view usage
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    }
});
