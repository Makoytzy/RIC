import { useState, useEffect } from 'react';
import Toast from './Toast';
import { subscribeToToast } from '../../utils/toast';

/**
 * ToastContainer Component
 * 
 * Manages toast notifications by listening to toast events and displaying them.
 * Add this component once at the root of your application.
 */
export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToToast((toastData) => {
      const id = Date.now() + Math.random();
      const newToast = { ...toastData, id, visible: true };
      
      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration + 500ms (animation time)
      const duration = toastData.duration || 5000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration + 500);
    });

    return unsubscribe;
  }, []);

  const handleClose = (id) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );

    // Remove from array after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          title={toast.title}
          visible={toast.visible}
          duration={toast.duration}
          position={toast.position}
          onClose={() => handleClose(toast.id)}
        />
      ))}
    </>
  );
}
