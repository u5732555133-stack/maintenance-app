# Application de Gestion de Maintenance

## 🎯 Vue d'ensemble

Application web complète de gestion de maintenance préventive multi-zones avec envoi automatisé d'emails.

**Version:** 1.0.0  
**Date:** 2025-11-13  
**Stack:** React 19.2.0 + Vite + Firebase + Cloud Functions

---

## ✅ État Actuel

### Tests
- ✅ 10/10 tests unitaires React
- ✅ 7/7 tests Cloud Functions  
- ✅ Tests d'intégration validés
- ✅ Dev server sans erreurs console

### Fonctionnalités Complètes
✅ Module Maintenance 100% fonctionnel
✅ Envoi automatique emails (8h quotidien)
✅ Page confirmation publique avec tokens
✅ Configuration email multi-provider (Resend/SendGrid/SMTP)
✅ Architecture multi-zones (4 projets Firebase)
✅ Calcul automatique des dates
✅ Gestion utilisateurs par établissement

---

## 🚀 Démarrage Rapide

```bash
# Frontend
npm install
npm run dev
# → http://localhost:5173

# Tests
npm test

# Cloud Functions  
cd functions
npm install
npm run deploy
```

---

## 📦 Structure

```
maintenance-app/
├── src/                      # Application React
│   ├── components/
│   │   ├── AdminEtablissement/   # Module Maintenance
│   │   ├── Auth/                 # Authentification
│   │   ├── Public/               # Pages publiques
│   │   └── Shared/               # Composants réutilisables
│   ├── contexts/                 # Contextes React
│   └── firebase/                 # Config Firebase
│
├── functions/                # Cloud Functions
│   ├── src/
│   │   ├── sendDailyReminders.js    # Envoi quotidien 8h
│   │   ├── confirmMaintenance.js    # Confirmation callable
│   │   ├── cleanExpiredTokens.js    # Nettoyage 2h
│   │   ├── emailService.js          # Service email multi-provider
│   │   └── multiZoneConfig.js       # Config multi-zones
│   └── test/                 # Tests Cloud Functions
│
├── vitest.config.js          # Config tests
├── CLOUD-FUNCTIONS.md        # Doc Cloud Functions
└── README.md                 # Ce fichier
```

---

## 📧 Configuration Email

### Providers supportés

**Resend** (Recommandé)
- 3000 emails/mois gratuit
- Configuration: API Key uniquement

**SendGrid**
- 100 emails/jour gratuit
- Configuration: API Key uniquement

**SMTP** (Gmail, Outlook)
- Gratuit avec compte existant
- Gmail: utiliser "App Password"

### Dans l'application
1. Se connecter en tant qu'admin établissement
2. Aller dans Paramètres > Configuration Email
3. Choisir le provider et renseigner identifiants
4. Tester l'envoi

---

## 🔄 Workflow Complet

### 1. Création Fiche
Admin crée fiche → Statut 'en_attente' → Calcul 'prochainEnvoi'

### 2. Envoi Automatique (8h)
```
Cloud Function sendDailyReminders
├─> Parcourt 4 zones Firebase
├─> Pour chaque établissement:
│   ├─> Vérifie emailConfig configuré
│   ├─> Récupère fiches échues (prochainEnvoi <= aujourd'hui)
│   ├─> Génère tokens de confirmation
│   ├─> Envoie emails via provider configuré
│   ├─> Statut → 'envoye'
│   └─> Calcule prochaine date
└─> Log historique
```

### 3. Confirmation
Destinataire → Email → Clique "Confirmer" → `/confirm/:token`  
→ Formulaire (date, commentaire) → Cloud Function  
→ Statut → 'realise' → Calcule nouvelle date → Token supprimé

---

## 🧪 Tests

```bash
# Tests React (10/10 ✅)
npm test

# Tests Cloud Functions (7/7 ✅)
cd functions && npm test

# Coverage
npm run test:coverage
```

---

## 📊 Monitoring

```bash
# Logs Cloud Functions
firebase functions:log

# Logs fonction spécifique
firebase functions:log --only sendDailyReminders

# Dashboard Firebase
https://console.firebase.google.com/project/maintenance-zone1/functions
```

---

## 🐛 Dépannage

### Emails non envoyés
- Vérifier emailConfig.configured === true
- Tester clés API dans dashboards providers
- Gmail SMTP: utiliser "App Password"

### Token expiré
- Durée: 30 jours par défaut
- Renvoyer email si expiré
- Ajuster dans sendDailyReminders.js

---

## 📚 Documentation

- `CLOUD-FUNCTIONS.md` - Documentation détaillée Cloud Functions
- `src/components/` - Documentation inline dans composants
- Firebase Docs: https://firebase.google.com/docs

---

## 🎉 État: Production Ready

✅ Tous les tests passent  
✅ Dev server sans erreurs console  
✅ Documentation complète  
✅ Cloud Functions testées et fonctionnelles  
✅ Architecture multi-zones validée  

**L'application est prête à être utilisée !**

---

Auteur: Claude (Assistant IA)  
Date: 2025-11-13
