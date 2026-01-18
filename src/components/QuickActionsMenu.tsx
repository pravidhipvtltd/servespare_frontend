import React, { useState } from 'react';
import { 
  Plus, X, ShoppingCart, Package, Users, FileText, 
  Receipt, DollarSign, TrendingUp, Zap, ArrowRight,
  UserPlus, PackagePlus, ShoppingBag, FileEdit, Calculator
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  gradient: string;
  onClick: () => void;
  roles: string[];
}

interface QuickActionsMenuProps {
  userRole: string;
  onAction: (actionId: string) => void;
}

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({ userRole, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'create-bill',
      label: 'Create Bill',
      icon: Receipt,
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
      onClick: () => handleAction('create-bill'),
      roles: ['super_admin', 'admin', 'inventory_manager', 'cashier']
    },
    {
      id: 'add-inventory',
      label: 'Add Product',
      icon: PackagePlus,
      color: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
      onClick: () => handleAction('add-inventory'),
      roles: ['super_admin', 'admin', 'inventory_manager']
    },
    {
      id: 'add-party',
      label: 'Add Party',
      icon: UserPlus,
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
      onClick: () => handleAction('add-party'),
      roles: ['super_admin', 'admin', 'inventory_manager']
    },
    {
      id: 'create-order',
      label: 'Purchase Order',
      icon: ShoppingBag,
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600',
      onClick: () => handleAction('create-order'),
      roles: ['super_admin', 'admin', 'inventory_manager']
    },
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: DollarSign,
      color: 'text-red-600',
      gradient: 'from-red-500 to-red-600',
      onClick: () => handleAction('add-expense'),
      roles: ['super_admin', 'admin']
    },
    {
      id: 'view-reports',
      label: 'View Reports',
      icon: TrendingUp,
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-indigo-600',
      onClick: () => handleAction('view-reports'),
      roles: ['super_admin', 'admin', 'inventory_manager']
    }
  ];

  const handleAction = (actionId: string) => {
    setIsOpen(false);
    onAction(actionId);
  };

  const filteredActions = quickActions.filter(action => 
    action.roles.includes(userRole)
  );

  return (
    <>
      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        {isOpen && (
          <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
            {filteredActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={`flex items-center space-x-3 bg-gradient-to-r ${action.gradient} text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideInFromRight 0.3s ease-out forwards'
                  }}
                >
                  <span className="font-medium whitespace-nowrap">{action.label}</span>
                  <Icon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                </button>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen 
              ? 'bg-red-500 hover:bg-red-600 rotate-45' 
              : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
          }`}
        >
          {isOpen ? (
            <X className="w-8 h-8 text-white" />
          ) : (
            <Zap className="w-8 h-8 text-white animate-pulse" />
          )}
        </button>
      </div>

      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};
