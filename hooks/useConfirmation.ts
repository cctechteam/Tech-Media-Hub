/**
 * useConfirmation Hook - Modal Confirmation System
 * 
 * Custom React hook for managing confirmation dialogs throughout the application.
 * Provides a Promise-based API for showing confirmation modals and handling
 * user responses asynchronously. Ideal for destructive actions like deleting
 * data or clearing forms.
 * 
 * Features:
 * - Promise-based API for async/await usage
 * - Customizable modal content (title, message, button text)
 * - Support for different button variants (danger, primary)
 * - Automatic state management for modal visibility
 * - Memory-efficient with useCallback optimization
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

import { useState, useCallback } from 'react';

/**
 * ConfirmationOptions Interface
 * 
 * Defines the configuration options for confirmation dialogs.
 * Allows customization of modal appearance and behavior.
 */
interface ConfirmationOptions {
  title: string;                          // Modal title/header text
  message: string;                        // Main confirmation message
  confirmText?: string;                   // Custom text for confirm button (default: "Confirm")
  cancelText?: string;                    // Custom text for cancel button (default: "Cancel")
  confirmVariant?: 'danger' | 'primary'; // Button styling variant
}

/**
 * useConfirmation Hook
 * 
 * Manages confirmation modal state and provides functions for
 * displaying confirmation dialogs and handling user responses.
 * 
 * @returns Object containing modal state and management functions
 */
export function useConfirmation() {
  // State to control modal visibility
  const [isOpen, setIsOpen] = useState(false);
  
  // State to store current confirmation options
  const [options, setOptions] = useState<ConfirmationOptions>({
    title: '',
    message: ''
  });
  
  // State to store the Promise resolve function for async handling
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  /**
   * Shows a confirmation dialog and returns a Promise
   * 
   * This function displays a modal with the provided options and returns
   * a Promise that resolves to true if confirmed, false if cancelled.
   * 
   * Usage example:
   * const confirmed = await confirm({
   *   title: "Delete Item",
   *   message: "Are you sure you want to delete this item?",
   *   confirmText: "Delete",
   *   confirmVariant: "danger"
   * });
   * 
   * @param confirmOptions - Configuration for the confirmation dialog
   * @returns Promise that resolves to boolean (true = confirmed, false = cancelled)
   */
  const confirm = useCallback((confirmOptions: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(confirmOptions);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  }, []);

  /**
   * Handles user confirmation (clicking "Confirm" button)
   * 
   * Resolves the Promise with true and closes the modal.
   */
  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setResolvePromise(null);
  }, [resolvePromise]);

  /**
   * Handles user cancellation (clicking "Cancel" button or closing modal)
   * 
   * Resolves the Promise with false and closes the modal.
   */
  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setResolvePromise(null);
  }, [resolvePromise]);

  // Return modal state and management functions
  return {
    isOpen,        // Boolean indicating if modal is currently visible
    options,       // Current confirmation dialog configuration
    confirm,       // Function to show confirmation dialog
    handleConfirm, // Function to handle user confirmation
    handleCancel   // Function to handle user cancellation
  };
}
