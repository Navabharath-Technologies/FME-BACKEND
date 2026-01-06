import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles';
import { API_URL } from '../config';
import FloatingHelpButton from '../components/FloatingHelpButton';

import LogoLoader from '../components/LogoLoader';

export default function OtpScreen({ route, navigation }) {
    const { email, phone, name } = route.params || {};
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const inputs = useRef([]);
    const [resendEnabled, setResendEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setResendEnabled(true);
            if (interval) clearInterval(interval);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [timer]);

    const handleResend = async () => {
        setResendEnabled(false);
        setTimer(60);
        try {
            await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, phone: '0000000000', otpChannel: 'email' }) // Use phone if needed, but email is primary here
            });
            Alert.alert('Success', 'OTP has been resent to your email.');
        } catch (error) {
            Alert.alert('Error', 'Failed to resend OTP.');
            setResendEnabled(true);
            setTimer(0);
        }
    };

    const handleChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 3) {
            inputs.current[index + 1].focus();
        }
    };

    const handleBackspace = (text, index) => {
        if (!text && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 4) {
            Alert.alert('Error', 'Please enter a 4-digit code.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone, otp: otpString })
            });
            const data = await response.json();

            setLoading(false);
            if (response.ok && data.success) {
                navigation.navigate('Permissions', { name, email, phone });
            } else {
                Alert.alert('Invalid OTP', 'The OTP you entered is incorrect. Please try again.');
            }
        } catch (error) {
            setLoading(false);
            console.error(error);
            Alert.alert('Error', 'Server error during verification.');
        }
    };

    return (
        <SafeAreaView style={[globalStyles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <View style={{ alignItems: 'center' }}>
                <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.headerTitle}>OTP Verification</Text>

            <View style={[styles.messageBox, styles.success]}>
                <Text style={styles.successText}>OTP is successfully sent to {email}, if not received, please check your junk/spam.</Text>
            </View>

            <Text style={styles.instruction}>Enter the 4-digit code sent to your email.</Text>
            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        style={styles.otpInput}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === 'Backspace') handleBackspace(digit, index);
                        }}
                        ref={(ref) => inputs.current[index] = ref}
                    />
                ))}
            </View>

            <View style={styles.timerBox}>
                {resendEnabled ? (
                    <TouchableOpacity onPress={handleResend}>
                        <Text style={[styles.timerText, { color: '#1a7161', fontWeight: 'bold' }]}>Resend OTP</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.timerText}>Resend OTP will be activated after {timer} secs</Text>
                )}
            </View>

            <View style={[styles.messageBox, styles.warning]}>
                <Text style={styles.warningText}>If you have not received the OTP, then please re-check the Email ID.</Text>
            </View>

            <TouchableOpacity style={globalStyles.btnPrimary} onPress={handleVerify}>
                <Text style={globalStyles.btnText}>VERIFY CODE</Text>
            </TouchableOpacity>
            {/* Dynamic Help Button */}
            <FloatingHelpButton />
            <LogoLoader visible={loading} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a7161',
        marginBottom: 20,
        textAlign: 'center',
    },
    instruction: {
        textAlign: 'center',
        color: '#555',
        marginBottom: 30,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        backgroundColor: '#fafafa',
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
        fontSize: 11,
    },
    warning: {
        backgroundColor: '#fff8e1',
        borderColor: '#faebcc',
        borderWidth: 1,
    },
    warningText: {
        color: '#8a6d3b',
        fontSize: 11,
    },
    timerBox: {
        backgroundColor: '#e3f2fd',
        padding: 10,
        borderRadius: 4,
        marginBottom: 20,
        alignItems: 'center',
    },
    timerText: {
        color: '#777',
        fontSize: 12,
    },
    logoImage: {
        width: 80,
        height: 80,
        marginBottom: 20,
        borderRadius: 40,
    },
});
