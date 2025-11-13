# Configuration Google OAuth pour Gmail - Guide Complet

## 🎯 Objectif

Permettre aux admins de connecter leur compte Google en 1 clic pour envoyer des emails via Gmail (gratuit, 500 emails/jour).

---

## 📋 Étapes de Configuration (À faire une seule fois)

### 1. Activer Gmail API dans Google Cloud Console

1. Va sur : https://console.cloud.google.com/
2. Sélectionne ton projet Firebase (maintenance-zone1)
3. Dans le menu, va sur **APIs & Services** > **Enable APIs and Services**
4. Cherche "Gmail API" et clique **Enable**

### 2. Créer les Credentials OAuth

1. Va sur **APIs & Services** > **Credentials**
2. Clique **Create Credentials** > **OAuth client ID**
3. Si demandé, configure l'écran de consentement :
   - User Type: **External**
   - App name: **Maintenance App**
   - User support email: ton email
   - Developer contact: ton email
   - Scopes: ajoute `https://www.googleapis.com/auth/gmail.send`
   - Test users: ajoute les emails des admins qui utiliseront l'app

4. Reviens sur **Credentials** > **Create OAuth client ID**
   - Application type: **Web application**
   - Name: **Maintenance App Web**
   - Authorized JavaScript origins:
     ```
     http://localhost:5173
     https://ton-app.vercel.app
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:5173/oauth/callback
     https://ton-app.vercel.app/oauth/callback
     ```

5. Note bien :
   - **Client ID** : `xxxxxxxxx.apps.googleusercontent.com`
   - **Client Secret** : `xxxxx-xxxxxxxxxxxx`

### 3. Configurer dans Firebase

Ajoute ces variables d'environnement aux Cloud Functions :

```bash
firebase functions:config:set \
  google.oauth.client_id="TON_CLIENT_ID" \
  google.oauth.client_secret="TON_CLIENT_SECRET" \
  google.oauth.redirect_uri="https://ton-app.vercel.app/oauth/callback"
```

Pour le dev local :
```bash
# Créer .runtimeconfig.json dans functions/
{
  "google": {
    "oauth": {
      "client_id": "TON_CLIENT_ID",
      "client_secret": "TON_CLIENT_SECRET",
      "redirect_uri": "http://localhost:5173/oauth/callback"
    }
  }
}
```

---

## 🚀 Workflow Utilisateur (Ultra Simple!)

### Pour l'Admin Établissement :

1. Va dans **Paramètres** > **Configuration Email**
2. Choisit **"Google (Gmail) - Recommandé"**
3. Clique sur le bouton **"Connecter avec Google"**
4. Popup Google → Sélectionne ton compte Gmail
5. Autorise l'accès (lecture/envoi d'emails)
6. Redirection automatique → **Configuration terminée !** ✅

C'est tout ! Plus besoin de :
- ❌ Créer des clés API
- ❌ Configurer SMTP
- ❌ Générer des App Passwords
- ❌ Mémoriser des identifiants

### Stockage Sécurisé

Les tokens sont stockés chiffrés dans Firestore :
```javascript
emailConfig: {
  provider: 'google_oauth',
  googleEmail: 'admin@etablissement.com',
  refreshToken: 'encrypted_token_here',
  configured: true,
  configuredAt: Timestamp
}
```

---

## 📧 Envoi d'Emails

Une fois configuré, l'envoi est automatique :

```
Cloud Function sendDailyReminders (8h quotidien)
├─> Lit emailConfig de l'établissement
├─> Détecte provider: 'google_oauth'
├─> Utilise le refresh token pour obtenir access token
├─> Envoie via Gmail API
└─> Email parti de l'adresse Gmail de l'admin !
```

**Avantages :**
- ✅ Gratuit (500 emails/jour)
- ✅ Les emails viennent du compte Gmail réel (meilleure délivrabilité)
- ✅ Pas de spam
- ✅ Interface Gmail pour voir les emails envoyés

---

## 🔐 Sécurité

1. **Refresh Token chiffré** dans Firestore
2. **Scopes limités** : uniquement `gmail.send` (envoi seulement)
3. **OAuth Google** : standard industrie, ultra sécurisé
4. **Révocation possible** : admin peut révoquer depuis son compte Google

---

## 🐛 Dépannage

### Erreur "redirect_uri_mismatch"
→ Vérifie que l'URL est exactement la même dans Google Cloud Console

### Erreur "access_denied"
→ L'admin doit accepter les permissions dans la popup OAuth

### Token expiré
→ Le refresh token permet de renouveler automatiquement, pas d'action requise

---

## 📊 Limites Gmail

- **500 emails/jour** par compte Gmail
- **100 destinataires par email**
- Largement suffisant pour la maintenance préventive !

Si besoin de plus :
- Utiliser plusieurs comptes Gmail (1 par zone)
- Ou utiliser Resend/SendGrid pour gros volumes

---

## ✅ Checklist de Setup

- [ ] Gmail API activée dans Google Cloud Console
- [ ] OAuth credentials créées (Client ID + Secret)
- [ ] Redirect URIs configurées
- [ ] Variables d'environnement ajoutées dans Firebase
- [ ] Test de connexion OAuth réussi
- [ ] Test d'envoi d'email réussi

---

Une fois configuré, c'est **100% automatique** et **0€/mois** ! 🎉
