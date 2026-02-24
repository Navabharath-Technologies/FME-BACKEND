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
                            maxLength={20}
                            onChangeText={(text) => {
                                // Auto-capitalization: Lowercase everything first -> Capitalize first letter of each word
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
                                // Initials logic: Scan parts of the name
                                // If a part is 2 letters and has NO vowels (likely initials like 'vr', 'sk'), format as 'V R', 'S K'
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

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>EMAIL</Text>
                        <TextInput
                            ref={emailRef}
                            style={[globalStyles.input, emailError ? { borderColor: 'red', borderWidth: 1 } : null]}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={(text) => {
                                // Allow only a-z, 0-9, @, .
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

                    <View style={globalStyles.inputGroup}>
                        <Text style={globalStyles.label}>MOBILE</Text>
                        <TextInput
                            ref={phoneRef}
                            style={[globalStyles.input, phoneError ? { borderColor: 'red', borderWidth: 1 } : null]}
                            placeholder="Mobile Number"
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
