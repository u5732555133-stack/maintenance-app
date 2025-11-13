const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialise Firebase Admin (app par défaut = zone1)
admin.initializeApp();

// Import des fonctions
const { sendDailyReminders } = require('./sendDailyReminders');
const { confirmMaintenance } = require('./confirmMaintenance');
const { cleanExpiredTokens } = require('./cleanExpiredTokens');

// Export des fonctions
exports.sendDailyReminders = sendDailyReminders;
exports.confirmMaintenance = confirmMaintenance;
exports.cleanExpiredTokens = cleanExpiredTokens;
