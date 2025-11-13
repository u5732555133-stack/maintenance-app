# Cloud Functions - Documentation

## Date: 2025-11-13

## 🎯 Vue d'ensemble

Les Cloud Functions permettent l'automatisation complète de l'envoi des emails de maintenance avec support multi-zones et multi-providers.

---

## 📋 Fonctions Déployées

### 1. **sendDailyReminders** (Planifiée)

**Déclenchement:** Tous les jours à 8h (heure de Paris)

**Objectif:** Parcourt tous les établissements de toutes les zones et envoie les emails de rappel de maintenance pour les fiches échues.

**Workflow:**

1. Se connecte aux 4 zones Firebase (zone1, zone2, zone3, zone4)
2. Récupère tous les établissements
3. Pour chaque établissement:
   - Vérifie qu'une configuration email est présente
   - Récupère les fiches avec `statut='en_attente'`
   - Filtre les fiches dont `prochainEnvoi <= aujourd'hui`
4. Pour chaque fiche échue:
   - Génère un token de confirmation unique (stocké dans zone1)
   - Récupère les contacts liés
   - Envoie un email à chaque contact via le provider configuré
   - Met à jour la fiche: `statut='envoye'`, calcule la prochaine date
   - Log dans l'historique

**Providers supportés:**
- **Resend** (recommandé - 3000 emails/mois gratuit)
- **SendGrid** (100 emails/jour gratuit)
- **SMTP** (Gmail, Outlook, etc.)

**Logs:**
```
🚀 Démarrage de l'envoi quotidien des rappels
📊 Total établissements trouvés: 2
🏢 Traitement: Mon Établissement (zone1)
  📋 3 fiches en attente trouvées
  📌 Fiche échue: Maintenance ascenseur
  ✅ 2 email(s) envoyé(s) pour: Maintenance ascenseur
✅ Envoi quotidien terminé
   📋 Fiches traitées: 1
   ✉️ Emails envoyés: 2
```

### 2. **cleanExpiredTokens** (Planifiée)

**Déclenchement:** Tous les jours à 2h du matin (heure de Paris)

**Objectif:** Nettoie les tokens de confirmation expirés (> 30 jours) depuis zone1.

**Workflow:**
1. Se connecte à zone1
2. Récupère tous les tokens où `expiresAt < maintenant`
3. Supprime tous les tokens expirés en batch

**Logs:**
```
🧹 Démarrage du nettoyage des tokens expirés
🗑️ 12 tokens expirés trouvés
✅ 12 tokens expirés supprimés
```

### 3. **confirmMaintenance** (Callable)

**Déclenchement:** Appelée depuis la page publique `/confirm/:token`

**Objectif:** Confirme qu'une maintenance a été réalisée.

**Workflow:**
1. Vérifie que le token existe dans zone1 et n'est pas expiré
2. Récupère la fiche depuis la zone appropriée
3. Calcule la prochaine date d'envoi
4. Met à jour la fiche: `statut='realise'`
5. Ajoute une entrée dans l'historique

---

## 📁 Structure des Fichiers

```
functions/
├── package.json                 # Dépendances (resend, @sendgrid/mail, nodemailer)
└── src/
    ├── index.js                 # Point d'entrée, exports des fonctions
    ├── multiZoneConfig.js       # Configuration multi-zones Firebase Admin
    ├── emailService.js          # Service générique d'envoi email (3 providers)
    ├── sendDailyReminders.js    # Fonction planifiée d'envoi quotidien
    ├── confirmMaintenance.js    # Fonction callable de confirmation
    └── cleanExpiredTokens.js    # Fonction planifiée de nettoyage
```

---

## 🔧 Configuration Requise

### 1. Configuration Email par Établissement

Chaque établissement doit avoir un objet `emailConfig` dans Firestore :

```javascript
emailConfig: {
  provider: 'resend' | 'sendgrid' | 'smtp',
  fromEmail: 'contact@etablissement.com',
  fromName: 'Mon Établissement',
  configured: true,
  configuredAt: Timestamp,

  // Selon le provider :
  resendApiKey: 'clé API Resend',
  // OU
  sendgridApiKey: 'clé API SendGrid',
  // OU
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUser: 'email@gmail.com',
  smtpPassword: 'mot de passe d\'application'
}
```

### 2. Variable d'Environnement

```bash
# URL de l'application React pour les liens de confirmation
APP_URL=https://maintenance-zone1.web.app
```

### 3. Service Accounts

Les Cloud Functions utilisent Application Default Credentials et peuvent accéder aux 4 zones Firebase si déployées depuis le bon projet.

---

## 🚀 Déploiement

### Installation des dépendances
```bash
cd functions
npm install
```

### Test local avec l'émulateur
```bash
# Depuis le dossier racine
firebase emulators:start --only functions
```

### Déploiement en production
```bash
# Déployer toutes les fonctions
firebase deploy --only functions

# Déployer une fonction spécifique
firebase deploy --only functions:sendDailyReminders
firebase deploy --only functions:confirmMaintenance
firebase deploy --only functions:cleanExpiredTokens
```

### Logs en production
```bash
# Voir les logs en temps réel
firebase functions:log

# Logs d'une fonction spécifique
firebase functions:log --only sendDailyReminders
```

---

## 📧 Template Email HTML

L'email envoyé est un template HTML professionnel responsive avec :

