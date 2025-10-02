// Composant modal pour afficher un contenu dans une popup centrée

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-xl relative animate-fade-in">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
          aria-label="Fermer"
        >✕</button>
        {children}
      </div>
    </div>
  );
}
