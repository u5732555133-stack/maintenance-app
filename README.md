# 🛠️ Application de Gestion de Maintenance

Application web complète pour la gestion de maintenance d'établissements. Solution **100% gratuite** et **scalable** jusqu'à des milliers d'établissements.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Déploiement](#déploiement)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)

---

## ✨ Fonctionnalités

### 👨‍💼 Super Admin (Direction)
- ✅ Création et gestion des établissements
- ✅ Création de comptes administrateurs par établissement
- ✅ Tableau de bord global avec statistiques
- ✅ Vue d'ensemble de tous les établissements

### 🏢 Admin Établissement
- ✅ Gestion des fiches de maintenance
- ✅ Gestion des contacts
- ✅ Historique des maintenances
- ✅ Configuration Gmail OAuth2 (envoi depuis son propre compte)
- ✅ Tableau de bord avec alertes

### 📧 Automatisation
- ✅ Envoi automatique quotidien des rappels (8h du matin)
- ✅ Emails envoyés depuis le compte Gmail de l'admin établissement
- ✅ Calcul automatique des prochaines dates
- ✅ Nettoyage automatique des tokens expirés

### 🌐 Page Publique
- ✅ Confirmation de maintenance via lien sécurisé
- ✅ Mise à jour automatique des dates
- ✅ Ajout de commentaires

---

## 🏗️ Architecture

### Stack Technique
- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** Firebase (Firestore + Functions + Auth)
- **Emails:** Gmail API (OAuth2)
- **Hébergement:** Firebase Hosting
- **Design:** Inspiré de jw.org (minimaliste, épuré)

### Multi-Database (4 Zones)

L'application utilise **4 bases Firebase** pour rester dans le plan gratuit :

```
Zone 1 : Nord / Île-de-France (750 établissements)
Zone 2 : Est / Grand Est (750 établissements)
Zone 3 : Ouest / Bretagne / Pays de Loire (750 établissements)
Zone 4 : Sud / PACA / Occitanie (750 établissements)
```

**Avantages :**
- ✅ 100% gratuit (4 × 50K lectures/jour = 200K/jour)
- ✅ Scalable jusqu'à 3000 établissements
- ✅ Répartition géographique automatique par code postal

### Structure Firestore

```
📁 etablissements/
  ├── {etablissementId}/
  │   ├── nom, adresse, codePostal, ville
  │   ├── adminEmail, adminGmailToken
  │   ├── zone (zone1, zone2, zone3, zone4)
  │   │
  │   ├── 📁 fiches/
  │   │   ├── {ficheId}/
  │   │   │   ├── nomTache, urlPdf
  │   │   │   ├── frequenceMois, prochainEnvoi
  │   │   │   ├── responsable, responsableAdjoint
  │   │   │   ├── contactIds[], statut
  │   │   │
  │   ├── 📁 contacts/
  │   │   ├── {contactId}/
  │   │   │   ├── nom, email, telephone
  │   │   │
  │   └── 📁 historique/
  │       ├── {histoId}/
  │           ├── ficheId, dateRealisation
  │           ├── commentaire, confirmedAt

📁 superAdmins/
  ├── {userId}/
      ├── email, nom, role

📁 users/
  ├── {userId}/
      ├── email, role, etablissementId, zone

📁 confirmationTokens/
  ├── {token}/
      ├── ficheId, etablissementId, zone
      ├── createdAt, expiresAt (30 jours)
```

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Google Cloud (gratuit)
- 4 projets Firebase (gratuits)

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd maintenance-app
npm install
```

### 2. Créer les 4 projets Firebase

1. Allez sur https://console.firebase.google.com/
2. Créez 4 projets :
   - `maintenance-zone1`
   - `maintenance-zone2`
   - `maintenance-zone3`
   - `maintenance-zone4`

3. Pour chaque projet :
   - Activez **Firebase Authentication** (Email/Password)
   - Activez **Cloud Firestore**
   - Activez **Cloud Functions**
   - Activez **Firebase Hosting**

### 3. Configurer les environnements

Copiez `.env.example` vers `.env` :

```bash
cp .env.example .env
```

Remplissez les variables pour chaque zone (récupérables dans les paramètres Firebase) :

```env
# Zone 1
VITE_FIREBASE_ZONE1_API_KEY=...
VITE_FIREBASE_ZONE1_AUTH_DOMAIN=...
VITE_FIREBASE_ZONE1_PROJECT_ID=...
# ... etc pour toutes les zones
```

### 4. Configurer Google OAuth2 (Gmail)

1. Allez sur https://console.cloud.google.com/
2. Créez un projet
3. Activez l'API Gmail
4. Créez des identifiants OAuth 2.0
5. Ajoutez l'URL de redirection :
   - `http://localhost:5173` (dev)
   - `https://votre-domaine.com` (prod)

6. Ajoutez dans `.env` :
```env
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_CLIENT_SECRET=...
```

