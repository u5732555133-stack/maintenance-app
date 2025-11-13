/**
 * Composant Input réutilisable
 * @param {Object} props
 * @param {string} props.label - Label du champ
 * @param {string} props.error - Message d'erreur
 * @param {string} props.type - Type d'input
 * @param {boolean} props.required - Champ obligatoire
 * @param {string} props.className - Classes CSS additionnelles
 */
export default function Input({
  label,
  error,
  type = 'text',
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`input ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
