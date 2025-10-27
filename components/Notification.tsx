
import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = "fixed top-8 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-2xl text-white font-bold z-[100] shadow-2xl transition-all duration-500";
  const typeClasses = type === 'success'
    ? 'bg-gradient-to-r from-green-500 to-green-600'
    : 'bg-gradient-to-r from-red-500 to-red-600';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl animate-bounce">{type === 'success' ? '✅' : '❌'}</span>
        <span className="text-lg">{message}</span>
      </div>
    </div>
  );
};

export default Notification;
