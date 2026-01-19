import React from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Modal } from 'react-native';

const LogoLoader = ({ visible }) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            statusBarTranslucent={true}
        >
            <View style={styles.container}>
                <View style={styles.loaderContainer}>
                    <Image
                        source={require('../../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {/* Rotating Loader around it */}
                    <View style={styles.spinnerContainer}>
                        <ActivityIndicator
                            size="large"
                            color="#1a7161"
                            style={styles.spinner}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // White overlay with transparency
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    logo: {
        width: 60,
        height: 60,
        opacity: 0.3, // Low visibility
        borderRadius: 30,
        position: 'absolute',
    },
    spinnerContainer: {
        position: 'absolute',
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        transform: [{ scale: 2.2 }], // Scale up to circle the logo
    }
});

export default LogoLoader;
