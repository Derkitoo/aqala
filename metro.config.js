// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Priority to CommonJS over ESM to avoid import.meta errors on web
config.resolver.resolverMainFields = ['browser', 'main', 'module'];

module.exports = config;
