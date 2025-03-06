import React, { useEffect } from 'react';
import './ModalPOI.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const ModalPOI: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        //handle escape key press to close the modal
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        //handle keydown to close the modal
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClose()}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

export default ModalPOI;