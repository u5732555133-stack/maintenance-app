const functions = require('firebase-functions');
const { getZoneFirestore } = require('./multiZoneConfig');

/**
 * Fonction planifiée qui nettoie les tokens de confirmation expirés
 * S'exécute tous les jours à 2h du matin
 * Les tokens sont stockés centralisés dans zone1
 */
exports.cleanExpiredTokens = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 2 * * *') // Tous les jours à 2h du matin
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    console.log('🧹 Démarrage du nettoyage des tokens expirés');

    try {
      const now = new Date();
      const dbZone1 = getZoneFirestore('zone1');

      // Récupère tous les tokens expirés
      const tokensSnapshot = await dbZone1
        .collection('confirmationTokens')
        .where('expiresAt', '<', now)
        .get();

      if (tokensSnapshot.empty) {
        console.log('✨ Aucun token expiré à nettoyer');
        return { success: true, tokensDeleted: 0 };
      }

      console.log(`🗑️ ${tokensSnapshot.size} tokens expirés trouvés`);

      // Supprime les tokens expirés par batch
      const batch = dbZone1.batch();
      tokensSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`✅ ${tokensSnapshot.size} tokens expirés supprimés`);

      return {
        success: true,
        tokensDeleted: tokensSnapshot.size,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des tokens:', error);
      throw error;
    }
  });
