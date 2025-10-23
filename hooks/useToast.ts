/**
 * useToast Hook - Toast Notification Management
 * 
 * Custom React hook for managing toast notifications throughout the application.
 * Provides a centralized system for displaying temporary messages to users
 * with different types (success, error, warning, info) and auto-dismiss functionality.
 * 
 * Features:
 * - Multiple toast types with appropriate styling
 * - Automatic unique ID generation for each toast
 * - Auto-dismiss with configurable duration
 * - Manual dismiss capability
 * - Batch operations (clear all)
 * - Memory-efficient with useCallback optimization
 * 
 * @author Tech Media Hub Team
 * @version 1.0
 * @since 2024
 */

import { useState, useCallback } from 'react';
import { Toast, ToastType } from '@/components/Toast';

/**
 * useToast Hook
 * 
 * Manages toast notification state and provides functions for
 * creating, removing, and managing toast messages.
 * 
 * @returns Object containing toast state and management functions
 */
export function useToast() {
  // State to store all active toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Adds a new toast notification
   * 
   * @param message - Text content to display in the toast
   * @param type - Toast type (success, error, warning, info)
   * @param duration - Optional auto-dismiss duration in milliseconds
   * @returns Unique ID of the created toast
   */
  const addToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    // Generate unique ID using timestamp and random string
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  /**
   * Removes a specific toast by ID
   * 
   * @param id - Unique identifier of the toast to remove
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Convenience function for success toasts
   * 
   * @param message - Success message to display
   * @param duration - Optional auto-dismiss duration
   * @returns Toast ID
   */
  const success = useCallback((message: string, duration?: number) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  /**
   * Convenience function for error toasts
   * 
   * @param message - Error message to display
   * @param duration - Optional auto-dismiss duration
   * @returns Toast ID
   */
  const error = useCallback((message: string, duration?: number) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  /**
   * Convenience function for warning toasts
   * 
   * @param message - Warning message to display
   * @param duration - Optional auto-dismiss duration
   * @returns Toast ID
   */
  const warning = useCallback((message: string, duration?: number) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  /**
   * Convenience function for info toasts
   * 
   * @param message - Info message to display
   * @param duration - Optional auto-dismiss duration
   * @returns Toast ID
   */
  const info = useCallback((message: string, duration?: number) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  /**
   * Removes all active toasts
   * Useful for cleanup or when navigating between pages
   */
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Return all toast management functions and state
  return {
    toasts,        // Array of active toast notifications
    addToast,      // Generic function to add any type of toast
    removeToast,   // Function to remove specific toast by ID
    success,       // Shorthand for success toasts
    error,         // Shorthand for error toasts
    warning,       // Shorthand for warning toasts
    info,          // Shorthand for info toasts
    clearAll       // Function to remove all toasts
  };
}
