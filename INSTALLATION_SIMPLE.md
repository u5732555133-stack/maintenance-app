# 🚀 Installation Super Simplifiée - 10 Minutes Chrono !

## ✨ Nouvelle méthode : TOUT se fait dans l'interface !

Plus besoin de manipuler des fichiers `.env` ou de configuration ! Tout se fait en quelques clics depuis l'application. 🎉

---

## 📋 Ce qu'il vous faut

1. **UN compte Gmail** (gratuit)
   - Exemple : `votre-asso@gmail.com`
   - OU utilisez votre compte Gmail existant

2. **Node.js 18+** installé sur votre ordinateur

3. **10 minutes** de votre temps

---

## 🎯 Installation en 3 étapes

### Étape 1 : Installer l'application (2 min)

```bash
# Téléchargez le code
git clone <votre-repo>
cd maintenance-app

# Installez les dépendances
npm install

# Lancez l'application
npm run dev
```

**→ Ouvrez http://localhost:5173**

---

### Étape 2 : Créer 4 projets Firebase SOUS LE MÊME COMPTE (5 min)

L'application va vous guider, mais voici ce qu'il faut faire **en parallèle** :

1. **Ouvrez un nouvel onglet** : https://console.firebase.google.com/

2. **Connectez-vous avec VOTRE compte Gmail** (un seul compte !)

3. **Créez 4 projets Firebase** (tous sous le même compte) :

   **Projet 1 :**
   - Cliquez sur "Ajouter un projet"
   - Nom : `maintenance-zone1`
   - Acceptez les conditions
   - Activez **Authentication** (Email/Password)
   - Activez **Cloud Firestore** (mode production, région Europe)
   - Créez une **app Web** (icône `</>`)
   - Nom de l'app : "Maintenance Zone 1"
   - Copiez la configuration `firebaseConfig` (NE FERMEZ PAS CET ONGLET !)

   **Répétez pour les projets 2, 3, 4** :
   - `maintenance-zone2`
   - `maintenance-zone3`
   - `maintenance-zone4`

4. **Astuce :** Gardez les 4 onglets Firebase ouverts côte à côte pour copier-coller facilement

---

### Étape 3 : Configurer dans l'interface (3 min)

De retour sur http://localhost:5173 :

1. **L'application affiche automatiquement le Setup Wizard** 🪄

2. Cliquez sur **"Commencer la configuration"**

3. **Pour chaque zone** (4 fois) :

   ```
   Zone 1 : Nord / Île-de-France
   ├── Copiez "apiKey" depuis Firebase Console → Collez
   ├── Copiez "authDomain" → Collez
   ├── Copiez "projectId" → Collez
   ├── Copiez "storageBucket" → Collez
   ├── Copiez "messagingSenderId" → Collez
   └── Copiez "appId" → Collez

   Cliquez "Zone suivante →"
   ```

4. Une fois les 4 zones configurées, cliquez **"Lancer l'application"**

5. **C'est terminé ! 🎉**

---

## ✅ Que se passe-t-il ensuite ?

### L'application se recharge automatiquement

Vous verrez maintenant la **page de connexion**.

### Créez votre premier Super Admin

**Via l'interface Firebase :**

