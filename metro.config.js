const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable package exports to fix Node.js module import errors (e.g. ws package trying to load standard Node libraries like stream, events, http, etc.)
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