### 5. Déployer les règles Firestore

Pour chaque zone :

```bash
firebase use zone1
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

firebase use zone2
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# ... etc pour zones 3 et 4
```

### 6. Créer le premier Super Admin

Manuellement dans Firestore (console Firebase) :

```
Collection: superAdmins
Document ID: [votre-uid-firebase]
Champs:
  - email: "direction@votre-asso.fr"
  - nom: "Direction Nationale"
  - role: "super_admin"
  - createdAt: [timestamp]
```

Puis créez le compte dans Authentication :
```bash
# Via console Firebase Authentication
Email: direction@votre-asso.fr
Password: [votre-mot-de-passe-sécurisé]
```

---

## ⚙️ Configuration

### Variables d'environnement

Créez `.env` à la racine :

```env
# Firebase Zones
VITE_FIREBASE_ZONE1_API_KEY=...
VITE_FIREBASE_ZONE1_AUTH_DOMAIN=...
VITE_FIREBASE_ZONE1_PROJECT_ID=...
VITE_FIREBASE_ZONE1_STORAGE_BUCKET=...
VITE_FIREBASE_ZONE1_MESSAGING_SENDER_ID=...
VITE_FIREBASE_ZONE1_APP_ID=...

VITE_FIREBASE_ZONE2_API_KEY=...
# ... (pareil pour zones 2, 3, 4)

# Google OAuth2
VITE_GOOGLE_CLIENT_ID=...
VITE_GOOGLE_CLIENT_SECRET=...
```

### Cloud Functions

Dans `functions/` :

```bash
cd functions
npm install

# Créer .env pour les fonctions
echo "GOOGLE_CLIENT_ID=..." > .env
echo "GOOGLE_CLIENT_SECRET=..." >> .env
echo "REDIRECT_URI=https://votre-domaine.com/oauth/callback" >> .env
echo "APP_URL=https://votre-domaine.com" >> .env
echo "ENCRYPTION_KEY=votre-clé-32-caractères" >> .env
```

---

## 📦 Déploiement

### Développement local

```bash
# Frontend
npm run dev

# Functions (émulateurs)
cd functions
npm run serve
```

### Production

```bash
# Build frontend
npm run build

# Déployer sur Firebase Hosting (Zone 1 par exemple)
firebase use zone1
firebase deploy --only hosting

# Déployer les Cloud Functions (chaque zone)
firebase use zone1
firebase deploy --only functions

firebase use zone2
firebase deploy --only functions

# ... etc pour zones 3 et 4
```

### Configuration DNS (optionnel)

Si vous voulez un domaine personnalisé :

```bash
firebase hosting:channel:deploy production --project zone1
```

Puis configurez votre DNS pour pointer vers Firebase Hosting.

---

## 👥 Utilisation

### 1. Connexion Super Admin

1. Allez sur `https://votre-app.com`
2. Connectez-vous avec le compte super admin créé
3. Vous accédez au tableau de bord direction

### 2. Créer un établissement

1. Cliquez sur "Établissements" dans le menu
2. Cliquez sur "+ Nouvel établissement"
3. Remplissez les informations :
   - Nom de l'établissement
   - Adresse complète + code postal (important !)
   - Email de l'admin (sera créé automatiquement)
   - Mot de passe temporaire

4. **Le système assigne automatiquement la zone selon le code postal**

### 3. Connexion Admin Établissement

1. L'admin reçoit ses identifiants
2. Il se connecte sur `https://votre-app.com`
3. Il accède à son tableau de bord établissement

### 4. Configurer Gmail (IMPORTANT)

**Pour envoyer des emails depuis le compte de l'établissement :**

1. Allez dans "Paramètres"
2. Cliquez sur "Connecter mon compte Gmail"
3. Autorisez l'application à envoyer des emails
4. ✅ C'est terminé ! Les emails seront envoyés depuis ce compte

### 5. Créer des contacts

1. Allez dans "Contacts"
2. Ajoutez les personnes qui vont recevoir les rappels
3. Renseignez nom, email, téléphone

### 6. Créer des fiches de maintenance

1. Allez dans "Fiches"
2. Cliquez sur "+ Nouvelle fiche"
3. Remplissez :
   - Nom de la tâche
   - URL du PDF (lien Drive, Dropbox...)
   - Périodicité (1, 2, 3, 6, 12, 24 mois)
   - Prochaine date d'envoi
   - Responsables (nom + email)
   - Contacts à notifier (cochez dans la liste)

4. Validez

### 7. Automatisation

**Chaque jour à 8h du matin :**

1. Le système vérifie toutes les fiches de toutes les zones
2. Pour chaque fiche échue :
   - Génère un lien de confirmation unique
   - Envoie un email via Gmail API aux contacts
   - Met à jour les dates automatiquement
   - Log dans l'historique

