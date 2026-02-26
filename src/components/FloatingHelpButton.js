import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Linking, Animated, Modal, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../config';

const FloatingHelpButton = () => {
    const insets = useSafeAreaInsets();
    const [expanded, setExpanded] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Animation value for width (0 = collapsed, 1 = expanded)
    const animValue = useRef(new Animated.Value(0)).current;

    const [contacts, setContacts] = useState({
        phone: '+918850120709', // Fallbacks just in case
        email: 'support@navabharathtechnologies.com',
        whatsapp: '+918850120709'
    });

    useEffect(() => {
        // Fetch dynamic contact details from backend so no rebuild is needed
        fetch(`${API_URL}/api/support-contacts`)
            .then(res => res.json())
            .then(data => {
                if (data && data.phone) {
                    setContacts({
                        phone: data.phone,
                        email: data.email,
                        whatsapp: data.whatsapp
                    });
                }
            })
            .catch(err => console.log('Failed to fetch dynamic contacts:', err));
    }, []);

    useEffect(() => {
        // Toggle expanded state every 5 seconds
        const interval = setInterval(() => {
            setExpanded(prev => !prev);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        Animated.timing(animValue, {
            toValue: expanded ? 1 : 0,
            duration: 400, // Smooth transition
            useNativeDriver: false, // width/maxWidth cannot use native driver
        }).start();
    }, [expanded]);

    const handlePress = () => {
        setModalVisible(true);
    };

    const handleCallUs = () => {
        Linking.openURL(`tel:${contacts.phone}`).catch(err => console.error(err));
    };

    const handleEmailUs = () => {
        Linking.openURL(`mailto:${contacts.email}`).catch(err => console.error(err));
    };

    const handleWhatsApp = () => {
        Linking.openURL(`whatsapp://send?phone=${contacts.whatsapp}`).catch(err => console.error(err));
    };

    // Interpolate animated value to a max-width for the text container
    const textMaxWidth = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 160]
    });

    const textOpacity = animValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1] // Keep hidden until halfway expanded
    });

    return (
        <>
            {/* The Floating Pill Button */}
            <Animated.View style={[styles.container, { bottom: Math.max(insets.bottom + 20, 20), right: 20 }]}>
                <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.8}>

                    <Animated.View style={{ maxWidth: textMaxWidth, overflow: 'hidden', opacity: textOpacity }}>
                        <Text style={styles.helpText} numberOfLines={1}>
                            Do you need assistance
                        </Text>
                    </Animated.View>

                    <Text style={styles.questionMark}>?</Text>

                </TouchableOpacity>
            </Animated.View>

            {/* The Help Options Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Need Assistance?</Text>
                                <Text style={styles.modalSubtitle}>Select an option to contact support:</Text>

                                <TouchableOpacity style={[styles.optionBtn, styles.btnBlue]} onPress={handleCallUs}>
                                    <Text style={styles.optionText}>📞 Call Us</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.optionBtn, styles.btnRed]} onPress={handleEmailUs}>
                                    <Text style={styles.optionText}>📧 Email Us</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.optionBtn, styles.btnGreen]} onPress={handleWhatsApp}>
                                    <Text style={styles.optionText}>💬 WhatsApp</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.optionBtn, styles.btnGrey]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.optionText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 9999, // Ensure it sits on top of all screens
        elevation: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 25,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#1a7161',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
        height: 44, // Fixed height keeps the circle/pill stable during animation
    },
    helpText: {
        color: '#1a7161',
        fontSize: 12,
        fontWeight: '600',
        marginRight: 4,
        whiteSpace: 'nowrap', // Prevent wrapping during animation
    },
    questionMark: {
        color: 'red',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 30,
        paddingHorizontal: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a7161',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#555',
        marginBottom: 25,
        textAlign: 'center',
    },
    optionBtn: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    btnBlue: {
        backgroundColor: '#eaf4fc',
    },
    btnRed: {
        backgroundColor: '#fcebe9',
    },
    btnGreen: {
        backgroundColor: '#eef8ef',
    },
    btnGrey: {
        backgroundColor: '#f5f5f5',
    },
    optionText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
});

export default FloatingHelpButton;
