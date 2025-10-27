
import React, { ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  headerClass?: string;
  showFooter?: boolean;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, onClose, children, headerClass = 'bg-blue-600', showFooter = true }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transform transition-all duration-300 scale-95 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${headerClass} text-white p-5`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-3xl font-bold">&times;</button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {showFooter && (
            <div className="p-4 border-t bg-gray-50 text-center">
            <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-all">
                إغلاق
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
