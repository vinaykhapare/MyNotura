import React from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteTitle: string;
  loading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  noteTitle,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showCloseButton={false}>
      <div className="text-center pt-2 pb-1">
        <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-4 h-4" />
        </div>
        <h3 className="font-serif text-lg font-medium text-[#FFFFFF] mb-1.5">
          Delete this entry?
        </h3>
        <p className="font-sans text-xs text-[#888888] mb-6 leading-relaxed max-w-xs mx-auto">
          Are you sure you want to delete <strong className="text-[#FFFFFF] font-medium">&ldquo;{noteTitle || 'Untitled Entry'}&rdquo;</strong>? This action cannot be undone.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
