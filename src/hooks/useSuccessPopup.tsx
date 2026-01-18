import { useState } from 'react';

export const useSuccessPopup = () => {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successTitle, setSuccessTitle] = useState('Success');

  const showSuccess = (message: string, title: string = 'Success') => {
    setSuccessMessage(message);
    setSuccessTitle(title);
    setShowSuccessPopup(true);
  };

  const hideSuccess = () => {
    setShowSuccessPopup(false);
  };

  return {
    showSuccessPopup,
    successMessage,
    successTitle,
    showSuccess,
    hideSuccess
  };
};
