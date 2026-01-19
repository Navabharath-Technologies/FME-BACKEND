import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, BackHandler, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles';

export default function ResultScreen({ route, navigation }) {
    const { score, totalQuestions, name } = route.params || { score: 0, totalQuestions: 0, name: 'User' };

    // Prevent hardware back button from going back to exam flow
    useEffect(() => {
        const backAction = () => {
            navigation.navigate('Home');
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);

    const finalMarks = score * 2;

    return (
        <SafeAreaView style={[localStyles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <ScrollView contentContainerStyle={localStyles.scrollContainer} bounces={false}>

                {/* 1. Header (Logo + Title) */}
                <View style={globalStyles.header}>
                    <Image source={require('../../assets/icon.png')} style={localStyles.logoImage} resizeMode="contain" />
                    <Text style={globalStyles.title}>Facilitator Mock Exam App</Text>
                </View>

                {/* 2. Success Message Box */}
                <View style={localStyles.successBox}>
                    <Text style={localStyles.successText}>
                        Examination Submitted Successfully!
                    </Text>
                    <Text style={localStyles.subSuccessText}>
                        Results will be mailed to registered email address
                    </Text>
                </View>

                {/* 4. Footer / Button */}
                <TouchableOpacity style={globalStyles.btnPrimary} onPress={() => navigation.navigate('Home')}>
                    <Text style={globalStyles.btnText}>Return to Home</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'center', // Center content vertically like Home
    },
    logoImage: {
        width: 80,
        height: 80,
        marginBottom: 10,
        borderRadius: 40,
    },
    // Success Box
    successBox: {
        width: '100%',
        backgroundColor: '#e8f5e9',
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#c8e6c9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        borderLeftWidth: 5,
        borderLeftColor: '#2e7d32', // Make it pop like Home welcome box
    },
    successText: {
        color: '#2e7d32',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    subSuccessText: {
        color: '#555',
        fontSize: 13,
        textAlign: 'center',
    },
    // Score
    scoreContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    resultLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    scoreText: {
        fontSize: 20, // Slightly larger
        fontWeight: 'bold',
        color: '#1a7161',
    },
});
