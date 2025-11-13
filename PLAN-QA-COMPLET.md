# Plan de QA Complet - Application Maintenance

## Objectif de l'Application

Gérer les fiches de maintenance d'établissement avec :
- ✅ Gestion des fiches (CRUD)
- ✅ Association responsable + adjoint
- ⏳ **Envoi automatique par email**
- ⏳ **Lien de confirmation d'exécution**
- ⏳ **Suivi des dates d'exécution**

---

## Tests Fonctionnels

### 1. Authentification

#### 1.1 Connexion Super Admin
- [ ] Se connecter avec brianskuratko@gmail.com
- [ ] Vérifier redirection vers /super-admin/dashboard
- [ ] Vérifier que le menu affiche les bonnes options
- [ ] Tester déconnexion

#### 1.2 Connexion Admin Établissement
- [ ] Se connecter avec test@etablissement.com
- [ ] Vérifier redirection vers /etablissement/dashboard
- [ ] Vérifier que le menu affiche les bonnes options
- [ ] Tester déconnexion

#### 1.3 Cas d'erreur
- [ ] Email invalide
- [ ] Mot de passe incorrect
- [ ] Champs vides

---

### 2. Super Admin - Gestion des Établissements

#### 2.1 Création d'établissement
- [ ] Ouvrir modal "+ Nouvel établissement"
- [ ] Remplir formulaire complet
- [ ] Vérifier validation des champs
- [ ] Créer établissement
- [ ] Vérifier que le compte admin est créé
- [ ] Tester connexion avec le nouveau compte

#### 2.2 Affichage
- [ ] Liste tous les établissements
- [ ] Affiche zone correctement
- [ ] Affiche email admin

#### 2.3 Suppression
- [ ] Supprimer un établissement
- [ ] Vérifier confirmation

#### 2.4 Dashboard
- [ ] Affiche stats correctes
- [ ] Total établissements
- [ ] Total fiches
- [ ] Fiches en attente
- [ ] Fiches en retard

---

### 3. Admin Établissement - Dashboard

#### 3.1 Statistiques
- [ ] Total fiches
- [ ] Fiches en attente
- [ ] Fiches en retard
- [ ] Total contacts

#### 3.2 Prochaines maintenances
- [ ] Liste des 5 prochaines
- [ ] Triées par date
- [ ] Badge "En retard" si applicable

---

### 4. Admin Établissement - Contacts

#### 4.1 Création
- [ ] Ouvrir modal "+ Nouveau contact"
- [ ] Remplir nom, email, téléphone
- [ ] Validation email
- [ ] Créer contact
- [ ] Vérifier dans la liste

#### 4.2 Modification
- [ ] Cliquer "Modifier"
- [ ] Changer les données
- [ ] Sauvegarder
- [ ] Vérifier les modifications

#### 4.3 Suppression
- [ ] Cliquer "Supprimer"
- [ ] Confirmer
- [ ] Vérifier suppression

#### 4.4 Tri et affichage
- [ ] Contacts triés par nom
- [ ] Affiche email et téléphone

---

### 5. Admin Établissement - Fiches de Maintenance

#### 5.1 Création de fiche
- [ ] Ouvrir modal "+ Nouvelle fiche"
- [ ] Remplir nom tâche
- [ ] URL PDF
- [ ] Périodicité (1-12 mois)
- [ ] Date prochain envoi
- [ ] Responsable principal (nom + email)
- [ ] Responsable adjoint (nom + email)
- [ ] Sélectionner contacts
- [ ] Commentaire
- [ ] Créer fiche
- [ ] Vérifier dans la liste

#### 5.2 Modification de fiche
- [ ] Cliquer "Modifier"
- [ ] Changer les données
- [ ] Sauvegarder
- [ ] Vérifier les modifications

#### 5.3 Suppression de fiche
- [ ] Cliquer "Supprimer"
- [ ] Confirmer
- [ ] Vérifier suppression

#### 5.4 Affichage
- [ ] Liste toutes les fiches
- [ ] Affiche statut (badge)
- [ ] Affiche périodicité
- [ ] Affiche prochaine date
- [ ] Affiche dernière date si existe
- [ ] Affiche responsables
- [ ] Affiche contacts associés
- [ ] Lien vers PDF fonctionne

---

### 6. Navigation

#### 6.1 Menu Super Admin
- [ ] Dashboard
- [ ] Établissements
- [ ] Déconnexion

