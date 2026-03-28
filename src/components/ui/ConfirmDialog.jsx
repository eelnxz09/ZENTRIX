import React from 'react';
import { Modal } from './Modal';
import { NeonButton } from './NeonButton';
import { AlertTriangle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
          <AlertTriangle size={28} className="text-pink-400" />
        </div>
        <h3 className="text-lg font-black font-display tracking-widest text-white uppercase mb-3">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">{message}</p>
        <div className="flex items-center gap-3 justify-center">
          <NeonButton variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </NeonButton>
          <NeonButton
            variant={variant}
            onClick={() => {
              onConfirm?.();
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </NeonButton>
        </div>
      </div>
    </Modal>
  );
};
