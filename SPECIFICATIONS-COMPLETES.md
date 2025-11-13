# Spécifications Complètes - Plateforme de Gestion Multi-Modules

## 🎯 Vision

**Plateforme de gestion scalable et modulaire** pour associations avec plusieurs établissements géographiques.
Modules actuels : Maintenance, Réunions (extensible à l'infini).

---

## 👥 Hiérarchie des Utilisateurs

### 1. Super Admin (Admin Général de l'Association)
**Rôle :** Gère l'infrastructure globale
- ✅ Crée les établissements
- ✅ Crée les comptes Admin Établissement
- ✅ Voit les stats globales
- ✅ Accès à tous les établissements

### 2. Admin Établissement
**Rôle :** Gère son établissement
- ⏳ Configure l'adresse email d'envoi (SMTP)
- ⏳ Crée les utilisateurs de son établissement
- ⏳ Peut déléguer/transférer la propriété
- ✅ Gère les modules activés
- ✅ Gère les fiches de maintenance
- ✅ Gère les contacts
- ⏳ Gère les réunions

### 3. Utilisateur Établissement (Nouveau rôle)
**Rôle :** Utilisateur basique de l'établissement
- Peut être responsable de fiches
- Peut être exécuteur de fiches
- Accès lecture seule aux fiches dont il est responsable
- Reçoit les emails de notification

---

## 🏗️ Architecture Modulaire

### Structure des Modules

```
/modules
  /maintenance
    - Fiches
    - Contacts
    - Historique
  /reunions
    - Calendrier
    - Liens Zoom/Teams
    - Participants
  /documents (futur)
  /comptabilite (futur)
```

### Configuration Établissement

```javascript
etablissement: {
  id, nom, adresse, codePostal, ville, zone,
  adminUid, adminEmail,

  // NOUVEAU : Configuration modules
  modulesActifs: ['maintenance', 'reunions'],

  // NOUVEAU : Configuration email
  emailConfig: {
    type: 'smtp' | 'sendgrid' | 'mailgun',
    from: 'admin@etablissement.fr',
    fromName: 'Nom Établissement',
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user, pass }
    }
  },

  // NOUVEAU : Paramètres délégation
  delegation: {
    canDelegate: true,
    delegatedTo: null  // UID du délégué
  }
}
```

---

## 📋 Module Maintenance (Amélioré)

### Structure Fiche de Maintenance

```javascript
fiche: {
  id, nomTache, urlPdf,

  // Fréquence et dates
  frequenceMois: 1-12,
  prochainEnvoi: Date,
  dernierEnvoi: Date,
  derniereExecution: Date,  // NOUVEAU

  // Responsables
  responsableNom, responsableEmail,
  responsableAdjointNom, responsableAdjointEmail,

  // NOUVEAU : Exécuteurs (plusieurs possibles)
  executeurs: [
    { uid, nom, email, fonction }
  ],

  // Contacts à notifier
  contactIds: [...],

  // État
  statut: 'en_attente' | 'en_cours' | 'terminee',
  commentaire,

  // NOUVEAU : Tracking
  envois: [
    {
      date: Date,
      emailsSent: [...],
      token: 'unique-token',
      confirmed: false,
      confirmedAt: null,
      confirmedBy: null,
      commentaireExecution: ''
    }
  ]
}
```

### Flux d'Envoi Email (Automatique)

```
1. Cloud Function (Scheduler) → Vérifie fiches à envoyer
2. Pour chaque fiche à envoyer :
   a. Génère token unique
   b. Envoie email via SMTP établissement
   c. Enregistre dans historique
3. Email contient :
   - Nom fiche
   - URL PDF
   - Contacts responsable + adjoint
   - Lien confirmation : https://app.com/confirm/:token
```

### Template Email

```html
Bonjour,

Vous devez effectuer la fiche de maintenance : **[NOM_FICHE]**

📄 Document : [Voir la fiche PDF]([URL_PDF])

👤 Responsable : [NOM] ([EMAIL])
👤 Responsable adjoint : [NOM] ([EMAIL])

⚠️ Merci de confirmer la date d'exécution via le lien ci-dessous :
🔗 [Confirmer l'exécution]([LIEN_CONFIRMATION])

---
Envoyé automatiquement par [NOM_ETABLISSEMENT]
```

### Page Confirmation Publique

```
URL : /confirm/:token

Affiche :
- Nom de la fiche
- Établissement
- Date d'envoi

Formulaire :
- Date d'exécution (requis)
- Commentaire (optionnel)
- Bouton "Confirmer"

→ Met à jour fiche :
  - derniereExecution = date saisie
  - statut = 'terminee'
  - prochainEnvoi = calcul auto (date + fréquence)
  - ajout dans historique
```

---

## 👥 Gestion des Utilisateurs Établissement

### Interface Admin Établissement

**Nouveau menu : "Utilisateurs"**

Liste des utilisateurs :
- Nom
- Email
- Fonction
- Date création
- Actions : Modifier, Supprimer

Créer utilisateur :
```javascript
utilisateur: {
  uid,  // Généré par Firebase Auth
  email,
  nom,
  fonction,
  etablissementId,
  role: 'user_etablissement',  // NOUVEAU rôle
  createdBy: adminUid,
  createdAt: Date,
  actif: true
}
```

**Pas de mot de passe initial** → Email de bienvenue avec lien reset password Firebase

---

## 🔄 Système de Délégation

### Interface Paramètres Établissement

**Section Délégation :**

```
□ Permettre la délégation
  ↓ Si activé :

  Déléguer la gestion à :
  [Dropdown des utilisateurs de l'établissement]

  [ ] Transférer définitivement (je perds l'accès)
  [ ] Délégation temporaire (je garde l'accès en lecture)

  [Bouton : Déléguer]
```

Lors de la délégation :
- Mise à jour `etablissement.delegation.delegatedTo`
- Mise à jour `users/:uid` → rôle devient `admin_etablissement`
- Email de notification
- (Option) Ancien admin perd les droits ou devient lecteur

---

## 📅 Module Réunions

### Structure Réunion

```javascript
reunion: {
  id,
  titre,
  description,
  date: Date,
  heure: 'HH:MM',
  duree: 60,  // minutes

  // Lien visio
  type: 'zoom' | 'teams' | 'meet' | 'autre',
  lien: 'https://zoom.us/j/...',

  // Participants
  participants: [
    { uid, nom, email, statut: 'invite' | 'accepte' | 'refuse' }
  ],

  // Notification
  rappelAvant: 24,  // heures

  // Fichiers
  ordreJour: 'URL',
  compteRendu: 'URL',

  statut: 'programmee' | 'annulee' | 'terminee',

  createdBy: uid,
  createdAt: Date
}
```

### Interface Module Réunions

**Vue Calendrier :**
- Calendrier mensuel
- Liste chronologique
- Filtres : À venir, Passées, Annulées

**Créer Réunion :**
- Formulaire simple
- Sélection participants (utilisateurs établissement)
- Champ lien Zoom/Teams
- Sélection rappel

**Email Invitation :**
- Envoyé automatiquement aux participants
- Bouton Accepter/Refuser (met à jour statut)
- Ajout au calendrier (.ics)

---

## 🔧 Configuration Email par Établissement

### Interface Paramètres → Email

**Options de configuration :**

1. **SMTP Personnalisé**
   ```
   Adresse expéditeur : [email@etablissement.fr]
   Nom expéditeur : [Nom Établissement]

   Serveur SMTP : [smtp.gmail.com]
   Port : [587]
   Sécurité : [TLS]

   Utilisateur : [email@etablissement.fr]
   Mot de passe : [••••••••]

   [Bouton : Tester la configuration]
   [Bouton : Enregistrer]
   ```

2. **SendGrid** (optionnel)
   ```
   API Key : [••••••••]
   ```

3. **Mailgun** (optionnel)
   ```
   API Key : [••••••••]
   Domain : [mg.etablissement.fr]
   ```

**Validation :**
- Test d'envoi lors de la configuration
- Email de test à l'admin
- Statut : ✅ Configuré | ❌ Non configuré | ⚠️ Erreur

---

## 🤖 Cloud Functions Firebase

### 1. Envoi Emails Maintenance

```javascript
// functions/sendMaintenanceEmails.js
// Déclenchement : Scheduler quotidien (8h00)

exports.sendMaintenanceEmails = functions.pubsub
  .schedule('0 8 * * *')
  .timeZone('Europe/Paris')
  .onRun(async (context) => {
    // Pour chaque zone
    //   Pour chaque établissement
    //     Charger config email
    //     Chercher fiches où prochainEnvoi <= aujourd'hui
    //     Pour chaque fiche :
    //       Générer token unique
    //       Envoyer email via SMTP config
    //       Enregistrer dans fiche.envois
  });
```

### 2. Confirmation Fiche

```javascript
// functions/confirmFiche.js
// Déclenchement : HTTP callable ou Firestore trigger

exports.confirmFiche = functions.https.onCall(async (data, context) => {
  // Valider token
  // Mettre à jour fiche :
  //   - derniereExecution
  //   - statut
  //   - prochainEnvoi (calcul auto)
  //   - envois[].confirmed = true
});
```

### 3. Rappels Réunions

```javascript
// functions/sendMeetingReminders.js
// Déclenchement : Scheduler horaire

exports.sendMeetingReminders = functions.pubsub
  .schedule('0 * * * *')
  .onRun(async (context) => {
    // Chercher réunions dans les 24h
    // Envoyer rappels aux participants
  });
```

---

## 📱 Navigation et Menu Dynamique

### Menu Super Admin
```
- Dashboard
- Établissements
- [Déconnexion]
```

### Menu Admin Établissement
```
- Dashboard
- [Modules actifs :]
  - Maintenance
    → Fiches
    → Contacts
    → Historique
  - Réunions
    → Calendrier
    → Mes réunions
- Utilisateurs
- Paramètres
  → Informations
  → Email
  → Modules
  → Délégation
- [Déconnexion]
```

### Menu Utilisateur Établissement
```
- Mes tâches
- [Modules accessibles :]
  - Maintenance (lecture seule)
  - Réunions
- [Déconnexion]
```

---

## 🗄️ Structure Firestore Complète

```
/zones/zone1/

  /users/{uid}
    - email, nom, role, etablissementId, dataZone, ...

  /superAdmins/{uid}
    - email, nom, ...

  /etablissements/{etabId}
    - nom, adresse, zone, adminUid, ...
    - modulesActifs: []
    - emailConfig: {}
    - delegation: {}

    /users/{uid}  // NOUVEAU : Utilisateurs de l'établissement
      - nom, email, fonction, role, ...

    /fiches/{ficheId}
      - nomTache, frequenceMois, ...
      - executeurs: []
      - envois: []

    /contacts/{contactId}
      - nom, email, telephone, ...

    /reunions/{reunionId}  // NOUVEAU
      - titre, date, lien, participants, ...

    /historique/{actionId}
      - type, description, date, userId, ...
```

---

## ✅ Checklist Implémentation

### Phase 1 : Base (✅ FAIT)
- [x] Authentification multi-rôles
- [x] Gestion établissements
- [x] Gestion contacts
- [x] Gestion fiches basique
- [x] Multi-zones Firebase

### Phase 2 : Architecture Modulaire (EN COURS)
- [ ] Système de modules activables
- [ ] Menu dynamique selon modules
- [ ] Refonte navigation

### Phase 3 : Gestion Utilisateurs
- [ ] CRUD utilisateurs établissement
- [ ] Nouveau rôle `user_etablissement`
- [ ] Email de bienvenue
- [ ] Association utilisateurs ↔ fiches

### Phase 4 : Configuration Email
- [ ] Interface config SMTP
- [ ] Test connexion SMTP
- [ ] Stockage sécurisé credentials
- [ ] Support SendGrid/Mailgun

### Phase 5 : Envoi Automatique
- [ ] Cloud Function scheduler
- [ ] Génération tokens
- [ ] Envoi emails via SMTP
- [ ] Template email HTML

### Phase 6 : Confirmation Publique
- [ ] Page /confirm/:token
- [ ] Validation token
- [ ] Formulaire confirmation
- [ ] Mise à jour automatique dates

### Phase 7 : Module Réunions
- [ ] Structure données réunions
- [ ] Interface calendrier
- [ ] CRUD réunions
- [ ] Envoi invitations
- [ ] Rappels automatiques

### Phase 8 : Délégation
- [ ] Interface paramètres
- [ ] Logique transfert
- [ ] Emails notification
- [ ] Gestion permissions

### Phase 9 : Historique Détaillé
- [ ] Tracking toutes actions
- [ ] Interface historique
- [ ] Filtres et recherche
- [ ] Export données

### Phase 10 : Tests & Doc
- [ ] Tests end-to-end
- [ ] Documentation utilisateur
- [ ] Guide admin
- [ ] Vidéos tutoriels

---

## 🚀 Prochaines Étapes Immédiates

1. **Refonte Navigation** → Menu modulaire
2. **Gestion Utilisateurs** → CRUD complet
3. **Config Email** → Interface SMTP
4. **Envoi Automatique** → Cloud Functions
5. **Page Confirmation** → Route publique
6. **Module Réunions** → Structure de base

---

**Date création :** 2025-11-12
**Statut :** En développement actif
**Version cible :** 2.0.0
