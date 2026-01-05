import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { useCameraPermissions } from 'expo-camera'; // Added Import
import { API_URL } from '../config';

export default function PermissionsScreen({ navigation, route }) {
    const { email, phone, name } = route.params || {};
    const [loading, setLoading] = useState(false);
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();


    const handleContinue = async () => {
        setLoading(true);
        try {
            // 1. Request Location Permission
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied. Location is required.');
                setLoading(false);
                return;
            }

            // 2. Request Camera Permission
            const cameraStatus = await requestCameraPermission();
            if (!cameraStatus.granted) {
                Alert.alert('Permission Denied', 'Camera permission is required to proceed.');
                setLoading(false);
                return;
            }

            // 2. Get Location
            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
            const { latitude, longitude } = location.coords;

            console.log('Location:', latitude, longitude);

            // 3. Send Location to Backend
            try {
                await fetch(`${API_URL}/api/update-location`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        latitude: latitude,
                        longitude: longitude
                    })
                });
            } catch (apiError) {
                console.error("API Error updating location:", apiError);
                // We proceed to camera even if location update fails? Or block?
                // Usually better to warn but let them proceed or retry.
                // For now, let's proceed but log it.
            }

            // 4. Navigate to Camera
            navigation.navigate('Camera', { name, email, phone });

        } catch (error) {
            console.error("Location Error:", error);
            Alert.alert('Error', 'Failed to get location.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>

            {/* Icon */}
            <View style={styles.permissionIcon}>
                <FontAwesome5 name="shield-alt" size={40} color="#1a7161" />
            </View>

            {/* Title */}
            <Text style={styles.title}>Permissions Needed</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
                To verify your identity, we need access to:
            </Text>

            {/* Permission List */}
            <View style={styles.permissionList}>
                <View style={styles.permissionItem}>
                    <FontAwesome5 name="map-marker-alt" size={18} color="#1a7161" />
                    <Text style={styles.permissionText}>Device Location</Text>
                </View>

                <View style={styles.permissionItem}>
                    <FontAwesome5 name="camera" size={18} color="#1a7161" />
                    <Text style={styles.permissionText}>Camera Access</Text>
                </View>
            </View>

            {/* Button */}
            <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>ALLOW ACCESS</Text>
                )}
            </TouchableOpacity>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    permissionIcon: {
        backgroundColor: '#e0f2f1',
        padding: 20,
        borderRadius: 50,
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a7161',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    permissionList: {
        width: '100%',
        marginBottom: 40,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    permissionText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
    button: {
        backgroundColor: '#1a7161',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
