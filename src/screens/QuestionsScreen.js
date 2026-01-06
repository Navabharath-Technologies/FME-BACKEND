import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Modal, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles';
import { API_URL } from '../config';

import LogoLoader from '../components/LogoLoader';

export default function QuestionsScreen({ navigation, route }) {
    const { name, email, phone, programId } = route.params || {};

    const [questions, setQuestions] = useState([]);
    const [page, setPage] = useState(0); // Current Page, 0-indexed
    const QUESTIONS_PER_PAGE = 10;

    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitModalVisible, setSubmitModalVisible] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await fetch(`${API_URL}/api/questions`);
            const data = await response.json();
            if (response.ok) {
                setQuestions(data);
            } else {
                Alert.alert('Error', 'Failed to load questions.');
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            Alert.alert('Error', 'Could not connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, optionKey) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionKey
        }));
    };

    const scrollViewRef = React.useRef(null);

    const handleNextPage = () => {
        // Validate that all questions on the current page are answered
        const startIndex = page * QUESTIONS_PER_PAGE;
        const currentPageQuestions = questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
        const allAnswered = currentPageQuestions.every(q => answers[q.id]);

        if (!allAnswered) {
            Alert.alert('Incomplete', 'Please answer all questions on this page before proceeding.');
            return;
        }

        const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
        if (page < totalPages - 1) {
            setPage(page + 1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        } else {
            handleSubmit();
        }
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(page - 1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
    };

    const handleSubmit = () => {
        setSubmitModalVisible(true);
    };

    const calculateAndNavigate = () => {
        setSubmitModalVisible(false);
        // No score calculation here, just pass data to Review Screen
        navigation.navigate('Review', { questions, userAnswers: answers, name, email, phone });
    };

    if (loading) {
        return (
            <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <LogoLoader visible={true} />
            </View>
        );
    }

    if (questions.length === 0) {
        return (
            <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>No questions available.</Text>
            </View>
        );
    }

    // Pagination Logic
    const startIndex = page * QUESTIONS_PER_PAGE;
    const currentQuestions = questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
    const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

    return (
        <SafeAreaView style={localStyles.safeArea}>
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={localStyles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header with Logo and Tagline */}
                <View style={[globalStyles.header, { marginTop: 40, marginBottom: 10, alignItems: 'center' }]}>
                    <Image source={require('../../assets/icon.png')} style={localStyles.logoImage} resizeMode="contain" />
                    <Text style={globalStyles.title}>Facilitator Mock Exam App</Text>
                </View>

                {currentQuestions.map((q, index) => {
                    const actualIndex = startIndex + index + 1;
                    const userAns = answers[q.id];

                    return (
                        <View key={q.id} style={localStyles.card}>
                            {/* Green Header */}
                            <View style={localStyles.cardHeader}>
                                <Text style={localStyles.questionText}>
                                    <Text style={localStyles.qNumText}>Q{actualIndex}. </Text>
                                    {q.question_text || q.question}
                                </Text>
                            </View>

                            {/* White Body with Options */}
                            <View style={localStyles.cardBody}>
                                {['A', 'B', 'C', 'D', 'E'].map(optKey => {
                                    const optText = q[`option_${optKey.toLowerCase()}`];
                                    if (!optText) return null;

                                    const isSelected = userAns === optKey;

                                    return (
                                        <TouchableOpacity
                                            key={optKey}
                                            style={localStyles.optionRow}
                                            onPress={() => handleOptionSelect(q.id, optKey)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[localStyles.radioCircle, isSelected && localStyles.radioSelected]}>
                                                {isSelected && <Text style={localStyles.checkMark}>✓</Text>}
                                            </View>

                                            <Text style={localStyles.optionText}>
                                                {optText}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    );
                })}

                <View style={localStyles.navigationContainer}>
                    <TouchableOpacity
                        style={[localStyles.navButton, { backgroundColor: '#66bb6a' }]} // Lighter green for PREV match
                        onPress={handlePreviousPage}
                        disabled={page === 0}
                    >
                        <Text style={localStyles.navButtonText}>PREV</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[localStyles.navButton, { backgroundColor: '#66bb6a' }]} // Lighter green for NEXT match
                        onPress={handleNextPage}
                    >
                        <Text style={localStyles.navButtonText}>
                            {page === totalPages - 1 ? 'SUBMIT' : 'NEXT'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Custom Submit Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={submitModalVisible}
                    onRequestClose={() => setSubmitModalVisible(false)}
                >
                    <View style={localStyles.modalOverlay}>
                        <View style={localStyles.modalContent}>
                            {/* Logo Centered */}
                            <Image source={require('../../assets/icon.png')} style={localStyles.modalLogo} resizeMode="contain" />

                            <Text style={localStyles.modalTitle}>Submit Answers</Text>
                            <Text style={localStyles.modalText}>Are you sure you want to finish and submit?</Text>

                            <View style={localStyles.modalButtons}>
                                <TouchableOpacity onPress={() => setSubmitModalVisible(false)}>
                                    <Text style={localStyles.modalCancel}>CANCEL</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={calculateAndNavigate}>
                                    <Text style={localStyles.modalSubmit}>SUBMIT</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: '#fff', // White background
        paddingBottom: 40,
        paddingTop: 10,
    },
    card: {
        marginHorizontal: 15,
        marginBottom: 20,
        borderRadius: 4,
        overflow: 'hidden', // Ensures header respects border radius
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 2, // Shadow for android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        backgroundColor: '#fff',
    },
    cardHeader: {
        backgroundColor: '#2e8b57', // Sea Green / Dark Green matching screenshot
        padding: 15,
    },
    cardBody: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    qNumText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    questionText: {
        fontSize: 15,
        color: '#fff', // White text on green header
        lineHeight: 22,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align top if multiline text
        paddingVertical: 12,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#e0e0e0', // Light grey for unselected
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2, // Align with text top
    },
    radioSelected: {
        backgroundColor: '#4db6ac', // Teal/Cyan color for selected
    },
    checkMark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    optionText: {
        fontSize: 14, // Slightly smaller per screenshot
        color: '#333',
        flex: 1, // Wrap text
        lineHeight: 20,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Center buttons or space between? Screenshot implies buttons are at bottom
        gap: 20, // Space between buttons
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
    },
    navButton: {
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 4,
        minWidth: 120,
        alignItems: 'center',
        shadowColor: '#000',
        elevation: 2,
    },
    navButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    logoImage: {
        width: 60,
        height: 60,
        marginBottom: 8,
        borderRadius: 30,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 24,
        width: '100%',
        alignItems: 'center', // Center content
        elevation: 5,
    },
    modalLogo: {
        width: 60,
        height: 60,
        marginBottom: 20,
        borderRadius: 30, // Circular if needed
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    modalText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        gap: 30,
    },
    modalCancel: {
        color: '#1a7161', // Theme Green
        fontWeight: 'bold',
        fontSize: 14,
    },
    modalSubmit: {
        color: '#1a7161', // Theme Green
        fontWeight: 'bold',
        fontSize: 14,
    },
});
