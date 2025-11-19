import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware pour vérifier le token JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Middleware pour vérifier que l'utilisateur est un super admin
export const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Accès réservé aux super admins' });
  }
  next();
};

// Middleware pour vérifier que l'utilisateur appartient à l'établissement
export const requireEtablissementAccess = (req, res, next) => {
  const etablissementId = parseInt(req.params.etablissementId || req.body.etablissement_id);

  if (req.user.role === 'super_admin') {
    // Super admin a accès à tout
    next();
    return;
  }

  if (req.user.etablissement_id !== etablissementId) {
    return res.status(403).json({ error: 'Accès non autorisé à cet établissement' });
  }

  next();
};

// Middleware pour vérifier que la ressource appartient à l'établissement de l'utilisateur
export const requireResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    // Import dynamique de pool pour éviter la dépendance circulaire
    const pool = (await import('../db.js')).default;

    const resourceId = req.params.id;

    // Super admin a accès à tout
    if (req.user.role === 'super_admin') {
      next();
      return;
    }

    try {
      // Déterminer la table selon le type de ressource
      let table;
      let resourceName;

      switch (resourceType) {
        case 'fiche':
          table = 'fiches_maintenance';
          resourceName = 'Fiche';
          break;
        case 'contact':
          table = 'contacts';
          resourceName = 'Contact';
          break;
        case 'reunion':
          table = 'reunions';
          resourceName = 'Réunion';
          break;
        default:
          return res.status(400).json({ error: 'Type de ressource invalide' });
      }

      // Vérifier que la ressource existe et appartient à l'établissement de l'utilisateur
      const result = await pool.query(
        `SELECT etablissement_id FROM ${table} WHERE id = $1`,
        [resourceId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: `${resourceName} non trouvé(e)` });
      }

      if (result.rows[0].etablissement_id !== req.user.etablissement_id) {
        return res.status(403).json({ error: 'Accès non autorisé à cette ressource' });
      }

      next();
    } catch (error) {
      console.error(`Erreur vérification accès ${resourceType}:`, error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  };
};

// Fonction pour générer un token JWT
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      etablissement_id: user.etablissement_id || null,
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Le token expire après 7 jours
  );
};