- **Header** avec titre et nom de l'établissement
- **Salutation** personnalisée avec le nom du contact
- **Card de tâche** avec le nom de la tâche et lien vers la fiche technique
- **Section contacts** avec responsable et adjoint (si définis)
- **Bouton CTA vert** pour confirmer la réalisation
- **Footer** avec informations

**Aperçu:**
```
┌─────────────────────────────────┐
│   🛠️ Rappel de Maintenance     │
│      Mon Établissement          │
├─────────────────────────────────┤
│ Bonjour Jean Dupont,            │
│                                 │
│ C'est le moment d'effectuer...  │
│                                 │
│ ┌────────────────────────────┐ │
│ │ 📌 Maintenance ascenseur   │ │
│ │ 📄 Fiche technique: [lien] │ │
│ └────────────────────────────┘ │
│                                 │
│ ┌────────────────────────────┐ │
│ │ 📞 Besoin d'aide ?         │ │
│ │ Responsable: Pierre Martin │ │
│ └────────────────────────────┘ │
│                                 │
│   [✅ Confirmer la réalisation]│
└─────────────────────────────────┘
```

---

## 🔐 Sécurité

### Tokens de Confirmation

- **Générés** avec `crypto.randomBytes(32)` (256 bits)
- **Stockés** centralisés dans zone1/confirmationTokens
- **Expiration** automatique après 30 jours
- **Nettoyage** automatique quotidien

**Structure du token:**
```javascript
{
  ficheId: 'ID de la fiche',
  etablissementId: 'ID de l'établissement',
  zone: 'zone1 | zone2 | zone3 | zone4',
  nomTache: 'Maintenance ascenseur',
  createdAt: Timestamp,
  expiresAt: Timestamp (créé + 30 jours)
}
```

### Clés API

- Les clés API des providers (Resend, SendGrid) sont stockées chiffrées dans Firestore
- Les mots de passe SMTP sont stockés en texte (à améliorer : chiffrement avec Cloud KMS)

---

## 📊 Monitoring

### Métriques importantes

- **Taux de succès d'envoi** par provider
- **Nombre de fiches traitées** par jour
- **Nombre d'emails envoyés** par établissement
- **Erreurs d'envoi** et leurs causes

### Dashboard Firebase Functions

```bash
# Accéder au dashboard
https://console.firebase.google.com/project/maintenance-zone1/functions
```

**Métriques disponibles:**
- Invocations (nombre d'exécutions)
- Temps d'exécution
- Mémoire utilisée
- Erreurs
- Logs

---

## 🐛 Debugging

### Problèmes courants

#### 1. Emails non envoyés

**Causes possibles:**
- Configuration email manquante ou invalide
- Clé API expirée ou invalide
- Quota dépassé (Resend: 3000/mois, SendGrid: 100/jour)
- SMTP: authentification échouée

**Solutions:**
- Vérifier `etablissement.emailConfig.configured === true`
- Tester les clés API manuellement
- Vérifier les quotas dans les dashboards des providers
- Pour SMTP Gmail: utiliser un "App Password" et non le mot de passe normal

#### 2. Tokens expirés

**Symptôme:** "Token invalide ou expiré" lors de la confirmation

**Solutions:**
- Vérifier que cleanExpiredTokens ne s'exécute pas trop souvent
- Augmenter la durée d'expiration (actuellement 30 jours)
- Renvoyer l'email si le token est expiré

#### 3. Multi-zones non fonctionnel

**Symptôme:** "Permission denied" lors de l'accès aux zones

**Solutions:**
- Vérifier que les Service Accounts ont accès aux 4 projets
- Vérifier les Firestore Rules de chaque zone
- S'assurer que les Cloud Functions sont déployées dans le bon projet

---

## ⚙️ Configuration avancée

### Changer la fréquence d'envoi

Modifier la cron expression dans `sendDailyReminders.js`:

```javascript
.schedule('0 8 * * *') // Tous les jours à 8h

// Exemples :
.schedule('0 8,16 * * *')      // 8h et 16h chaque jour
.schedule('0 8 * * 1-5')       // 8h du lundi au vendredi
.schedule('0 8 1 * *')         // 8h le 1er de chaque mois
```

### Ajouter un nouveau provider

1. Ajouter la dépendance dans `functions/package.json`
2. Créer une fonction `sendVia[Provider]` dans `emailService.js`
3. Ajouter le case dans le switch de `sendEmail()`
4. Mettre à jour l'interface Settings.jsx

---

## 📈 Prochaines Améliorations

- [ ] Retry automatique en cas d'échec d'envoi
- [ ] Rate limiting pour respecter les quotas des providers
- [ ] Chiffrement des clés API avec Cloud KMS
- [ ] Webhooks pour tracking des ouvertures/clics d'emails
- [ ] Support de templates email personnalisés par établissement
- [ ] Notifications Slack/Discord en cas d'erreurs
- [ ] Dashboard analytics avec statistiques d'envoi

---

## 📚 Ressources

### Documentation providers

- **Resend:** https://resend.com/docs
- **SendGrid:** https://docs.sendgrid.com/
- **Nodemailer (SMTP):** https://nodemailer.com/

### Firebase Functions

- **Documentation:** https://firebase.google.com/docs/functions
- **Scheduled Functions:** https://firebase.google.com/docs/functions/schedule-functions
- **Multi-project:** https://firebase.google.com/docs/projects/multiprojects

---

**Version:** 1.0.0
**Auteur:** Claude (Assistant IA)
**Date:** 2025-11-13
