import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, Platform, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles';
import { API_URL } from '../config';

// Force refresh
import FloatingHelpButton from '../components/FloatingHelpButton';

export default function ProgramDetailsScreen({ route, navigation }) {
    // Extract user details passed from previous screens
    const { name, email, phone, programId } = route.params || {};

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
            <ScrollView contentContainerStyle={localStyles.scrollContainer}>
                {/* App Header with Logo */}
                <View style={[globalStyles.header, { marginBottom: 10 }]}>
                    <Image source={require('../../assets/icon.png')} style={localStyles.logoImage} resizeMode="contain" />
                    <Text style={globalStyles.title}>Facilitator Mock Exam App</Text>
                </View>

                <View style={localStyles.headerBanner}>
                    <Text style={localStyles.headerTitle}>APPLICANT DETAILS</Text>
                </View>

                <View style={localStyles.container}>

                    {/* Applicant Details Card */}
                    <View style={localStyles.card}>
                        <View style={localStyles.row}>
                            <Text style={localStyles.label}>Applicant Name</Text>
                            <Text style={localStyles.value}>{name || 'N/A'}</Text>
                        </View>
                        <View style={localStyles.row}>
                            <Text style={localStyles.label}>Applicant Email</Text>
                            <Text style={localStyles.value}>{email || 'N/A'}</Text>
                        </View>
                        <View style={localStyles.row}>
                            <Text style={localStyles.label}>Applicant Mobile</Text>
                            <Text style={localStyles.value}>{phone || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Programme Details Card */}
                    <View style={localStyles.card}>
                        <View style={localStyles.row}>
                            <Text style={localStyles.label}>ProgrammeId</Text>
                            <Text style={localStyles.value}>{programId || 'ZEDTP10264'}</Text>
                        </View>
                        <View style={localStyles.row}>
                            <Text style={localStyles.label}>Programme Name</Text>
                            <Text style={localStyles.value}>ZED Facilitator Mock Exam</Text>
                        </View>
                        <View style={localStyles.row}>
                            <Text style={localStyles.label}>Venue</Text>
                            <Text style={localStyles.value}>Virtual</Text>
                        </View>

                    </View>
                    {/* Link to Access PDF */}
                    <TouchableOpacity
                        style={{ marginTop: 20, alignItems: 'center' }}
                        onPress={() => {
                            const pdfUrl = `${API_URL}/public/Study_Material.pdf`;
                            Linking.openURL(pdfUrl).catch(err => {
                                console.error('Failed to open PDF:', err);
                                Alert.alert('Error', 'Could not open the PDF.');
                            });
                        }}
                    >
                        <Text style={{ color: '#1a7161', textDecorationLine: 'underline', fontWeight: 'bold' }}>
                            Study_Material (PDF)
                        </Text>
                    </TouchableOpacity>
                    {/* Next Button */}
                    <TouchableOpacity style={localStyles.nextButton} onPress={() => navigation.navigate('Questions', { name, email, phone, programId })}>
                        <Text style={localStyles.nextButtonText}>Next &gt;&gt;</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            {/* Dynamic Help Button */}
            <FloatingHelpButton />
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    headerBanner: {
        backgroundColor: '#1a7161', // Brand Color
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 0,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    container: {
        padding: 20,
    },
    card: {
        backgroundColor: '#e8f5e9', // Light green background matching screenshot
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    row: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2e7d32', // Darker green for labels
        marginBottom: 2,
    },
    value: {
        fontSize: 14,
        color: '#444444ff',
    },
    link: {
        fontSize: 12,
        color: '#1a7161',
        textDecorationLine: 'underline',
    },
    logoImage: {
        width: 80,
        height: 80,
        marginBottom: 10,
        borderRadius: 40,
    },
    nextButton: {
        backgroundColor: '#1a7161', // Matched with Home/Global Primary
        paddingVertical: 15,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30, // Extra bottom margin for scroll
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
