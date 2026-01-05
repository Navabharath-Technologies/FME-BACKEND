import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import NeedAssistanceModal from './NeedAssistanceModal';

export default function FloatingHelpButton() {
    const [modalVisible, setModalVisible] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const widthAnim = useRef(new Animated.Value(50)).current; // Initial width (circle)
    const textOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let intervalId = null;

        const cycle = () => {
            expand();
            setTimeout(() => {
                collapse();
            }, 5000); // Open for 5 seconds
        };

        const timeout = setTimeout(() => {
            cycle(); // First run
            intervalId = setInterval(cycle, 60000); // Repeat every 60s
        }, 1000);

        return () => {
            clearTimeout(timeout);
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const expand = () => {
        setExpanded(true);
        Animated.parallel([
            Animated.timing(widthAnim, {
                toValue: 220,
                duration: 500,
                useNativeDriver: false,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 500,
                delay: 200,
                useNativeDriver: false,
            })
        ]).start();
    };

    const collapse = () => {
        Animated.parallel([
            Animated.timing(widthAnim, {
                toValue: 50,
                duration: 500,
                useNativeDriver: false,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
            Animated.timing(textOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            })
        ]).start(() => setExpanded(false));
    };

    return (
        <>
            <Animated.View style={[styles.container, { width: widthAnim }]}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Animated.Text style={[styles.text, { opacity: textOpacity }]} numberOfLines={1}>
                        Do you need assistance
                    </Animated.Text>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>?</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <NeedAssistanceModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
        borderColor: '#1a7161',
        borderWidth: 1,
        overflow: 'hidden',
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 0,
        justifyContent: 'flex-end', // Keep Icon on the Right
    },
    iconContainer: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
    },
    icon: {
        fontSize: 24,
        color: '#d32f2f',
        fontWeight: 'bold',
    },
    text: {
        fontSize: 12, // Smaller Text
        color: '#1a7161',
        fontWeight: 'bold',
        marginRight: 5, // Space between text and icon
        marginLeft: 15, // Padding on left edge
        whiteSpace: 'nowrap',
    }
});
