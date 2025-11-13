import { format, addMonths, isBefore, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date au format français dd/MM/yyyy
 * @param {Date|string} date - Date à formater
 * @returns {string} - Date formatée
 */
export function formatDate(date) {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: fr });
}

/**
 * Formate une date avec l'heure au format français
 * @param {Date|string} date - Date à formater
 * @returns {string} - Date et heure formatées
 */
export function formatDateTime(date) {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy à HH:mm', { locale: fr });
}

/**
 * Calcule la prochaine date de maintenance
 * @param {Date|string} dateActuelle - Date de départ
 * @param {number} periodiciteEnMois - Périodicité en mois
 * @returns {Date} - Prochaine date calculée
 */
export function calculateNextDate(dateActuelle, periodiciteEnMois) {
  const dateObj = typeof dateActuelle === 'string' ? parseISO(dateActuelle) : dateActuelle;
  return addMonths(dateObj, periodiciteEnMois);
}

/**
 * Vérifie si une date est en retard (passée)
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} - True si en retard
 */
export function isLate(date) {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return isBefore(dateObj, today);
}

/**
 * Vérifie si une date est aujourd'hui ou passée
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} - True si aujourd'hui ou passée
 */
export function isDueToday(date) {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return !isBefore(today, dateObj);
}

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si valide
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide une URL
 * @param {string} url - URL à valider
 * @returns {boolean} - True si valide
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Génère un ID unique
 * @returns {string} - ID unique
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Tronque un texte et ajoute "..."
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximum
 * @returns {string} - Texte tronqué
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Obtient les initiales d'un nom
 * @param {string} name - Nom complet
 * @returns {string} - Initiales (max 2 lettres)
 */
export function getInitials(name) {
  if (!name) return '';

  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Compte le nombre de jours entre deux dates
 * @param {Date|string} date1 - Première date
 * @param {Date|string} date2 - Deuxième date
 * @returns {number} - Nombre de jours
 */
export function daysBetween(date1, date2) {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;

  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Détermine la couleur du badge selon le statut
 * @param {string} statut - Statut de la fiche
 * @returns {string} - Classes CSS pour le badge
 */
export function getStatutBadgeClass(statut) {
  switch (statut) {
    case 'en_attente':
      return 'bg-yellow-100 text-yellow-800';
    case 'envoye':
      return 'bg-blue-100 text-blue-800';
    case 'realise':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Détermine le label du statut
 * @param {string} statut - Statut de la fiche
 * @returns {string} - Label en français
 */
export function getStatutLabel(statut) {
  switch (statut) {
    case 'en_attente':
      return 'En attente';
    case 'envoye':
      return 'Envoyé';
    case 'realise':
      return 'Réalisé';
    default:
      return statut;
  }
}

/**
 * Extrait le département d'un code postal
 * @param {string} codePostal - Code postal (5 chiffres)
 * @returns {string} - Numéro de département
 */
export function getDepartementFromCodePostal(codePostal) {
  if (!codePostal || codePostal.length < 2) return '';
  return codePostal.substring(0, 2);
}

/**
 * Copie du texte dans le presse-papier
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>} - True si succès
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Télécharge un fichier
 * @param {Blob} blob - Données du fichier
 * @param {string} filename - Nom du fichier
 */
export function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
