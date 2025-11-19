/**
 * Tests de sécurité pour les routes API
 *
 * Ce fichier teste que :
 * - Les routes POST/PUT/DELETE fiches ont les bons middlewares
 * - Les routes POST/PUT/DELETE contacts ont les bons middlewares
 * - Les utilisateurs ne peuvent pas accéder aux ressources d'autres établissements
 *
 * Note: Ce sont des tests de validation de la configuration des routes.
 * Pour des tests d'intégration complets, il faudrait un serveur de test avec une base de données.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Sécurité des routes - Vérification du code', () => {
  let serverCode;

  // Lire le fichier server.js pour vérifier la configuration des routes
  const serverPath = path.join(__dirname, '../server.js');
  serverCode = fs.readFileSync(serverPath, 'utf8');

  describe('Routes FICHES - Middlewares de sécurité', () => {
    it('POST /api/fiches devrait avoir requireEtablissementAccess', () => {
      const postFichesRoute = /app\.post\(['"]\/api\/fiches['"]\s*,\s*authenticateToken\s*,\s*requireEtablissementAccess/;
      expect(serverCode).toMatch(postFichesRoute);
    });

    it('PUT /api/fiches/:id devrait avoir requireResourceAccess', () => {
      const putFichesRoute = /app\.put\(['"]\/api\/fiches\/:id['"]\s*,\s*authenticateToken\s*,\s*requireResourceAccess\(['"]fiche['"]\)/;
      expect(serverCode).toMatch(putFichesRoute);
    });

    it('DELETE /api/fiches/:id devrait avoir requireResourceAccess', () => {
      const deleteFichesRoute = /app\.delete\(['"]\/api\/fiches\/:id['"]\s*,\s*authenticateToken\s*,\s*requireResourceAccess\(['"]fiche['"]\)/;
      expect(serverCode).toMatch(deleteFichesRoute);
    });

    it('GET /api/etablissements/:etablissementId/fiches devrait avoir requireEtablissementAccess', () => {
      const getFichesRoute = /app\.get\(['"]\/api\/etablissements\/:etablissementId\/fiches['"]\s*,\s*authenticateToken\s*,\s*requireEtablissementAccess/;
      expect(serverCode).toMatch(getFichesRoute);
    });
  });

  describe('Routes CONTACTS - Middlewares de sécurité', () => {
    it('POST /api/contacts devrait avoir requireEtablissementAccess', () => {
      const postContactsRoute = /app\.post\(['"]\/api\/contacts['"]\s*,\s*authenticateToken\s*,\s*requireEtablissementAccess/;
      expect(serverCode).toMatch(postContactsRoute);
    });

    it('PUT /api/contacts/:id devrait avoir requireResourceAccess', () => {
      const putContactsRoute = /app\.put\(['"]\/api\/contacts\/:id['"]\s*,\s*authenticateToken\s*,\s*requireResourceAccess\(['"]contact['"]\)/;
      expect(serverCode).toMatch(putContactsRoute);
    });

    it('DELETE /api/contacts/:id devrait avoir requireResourceAccess', () => {
      const deleteContactsRoute = /app\.delete\(['"]\/api\/contacts\/:id['"]\s*,\s*authenticateToken\s*,\s*requireResourceAccess\(['"]contact['"]\)/;
      expect(serverCode).toMatch(deleteContactsRoute);
    });

    it('GET /api/etablissements/:etablissementId/contacts devrait avoir requireEtablissementAccess', () => {
      const getContactsRoute = /app\.get\(['"]\/api\/etablissements\/:etablissementId\/contacts['"]\s*,\s*authenticateToken\s*,\s*requireEtablissementAccess/;
      expect(serverCode).toMatch(getContactsRoute);
    });
  });

  describe('Import des middlewares', () => {
    it('devrait importer requireResourceAccess', () => {
      const importStatement = /import\s+\{[^}]*requireResourceAccess[^}]*\}\s+from\s+['"]\.\/middleware\/auth\.js['"]/;
      expect(serverCode).toMatch(importStatement);
    });

    it('devrait importer requireEtablissementAccess', () => {
      const importStatement = /import\s+\{[^}]*requireEtablissementAccess[^}]*\}\s+from\s+['"]\.\/middleware\/auth\.js['"]/;
      expect(serverCode).toMatch(importStatement);
    });

    it('devrait importer authenticateToken', () => {
      const importStatement = /import\s+\{[^}]*authenticateToken[^}]*\}\s+from\s+['"]\.\/middleware\/auth\.js['"]/;
      expect(serverCode).toMatch(importStatement);
    });
  });

  describe('Routes ÉTABLISSEMENTS - Réservées super admin', () => {
    it('POST /api/etablissements devrait avoir requireSuperAdmin', () => {
      const postEtabRoute = /app\.post\(['"]\/api\/etablissements['"]\s*,\s*authenticateToken\s*,\s*requireSuperAdmin/;
      expect(serverCode).toMatch(postEtabRoute);
    });

    it('PUT /api/etablissements/:id devrait avoir requireSuperAdmin', () => {
      const putEtabRoute = /app\.put\(['"]\/api\/etablissements\/:id['"]\s*,\s*authenticateToken\s*,\s*requireSuperAdmin/;
      expect(serverCode).toMatch(putEtabRoute);
    });

    it('DELETE /api/etablissements/:id devrait avoir requireSuperAdmin', () => {
      const deleteEtabRoute = /app\.delete\(['"]\/api\/etablissements\/:id['"]\s*,\s*authenticateToken\s*,\s*requireSuperAdmin/;
      expect(serverCode).toMatch(deleteEtabRoute);
    });
  });
});

describe('Middleware auth.js - Vérification de l\'implémentation', () => {
  let authCode;

  const authPath = path.join(__dirname, '../middleware/auth.js');
  authCode = fs.readFileSync(authPath, 'utf8');

  it('devrait exporter requireResourceAccess', () => {
    expect(authCode).toMatch(/export\s+(const|function)\s+requireResourceAccess/);
  });

  it('requireResourceAccess devrait vérifier l\'établissement de la ressource', () => {
    expect(authCode).toMatch(/etablissement_id/);
    expect(authCode).toMatch(/SELECT.*FROM.*WHERE/);
  });

  it('requireResourceAccess devrait supporter les types "fiche" et "contact"', () => {
    expect(authCode).toMatch(/fiches_maintenance/);
    expect(authCode).toMatch(/contacts/);
  });

  it('requireEtablissementAccess devrait autoriser les super admins', () => {
    const superAdminCheck = /if\s*\(\s*req\.user\.role\s*===\s*['"]super_admin['"]\s*\)/;
    expect(authCode).toMatch(superAdminCheck);
  });
});
