import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, Button, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { globalStyles } from '../styles';
import { API_URL } from '../config';

export default function CameraScreen({ route, navigation }) {
    const { name, email, phone } = route.params || {}; // Safe access
    const [permission, requestPermission] = useCameraPermissions();
    const [scannedImage, setScannedImage] = useState(null);
    const cameraRef = useRef(null);

    // Initial check or effect if needed, but the hook handles state.

    // Explicitly request if not determined? 
    // The hook 'permission' can be null initially.
    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            // Optional: Auto request? Better to let user trigger or rely on the hook's initial state if it auto-requests.
            // Usually we show a view to ask.
        }
    }, [permission]);

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.3 });
                setScannedImage(photo);
            } catch (error) {
                console.error("Take picture error:", error);
                Alert.alert("Error", "Failed to capture image.");
            }
        }
    };

    const retakePicture = () => {
        setScannedImage(null);
    };

    const handleProceed = async () => {
        if (!scannedImage) return;

        try {
            // Resize and compress image
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
                // Navigate to next screen or Home
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

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    if (!permission || !permission.granted) {
        return <View style={globalStyles.container} />;
    }

    return (
        <SafeAreaView style={[globalStyles.container, { padding: 0, alignItems: 'center', backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Photo Verification</Text>
                <Text style={styles.subtitle}>Please capture your photo to proceed</Text>
            </View>

            <View style={styles.cameraContainer}>
                {scannedImage ? (
                    <Image source={{ uri: scannedImage.uri }} style={styles.camera} />
                ) : (
                    <View style={styles.cameraWrapper}>
                        <CameraView
                            style={styles.camera}
                            facing="front"
                            ref={cameraRef}
                        />
                        <View style={styles.overlay} />
                    </View>
                )}
            </View>

            <Text style={styles.instruction}>Ensure your face is clearly visible within the frame.</Text>

            <View style={styles.controls}>
                {!scannedImage ? (
                    <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={[globalStyles.btnPrimary, { backgroundColor: '#888', marginBottom: 10 }]} onPress={retakePicture}>
                            <Text style={globalStyles.btnText}>RETAKE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={globalStyles.btnPrimary} onPress={handleProceed}>
                            <Text style={globalStyles.btnText}>PROCEED</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a7161',
    },
    subtitle: {
        fontSize: 12,
        color: '#666',
    },
    cameraContainer: {
        width: 250,
        height: 330,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#1a7161',
        marginBottom: 20,
        position: 'relative',
        backgroundColor: '#000',
    },
    cameraWrapper: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    overlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 200,
        height: 250,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 100, // Oval
        borderStyle: 'dashed',
        transform: [{ translateX: -100 }, { translateY: -125 }],
    },
    instruction: {
        fontSize: 13,
        color: '#555',
        marginBottom: 40,
    },
    controls: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    captureBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        borderWidth: 5,
        borderColor: '#1a7161',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a7161',
    },
    actionButtons: {
        width: '100%',
    }
});
