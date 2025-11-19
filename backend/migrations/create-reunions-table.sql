-- Migration : Création de la table reunions
-- Date : 2025-11-19
-- Description : Table pour gérer les réunions récurrentes de l'établissement

-- Table des réunions
CREATE TABLE IF NOT EXISTS reunions (
  id SERIAL PRIMARY KEY,
  etablissement_id INTEGER REFERENCES etablissements(id) ON DELETE CASCADE,

  -- Informations de la réunion
  nom VARCHAR(255) NOT NULL,
  description TEXT,

  -- Récurrence
  jour_semaine INTEGER NOT NULL CHECK (jour_semaine >= 0 AND jour_semaine <= 6), -- 0=Dimanche, 1=Lundi, ..., 6=Samedi
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  frequence VARCHAR(50) NOT NULL DEFAULT 'hebdomadaire', -- 'hebdomadaire', 'bi-mensuel', 'mensuel'

  -- Localisation
  lieu VARCHAR(255),
  url_visio TEXT, -- Lien Zoom, Teams, Meet, etc.

  -- État
  actif BOOLEAN DEFAULT true,

  -- Métadonnées
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_hours CHECK (heure_debut < heure_fin)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reunions_etablissement ON reunions(etablissement_id);
CREATE INDEX IF NOT EXISTS idx_reunions_actif ON reunions(actif);
CREATE INDEX IF NOT EXISTS idx_reunions_jour ON reunions(jour_semaine);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_reunions_updated_at
  BEFORE UPDATE ON reunions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Données de test pour l'établissement Aucamville (id=6)
INSERT INTO reunions (etablissement_id, nom, description, jour_semaine, heure_debut, heure_fin, frequence, lieu, url_visio, actif)
VALUES
  (6, 'Réunion Hebdo Équipe', 'Réunion hebdomadaire de l''équipe', 1, '10:00:00', '11:00:00', 'hebdomadaire', 'Salle de réunion A', 'https://zoom.us/j/example1', true),
  (6, 'Point Direction', 'Point mensuel avec la direction', 1, '14:00:00', '15:30:00', 'mensuel', 'Bureau Direction', NULL, true),
  (6, 'Suivi Projets', 'Suivi bi-mensuel des projets en cours', 3, '09:00:00', '10:00:00', 'bi-mensuel', NULL, 'https://meet.google.com/abc-defg-hij', true);
