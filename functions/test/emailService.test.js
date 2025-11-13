const { expect } = require('chai');
const { generateMaintenanceEmailTemplate } = require('../src/emailService');

describe('Email Service', () => {
  describe('generateMaintenanceEmailTemplate', () => {
    it('should generate HTML email with all data', () => {
      const data = {
        contactNom: 'Jean Dupont',
        nomTache: 'Maintenance ascenseur',
        urlPdf: 'https://example.com/fiche.pdf',
        responsableNom: 'Pierre Martin',
        responsableEmail: 'pierre@example.com',
        confirmUrl: 'https://example.com/confirm/abc123',
        etablissementNom: 'Mon Établissement',
      };

      const html = generateMaintenanceEmailTemplate(data);

      expect(html).to.include('Jean Dupont');
      expect(html).to.include('Maintenance ascenseur');
      expect(html).to.include('Pierre Martin');
      expect(html).to.include('pierre@example.com');
      expect(html).to.include('https://example.com/confirm/abc123');
      expect(html).to.include('Mon Établissement');
    });

    it('should handle missing optional fields', () => {
      const data = {
        contactNom: 'Jean Dupont',
        nomTache: 'Maintenance ascenseur',
        confirmUrl: 'https://example.com/confirm/abc123',
        etablissementNom: 'Mon Établissement',
      };

      const html = generateMaintenanceEmailTemplate(data);

      expect(html).to.include('Jean Dupont');
      expect(html).to.include('Maintenance ascenseur');
      expect(html).to.not.include('Fiche technique');
      expect(html).to.not.include('Responsable :');
    });

    it('should generate valid HTML structure', () => {
      const data = {
        contactNom: 'Test',
        nomTache: 'Test Task',
        confirmUrl: 'https://example.com/confirm/test',
        etablissementNom: 'Test Corp',
      };

      const html = generateMaintenanceEmailTemplate(data);

      expect(html).to.include('<!DOCTYPE html');
      expect(html).to.include('<html');
      expect(html).to.include('<head>');
      expect(html).to.include('<body>');
      expect(html).to.include('</html>');
    });
  });
});
