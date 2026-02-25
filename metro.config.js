const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Block backend/server files from being bundled into the mobile app
const escapePath = (filename) => new RegExp(`^${path.resolve(__dirname, filename).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

const customBlockList = [
    // Block the main server entry point and all backend modules
    escapePath('server.js'),
    escapePath('dbConfig.js'),
    escapePath('emailService.js'),
    escapePath('phoneEmailService.js'),
    escapePath('cronService.js'),
    escapePath('questions_data.js'),
    // Block node_modules used only by the server (not React Native compatible)
    /node_modules[/\\]mssql[/\\].*/,
    /node_modules[/\\]express[/\\].*/,
    /node_modules[/\\]body-parser[/\\].*/,
    /node_modules[/\\]node-cron[/\\].*/,
    /node_modules[/\\]resend[/\\].*/,
];

if (config.resolver.blockList) {
    config.resolver.blockList = Array.isArray(config.resolver.blockList)
        ? [...config.resolver.blockList, ...customBlockList]
        : [config.resolver.blockList, ...customBlockList];
} else {
    config.resolver.blockList = customBlockList;
}

module.exports = config;
