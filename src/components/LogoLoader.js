import React from 'react';
import { View, Modal, ActivityIndicator, Image, StyleSheet } from 'react-native';

const LogoLoader = ({ visible }) => {
    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={visible}
            onRequestClose={() => { }} // Block back button close
        >
            <View style={styles.modalBackground}>
                <View style={styles.activityIndicatorWrapper}>
                    {/* Placeholder for Logo if available, else just text/spinner */}
                    <Image
                        source={require('../../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <ActivityIndicator animating={true} color="#1a7161" size="large" style={styles.spinner} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: 150,
        width: 150,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 60,
        height: 60,
        marginBottom: 20,
        borderRadius: 30,
    },
    spinner: {
        marginTop: 10,
    },
});

export default LogoLoader;
