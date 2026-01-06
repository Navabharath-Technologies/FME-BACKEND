import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

const Certificate = ({ name, score }) => {
    const finalMarks = score * 2;
    const date = new Date();
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

    return (
        <View style={styles.certificateContainer}>
            <ImageBackground
                source={require('../../assets/certificate_bg.png')}
                style={styles.certificateBg}
                imageStyle={{ borderRadius: 10 }}
                resizeMode="stretch"
            >
                <View style={styles.overlayContent}>
                    <Text style={styles.certText}>
                        This is to certify that
                    </Text>
                    <Text style={styles.certName}>
                        {name || 'Participant'}
                    </Text>
                    <Text style={styles.certTextBody}>
                        has successfully completed Facilitator Mock Exam through FME Application and scored
                    </Text>
                    <Text style={[styles.certScore, { color: finalMarks > 80 ? '#2e7d32' : '#d32f2f' }]}>
                        {finalMarks} out of 100
                    </Text>
                </View>

                {/* Issued Date Label */}
                <View style={styles.issuedLabel}>
                    <Text style={styles.issuedText}>Issued on: {formattedDate}</Text>
                </View>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    certificateContainer: {
        width: '100%',
        height: 260, // Landscape height
        marginBottom: 30,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        backgroundColor: '#fff',
    },
    certificateBg: {
        width: '100%',
        height: '100%',
    },
    overlayContent: {
        position: 'absolute',
        top: '52%',
        left: '38%',
        width: '58%',
        alignItems: 'center',
        padding: 5,
    },
    certText: {
        fontSize: 10,
        color: '#000',
        marginBottom: 4,
        fontStyle: 'italic',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    certName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    certTextBody: {
        fontSize: 9,
        color: '#000',
        marginBottom: 4,
        textAlign: 'center',
        lineHeight: 12,
        fontWeight: '600',
    },
    certScore: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#d32f2f',
        textAlign: 'center',
    },
    issuedLabel: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    issuedText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default Certificate;
