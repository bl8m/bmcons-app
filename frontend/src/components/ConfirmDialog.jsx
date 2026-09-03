import Modal from './Modal.jsx';
import Button from './Button.jsx';

// Conferma riutilizzabile per azioni distruttive (es. cancellazioni).
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Conferma',
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm text-text">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
