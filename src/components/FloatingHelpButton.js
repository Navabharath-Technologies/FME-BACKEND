import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Linking } from 'react-native';

const FloatingHelpButton = () => {
    const handlePress = () => {
        // Simple action for help, e.g., open email or show alert
        Alert.alert(
            "Need Help?",
            "Contact support at support@navabharathtechnologies.com",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Email Support", onPress: () => Linking.openURL('mailto:support@navabharathtechnologies.com') }
            ]
        );
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.text}>?</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#1a7161',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        zIndex: 1000,
    },
    text: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default FloatingHelpButton;
