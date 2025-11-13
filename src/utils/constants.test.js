import { describe, it, expect } from 'vitest';
import { MODULES, ROLES, STATUTS_FICHE, ZONES, MODULES_LABELS } from './constants';

describe('Constants', () => {
  describe('MODULES', () => {
    it('contains maintenance module', () => {
      expect(MODULES.MAINTENANCE).toBe('maintenance');
    });

    it('contains all expected modules', () => {
      expect(MODULES).toHaveProperty('MAINTENANCE');
      expect(MODULES).toHaveProperty('REUNIONS');
      expect(MODULES).toHaveProperty('DOCUMENTS');
      expect(MODULES).toHaveProperty('COMPTABILITE');
    });
  });

  describe('ROLES', () => {
    it('contains all user roles', () => {
      expect(ROLES).toHaveProperty('SUPER_ADMIN');
      expect(ROLES).toHaveProperty('ADMIN_ETABLISSEMENT');
      expect(ROLES).toHaveProperty('USER_ETABLISSEMENT');
      expect(ROLES).toHaveProperty('USER');
    });

    it('admin role has correct value', () => {
      expect(ROLES.ADMIN_ETABLISSEMENT).toBe('admin_etablissement');
    });
  });

  describe('STATUTS_FICHE', () => {
    it('contains all fiche statuses', () => {
      expect(STATUTS_FICHE).toHaveProperty('EN_ATTENTE');
      expect(STATUTS_FICHE).toHaveProperty('ENVOYE');
      expect(STATUTS_FICHE).toHaveProperty('REALISE');
    });

    it('statuses have correct values', () => {
      expect(STATUTS_FICHE.EN_ATTENTE).toBe('en_attente');
      expect(STATUTS_FICHE.ENVOYE).toBe('envoye');
      expect(STATUTS_FICHE.REALISE).toBe('realise');
    });
  });

  describe('ZONES', () => {
    it('contains all zones', () => {
      expect(ZONES).toHaveProperty('ZONE1');
      expect(ZONES).toHaveProperty('ZONE2');
      expect(ZONES).toHaveProperty('ZONE3');
      expect(ZONES).toHaveProperty('ZONE4');
    });
  });

  describe('MODULES_LABELS', () => {
    it('has labels for all modules', () => {
      expect(MODULES_LABELS.maintenance).toBe('Maintenance');
      expect(MODULES_LABELS.reunions).toBe('Réunions');
    });
  });
});
