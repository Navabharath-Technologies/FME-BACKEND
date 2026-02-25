import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles';
import { API_URL } from '../config';

// Force refresh
import FloatingHelpButton from '../components/FloatingHelpButton';

export default function ProgramDetailsScreen({ route, navigation }) {
    // Extract user details passed from previous screens
    const { name, email, phone, programId } = route.params || {};

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar style="dark" translucent />
            <ScrollView contentContainerStyle={localStyles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* App Header with Logo */}
                <View style={localStyles.header}>
                    <Image source={require('../../assets/icon.png')} style={localStyles.logoImage} resizeMode="contain" />
                    <Text style={localStyles.title}>Facilitator Mock Exam App</Text>
                </View>

                {/* Banner */}
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
                        style={localStyles.pdfLinkContainer}
                        onPress={() => {
                            const pdfUrl = `${API_URL}/public/Study_Material.pdf`;
                            Linking.openURL(pdfUrl).catch(err => {
                                console.error('Failed to open PDF:', err);
                                Alert.alert('Error', 'Could not open the PDF.');
                            });
                        }}
                    >
                        <Text style={localStyles.pdfLinkText}>Study_Material (PDF)</Text>
                    </TouchableOpacity>

                    {/* Next Button */}
                    <TouchableOpacity
                        style={localStyles.nextButton}
                        onPress={() => navigation.navigate('Questions', { name, email, phone, programId })}
                    >
                        <Text style={localStyles.nextButtonText}>NEXT &gt;&gt;</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>

            <FloatingHelpButton />
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#fff',
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
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
    headerBanner: {
        backgroundColor: '#1f7158',
        paddingVertical: 14,
        paddingHorizontal: 20,
        width: '100%',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    container: {
        padding: 20,
    },
    card: {
        backgroundColor: '#eaf4eb', // Match screenshot pale green
        borderRadius: 6,
        padding: 18,
        marginBottom: 20,
    },
    row: {
        marginBottom: 14,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0d6b1d', // Match screenshot dark green label
        marginBottom: 4,
    },
    value: {
        fontSize: 14,
        color: '#222', // Almost black
    },
    pdfLinkContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    pdfLinkText: {
        color: '#1a7161',
        fontWeight: '600',
        textDecorationLine: 'underline',
        fontSize: 14,
    },
    nextButton: {
        backgroundColor: '#1f7158',
        paddingVertical: 16,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 40,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    helpContainer: {
        alignItems: 'flex-end',
        position: 'relative',
        height: 50, // To give the absolute floating button space to render without cutting
    },
});
