const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getZoneFirestore } = require('./multiZoneConfig');

/**
 * Fonction callable pour confirmer une maintenance
 * Accessible publiquement depuis la page /confirm/:token
 */
exports.confirmMaintenance = functions
  .region('europe-west1')
  .https
  .onCall(async (data, context) => {
    const { token, dateRealisation, commentaire } = data;

    if (!token || !dateRealisation) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Token et date de réalisation requis'
      );
    }

    try {
      // Récupère le token depuis zone1 (centralisé)
      const dbZone1 = getZoneFirestore('zone1');
      const tokenDoc = await dbZone1
        .collection('confirmationTokens')
        .doc(token)
        .get();

      if (!tokenDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Token invalide ou expiré'
        );
      }

      const tokenData = tokenDoc.data();

      // Vérifie l'expiration
      if (tokenData.expiresAt && tokenData.expiresAt.toDate() < new Date()) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Token expiré'
        );
      }

      // Récupère la fiche depuis la bonne zone
      const dbZone = getZoneFirestore(tokenData.zone);
      const ficheDoc = await dbZone
        .doc(`etablissements/${tokenData.etablissementId}/fiches/${tokenData.ficheId}`)
        .get();

      if (!ficheDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Fiche introuvable'
        );
      }

      const fiche = ficheDoc.data();

      // Calcule la prochaine date
      const dateReal = new Date(dateRealisation);
      const nextDate = new Date(dateReal);
      nextDate.setMonth(nextDate.getMonth() + (fiche.frequenceMois || 1));

      // Met à jour la fiche
      await ficheDoc.ref.update({
        statut: 'realise',
        dernierEnvoi: dateReal,
        prochainEnvoi: nextDate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Ajoute à l'historique
      await dbZone
        .collection(`etablissements/${tokenData.etablissementId}/historique`)
        .add({
          type: 'confirmation',
          ficheId: tokenData.ficheId,
          nomTache: tokenData.nomTache,
          dateRealisation: dateReal,
          prochainEnvoi: nextDate,
          commentaire: commentaire || '',
          confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Supprime le token (usage unique)
      await tokenDoc.ref.delete();

      console.log(`✅ Maintenance confirmée pour fiche: ${fiche.nomTache}`);

      return {
        success: true,
        nextDate: nextDate.toISOString(),
        nomTache: fiche.nomTache,
      };
    } catch (error) {
      console.error('❌ Erreur lors de la confirmation:', error);

      // Retourne l'erreur avec plus de détails
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        'internal',
        `Erreur lors de la confirmation: ${error.message}`
      );
    }
  });
