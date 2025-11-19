# Guide de Test Manuel - Sécurité des Routes

## Objectif
Tester que les middlewares de sécurité fonctionnent correctement après les corrections.

## Prérequis
- Backend démarré sur le RPI ou localement
- Un compte super_admin
- Un compte admin établissement (responsable)

## Tests à effectuer

### 1. Création de Contact - Admin Établissement

**Scénario**: Un admin d'établissement crée un contact pour son propre établissement

1. Se connecter avec un compte `responsable`
2. Récupérer le token JWT
3. Créer un contact via POST `/api/contacts` avec le bon `etablissement_id`

**Résultat attendu**: ✅ Le contact doit être créé avec succès

**Commande curl**:
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@etablissement.com","password":"votre-password"}' \
  | jq -r '.token')

# 2. Créer un contact
curl -X POST http://localhost:3001/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "etablissement_id": 1,
    "nom": "Test Contact",
    "prenom": "John",
    "email": "test@test.com"
  }'
```

---

### 2. Création de Contact - Cross-Establishment (DOIT ÉCHOUER)

**Scénario**: Un admin d'établissement tente de créer un contact pour un AUTRE établissement

1. Se connecter avec un compte `responsable` de l'établissement #1
2. Essayer de créer un contact pour l'établissement #2

**Résultat attendu**: ❌ Erreur 403 "Accès non autorisé à cet établissement"

**Commande curl**:
```bash
# Créer un contact pour un autre établissement (doit échouer)
curl -X POST http://localhost:3001/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "etablissement_id": 2,
    "nom": "Malicious Contact",
    "email": "hacker@evil.com"
  }'
```

---

### 3. Création de Fiche - Admin Établissement

**Scénario**: Un admin d'établissement crée une fiche de maintenance pour son établissement

**Résultat attendu**: ✅ La fiche doit être créée avec succès

**Commande curl**:
```bash
curl -X POST http://localhost:3001/api/fiches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "etablissement_id": 1,
    "nom_tache": "Test Maintenance",
    "frequence_mois": 6,
    "responsable_nom": "Test User",
    "responsable_email": "test@test.com"
  }'
```

---

### 4. Création de Fiche - Cross-Establishment (DOIT ÉCHOUER)

**Résultat attendu**: ❌ Erreur 403 "Accès non autorisé à cet établissement"

**Commande curl**:
```bash
curl -X POST http://localhost:3001/api/fiches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "etablissement_id": 2,
    "nom_tache": "Malicious Task",
    "frequence_mois": 1
  }'
```

---

### 5. Modification de Contact d'un Autre Établissement (DOIT ÉCHOUER)

**Scénario**: Un admin d'établissement #1 tente de modifier un contact de l'établissement #2

**Résultat attendu**: ❌ Erreur 403 "Accès non autorisé à cette ressource"

**Commande curl**:
```bash
# Supposons que le contact ID 10 appartient à l'établissement #2
curl -X PUT http://localhost:3001/api/contacts/10 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nom": "Modified Name",
    "email": "modified@test.com"
  }'
```

---

### 6. Suppression de Contact d'un Autre Établissement (DOIT ÉCHOUER)

**Résultat attendu**: ❌ Erreur 403 "Accès non autorisé à cette ressource"

**Commande curl**:
```bash
curl -X DELETE http://localhost:3001/api/contacts/10 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 7. Super Admin - Accès Complet

**Scénario**: Un super admin doit pouvoir créer/modifier/supprimer des ressources de n'importe quel établissement

**Résultat attendu**: ✅ Toutes les opérations doivent réussir

**Commande curl**:
```bash
# 1. Login super admin
SUPER_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"super@admin.com","password":"votre-password"}' \
  | jq -r '.token')

# 2. Créer contact pour n'importe quel établissement
curl -X POST http://localhost:3001/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -d '{
    "etablissement_id": 1,
    "nom": "Super Admin Contact",
    "email": "superadmin@test.com"
  }'

# 3. Créer fiche pour n'importe quel établissement
curl -X POST http://localhost:3001/api/fiches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPER_TOKEN" \
  -d '{
    "etablissement_id": 1,
    "nom_tache": "Super Admin Task"
  }'
```

---

## Checklist de Validation

- [ ] Admin établissement peut créer contact pour son établissement
- [ ] Admin établissement NE PEUT PAS créer contact pour autre établissement
- [ ] Admin établissement peut créer fiche pour son établissement
- [ ] Admin établissement NE PEUT PAS créer fiche pour autre établissement
- [ ] Admin établissement peut modifier contact de son établissement
- [ ] Admin établissement NE PEUT PAS modifier contact d'autre établissement
- [ ] Admin établissement peut supprimer contact de son établissement
- [ ] Admin établissement NE PEUT PAS supprimer contact d'autre établissement
- [ ] Super admin a accès complet à tous les établissements

## Codes d'erreur attendus

- `401` - Token manquant ou invalide
- `403` - Accès refusé (mauvais établissement ou mauvaise ressource)
- `404` - Ressource non trouvée
- `200/201` - Succès

## Notes

Tous les tests ont été validés par les tests unitaires automatisés (`npm test` dans le backend).
