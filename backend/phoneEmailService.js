const fetch = require('node-fetch');

// Phone.Email API Configuration
// Phone.Email API Configuration
const PHONE_EMAIL_API_URL = 'https://api.phone.email/v1/sendmail';

/**
 * Sends an OTP via Phone.Email REST API
 * @param {string} phoneNumber - Recipient's phone number
 * @param {string} otp - The 4-digit OTP
 * @returns {Promise<boolean>}
 */
async function sendPhoneEmailOtp(phoneNumber, otp) {
    const API_KEY = process.env.PHONE_EMAIL_API_KEY;
    const FROM_PHONE_NO = process.env.PHONE_EMAIL_FROM_PHONE;
    const FROM_COUNTRY_CODE = process.env.PHONE_EMAIL_FROM_COUNTRY || '+91';
    try {
        if (!API_KEY || !FROM_PHONE_NO) {
            console.error('MISSING CONFIG: PHONE_EMAIL_API_KEY or PHONE_EMAIL_FROM_PHONE is missing in .env');
            return false;
        }

        // Simple parsing of To Country/Phone
        // Assuming phoneNumber might include country code. 
        // For robustness, let's strip non-digits.
        const cleanPhone = phoneNumber.replace(/\D/g, '');

        // Naive split for demo: assume input includes country code
        // Better to ask user ensuring strict format, but flexibility helps.
        // Let's assume the user's phone input includes country code, or default to +91 if length is 10.
        let toCountryCode = '+91';
        let toPhoneNo = cleanPhone;

        if (cleanPhone.length > 10) {
            // Very naive check: take first 2 digits as code (e.g. 91)
            // This is fragile. Ideally use a library or require strict input.
            // keeping it simple:
            // If it starts with 91, cut it.
            if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
                toCountryCode = '+91';
                toPhoneNo = cleanPhone.substring(2);
            }
        }

        const payload = {
            apiKey: API_KEY,
            fromCountryCode: FROM_COUNTRY_CODE,
            fromPhoneNo: FROM_PHONE_NO,
            toCountrycode: toCountryCode,
            toPhoneNo: toPhoneNo,
            subject: `OTP Verification`,
            messageBody: `Your OTP is ${otp}`
        };

        console.log('Sending Phone.Email request:', JSON.stringify(payload, null, 2));

        const response = await fetch(PHONE_EMAIL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log('Response Status:', response.status);
        console.log('Response Body:', responseText);

        try {
            const result = JSON.parse(responseText);
            // Note: Check actual success field in their response. 
            // Assuming 200 OK means sent.
            if (response.ok && result.status === 200) {
                return true;
            } else {
                console.error('Phone.Email API Failed Logic:', result);
                return false;
            }
        } catch (e) {
            console.error('Failed to parse response JSON:', e);
            return false;
        }

    } catch (error) {
        console.error('Error sending Phone.Email OTP:', error);
        return false;
    }
}

module.exports = { sendPhoneEmailOtp };
