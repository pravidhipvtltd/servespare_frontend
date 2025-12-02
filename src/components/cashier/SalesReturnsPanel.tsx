import React from 'react';

interface SalesReturnsPanelProps {
  onReturnComplete: () => void;
}

export const SalesReturnsPanel: React.FC<SalesReturnsPanelProps> = ({ onReturnComplete }) => {
  return (
    <div className="p-6">
      <h2 className="text-white text-2xl">Sales Returns Panel - Coming Soon</h2>
    </div>
  );
};
