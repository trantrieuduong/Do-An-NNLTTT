
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import '../../styles/ConfirmModal.css';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-container">
                        {isDanger && <AlertTriangle className="modal-icon-danger" size={24} />}
                        <h3>{title}</h3>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <p>{message}</p>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn btn-secondary" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`modal-btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
                        onClick={() => {
                            onConfirm();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
