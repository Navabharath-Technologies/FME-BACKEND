import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, BackHandler, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingHelpButton from '../components/FloatingHelpButton';

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
        <SafeAreaView style={localStyles.container}>
            <StatusBar style="dark" translucent />
            <ScrollView contentContainerStyle={localStyles.scrollContainer} bounces={false} showsVerticalScrollIndicator={false}>

                {/* header */}
                <View style={localStyles.header}>
                    <Image source={require('../../assets/icon.png')} style={localStyles.logoImage} resizeMode="contain" />
                    <Text style={localStyles.title}>Facilitator Mock Exam App</Text>
                </View>

                <View style={localStyles.content}>
                    {/* Success Message Box */}
                    <View style={localStyles.successBox}>
                        <Text style={localStyles.successText}>
                            Examination Submitted Successfully!
                        </Text>
                        <Text style={localStyles.subSuccessText}>
                            Results will be mailed to registered email address
                        </Text>
                    </View>

                    {/* Return Button */}
                    <TouchableOpacity style={localStyles.homeButton} onPress={() => navigation.navigate('Home')}>
                        <Text style={localStyles.homeButtonText}>RETURN TO HOME</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <FloatingHelpButton />

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
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    logoImage: {
        width: 80,
        height: 90,
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a7161',
        textAlign: 'center',
    },
    content: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    successBox: {
        width: '100%',
        backgroundColor: '#eaf4eb',
        paddingVertical: 25,
        paddingHorizontal: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#c8e6c9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        borderLeftWidth: 5,
        borderLeftColor: '#0d6b1d', // matches inner brand color
    },
    successText: {
        color: '#0d6b1d',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subSuccessText: {
        color: '#444',
        fontSize: 13,
        textAlign: 'center',
    },
    homeButton: {
        backgroundColor: '#1f7158',
        paddingVertical: 16,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    homeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
