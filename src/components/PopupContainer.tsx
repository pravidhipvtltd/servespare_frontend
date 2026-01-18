import React from 'react';
import { SuccessPopup } from './SuccessPopup';
import { ErrorPopup } from './ErrorPopup';
import { ConfirmDialog } from './ConfirmDialog';

interface PopupContainerProps {
  // Success Props
  showSuccessPopup: boolean;
  successTitle: string;
  successMessage: string;
  onSuccessClose: () => void;
  
  // Error Props
  showErrorPopup: boolean;
  errorTitle: string;
  errorMessage: string;
  errorType?: 'error' | 'warning' | 'info';
  onErrorClose: () => void;
  
  // Confirm Props
  showConfirmDialog: boolean;
  confirmConfig: {
    title: string;
    message: string;
    details: string[];
    onConfirm: () => void;
    type: 'warning' | 'danger' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
  } | null;
  onConfirmCancel: () => void;
}

export const PopupContainer: React.FC<PopupContainerProps> = ({
  showSuccessPopup,
  successTitle,
  successMessage,
  onSuccessClose,
  showErrorPopup,
  errorTitle,
  errorMessage,
  errorType = 'warning',
  onErrorClose,
  showConfirmDialog,
  confirmConfig,
  onConfirmCancel
}) => {
  return (
    <>
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={onSuccessClose}
        title={successTitle}
        message={successMessage}
        autoClose={true}
        autoCloseDelay={4000}
      />

      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={onErrorClose}
        title={errorTitle}
        message={errorMessage}
        type={errorType}
      />

      {confirmConfig && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onConfirm={confirmConfig.onConfirm}
          onCancel={onConfirmCancel}
          title={confirmConfig.title}
          message={confirmConfig.message}
          details={confirmConfig.details}
          type={confirmConfig.type}
          confirmText={confirmConfig.confirmText || 'Confirm'}
          cancelText={confirmConfig.cancelText || 'Cancel'}
        />
      )}
    </>
  );
};