#### 6.2 Menu Admin Établissement
- [ ] Dashboard
- [ ] Fiches
- [ ] Contacts
- [ ] Historique
- [ ] Paramètres
- [ ] Déconnexion

#### 6.3 Routes protégées
- [ ] Super admin ne peut pas accéder routes établissement
- [ ] Admin établissement ne peut pas accéder routes super admin
- [ ] Non connecté redirigé vers login

---

### 7. Gestion des Erreurs

#### 7.1 Permissions Firestore
- [ ] Gestion gracieuse des zones sans permissions
- [ ] Messages d'erreur clairs

#### 7.2 Erreurs réseau
- [ ] Timeout
- [ ] Connexion perdue
- [ ] Messages utilisateur compréhensibles

#### 7.3 Validation formulaires
- [ ] Champs requis
- [ ] Format email
- [ ] Longueur mot de passe
- [ ] Messages d'erreur clairs

---

### 8. Responsivité

- [ ] Mobile (320px)
- [ ] Tablette (768px)
- [ ] Desktop (1024px+)
- [ ] Menus adaptés
- [ ] Modals adaptés

---

## Tests de Performance

- [ ] Temps de chargement dashboard < 2s
- [ ] Création fiche < 1s
- [ ] Navigation fluide
- [ ] Pas de memory leaks

---

## Fonctionnalités Manquantes à Implémenter

### ⏳ Priorité 1 : Système d'Envoi d'Emails

**Besoin :**
- Envoi automatique des fiches par email
- Email au responsable principal
- Email au responsable adjoint (si défini)
- CC aux contacts sélectionnés
- Lien de confirmation inclus

**À implémenter :**
1. Cloud Function Firebase pour envoi emails
2. Template email HTML
3. Génération de tokens de confirmation
4. Route publique pour confirmation
5. Mise à jour statut fiche après confirmation

### ⏳ Priorité 2 : Lien de Confirmation

**Besoin :**
- Lien unique par fiche/envoi
- Page publique de confirmation
- Capture date d'exécution
- Mise à jour automatique fiche

**À implémenter :**
1. Génération token unique
2. Stockage token + ficheId
3. Page publique /confirm/:token
4. Formulaire date + commentaire
5. Mise à jour Firestore

### ⏳ Priorité 3 : Planification Automatique

**Besoin :**
- Envoi automatique selon périodicité
- Calcul prochaine date après confirmation
- Notifications pour fiches en retard

**À implémenter :**
1. Cloud Scheduler
2. Cloud Function de planification
3. Logique calcul prochaine date
4. Système de notifications

### ⏳ Priorité 4 : Historique Détaillé

**Besoin :**
- Historique de tous les envois
- Dates d'exécution
- Qui a confirmé
- Commentaires

**À implémenter :**
1. Collection "historique" par fiche
2. Interface liste historique
3. Filtres et recherche
4. Export PDF/Excel

---

## Bugs Connus

### 🐛 Bug 1 : Redirection après login
- **Problème :** userRole pas encore mis à jour après signIn
- **Solution :** Utiliser useEffect pour redirection
- **Statut :** ✅ Corrigé

### 🐛 Bug 2 : Document utilisateur avec mauvais ID
- **Problème :** addDoc créait ID aléatoire au lieu de UID
- **Solution :** Utiliser setDoc avec UID
- **Statut :** ✅ Corrigé

### 🐛 Bug 3 : Modal établissement invisible
- **Problème :** z-index overlay couvrait formulaire
- **Solution :** Ajuster hiérarchie z-index
- **Statut :** ✅ Corrigé

### 🐛 Bug 4 : Dashboard Super Admin erreurs 400
- **Problème :** ???
- **Statut :** ⏳ À investiguer

---

## Scripts de Test Disponibles

```bash
# Test connexion
node test-login.mjs [EMAIL] [PASSWORD]

# Test création établissement
node test-create-etablissement.mjs

# Test flux complet
node test-complete-flow.mjs

# Test permissions zones
node test-zones.mjs
```

---

## Checklist Finale Avant Production

- [ ] Tous les tests fonctionnels passent
- [ ] Pas d'erreurs console
- [ ] Pas de warnings React
- [ ] Responsive testé
- [ ] Emails fonctionnent
- [ ] Liens de confirmation fonctionnent
- [ ] Historique complet
- [ ] Documentation à jour
- [ ] Variables d'environnement configurées
- [ ] Règles Firestore sécurisées
- [ ] Backup automatique configuré
