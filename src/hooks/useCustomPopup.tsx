import { useState } from 'react';

export const useCustomPopup = () => {
  // Success Popup State
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('Success');

  // Error Popup State
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [errorType, setErrorType] = useState<'error' | 'warning' | 'info'>('warning');

  // Confirm Dialog State
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    details: string[];
    onConfirm: () => void;
    type: 'warning' | 'danger' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
  } | null>(null);

  const showSuccess = (message: string, title: string = 'Success') => {
    setSuccessMessage(message);
    setSuccessTitle(title);
    setShowSuccessPopup(true);
  };

  const hideSuccess = () => {
    setShowSuccessPopup(false);
  };

  const showError = (message: string, title?: string, type: 'error' | 'warning' | 'info' = 'warning') => {
    setErrorMessage(message);
    setErrorTitle(title || '');
    setErrorType(type);
    setShowErrorPopup(true);
  };

  const hideError = () => {
    setShowErrorPopup(false);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      details?: string[];
      type?: 'warning' | 'danger' | 'info' | 'success';
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    setConfirmConfig({
      title,
      message,
      details: options?.details || [],
      onConfirm: () => {
        onConfirm();
        setShowConfirmDialog(false);
      },
      type: options?.type || 'warning',
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel'
    });
    setShowConfirmDialog(true);
  };

  const hideConfirm = () => {
    setShowConfirmDialog(false);
    setConfirmConfig(null);
  };

  return {
    // Success
    showSuccessPopup,
    successMessage,
    successTitle,
    showSuccess,
    hideSuccess,
    
    // Error
    showErrorPopup,
    errorMessage,
    errorTitle,
    errorType,
    showError,
    hideError,

    // Confirm
    showConfirmDialog,
    confirmConfig,
    showConfirm,
    hideConfirm
  };
};