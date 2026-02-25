import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles';
import { API_URL } from '../config';
import FloatingHelpButton from '../components/FloatingHelpButton';
import LogoLoader from '../components/LogoLoader';

export default function ExaminationScreen({ route, navigation }) {
    const { name, email: loggedInEmail, phone: loggedInPhone } = route.params || {};

    const [programId, setProgramId] = useState('ZEDTP10264');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);



    const handleNext = async () => {
        if (!email || !phone || !programId) {
            Alert.alert('Error', 'Please fill all required fields(*).');
            return;
        }

        // Validate against logged-in credentials
        if (email.toLowerCase() !== loggedInEmail?.toLowerCase()) {
            Alert.alert('Error', 'Email ID does not match your login credentials.');
            return;
        }

        if (phone !== loggedInPhone) {
            Alert.alert('Error', 'Mobile Number does not match your login credentials.');
            return;
        }

        // Proceed directly to Program Details (Skipping Phone OTP)
        navigation.navigate('ProgramDetails', {
            name,
            email,
            phone,
            programId
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar style="dark" translucent />
            <ScrollView contentContainerStyle={localStyles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* App Header with Logo */}
                <View style={localStyles.header}>
                    <Image source={require('../../assets/icon.png')} style={localStyles.logoImage} resizeMode="contain" />
                    <Text style={localStyles.title}>Facilitator Mock Exam App</Text>
                </View>

                <View style={localStyles.formContainer}>

                    {/* Email Field */}
                    <View style={localStyles.inputGroup}>
                        <Text style={localStyles.label}>Email ID <Text style={localStyles.required}>*</Text></Text>
                        <TextInput
                            style={localStyles.input}
                            value={email}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/[^a-zA-Z0-9@.]/g, '').toLowerCase();
                                setEmail(cleaned);
                            }}
                            placeholder="Enter Email ID"
                            placeholderTextColor="#ccc"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Mobile Field */}
                    <View style={localStyles.inputGroup}>
                        <Text style={localStyles.label}>Mobile Number <Text style={localStyles.required}>*</Text></Text>
                        <TextInput
                            style={localStyles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter Mobile Number"
                            placeholderTextColor="#ccc"
                            keyboardType="phone-pad"
                        />
                    </View>

                    {/* Programme ID Field */}
                    <View style={localStyles.inputGroup}>
                        <Text style={localStyles.label}>Programme ID <Text style={localStyles.required}>*</Text></Text>
                        <TextInput
                            style={[localStyles.input, localStyles.disabledInput]}
                            value={programId}
                            onChangeText={setProgramId}
                            editable={false}
                        />
                    </View>

                    {/* Next Button */}
                    <TouchableOpacity style={localStyles.nextButton} onPress={handleNext}>
                        <Text style={localStyles.nextButtonText}>NEXT &gt;&gt;</Text>
                    </TouchableOpacity>

                </View>

            </ScrollView >

            <FloatingHelpButton />
            <LogoLoader visible={loading} />
        </SafeAreaView>
    );

}

const localStyles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    header: {
        alignItems: 'center',
        paddingTop: 30,
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
    formContainer: {
        paddingHorizontal: 25,
        paddingTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    required: {
        color: 'red',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        padding: 14,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#fff',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#555',
    },
    nextButton: {
        backgroundColor: '#1f7158',
        paddingVertical: 16,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    helpContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        position: 'relative',
        minHeight: 120, // Add clear space at the bottom to offset the negative margin of the help button
    },
});

