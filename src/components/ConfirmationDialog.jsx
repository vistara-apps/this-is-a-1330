import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

/**
 * Confirmation dialog component
 * @param {Object} props - Component props
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message
 * @param {string} [props.confirmText='Confirm'] - Text for confirm button
 * @param {string} [props.cancelText='Cancel'] - Text for cancel button
 * @param {Function} props.onConfirm - Confirm action handler
 * @param {Function} props.onCancel - Cancel action handler
 * @param {boolean} [props.isWarning=false] - Whether this is a warning dialog
 * @param {boolean} [props.isLoading=false] - Whether the confirm action is loading
 * @returns {JSX.Element} Confirmation dialog component
 */
export const ConfirmationDialog = ({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isWarning = false,
  isLoading = false
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-surfaceLight rounded-xl max-w-md w-full animate-slide-up">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isWarning ? (
                <div className="bg-warning/10 p-2 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
              ) : (
                <div className="bg-primary/10 p-2 rounded-full">
                  <Info className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-textPrimary">
                {title}
              </h3>
              <p className="mt-2 text-sm text-textSecondary">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-surfaceLight p-4 flex space-x-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="btn-secondary"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`btn-primary ${isWarning ? 'bg-warning hover:bg-warning/90' : ''}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;

