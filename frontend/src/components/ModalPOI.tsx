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
        <div id='poimodal-content' className="fixed inset-0 z-50">
            <div className="widget absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                          z-50 p-5 w-60 gap-4 rounded-lg flex flex-col items-center justify-center shadow-lg
                          [&_label]:font-bold [&_input]:mt-1 [&_input]:p-2 [&_select]:p-2 bg-white">
                    {children}
            </div>
            <button className="fixed inset-0 z-40 bg-black opacity-50 border-0" onClick={onClose} id='poimodal-overlay' tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClose()}>
            </button>
        </div>
    );
};

export default ModalPOI;