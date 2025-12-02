import React from 'react';

interface CashDrawerManagementProps {
  shift: any;
  onShiftChange: () => void;
}

export const CashDrawerManagement: React.FC<CashDrawerManagementProps> = ({ shift, onShiftChange }) => {
  return (
    <div className="p-6">
      <h2 className="text-white text-2xl">Cash Drawer Management - Coming Soon</h2>
    </div>
  );
};
