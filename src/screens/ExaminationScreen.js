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
            <ScrollView contentContainerStyle={localStyles.scrollContainer}>

                {/* App Header with Logo */}
                <View style={globalStyles.header}>
                    <Image source={require('../../assets/icon.png')} style={localStyles.logoImage} resizeMode="contain" />
                    <Text style={globalStyles.title}>Facilitator Mock Exam App</Text>
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
                            editable={false} // Assuming default ID is fixed or pre-filled?
                        />
                    </View>

                    {/* Next Button */}
                    <TouchableOpacity style={localStyles.nextButton} onPress={handleNext}>
                        <Text style={localStyles.nextButtonText}>Next &gt;&gt;</Text>
                    </TouchableOpacity>


                </View>
            </ScrollView >

            {/* Dynamic Help Button */}
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
    headerBanner: {
        backgroundColor: '#1a7161', // Brand Color
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 40,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center', // Centered title
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    required: {
        color: 'red',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 10,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#fff',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#777',
    },
    nextButton: {
        backgroundColor: '#1a7161', // Matched with Home/Global Primary
        paddingVertical: 15,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
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
    logoImage: {
        width: 80,
        height: 80,
        marginBottom: 10,
        borderRadius: 40,
    },
});

