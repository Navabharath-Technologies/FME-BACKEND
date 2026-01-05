import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Linking, Platform } from 'react-native';

export default function NeedAssistanceModal({ visible, onClose }) {

    // Support Details
    const PHONE_NUMBER = '+918850120709'; // Replace with actual
    const EMAIL_ID = 'zedcertifications@navabharathtechnologies.com'; // Replace with actual
    const WHATSAPP_NUMBER = '918850120709'; // Replace with actual (Country code without +)

    const handleCall = () => {
        let phoneNumber = '';
        if (Platform.OS === 'android') {
            phoneNumber = `tel:${PHONE_NUMBER}`;
        } else {
            phoneNumber = `telprompt:${PHONE_NUMBER}`;
        }
        Linking.openURL(phoneNumber);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${EMAIL_ID}`);
    };

    const handleWhatsApp = () => {
        let url =
            'whatsapp://send?text=' +
            'Hello, I need assistance with the FME Application.' +
            '&phone=' +
            WHATSAPP_NUMBER;
        Linking.openURL(url)
            .catch(() => {
                // FLbk to web if app not installed
                Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=Hello, I need assistance with the FME Application.`);
            });
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Need Assistance?</Text>
                    <Text style={styles.modalSubText}>Select an option to contact support:</Text>

                    <TouchableOpacity style={[styles.button, styles.callBtn]} onPress={handleCall}>
                        <Text style={styles.btnText}>📞 Call Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.emailBtn]} onPress={handleEmail}>
                        <Text style={styles.btnText}>📧 Email Us</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.whatsappBtn]} onPress={handleWhatsApp}>
                        <Text style={styles.btnText}>💬 WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.closeBtn]} onPress={onClose}>
                        <Text style={[styles.btnText, { color: '#555' }]}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1a7161',
    },
    modalSubText: {
        marginBottom: 20,
        textAlign: 'center',
        color: '#666',
    },
    button: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        alignItems: 'center',
    },
    callBtn: { backgroundColor: '#e3f2fd' },
    emailBtn: { backgroundColor: '#fbe9e7' },
    whatsappBtn: { backgroundColor: '#e8f5e9' },
    closeBtn: { marginTop: 10, backgroundColor: '#f5f5f5' },
    btnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
});
