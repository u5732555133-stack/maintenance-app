/**
 * Composant Loader pour afficher un état de chargement
 * @param {Object} props
 * @param {string} props.size - sm | md | lg
 * @param {string} props.text - Texte à afficher sous le loader
 */
export default function Loader({ size = 'md', text = 'Chargement...' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}></div>
      {text && <p className="mt-4 text-sm text-gray-600">{text}</p>}
    </div>
  );
}
