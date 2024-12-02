'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// Types
interface Toast {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// Create Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    ({ duration = 5000, ...props }: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prevToasts) => [...prevToasts, { id, duration, ...props }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <Toaster toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Individual Toast Component
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: () => void;
}) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(onRemove, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onRemove]);

  const typeStyles = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
  };

  const baseStyles =
    'rounded-lg border-l-4 p-4 shadow-md transition-all duration-300 ease-in-out';
  const style = toast.type
    ? typeStyles[toast.type]
    : 'bg-white dark:bg-gray-800 border-gray-500';

  return (
    <div className={`${baseStyles} ${style} flex items-start justify-between`}>
      <div className='mr-2 flex-1'>
        {toast.title && (
          <h3 className='text-sm font-semibold'>{toast.title}</h3>
        )}
        {toast.description && (
          <p className='mt-1 text-sm'>{toast.description}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className='text-gray-400 transition-colors hover:text-gray-600'
        aria-label='Close notification'
      >
        <svg
          className='h-4 w-4'
          fill='none'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path d='M6 18L18 6M6 6l12 12'></path>
        </svg>
      </button>
    </div>
  );
}

// Main Toaster Component
function Toaster({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className='pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2'>
      {toasts.map((toast) => (
        <div key={toast.id} className='pointer-events-auto'>
          <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}

// Example usage:
/*
import { useToast } from './path-to-this-file';

function YourComponent() {
  const { addToast } = useToast();

  const showToast = () => {
    addToast({
      title: "Success!",
      description: "Your action was completed successfully.",
      type: "success",
      duration: 5000,
    });
  };

  return <button onClick={showToast}>Show Toast</button>;
}
*/
