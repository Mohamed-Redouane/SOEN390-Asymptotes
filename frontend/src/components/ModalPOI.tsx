import React, { useEffect } from 'react';

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
        <div data-testid='poimodal-content'>
            <div className="widget z-50 fixed left-0 mt-8 p-5 max-w-30 gap-4 rounded-lg flex flex-col items-center justify-center shadow-lg [&_label]:font-bold">
                    {children}
            </div>
            <button className="fixed top-0 left-0 z-40 opacity-50 w-full h-full bg-black border-0" onClick={onClose} data-testid='poimodal-overlay' tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClose()}>
            </button>
        </div>
    );
};

export default ModalPOI;