// Rôles utilisateurs
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_ETABLISSEMENT: 'admin_etablissement',
  RESPONSABLE: 'responsable', // Alias pour admin_etablissement (backend PostgreSQL)
  USER_ETABLISSEMENT: 'user_etablissement',
  USER: 'user',
};

// Statuts des fiches
export const STATUTS_FICHE = {
  EN_ATTENTE: 'en_attente',
  ENVOYE: 'envoye',
  REALISE: 'realise',
};

// Périodicités disponibles (en mois)
export const PERIODICITES = [
  { value: 1, label: '1 mois' },
  { value: 2, label: '2 mois' },
  { value: 3, label: '3 mois' },
  { value: 6, label: '6 mois' },
  { value: 12, label: '1 an' },
  { value: 24, label: '2 ans' },
];

// Jours de la semaine pour les réunions
export const JOURS_SEMAINE = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
];

// Fréquences des réunions
export const FREQUENCES_REUNION = [
  { value: 'hebdomadaire', label: 'Hebdomadaire' },
  { value: 'bi-mensuel', label: 'Bi-mensuel (toutes les 2 semaines)' },
  { value: 'mensuel', label: 'Mensuel' },
];

// Zones géographiques
export const ZONES = {
  ZONE1: 'zone1',
  ZONE2: 'zone2',
  ZONE3: 'zone3',
  ZONE4: 'zone4',
  ZONE5: 'zone5',
  ZONE6: 'zone6',
};

export const ZONES_LABELS = {
  zone1: 'Nord / Île-de-France',
  zone2: 'Est / Grand Est',
  zone3: 'Ouest / Bretagne / Pays de Loire',
  zone4: 'Sud / PACA / Occitanie',
  zone5: 'Centre-Val de Loire / Bourgogne',
  zone6: 'Nouvelle-Aquitaine / Limousin',
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Erreur d\'authentification',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action',
  NETWORK_ERROR: 'Erreur de connexion au serveur',
  REQUIRED_FIELDS: 'Veuillez remplir tous les champs obligatoires',
  INVALID_EMAIL: 'Adresse email invalide',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 6 caractères',
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  FICHE_CREATED: 'Fiche de maintenance créée avec succès',
  FICHE_UPDATED: 'Fiche de maintenance mise à jour',
  FICHE_DELETED: 'Fiche de maintenance supprimée',
  CONTACT_CREATED: 'Contact créé avec succès',
  CONTACT_UPDATED: 'Contact mis à jour',
  CONTACT_DELETED: 'Contact supprimé',
  ETABLISSEMENT_CREATED: 'Établissement créé avec succès',
  ETABLISSEMENT_UPDATED: 'Établissement mis à jour',
  GMAIL_CONNECTED: 'Compte Gmail connecté avec succès',
  MAINTENANCE_CONFIRMED: 'Maintenance confirmée avec succès',
  USER_CREATED: 'Utilisateur créé avec succès',
  USER_UPDATED: 'Utilisateur mis à jour',
  USER_DELETED: 'Utilisateur supprimé',
  REUNION_CREATED: 'Réunion créée avec succès',
  REUNION_UPDATED: 'Réunion mise à jour',
  REUNION_DELETED: 'Réunion supprimée',
};

// Modules disponibles
export const MODULES = {
  MAINTENANCE: 'maintenance',
  REUNIONS: 'reunions',
  DOCUMENTS: 'documents',
  COMPTABILITE: 'comptabilite',
};

export const MODULES_LABELS = {
  maintenance: 'Maintenance',
  reunions: 'Réunions',
  documents: 'Documents',
  comptabilite: 'Comptabilité',
};

// Configuration des modules (menu items par module)
export const MODULE_MENU_ITEMS = {
  maintenance: [
    { label: 'Fiches', path: '/admin/fiches', icon: 'clipboard' },
    { label: 'Contacts', path: '/admin/contacts', icon: 'users' },
    { label: 'Historique', path: '/admin/historique', icon: 'history' },
  ],
  reunions: [
    { label: 'Calendrier', path: '/admin/reunions', icon: 'calendar' },
    { label: 'Mes réunions', path: '/admin/reunions/mes-reunions', icon: 'video' },
  ],
};

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',

  // Super Admin
  SUPER_ADMIN_DASHBOARD: '/super-admin',
  SUPER_ADMIN_ETABLISSEMENTS: '/super-admin/etablissements',

  // Admin Établissement
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',

  // Module Maintenance
  ADMIN_FICHES: '/admin/fiches',
  ADMIN_CONTACTS: '/admin/contacts',
  ADMIN_HISTORIQUE: '/admin/historique',

  // Module Réunions
  ADMIN_REUNIONS: '/admin/reunions',
  ADMIN_MES_REUNIONS: '/admin/reunions/mes-reunions',

  // Public
  PUBLIC_CONFIRM: '/confirm/:token',
};
