import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../config';
import { globalStyles } from '../styles';
import LogoLoader from '../components/LogoLoader';
import { resetSession } from './QuestionsScreen';

export default function ReviewScreen({ route, navigation }) {
    const { questions, userAnswers, name, email, phone } = route.params || { questions: [], userAnswers: {} };
    // console.log('[ReviewScreen] Rendering with:', { questionsCount: questions?.length, name, email });
    const [isChecked, setIsChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinalSubmit = async () => {
        if (!isChecked) {
            Alert.alert('Confirmation Required', 'Please confirm the checkbox before submitting.');
            return;
        }

        setIsSubmitting(true);

        // Calculate Score
        let score = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correct_answer) {
                score++;
            }
        });

        // Save Score to Backend
        try {
            await fetch(`${API_URL}/api/submit-result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, score, name, questions, userAnswers })
            });
        } catch (error) {
            console.error('Failed to save score:', error);
            // Optionally alert user or just proceed
        }

        setIsSubmitting(false);

        // Clear session so next test starts fresh
        resetSession();

        // Navigate to Result
        navigation.replace('Result', { score, totalQuestions: questions.length, userAnswers, questions, name });
    };

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <StatusBar style="dark" translucent />
            <View style={localStyles.container}>
                <ScrollView contentContainerStyle={localStyles.scrollContainer} stickyHeaderIndices={[1]}>
                    {/* Header with Logo and Tagline */}
                    <View style={localStyles.headerContainer}>
                        <Image source={require('../../assets/icon.png')} style={localStyles.logoImage} resizeMode="contain" />
                        <Text style={globalStyles.title}>Facilitator Mock Exam App</Text>
                    </View>

                    {/* Table Header */}
                    <View style={localStyles.tableBorderTop}>
                        <View style={localStyles.tableHeader}>
                            <Text style={localStyles.headerCol1}>QUESTIONS</Text>
                            <View style={localStyles.verticalLineHeader} />
                            <Text style={localStyles.headerCol2}>SELECTED ANSWER</Text>
                        </View>
                    </View>

                    {/* Table Body */}
                    <View style={localStyles.tableBody}>
                        {(questions || []).map((q, index) => {
                            const userSelectedKey = (userAnswers || {})[q.id];
                            const selectedText = userSelectedKey ? q[`option_${userSelectedKey.toLowerCase()}`] : 'Not Answered';

                            return (
                                <View key={q.id} style={localStyles.tableRow}>
                                    {/* Question Column */}
                                    <View style={localStyles.col1}>
                                        <Text style={localStyles.qText}>
                                            <Text style={{ fontWeight: 'bold' }}>Q{index + 1}.</Text> {q.question_text || q.question}
                                        </Text>
                                    </View>

                                    {/* Divider */}
                                    <View style={localStyles.verticalLine} />

                                    {/* Answer Column */}
                                    <View style={localStyles.col2}>
                                        <Text style={localStyles.aText}>
                                            {selectedText}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Footer with Checkbox and Buttons */}
                    <View style={localStyles.footer}>
                        <TouchableOpacity
                            style={localStyles.checkboxContainer}
                            onPress={() => setIsChecked(!isChecked)}
                            activeOpacity={0.8}
                        >
                            <View style={[localStyles.checkbox, isChecked && localStyles.checkboxChecked]}>
                                {isChecked && <Text style={localStyles.checkmark}>✓</Text>}
                            </View>
                            <Text style={localStyles.checkboxLabel}>
                                I confirm the above and agree to proceed with the information provided.
                            </Text>
                        </TouchableOpacity>

                        <View style={localStyles.buttonRow}>
                            <TouchableOpacity
                                style={[localStyles.button, localStyles.prevButton]}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={localStyles.buttonText}>PREV</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[localStyles.button, localStyles.submitButton]}
                                onPress={handleFinalSubmit}
                            >
                                <Text style={localStyles.buttonText}>FINAL SUBMIT</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                </ScrollView>
            </View>

            <LogoLoader visible={isSubmitting} />

        </SafeAreaView >
    );
}

const localStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#fff',
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: '#fff',
    },
    // Table Styles
    tableBorderTop: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0', // Light Grey Border
        backgroundColor: '#fff',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 15,
        paddingHorizontal: 15,
        alignItems: 'stretch',
    },
    headerCol1: {
        flex: 0.55,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase',
    },
    verticalLineHeader: {
        width: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 10,
    },
    headerCol2: {
        flex: 0.45,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#000',
        textTransform: 'uppercase',
        paddingLeft: 5,
    },
    tableBody: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0', // Grid line
        paddingVertical: 15,
        paddingHorizontal: 15,
        alignItems: 'stretch',
    },
    verticalLine: {
        width: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 10,
    },
    logoImage: {
        width: 80,
        height: 80,
        marginBottom: 10,
        borderRadius: 40,
    },
    col1: {
        flex: 0.55,
    },
    col2: {
        flex: 0.45,
        justifyContent: 'center',
        paddingLeft: 5,
    },
    qText: {
        fontSize: 14,
        color: '#000',
        lineHeight: 22,
    },
    aText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        paddingBottom: 40,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#999',
        borderRadius: 3,
        marginRight: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        borderColor: '#1a7161',
        backgroundColor: '#1a7161',
    },
    checkmark: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 4,
        alignItems: 'center',
    },
    prevButton: {
        backgroundColor: '#408253',
    },
    submitButton: {
        backgroundColor: '#408253',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
        textTransform: 'uppercase',
    },
    // Loader Styles
    loaderOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)', // Dark semi-transparent
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContent: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 10,
    },
    loaderImage: {
        width: 80,
        height: 80,
        marginBottom: 15,
        borderRadius: 40,
    },
    loaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a7161',
    }
});
