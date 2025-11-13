# Configuration du Super Admin

## Bonne nouvelle : L'application est déjà fermée ! 🔒

Il n'y a **aucune route d'inscription publique**. Seuls les comptes créés manuellement peuvent se connecter.

## 1. Créer le premier compte Super Admin

Pour créer le compte Super Admin, tu as 2 options :

### Option A : Depuis la console Firebase (Recommandé)

1. **Crée le compte dans Firebase Authentication**
   - Va sur https://console.firebase.google.com
   - Sélectionne ton projet **maintenance-zone1**
   - Va dans **Authentication** > **Users**
   - Clique sur **Add User**
   - Email : `ton-email@exemple.com`
   - Mot de passe : `MotDePasseSecurise123!`
   - Copie l'UID de l'utilisateur créé (ex: `abc123def456`)

2. **Ajoute le document dans Firestore**
   - Va dans **Firestore Database**
   - Crée une collection `superAdmins`
   - Ajoute un document avec l'UID comme ID
   - Champs à ajouter :
     ```json
     {
       "email": "ton-email@exemple.com",
       "createdAt": [Date et heure actuelles],
       "name": "Ton Nom"
     }
     ```

### Option B : Avec un script (Plus rapide)

J'ai créé un script pour toi. Ouvre la console de ton navigateur sur http://localhost:5173/ et colle ce code :

```javascript
// ATTENTION : À exécuter UNE SEULE FOIS pour créer le super admin
(async () => {
  // Importe Firebase
  const { getAuth, createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
  const { getFirestore, doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

  // Configuration
  const EMAIL = "admin@maintenance.com"; // ← Change cet email
  const PASSWORD = "SuperAdmin2024!"; // ← Change ce mot de passe
  const NAME = "Super Admin"; // ← Change ce nom

  try {
    // Récupère les instances Firebase zone1
    const auth = window.firebaseAuth || getAuth();
    const db = window.firebaseDb || getFirestore();

    // Crée le compte
    const userCredential = await createUserWithEmailAndPassword(auth, EMAIL, PASSWORD);
    const uid = userCredential.user.uid;

    // Ajoute dans Firestore
    await setDoc(doc(db, 'superAdmins', uid), {
      email: EMAIL,
      name: NAME,
      createdAt: new Date(),
    });

    console.log('✅ Super Admin créé avec succès !');
    console.log('📧 Email:', EMAIL);
    console.log('🔑 Mot de passe:', PASSWORD);
    console.log('🆔 UID:', uid);

    alert('Super Admin créé ! Tu peux maintenant te connecter.');
  } catch (error) {
    console.error('❌ Erreur:', error);
    alert('Erreur : ' + error.message);
  }
})();
```

## 2. Se connecter en tant que Super Admin

Après avoir créé le compte :

1. Va sur http://localhost:5173/
2. Connecte-toi avec :
   - Email : celui que tu as défini
   - Mot de passe : celui que tu as défini
3. Tu seras redirigé vers le **Dashboard Super Admin**

## 3. Créer des comptes Admin Établissement

Une fois connecté en Super Admin :

1. Va dans **"Établissements"** dans le menu
2. Clique sur **"Ajouter un établissement"**
3. Remplis les informations :
   - Nom de l'établissement
   - Adresse
   - Code postal (important pour la zone)
   - Email de l'admin
   - Mot de passe de l'admin
4. Le compte admin établissement sera créé automatiquement

L'admin établissement pourra ensuite se connecter avec son email et mot de passe.

## 4. Architecture des comptes

```
📊 Super Admin (1 compte)
  └─ A accès à tout
  └─ Peut créer des établissements
  └─ Chaque établissement = 1 admin

📍 Admin Établissement (1 par établissement)
  └─ Accès uniquement à SON établissement
  └─ Gère les fiches de maintenance
  └─ Gère les contacts
  └─ Peut voir l'historique
```

## 5. Logs de connexion

Tu veux voir qui se connecte ?

Firebase Authentication te permet de voir tous les utilisateurs :
- Va sur https://console.firebase.google.com
- Authentication > Users
- Tu verras : email, date de création, dernière connexion

## Sécurité ✅

- ✅ Pas d'inscription publique
- ✅ Seuls les comptes créés peuvent se connecter
- ✅ Le Super Admin contrôle qui a accès
- ✅ Chaque admin établissement ne voit que SES données
