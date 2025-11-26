// Permission Mapping - Maps panel IDs to permission keys
export const PANEL_PERMISSIONS: Record<string, string> = {
  'dashboard': 'view_dashboard',
  'user-roles': 'view_users',
  'parties': 'view_parties',
  'total-inventory': 'view_inventory',
  'pricing-control': 'view_pricing',
  'order-management': 'view_orders',
  'bills': 'view_bills',
  'daybook': 'view_daybook',
  'ledger': 'view_ledger',
  'return': 'view_returns',
  'bill-creation': 'create_bills',
  'purchase-orders': 'view_orders',
  'return-refund': 'view_returns',
  'petty-cash': 'view_daybook',
  'financial-reports': 'view_reports',
  'bank-accounts': 'view_daybook',
  'cash-in-hand': 'view_daybook',
  'crm': 'view_crm',
};

export const getPermissionForPanel = (panelId: string): string => {
  return PANEL_PERMISSIONS[panelId] || 'view_dashboard';
};
