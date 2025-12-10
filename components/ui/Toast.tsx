import React, { useEffect } from 'react';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Notification } from '../../types';

interface ToastContainerProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {notifications.map((notif) => (
        <Toast key={notif.id} notification={notif} onClose={() => removeNotification(notif.id)} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    info: <Info size={18} className="text-teal-500" />,
    success: <CheckCircle size={18} className="text-green-500" />,
    warning: <AlertTriangle size={18} className="text-orange-500" />
  };

  const borders = {
    info: 'border-teal-500/50',
    success: 'border-green-500/50',
    warning: 'border-orange-500/50'
  };

  return (
    <div className={`
      pointer-events-auto
      flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-md 
      bg-slate-900/90 dark:bg-black/90 text-white 
      border-l-4 ${borders[notification.type]} 
      animate-slide-in
      max-w-xs
    `}>
      {icons[notification.type]}
      <p className="text-sm font-medium">{notification.message}</p>
      <button onClick={onClose} className="ml-auto text-white/50 hover:text-white">
        <X size={14} />
      </button>
    </div>
  );
};
