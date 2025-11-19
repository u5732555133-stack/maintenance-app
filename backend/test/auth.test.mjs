/**
 * Tests unitaires pour les middlewares d'authentification et d'autorisation
 *
 * Ce fichier teste :
 * - authenticateToken
 * - requireSuperAdmin
 * - requireEtablissementAccess
 * - requireResourceAccess
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Charger la configuration .env
dotenv.config();

// S'assurer qu'on a un JWT_SECRET pour les tests
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-testing';
}

// Import des middlewares à tester
import {
  authenticateToken,
  requireSuperAdmin,
  requireEtablissementAccess,
  requireResourceAccess,
  generateToken
} from '../middleware/auth.js';

describe('Middleware authenticateToken', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  it('devrait rejeter une requête sans token', () => {
    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token manquant' });
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait rejeter un token invalide', () => {
    req.headers['authorization'] = 'Bearer invalid-token';

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token invalide' });
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait accepter un token valide et ajouter user à req', () => {
    const user = { id: 1, email: 'test@test.com', role: 'super_admin' };
    const token = generateToken(user);
    req.headers['authorization'] = `Bearer ${token}`;

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('test@test.com');
  });
});

describe('Middleware requireSuperAdmin', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  it('devrait bloquer un utilisateur non super admin', () => {
    req.user.role = 'responsable';

    requireSuperAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Accès réservé aux super admins' });
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait autoriser un super admin', () => {
    req.user.role = 'super_admin';

    requireSuperAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('Middleware requireEtablissementAccess', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { etablissement_id: 1 },
      params: {},
      body: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  it('devrait autoriser un super admin sans vérification établissement', () => {
    req.user.role = 'super_admin';
    req.params.etablissementId = '2'; // Différent de l'établissement de l'utilisateur

    requireEtablissementAccess(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('devrait autoriser un utilisateur accédant à son établissement (via params)', () => {
    req.user.role = 'responsable';
    req.user.etablissement_id = 1;
    req.params.etablissementId = '1';

    requireEtablissementAccess(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('devrait autoriser un utilisateur accédant à son établissement (via body)', () => {
    req.user.role = 'responsable';
    req.user.etablissement_id = 1;
    req.body.etablissement_id = 1;

    requireEtablissementAccess(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('devrait bloquer un utilisateur accédant à un autre établissement', () => {
    req.user.role = 'responsable';
    req.user.etablissement_id = 1;
    req.params.etablissementId = '2'; // Établissement différent

    requireEtablissementAccess(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Accès non autorisé à cet établissement' });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('Middleware requireResourceAccess', () => {
  let req, res, next, mockPool;

  beforeEach(() => {
    req = {
      user: {
        role: 'responsable',
        etablissement_id: 1
      },
      params: { id: '10' }
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  it('devrait autoriser un super admin sans vérification', async () => {
    req.user.role = 'super_admin';
    const middleware = requireResourceAccess('fiche');

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  // Note: Les tests suivants nécessiteraient de mocker le module pool
  // qui est importé dynamiquement dans le middleware. Pour une vraie implémentation,
  // il faudrait utiliser un framework de mock plus avancé ou refactorer le code
  // pour injecter la dépendance pool.
});

describe('Fonction generateToken', () => {
  it('devrait générer un token JWT valide', () => {
    const user = {
      id: 1,
      email: 'test@test.com',
      role: 'super_admin',
      etablissement_id: null
    };

    const token = generateToken(user);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // Vérifier que le token peut être décodé
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(user.id);
    expect(decoded.email).toBe(user.email);
    expect(decoded.role).toBe(user.role);
  });

  it('devrait inclure etablissement_id dans le token si fourni', () => {
    const user = {
      id: 2,
      email: 'admin@etablissement.com',
      role: 'responsable',
      etablissement_id: 5
    };

    const token = generateToken(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.etablissement_id).toBe(5);
  });
});
