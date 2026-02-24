const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Block backend/server files from being bundled into the mobile app
config.resolver.blockList = [
    // Block the main server entry point and all backend modules
    /server\.js$/,
    /dbConfig\.js$/,
    /emailService\.js$/,
    /phoneEmailService\.js$/,
    /cronService\.js$/,
    /questions_data\.js$/,
    // Block node_modules used only by the server (not React Native compatible)
    /node_modules[/\\]mssql[/\\].*/,
    /node_modules[/\\]express[/\\].*/,
    /node_modules[/\\]body-parser[/\\].*/,
    /node_modules[/\\]node-cron[/\\].*/,
    /node_modules[/\\]resend[/\\].*/,
];

module.exports = config;
