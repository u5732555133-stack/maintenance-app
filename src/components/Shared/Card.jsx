/**
 * Composant Card réutilisable
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu de la card
 * @param {string} props.className - Classes CSS additionnelles
 * @param {string} props.title - Titre de la card (optionnel)
 */
export default function Card({ children, className = '', title, ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
