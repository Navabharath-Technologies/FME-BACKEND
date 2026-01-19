import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    logoText: {
        color: '#999',
        fontSize: 10,
        fontWeight: '600',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a7161',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#444',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#fff',
        fontSize: 14,
        color: '#333',
    },
    btnPrimary: {
        width: '100%',
        backgroundColor: '#1a7161',
        padding: 15,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    btnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    // Standardized Header Label (Green Pill)
    headerLabelWrapper: {
        backgroundColor: '#1a7161',
        width: '90%', // Or just paddingHorizontal
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        alignSelf: 'center', // Ensure it centers itself in parent
    },
    headerLabelText: {
        fontSize: 18, // Consistent size
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
});
