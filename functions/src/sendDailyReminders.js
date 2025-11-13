const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { getAllEtablissements, getZoneFirestore } = require('./multiZoneConfig');
const { sendEmail, generateMaintenanceEmailTemplate } = require('./emailService');

/**
 * Fonction planifiée qui s'exécute tous les jours à 8h
 * Envoie les rappels de maintenance pour toutes les fiches échues
 * Support multi-zones et multi-providers (Resend, SendGrid, SMTP)
 */
exports.sendDailyReminders = functions
  .region('europe-west1')
  .pubsub
  .schedule('0 8 * * *') // Tous les jours à 8h (heure de Paris)
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    console.log('🚀 Démarrage de l\'envoi quotidien des rappels');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Récupère tous les établissements de toutes les zones
      const etablissements = await getAllEtablissements();
      console.log(`📊 Total établissements trouvés: ${etablissements.length}`);

      let totalEmailsSent = 0;
      let totalFichesProcessed = 0;

      // Traite chaque établissement
      for (const etablissement of etablissements) {
        const { id: etablissementId, zone, nom, emailConfig } = etablissement;

        console.log(`\n🏢 Traitement: ${nom} (${zone})`);

        // Vérifie la configuration email
        if (!emailConfig || !emailConfig.configured) {
          console.log(`⚠️ Email non configuré pour ${nom}, skip...`);
          continue;
        }

        // Récupère Firestore pour cette zone
        const db = getZoneFirestore(zone);

        // Récupère les fiches échues
        const fichesSnapshot = await db
          .collection(`etablissements/${etablissementId}/fiches`)
          .where('statut', '==', 'en_attente')
          .get();

        if (fichesSnapshot.empty) {
          console.log(`  ℹ️ Aucune fiche en attente`);
          continue;
        }

        console.log(`  📋 ${fichesSnapshot.size} fiches en attente trouvées`);

        // Traite chaque fiche
        for (const ficheDoc of fichesSnapshot.docs) {
          const fiche = ficheDoc.data();
          const ficheId = ficheDoc.id;

          // Vérifie si la fiche est échue
          const prochainEnvoi = fiche.prochainEnvoi?.toDate?.();
          if (!prochainEnvoi || prochainEnvoi > today) {
            continue; // Pas encore échue
          }

          console.log(`  📌 Fiche échue: ${fiche.nomTache}`);
          totalFichesProcessed++;

          // Génère un token de confirmation unique
          const confirmToken = crypto.randomBytes(32).toString('hex');

          // Stocke le token dans zone1 (centralisé)
          const dbZone1 = getZoneFirestore('zone1');
          await dbZone1
            .collection('confirmationTokens')
            .doc(confirmToken)
            .set({
              ficheId: ficheId,
              etablissementId: etablissementId,
              zone: zone,
              nomTache: fiche.nomTache,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
            });

          // Récupère les contacts
          const contactsData = [];
          if (fiche.contactIds && fiche.contactIds.length > 0) {
            for (const contactId of fiche.contactIds) {
              const contactDoc = await db
                .doc(`etablissements/${etablissementId}/contacts/${contactId}`)
                .get();

              if (contactDoc.exists) {
                contactsData.push({
                  id: contactDoc.id,
                  ...contactDoc.data(),
                });
              }
            }
          }

          if (contactsData.length === 0) {
            console.log(`  ⚠️ Aucun contact pour la fiche: ${fiche.nomTache}`);
            continue;
          }

          // URL de confirmation (pointe vers l'application React)
          const confirmUrl = `${process.env.APP_URL || 'https://maintenance-zone1.web.app'}/confirm/${confirmToken}`;

          // Envoie les emails à tous les contacts
          for (const contact of contactsData) {
            const templateData = {
              contactNom: contact.nom,
              nomTache: fiche.nomTache,
              urlPdf: fiche.urlPdf || null,
              responsableNom: fiche.responsableNom || null,
              responsableEmail: fiche.responsableEmail || null,
              responsableAdjointNom: fiche.responsableAdjointNom || null,
              responsableAdjointEmail: fiche.responsableAdjointEmail || null,
              confirmUrl: confirmUrl,
              etablissementNom: nom,
            };

            const htmlContent = generateMaintenanceEmailTemplate(templateData);

            const sent = await sendEmail(
              emailConfig,
              contact.email,
              contact.nom,
              `🛠️ Rappel maintenance : ${fiche.nomTache}`,
              htmlContent
            );

            if (sent) {
              totalEmailsSent++;
            }
          }

          // Met à jour la fiche
          const newNextDate = new Date(today);
          newNextDate.setMonth(newNextDate.getMonth() + (fiche.frequenceMois || 1));

          await ficheDoc.ref.update({
            dernierEnvoi: admin.firestore.FieldValue.serverTimestamp(),
            prochainEnvoi: newNextDate,
            statut: 'envoye',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Log dans l'historique
          await db
            .collection(`etablissements/${etablissementId}/historique`)
            .add({
              type: 'envoi_email',
              ficheId: ficheId,
              nomTache: fiche.nomTache,
              dateEnvoi: admin.firestore.FieldValue.serverTimestamp(),
              prochainEnvoi: newNextDate,
              contactsNotifies: contactsData.map(c => c.email),
              emailsSent: contactsData.length,
            });

          console.log(`  ✅ ${contactsData.length} email(s) envoyé(s) pour: ${fiche.nomTache}`);
        }
      }

      console.log(`\n✅ Envoi quotidien terminé`);
      console.log(`   📋 Fiches traitées: ${totalFichesProcessed}`);
      console.log(`   ✉️ Emails envoyés: ${totalEmailsSent}`);

      return {
        success: true,
        fichesProcessed: totalFichesProcessed,
        emailsSent: totalEmailsSent,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi quotidien:', error);
      throw error;
    }
  });
