import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles';
import { API_URL } from '../config';
import FloatingHelpButton from '../components/FloatingHelpButton';
import LogoLoader from '../components/LogoLoader';



export default function HomeScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [loading, setLoading] = useState(false);

    // References for inputs to handle 'Next' focus
    const emailRef = React.useRef(null);
    const phoneRef = React.useRef(null);

    const handleSubmit = async () => {
        let valid = true;

        // Validation Logic (Keep existing)
        setNameError('');
        setEmailError('');
        setPhoneError('');

        if (!name) {
            setNameError('Name is required.');
            valid = false;
        }

        if (!email) {
            setEmailError('Email is required.');
            valid = false;
        } else if (!email.toLowerCase().endsWith('@gmail.com')) {
            setEmailError('Please enter a valid Gmail address.');
            valid = false;
        }

        if (!phone) {
            setPhoneError('Mobile Number is required.');
            valid = false;
        } else if (!/^\d{10}$/.test(phone)) {
            setPhoneError('Please enter a valid 10-digit mobile number.');
            valid = false;
        }

        if (!valid) return;

        setLoading(true);
        try {
            console.log('Initiating Email OTP for:', email);
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, otpChannel: 'email' })
            });

            const data = await response.json();
            setLoading(false);

            if (response.ok) {
                // Navigate to OTP Screen
                navigation.navigate('Otp', {
                    phone,
                    email,
                    name
                });
            } else {
                Alert.alert('Error', data.message || 'Failed to send OTP.');
            }

        } catch (error) {
            setLoading(false);
            console.error('API Error:', error);
            Alert.alert('Error', 'Failed to connect to server. Please try again.');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    contentContainerStyle={localStyles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ... Header and Inputs (unchanged) ... */}
                    <View style={globalStyles.header}>
                        <Image source={require('../../assets/icon.png')} style={localStyles.logoImage} resizeMode="contain" />
                        <Text style={globalStyles.title}>Facilitator Mock Exam App</Text>
                    </View>

                    <View style={localStyles.welcomeBox}>
                        <Text style={localStyles.welcomeTitle}>Welcome</Text>
                        <Text style={localStyles.welcomeText}>To proceed, please keep the following ready:</Text>
                        <Text style={localStyles.welcomeList}>1. Your Full Name.</Text>
                        <Text style={localStyles.welcomeList}>2. Registered email Id provided during registration.</Text>
                        <Text style={localStyles.welcomeList}>3. The Mobile Number provided during registration.</Text>
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>ROLE</Text>
                        <TextInput
                            style={[globalStyles.input, { backgroundColor: '#e0e0e0', color: '#555' }]}
                            value="Facilitator"
                            editable={false}
                        />
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>NAME</Text>
                        <TextInput
                            style={[globalStyles.input, nameError ? { borderColor: 'red', borderWidth: 1 } : null]}
                            placeholder="Full Name"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                if (text && !/^[a-zA-Z\s]*$/.test(text)) {
                                    setNameError('Name should not contain special characters.');
                                } else {
                                    setNameError('');
                                }
                            }}
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current?.focus()}
                            blurOnSubmit={false}
                        />
                        {nameError ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{nameError}</Text> : null}
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>EMAIL</Text>
                        <TextInput
                            ref={emailRef}
                            style={[globalStyles.input, emailError ? { borderColor: 'red', borderWidth: 1 } : null]}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={(text) => { setEmail(text); setEmailError(''); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => phoneRef.current?.focus()}
                            blurOnSubmit={false}
                        />
                        {emailError ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{emailError}</Text> : null}
                    </View>

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>MOBILE</Text>
                        <TextInput
                            ref={phoneRef}
                            style={[globalStyles.input, phoneError ? { borderColor: 'red', borderWidth: 1 } : null]}
                            placeholder="Mobile Number"
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text);
                                if (text && !/^\d*$/.test(text)) {
                                    setPhoneError('Phone number should only contain digits.');
                                } else if (text.length > 10) {
                                    setPhoneError('Phone number cannot exceed 10 digits.');
                                } else {
                                    setPhoneError('');
                                }
                            }}
                            keyboardType="phone-pad"
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                        />
                        {phoneError ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{phoneError}</Text> : null}
                    </View>

                    <TouchableOpacity style={globalStyles.btnPrimary} onPress={handleSubmit} disabled={loading}>
                        <Text style={globalStyles.btnText}>{loading ? 'SUBMITTING...' : 'SUBMIT'}</Text>
                    </TouchableOpacity>

                </ScrollView>



                {/* Dynamic Help Button */}
                <FloatingHelpButton />
            </KeyboardAvoidingView>
            <LogoLoader visible={loading} />
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    scrollContainer: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
        justifyContent: 'center',
    },
    welcomeBox: {
        backgroundColor: '#eff9f1',
        borderRadius: 4,
        padding: 15,
        marginBottom: 25,
        borderLeftWidth: 5,
        borderLeftColor: '#1a7161',
    },
    welcomeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#555',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 11,
        color: '#666',
        marginBottom: 4,
    },
    welcomeList: {
        fontSize: 11,
        color: '#666',
        marginLeft: 10,
        marginBottom: 2,
    },
    logoImage: {
        width: 80,
        height: 80,
        marginBottom: 10,
        borderRadius: 40,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#999',
        lineHeight: 24,
    },
    otpTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a7161',
        textAlign: 'center',
        marginBottom: 20,
    },
    messageBox: {
        padding: 10,
        borderRadius: 4,
        marginBottom: 20,
    },
    success: {
        backgroundColor: '#f0ffee',
        borderColor: '#dff0df',
        borderWidth: 1,
    },
    successText: {
        color: '#4caf50',
        fontSize: 12,
        textAlign: 'center',
    },
    warning: {
        backgroundColor: '#fff8e1',
        borderColor: '#faebcc',
        borderWidth: 1,
    },
    warningText: {
        color: '#8a6d3b',
        fontSize: 11,
        textAlign: 'center',
    },
    otpInstruction: {
        textAlign: 'center',
        color: '#555',
        marginBottom: 15,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    otpInput: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        backgroundColor: '#fafafa',
    },
    timerBox: {
        backgroundColor: '#e3f2fd',
        padding: 10,
        borderRadius: 4,
        marginBottom: 15,
        alignItems: 'center',
    },
    timerText: {
        color: '#777',
        fontSize: 12,
    },
});