1. Allez dans **Firebase Console** → **Projet Zone 1** (n'importe lequel)
2. **Authentication** → "Add user"
   - Email : `direction@votre-asso.fr`
   - Password : `[mot-de-passe-sécurisé]`
   - **Copiez l'UID** (identifiant unique)

3. **Firestore Database** → "Start collection"
   - Collection ID : `superAdmins`
   - Document ID : `[collez l'UID copié ci-dessus]`
   - Ajoutez les champs :
     ```
     email (string) : direction@votre-asso.fr
     nom (string) : Direction Nationale
     role (string) : super_admin
     createdAt (timestamp) : [cliquez sur l'horloge, sélectionnez "now"]
     ```

4. Cliquez "Save"

---

## 🎯 Premier Test

1. **Connectez-vous** avec le compte super admin
   - Email : `direction@votre-asso.fr`
   - Password : `[celui que vous avez créé]`

2. **Créez un établissement** :
   - Nom : Test Paris
   - Adresse : 123 rue de Test
   - Code postal : **75001** (important !)
   - Ville : Paris
   - Email admin : admin@test.fr
   - Password : test123456

3. **L'établissement est assigné automatiquement à la Zone 1** (Île-de-France) ! ✅

4. Déconnectez-vous et reconnectez-vous avec `admin@test.fr` / `test123456`

5. Vous êtes maintenant dans l'interface admin établissement ! 🎊

---

## 💰 Pourquoi un seul compte Gmail suffit ?

### Les quotas Firebase sont PAR PROJET, pas par compte !

Avec **1 compte** et **4 projets**, vous avez :

| Ressource | Par Projet | × 4 Projets | Total |
|-----------|-----------|-------------|-------|
| Lectures Firestore | 50K/jour | × 4 | **200K/jour** |
| Écritures Firestore | 20K/jour | × 4 | **80K/jour** |
| Stockage | 1 GB | × 4 | **4 GB** |
| Cloud Functions | 2M invocations/mois | × 4 | **8M/mois** |

**→ Vous multipliez les quotas gratuits par 4 !** 🎉

### Avantages :
✅ **Gestion simplifiée** : tous vos projets au même endroit
✅ **Facturation centralisée** : une seule carte si dépassement
✅ **Permissions partagées** : ajoutez des collègues facilement
✅ **Pas de limite** au nombre de projets par compte

---

## 💡 Avantages de cette méthode

✅ **Aucune manipulation de fichiers** `.env`
✅ **Configuration visuelle** guidée pas à pas
✅ **Validation en temps réel** des credentials
✅ **Modification possible** depuis les paramètres
✅ **Multi-appareil** : configurez une fois, utilisez partout (localStorage)
✅ **Sécurisé** : les credentials sont stockés localement uniquement
✅ **UN SEUL compte Gmail** à gérer

---

## 🔄 Modifier la configuration plus tard

Si vous devez ajouter/modifier une zone :

1. Dans l'application, allez dans **Paramètres** (icône ⚙️)
2. Section **"Configuration Firebase"**
3. Cliquez sur **"Modifier la zone X"**
4. Collez les nouvelles credentials
5. Sauvegardez

**L'application redémarre automatiquement avec la nouvelle config !**

---

## ❓ FAQ

### Puis-je utiliser moins de 4 zones ?

Oui ! Vous pouvez commencer avec 1 seule zone et ajouter les autres plus tard.

### Les autres utilisateurs doivent-ils configurer Firebase ?

Non ! La configuration est faite une seule fois par le super admin.

**Pour les autres utilisateurs :**
- Ils ouvrent l'app
- L'app est déjà configurée (si déployée)
- Ils se connectent, c'est tout !

### Pourquoi 4 projets Firebase au lieu d'un seul ?

Pour multiplier les quotas gratuits ! Chaque projet a ses propres limites. Avec 4 projets, vous avez 4× plus de ressources gratuites.

### Puis-je sauvegarder ma configuration ?

Oui ! Allez dans **Paramètres** → **"Exporter la configuration"**
Un fichier JSON est téléchargé. Vous pouvez le réimporter plus tard.

### Que se passe-t-il si je perds ma configuration ?

Si vous videz le cache du navigateur, la configuration est perdue.
Mais vous pouvez :
1. Relancer le Setup Wizard
2. Ou importer votre sauvegarde JSON

---

## 🚀 Déploiement en Production

Une fois que tout fonctionne localement :

```bash
# Build
npm run build

# La configuration est automatiquement incluse dans le build !

# Déployez sur Firebase Hosting (Zone 1)
firebase use zone1
firebase deploy --only hosting

# Ou sur Vercel
vercel deploy
```

**Les autres utilisateurs n'auront rien à configurer !** 🎉

---

## 🎊 Félicitations !

Vous avez maintenant une application de maintenance **professionnelle**, **scalable** et **100% gratuite** configurée en moins de 10 minutes !

**Prochaines étapes :**
- Créez vos établissements
- Invitez les admins
- Configurez Gmail OAuth2 dans les paramètres de chaque établissement
- Les rappels automatiques démarrent le lendemain à 8h ! ⏰

---

## 📊 Récapitulatif des coûts

**Avec cette configuration :**
- 🆓 **0€/mois** pour 3000 établissements
- 🆓 **0€/mois** pour 180 000 fiches
- 🆓 **0€/mois** pour les emails (via Gmail API)
- 🆓 **0€/mois** pour l'hébergement (Firebase Hosting gratuit)

**Et si vous dépassez les limites gratuites (très improbable) :**
- 💰 ~**20€/mois** au maximum
- 💳 Facturation centralisée sur un seul compte
- 📊 Transparence totale des coûts dans la console Firebase

---

**Besoin d'aide ? Consultez README.md pour plus de détails !** 📖
