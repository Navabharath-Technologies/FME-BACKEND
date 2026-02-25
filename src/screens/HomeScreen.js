import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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

    const validatePhone = (num) => {
        // 1. Must start with 6,7,8,9
        if (!/^[6-9]/.test(num)) return "please enter valid phone number.";

        // 2. Must be digits only (already checked in regex, but safe to keep)
        if (!/^\d+$/.test(num)) return "Phone number should only contain digits.";

        // 3. Length check
        if (num.length > 10) return "Phone number cannot exceed 10 digits.";
        if (num.length === 10) {
            // 4. No continuous ascending (e.g., 123456) or descending (e.g., 654321) of more than 5 digits ? 
            // User asked: "not be in continues numbers like accending or descending"
            // Let's check for the whole string or significant chunks.
            // A simple way is to check if "0123456789" includes the substring or reversed.

            const ascending = "0123456789";
            const descending = "9876543210";

            // Allow small sequences? User said "continues numbers", usually implies the whole or large part.
            // Let's allow max 5 sequential digits. If 6 or more, reject.
            // Actually, for 10 digits, "1234567890" is the main catch.
            if (ascending.includes(num)) return "Invalid phone number sequence.";
            if (descending.includes(num)) return "Invalid phone number sequence.";

            // 5. Repeated digits (Dummy) e.g., 8888888888
            if (/^(\d)\1+$/.test(num)) return "Invalid phone number (repeated digits).";

            // 6. High frequency of a single digit (e.g., 9000000000, 8881888888)
            const digitCounts = {};
            for (let char of num) {
                digitCounts[char] = (digitCounts[char] || 0) + 1;
            }
            if (Object.values(digitCounts).some(count => count > 7)) {
                return "Invalid phone number (too many similar digits).";
            }

            // 7. Repeating patterns (e.g., 9898989898, 6786786786, 9876598765)
            // Check patterns of length 2, 3, 4, 5
            for (let len = 2; len <= 5; len++) {
                const pattern = num.substring(0, len);
                // Create a string by repeating the pattern enough times to reach length 10
                const repeated = pattern.repeat(Math.ceil(10 / len)).slice(0, 10);
                if (repeated === num) {
                    return "Invalid phone number (repeating pattern).";
                }
            }
        }

        return "";
    };

    const handleSubmit = async () => {
        let valid = true;

        // Validation Logic (Keep existing)
        setNameError('');
        setEmailError('');
        setPhoneError('');

        if (!name) {
            setNameError('Name is required.');
            valid = false;
        } else if (!/^[a-zA-Z\s]*$/.test(name)) {
            setNameError('Name should not contain special characters.');
            valid = false;
        } else if (/(.)\1{2,}/.test(name)) {
            setNameError('Name containing continuous repeated characters are not allowed.');
            valid = false;
        } else if (name.length > 20) {
            setNameError('Name cannot exceed 20 characters.');
            valid = false;
        }

        if (!email) {
            setEmailError('Email is required.');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Please enter a valid email address.');
            valid = false;
        }

        if (!phone) {
            setPhoneError('Mobile Number is required.');
            valid = false;
        } else if (phone.length !== 10) {
            setPhoneError('Please enter a valid 10-digit mobile number.');
            valid = false;
        } else {
            const phoneValError = validatePhone(phone);
            if (phoneValError) {
                setPhoneError(phoneValError);
                valid = false;
            }
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar style="dark" translucent />
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    contentContainerStyle={localStyles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={localStyles.header}>
                        <Image source={require('../../assets/icon.png')} style={localStyles.logoImage} resizeMode="contain" />
                        <Text style={localStyles.title}>Facilitator Mock Exam App</Text>
                    </View>

                    <View style={localStyles.welcomeBox}>
                        <Text style={localStyles.welcomeTitle}>Welcome</Text>
                        <Text style={localStyles.welcomeText}>To proceed, please keep the following ready:</Text>
                        <Text style={localStyles.welcomeList}>1. Your Full Name.</Text>
                        <Text style={localStyles.welcomeList}>2. Registered email Id provided during registration.</Text>
                        <Text style={localStyles.welcomeList}>3. The Mobile Number provided during registration.</Text>
                    </View>

                    <View style={localStyles.inputGroup}>
                        <Text style={localStyles.label}>ROLE</Text>
                        <TextInput
                            style={[localStyles.input, { backgroundColor: '#e2e2e2', color: '#333' }]}
                            value="Facilitator"
                            editable={false}
                        />
                    </View>

                    <View style={localStyles.inputGroup}>
                        <Text style={localStyles.label}>NAME</Text>
                        <TextInput
                            style={[localStyles.input, nameError ? { borderColor: 'red' } : null]}
                            placeholder="Full Name"
                            placeholderTextColor="#ccc"
                            value={name}
                            maxLength={20}
                            onChangeText={(text) => {
                                let newText = text.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());
                                setName(newText);
                                if (newText && !/^[a-zA-Z\s]*$/.test(newText)) {
                                    setNameError('Name should not contain special characters.');
                                } else if (/(.)\1{2,}/.test(newText)) {
                                    setNameError('Name containing continuous repeated characters are not allowed.');
                                } else {
                                    setNameError('');
                                }
                            }}
                            onBlur={() => {
                                let parts = name.split(' ');
                                parts = parts.map(p => {
                                    if (p.length === 2 && !/[aeiouAEIOU]/.test(p)) {
                                        return p.split('').join(' ').toUpperCase();
                                    }
                                    return p;
                                });
                                setName(parts.join(' '));
                            }}
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current?.focus()}
                            blurOnSubmit={false}
                        />
                        {nameError ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{nameError}</Text> : null}
                    </View>

                    <View style={localStyles.inputGroup}>
                        <Text style={localStyles.label}>EMAIL</Text>
                        <TextInput
                            ref={emailRef}
                            style={[localStyles.input, emailError ? { borderColor: 'red' } : null]}
                            placeholder="Email Address"
                            placeholderTextColor="#ccc"
                            value={email}
                            onChangeText={(text) => {
                                const cleaned = text.replace(/[^a-zA-Z0-9@.]/g, '').toLowerCase();
                                setEmail(cleaned);
                                setEmailError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            returnKeyType="next"
                            onSubmitEditing={() => phoneRef.current?.focus()}
                            blurOnSubmit={false}
                        />
                        {emailError ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{emailError}</Text> : null}
                    </View>

                    <View style={localStyles.inputGroup}>
                        <Text style={localStyles.label}>MOBILE</Text>
                        <TextInput
                            ref={phoneRef}
                            style={[localStyles.input, phoneError ? { borderColor: 'red' } : null]}
                            placeholder="Mobile Number"
                            placeholderTextColor="#ccc"
                            value={phone}
                            onChangeText={(text) => {
                                setPhone(text);
                                const errorMsg = validatePhone(text);
                                setPhoneError(errorMsg);
                            }}
                            keyboardType="phone-pad"
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                        />
                        {phoneError ? <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{phoneError}</Text> : null}
                    </View>

                    <View style={localStyles.submitButtonContainer}>
                        <TouchableOpacity style={localStyles.btnPrimary} onPress={handleSubmit} disabled={loading}>
                            <Text style={localStyles.btnText}>{loading ? 'SUBMITTING...' : 'SUBMIT'}</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
            <LogoLoader visible={loading} />
            <FloatingHelpButton />
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    scrollContainer: {
        paddingHorizontal: 25,
        paddingTop: 40,
        paddingBottom: 40,
        backgroundColor: '#ffffff',
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoImage: {
        width: 70,
        height: 80,
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a7161',
        textAlign: 'center',
    },
    welcomeBox: {
        backgroundColor: '#f1f8f3',
        borderRadius: 4,
        padding: 15,
        paddingLeft: 20,
        marginBottom: 25,
        borderLeftWidth: 4,
        borderLeftColor: '#1a7161',
    },
    welcomeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 12,
        color: '#555',
        marginBottom: 6,
    },
    welcomeList: {
        fontSize: 12,
        color: '#555',
        marginBottom: 3,
        paddingLeft: 5,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        letterSpacing: 0.5,
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
    btnPrimary: {
        backgroundColor: '#1f7158',
        padding: 16,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
    },
    btnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    submitButtonContainer: {
        position: 'relative',
        marginTop: 10,
        marginBottom: 45, // Extra space below for the lowered overlapping help button
    },
});
