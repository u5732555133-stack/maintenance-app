# 🚀 Guide de Configuration Rapide

Ce guide vous aide à configurer l'application de maintenance de A à Z en 30 minutes.

## ✅ Checklist de Configuration

### Étape 1 : Prérequis (5 min)
- [ ] Node.js 18+ installé
- [ ] Compte Google créé
- [ ] Git installé

### Étape 2 : Créer les projets Firebase (10 min)

1. Allez sur https://console.firebase.google.com/
2. Cliquez sur "Ajouter un projet"
3. Créez **4 projets** avec ces noms :
   - [ ] `maintenance-zone1`
   - [ ] `maintenance-zone2`
   - [ ] `maintenance-zone3`
   - [ ] `maintenance-zone4`

4. Pour **CHAQUE projet**, activez :
   - [ ] **Authentication** → Email/Password
   - [ ] **Firestore Database** → Mode production (USA ou EU)
   - [ ] **Cloud Functions** → Upgrade vers Blaze plan (gratuit tant que sous les limites)
   - [ ] **Hosting** (optionnel, pour déploiement)

### Étape 3 : Récupérer les clés Firebase (5 min)

Pour chaque projet :

1. Allez dans **Paramètres du projet** (⚙️) → **Paramètres généraux**
2. Scrollez jusqu'à "Vos applications"
3. Cliquez sur "</>" (Web)
4. Donnez un nom (ex: "Maintenance App Zone 1")
5. Copiez les valeurs de `firebaseConfig`

**Notez toutes les valeurs pour les 4 zones !**

### Étape 4 : Configurer Google OAuth2 (5 min)

1. Allez sur https://console.cloud.google.com/
2. Sélectionnez **un seul** projet (zone1 par exemple)
3. Activez **Gmail API**
4. Créez des identifiants **OAuth 2.0** :
   - Type : Application Web
   - URI de redirection autorisés :
     - `http://localhost:5173`
     - `https://votre-domaine.com` (à changer plus tard)

5. Copiez :
   - [ ] Client ID
   - [ ] Client Secret

### Étape 5 : Configuration locale (5 min)

```bash
# Clonez le projet (si depuis Git)
git clone <votre-repo>
cd maintenance-app

# Installez les dépendances
npm install

# Copiez le fichier d'exemple
cp .env.example .env

# Éditez .env avec vos clés
nano .env  # ou code .env dans VS Code
```

**Remplissez toutes les variables dans `.env` :**

```env
# Zone 1
VITE_FIREBASE_ZONE1_API_KEY=AIza...
VITE_FIREBASE_ZONE1_AUTH_DOMAIN=maintenance-zone1.firebaseapp.com
VITE_FIREBASE_ZONE1_PROJECT_ID=maintenance-zone1
VITE_FIREBASE_ZONE1_STORAGE_BUCKET=maintenance-zone1.appspot.com
VITE_FIREBASE_ZONE1_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_ZONE1_APP_ID=1:123456789:web:abc123

# ... Répétez pour zones 2, 3, 4

# OAuth2
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-...
```

### Étape 6 : Initialiser Firebase (5 min)

```bash
# Installez Firebase CLI
npm install -g firebase-tools

# Connectez-vous
firebase login

# Configurez les alias
firebase use --add

# Sélectionnez maintenance-zone1
# Alias: zone1

# Répétez pour zones 2, 3, 4
```

### Étape 7 : Déployer les règles Firestore

```bash
# Pour chaque zone :
firebase use zone1
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

firebase use zone2
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# ... zones 3 et 4
```

### Étape 8 : Créer le premier Super Admin

1. Allez dans **Firebase Console** → Projet Zone 1
2. **Authentication** → Ajouter un utilisateur :
   - Email : `direction@votre-asso.fr`
   - Password : `[mot-de-passe-sécurisé]`
3. Copiez l'**UID** du compte créé

4. **Firestore** → Créer collection `superAdmins` :
   - ID document : `[UID copié ci-dessus]`
   - Champs :
     - `email` (string) : `direction@votre-asso.fr`
     - `nom` (string) : `Direction Nationale`
     - `role` (string) : `super_admin`
     - `createdAt` (timestamp) : maintenant

### Étape 9 : Tester en local

```bash
# Lancez l'app
npm run dev

# Ouvrez http://localhost:5173
# Connectez-vous avec le compte super admin
```

**Vous êtes prêt ! 🎉**

---

## 🔥 Premier Test

### Test 1 : Créer un établissement

1. Connectez-vous en tant que super admin
2. Allez dans "Établissements"
3. Cliquez "+ Nouvel établissement"
4. Remplissez :
   - Nom : `Test Paris`
   - Adresse : `123 rue de Test`
   - Code postal : `75001` (important !)
   - Ville : `Paris`
   - Email admin : `admin@test.fr`
   - Password : `test123456`

5. Validez

**→ L'établissement est créé dans la Zone 1 (Île-de-France) automatiquement !**

### Test 2 : Se connecter en tant qu'admin établissement

1. Déconnectez-vous
2. Reconnectez-vous avec :
   - Email : `admin@test.fr`
   - Password : `test123456`

3. Vous devez voir le tableau de bord établissement

### Test 3 : Créer un contact

1. Allez dans "Contacts"
2. Ajoutez :
   - Nom : `Jean Test`
   - Email : `jean@test.fr`

### Test 4 : Créer une fiche

1. Allez dans "Fiches"
2. Créez une fiche test :
   - Nom : `Test maintenance`
   - URL PDF : `https://example.com/test.pdf`
   - Périodicité : 1 mois
   - Date : demain
   - Cochez le contact `Jean Test`

---

## 🚀 Déploiement en Production (optionnel)

```bash
# Build
npm run build

# Déployer sur Firebase Hosting (Zone 1)
firebase use zone1
firebase deploy --only hosting

# Déployer les Cloud Functions (toutes les zones)
firebase use zone1
cd functions && npm install && cd ..
firebase deploy --only functions

firebase use zone2
firebase deploy --only functions

# ... zones 3 et 4
```

---

## ❓ Problèmes Fréquents

### "Permission denied" dans Firestore
→ Vérifiez que les règles Firestore sont déployées

### "User not found" après login
→ Vérifiez que le document existe dans `superAdmins` ou `users`

### Emails ne partent pas
→ Gmail OAuth2 doit être configuré dans les paramètres de l'établissement

### Build échoue
→ Vérifiez que toutes les variables `.env` sont renseignées

---

## 🎯 Prochaines Étapes

Une fois l'application configurée :

1. Invitez les admins des établissements
2. Ils configurent Gmail dans "Paramètres"
3. Ils ajoutent leurs contacts
4. Ils créent leurs fiches de maintenance
5. Les rappels partent automatiquement chaque jour à 8h !

**Besoin d'aide ? Consultez le README.md complet !**
