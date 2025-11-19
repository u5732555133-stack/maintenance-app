# Changelog Sécurité - 19 Novembre 2025

## 🔒 Correctifs de Sécurité Critiques

### Problème Identifié

Les routes POST/PUT/DELETE pour les contacts et fiches de maintenance n'avaient **pas de vérification d'établissement**, créant une faille de sécurité majeure permettant à un admin d'établissement de créer/modifier/supprimer des ressources d'autres établissements.

### Impact

**Avant les corrections** :
- ❌ Un admin d'établissement #1 pouvait créer des contacts pour l'établissement #2
- ❌ Un admin pouvait modifier/supprimer des fiches d'autres établissements
- ❌ Aucune vérification d'appartenance des ressources lors des modifications

**Après les corrections** :
- ✅ Chaque admin ne peut créer que pour son propre établissement
- ✅ Impossible de modifier/supprimer des ressources d'autres établissements
- ✅ Super admin garde l'accès complet à tous les établissements

---

## 📋 Fichiers Modifiés

### 1. `/backend/middleware/auth.js`
**Ajout**: Nouveau middleware `requireResourceAccess(resourceType)`

**Fonction**: Vérifie que la ressource (contact ou fiche) demandée appartient bien à l'établissement de l'utilisateur.

```javascript
export const requireResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    const resourceId = req.params.id;

    // Super admin a accès à tout
    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    // Vérifier que la ressource appartient à l'établissement de l'utilisateur
    const table = resourceType === 'fiche' ? 'fiches_maintenance' : 'contacts';
    const result = await pool.query(
      `SELECT etablissement_id FROM ${table} WHERE id = $1`,
      [resourceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ressource non trouvée' });
    }

    if (result.rows[0].etablissement_id !== req.user.etablissement_id) {
      return res.status(403).json({ error: 'Accès non autorisé à cette ressource' });
    }

    next();
  };
};
```

---

### 2. `/backend/server.js`
**Import**: Ajout de `requireResourceAccess`

```javascript
import {
  authenticateToken,
  requireSuperAdmin,
  requireEtablissementAccess,
  requireResourceAccess,  // <- NOUVEAU
  generateToken
} from './middleware/auth.js';
```

**Routes Corrigées** :

#### Fiches de maintenance
- **POST `/api/fiches`** (ligne 295)
  - Avant: `authenticateToken`
  - Après: `authenticateToken, requireEtablissementAccess` ✅

- **PUT `/api/fiches/:id`** (ligne 335)
  - Avant: `authenticateToken`
  - Après: `authenticateToken, requireResourceAccess('fiche')` ✅

- **DELETE `/api/fiches/:id`** (ligne 378)
  - Avant: `authenticateToken`
  - Après: `authenticateToken, requireResourceAccess('fiche')` ✅

#### Contacts
- **POST `/api/contacts`** (ligne 413)
  - Avant: `authenticateToken`
  - Après: `authenticateToken, requireEtablissementAccess` ✅

- **PUT `/api/contacts/:id`** (ligne 437)
  - Avant: `authenticateToken`
  - Après: `authenticateToken, requireResourceAccess('contact')` ✅

- **DELETE `/api/contacts/:id`** (ligne 463)
  - Avant: `authenticateToken`
  - Après: `authenticateToken, requireResourceAccess('contact')` ✅

---

## 🧪 Tests Ajoutés

### Fichiers de test créés

1. **`/backend/test/auth.test.mjs`** (12 tests)
   - Tests des middlewares `authenticateToken`
   - Tests de `requireSuperAdmin`
   - Tests de `requireEtablissementAccess`
   - Tests de `requireResourceAccess`
   - Tests de `generateToken`

2. **`/backend/test/routes-security.test.mjs`** (18 tests)
   - Vérification que toutes les routes ont les bons middlewares
   - Validation de la configuration des imports
   - Tests de sécurité des routes établissements

### Configuration de test

- **`/backend/package.json`**
  - Ajout de vitest comme devDependency
  - Ajout scripts: `test` et `test:watch`

- **`/backend/vitest.config.js`**
  - Configuration pour environnement Node.js
  - Coverage activé

### Résultats

✅ **30 tests passent**
- 12 tests d'authentification/autorisation
- 18 tests de sécurité des routes

```bash
Test Files  2 passed (2)
     Tests  30 passed (30)
```

---

## 📚 Documentation Ajoutée

### `/backend/TEST-MANUEL-SECURITE.md`

Guide complet de test manuel incluant :
- 7 scénarios de test avec commandes curl
- Tests positifs (doivent réussir)
- Tests négatifs (doivent échouer avec 403)
- Checklist de validation

---

## 🚀 Déploiement

### Actions Requises

1. **Installer les dépendances backend**
   ```bash
   cd backend
   npm install
   ```

2. **Lancer les tests**
   ```bash
   npm test
   ```
   → Doit afficher "30 passed"

3. **Redémarrer le backend**
   - Sur le RPI : redémarrer le service backend
   - Localement : `npm run dev`

4. **Tester manuellement**
   - Suivre le guide `/backend/TEST-MANUEL-SECURITE.md`
   - Vérifier tous les scénarios

5. **Push vers GitHub**
   ```bash
   git add .
   git commit -m "fix(security): Add middleware protection for contacts and fiches routes

   - Add requireResourceAccess middleware to verify resource ownership
   - Secure POST/PUT/DELETE routes for fiches and contacts
   - Prevent cross-establishment access
   - Add 30 unit tests for security validation

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   git push
   ```

6. **Déployer sur Vercel**
   - Le frontend n'a pas changé, pas de redéploiement nécessaire
   - Vérifier que l'app continue de fonctionner

---

## 🔍 Vérification Post-Déploiement

- [ ] Backend redémarré sans erreur
- [ ] Tests manuels passent (voir TEST-MANUEL-SECURITE.md)
- [ ] Admin établissement peut créer contacts/fiches pour son établissement
- [ ] Admin établissement NE PEUT PAS accéder aux ressources d'autres établissements
- [ ] Super admin garde l'accès complet
- [ ] Pas de régression sur les fonctionnalités existantes

---

## 📊 Statistiques

- **Fichiers modifiés**: 2 (auth.js, server.js)
- **Fichiers créés**: 5 (2 tests, 1 config, 2 docs)
- **Lignes de code ajoutées**: ~350
- **Tests créés**: 30
- **Failles de sécurité corrigées**: 6 routes critiques

---

## 🎯 Prochaines Étapes Recommandées

1. **Audit de sécurité complet**
   - Vérifier les autres routes pour des problèmes similaires
   - Ajouter des tests d'intégration avec base de données

2. **Logging et monitoring**
   - Logger les tentatives d'accès non autorisées
   - Alertes sur les 403 répétés

3. **Rate limiting**
   - Ajouter un rate limiter pour prévenir les attaques par force brute

4. **Documentation API**
   - Documenter tous les endpoints avec Swagger/OpenAPI
   - Inclure les codes d'erreur et permissions

---

## ✅ Validation

- ✅ Code review effectué
- ✅ Tests unitaires passent (30/30)
- ✅ Documentation créée
- ⏳ Tests manuels à effectuer après déploiement
- ⏳ Validation en production

---

**Date**: 19 Novembre 2025
**Auteur**: Claude Code
**Type**: Correctif de Sécurité Critique
**Priorité**: 🔴 HAUTE
