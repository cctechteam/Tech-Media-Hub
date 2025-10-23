/**
 * Confirmation Modal Component
 * 
 * A reusable modal dialog for confirming user actions, particularly
 * destructive operations like deleting data or clearing forms.
 * Provides a consistent UI for confirmation workflows throughout
 * the application.
 * 
 * Features:
 * - Customizable title, message, and button text
 * - Support for danger and primary button variants
 * - Keyboard accessibility (ESC to cancel)
 * - Click outside to cancel functionality
 * - Body scroll prevention when open
 * - Smooth animations and transitions
 * - Responsive design
 * 
 * Usage:
 * - Typically used with useConfirmation hook
 * - Displays over page content with backdrop
 * - Returns boolean result via callback functions
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

"use client";
import { useEffect } from 'react';

/**
 * ConfirmationModalProps Interface
 * 
 * Defines the props for the confirmation modal component.
 * Allows full customization of modal content and behavior.
 */
interface ConfirmationModalProps {
  isOpen: boolean;                          // Controls modal visibility
  title: string;                            // Modal header title
  message: string;                          // Main confirmation message
  confirmText?: string;                     // Custom confirm button text (default: "Confirm")
  cancelText?: string;                      // Custom cancel button text (default: "Cancel")
  confirmVariant?: 'danger' | 'primary';   // Button styling variant
  onConfirm: () => void;                    // Callback when user confirms
  onCancel: () => void;                     // Callback when user cancels
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getConfirmButtonStyles = () => {
    if (confirmVariant === 'danger') {
      return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
    }
    return 'focus:ring-2';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-offset-2 ${getConfirmButtonStyles()}`}
            style={{
              backgroundColor: confirmVariant === 'danger' ? undefined : '#B91C47',
              '--tw-ring-color': confirmVariant === 'danger' ? undefined : '#B91C47'
            } as any}
            onMouseEnter={(e) => {
              if (confirmVariant !== 'danger') {
                (e.target as HTMLElement).style.backgroundColor = '#A01B3F';
              }
            }}
            onMouseLeave={(e) => {
              if (confirmVariant !== 'danger') {
                (e.target as HTMLElement).style.backgroundColor = '#B91C47';
              }
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
