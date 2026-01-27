import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export interface ToastProps {
  children: React.ReactNode;
  duration?: number; // in milliseconds, 0 means no auto-dismiss
  onDismiss?: () => void;
  variant?: 'default' | 'success' | 'error' | 'info';
  showCloseButton?: boolean;
}

export const Toast = ({
  children,
  duration = 6000,
  onDismiss,
  variant = 'default',
  showCloseButton = true,
}: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation to complete
    setTimeout(() => {
      onDismiss?.();
    }, 200); // Match transition duration
  }, [onDismiss]);

  useEffect(() => {
    // Auto-dismiss if duration is set
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss, handleDismiss]);

  const variantStyles = {
    default: 'bg-background-secondary border-border',
    success: 'bg-success/10 border-success/30',
    error: 'bg-error/10 border-error/30',
    info: 'bg-primary/10 border-primary/30',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-200 ${
        !isExiting
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] max-w-md ${variantStyles[variant]}`}
      >
        <div className="flex-1">{children}</div>
        {showCloseButton && onDismiss && (
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-text-secondary hover:text-text hover:bg-background/50 transition-colors flex-shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