**Email reçu par le contact :**
```
🛠️ Rappel maintenance : Vérification extincteurs

Bonjour Jean Dupont,

C'est l'heure de réaliser la maintenance suivante :

📌 Tâche : Vérification extincteurs
🔗 Fiche : https://drive.google.com/...

📞 Besoin d'aide ? Contactez :
   • Responsable : Marie Martin (marie@exemple.fr)
   • Responsable adjoint : Paul Durand (paul@exemple.fr)

✅ Confirmer la réalisation : https://votre-app.com/confirm/abc123...

Merci !
```

### 8. Confirmation de maintenance

1. Le contact clique sur le lien
2. Il accède à un formulaire simple
3. Il indique la date de réalisation + commentaire
4. Il valide

**→ Le système recalcule automatiquement la prochaine date !**

---

## 📊 Limites Gratuites

### Firebase (par zone)
- ✅ 50K lectures/jour
- ✅ 20K écritures/jour
- ✅ 1 GB stockage
- ✅ Cloud Functions : 2M invocations/mois

### Gmail API
- ✅ **ILLIMITÉ** (quota Google Workspace : 2000 emails/jour)
- ✅ Chaque admin a son propre quota
- ✅ 3000 admins = 6 000 000 emails/jour théoriques !

### Coût estimé
- **0€/mois** pour 3000 établissements avec 60 fiches chacune
- Si dépassement : ~20€/mois (très peu probable)

---

## 📂 Structure du Projet

```
maintenance-app/
├── src/
│   ├── components/
│   │   ├── SuperAdmin/          # Interface direction
│   │   │   ├── Dashboard.jsx
│   │   │   └── Etablissements.jsx
│   │   ├── AdminEtablissement/  # Interface admin établissement
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FichesList.jsx
│   │   │   ├── ContactsList.jsx
│   │   │   ├── Historique.jsx
│   │   │   └── Settings.jsx
│   │   ├── Public/              # Page publique
│   │   │   └── ConfirmMaintenance.jsx
│   │   ├── Auth/                # Authentification
│   │   │   ├── Login.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── Shared/              # Composants réutilisables
│   │       ├── Navbar.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       └── ...
│   ├── contexts/
│   │   └── AuthContext.jsx      # Context d'authentification
│   ├── utils/
│   │   ├── firebase.js          # Config Firebase (4 zones)
│   │   ├── constants.js         # Constantes
│   │   └── helpers.js           # Fonctions utilitaires
│   ├── App.jsx                  # Routing principal
│   └── main.jsx
│
├── functions/                   # Cloud Functions
│   ├── src/
│   │   ├── index.js
│   │   ├── sendDailyReminders.js    # Envoi quotidien 8h
│   │   ├── confirmMaintenance.js    # Confirmation maintenance
│   │   ├── gmailAuth.js             # OAuth2 Gmail
│   │   └── cleanExpiredTokens.js    # Nettoyage tokens
│   └── package.json
│
├── firebase.json                # Config Firebase
├── firestore.rules              # Règles de sécurité
├── firestore.indexes.json       # Index Firestore
├── .firebaserc                  # Alias projets
├── .env.example                 # Template variables env
├── package.json
└── README.md                    # Ce fichier !
```

---

## 🔒 Sécurité

### Firestore Rules
- ✅ Super Admin peut tout faire
- ✅ Admin ne voit que SON établissement
- ✅ Page publique peut confirmer (lecture token uniquement)
- ✅ Pas d'accès direct aux données sensibles

### OAuth2 Gmail
- ✅ Refresh tokens chiffrés dans Firestore
- ✅ Aucun mot de passe stocké
- ✅ Révocable à tout moment par l'admin

### Tokens de confirmation
- ✅ Unique par fiche + contact
- ✅ Expire après 30 jours
- ✅ Usage unique recommandé
- ✅ Nettoyage automatique quotidien

---

## 🐛 Dépannage

### Erreur "Permission denied"
→ Vérifiez les règles Firestore et l'authentification

### Emails non envoyés
→ Vérifiez que Gmail OAuth2 est configuré pour l'établissement

### Token expiré
→ Les tokens durent 30 jours, demandez un nouvel envoi

### Build échoue
→ Vérifiez que toutes les variables d'environnement sont définies

---

## 📝 TODO / Améliorations futures

- [ ] PWA (Application installable sur mobile)
- [ ] Notifications push
- [ ] Dashboard avec graphiques avancés
- [ ] Export Excel/PDF
- [ ] Multi-langue (FR/EN)
- [ ] Dark mode
- [ ] Recherche Algolia
- [ ] Webhooks pour intégrations
- [ ] API REST publique

---

## 📄 Licence

MIT License - Libre d'usage pour associations à but non lucratif

---

## 🙏 Support

Pour toute question :
- 📧 Email : support@votre-asso.fr
- 📖 Documentation : https://docs.votre-app.com

---

**Développé avec ❤️ pour faciliter la gestion de maintenance**
