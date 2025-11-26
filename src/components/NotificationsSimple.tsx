// Simple & Clean Notifications - Functional
import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Package, DollarSign, X, Check } from 'lucide-react';
import { InventoryItem, Party, Bill } from '../types';

interface NotificationsSimpleProps {
  inventory: InventoryItem[];
  parties: Party[];
  bills: Bill[];
}

export const NotificationsSimple: React.FC<NotificationsSimpleProps> = ({ inventory, parties, bills }) => {
  const [readNotifications, setReadNotifications] = useState<string[]>([]);

  // Calculate notifications
  const outOfStock = inventory.filter(item => item.quantity === 0);
  const lowStock = inventory.filter(item => item.quantity > 0 && item.quantity <= item.minStockLevel);
  const overduePayments = parties.filter(p => p.balance > 0);
  
  const today = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => b.date && b.date.startsWith(today));
  const todayRevenue = todayBills.reduce((sum, b) => sum + b.total, 0);

  // Mark notification as read
  const markAsRead = (id: string) => {
    if (!readNotifications.includes(id)) {
      setReadNotifications([...readNotifications, id]);
    }
  };

  // Mark all as read
  const markAllRead = () => {
    const allIds = [
      ...outOfStock.map(i => `out-${i.id}`),
      ...lowStock.map(i => `low-${i.id}`),
      ...overduePayments.map(p => `pay-${p.id}`)
    ];
    setReadNotifications(allIds);
  };

  // Clear all
  const clearAll = () => {
    setReadNotifications([]);
  };

  const totalUnread = outOfStock.filter(i => !readNotifications.includes(`out-${i.id}`)).length +
                     lowStock.filter(i => !readNotifications.includes(`low-${i.id}`)).length +
                     overduePayments.filter(p => !readNotifications.includes(`pay-${p.id}`)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold flex items-center">
            <Bell className="w-7 h-7 mr-3 text-blue-600" />
            Notifications
            {totalUnread > 0 && (
              <span className="ml-3 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                {totalUnread} New
              </span>
            )}
          </h2>
          <p className="text-gray-600 mt-1">Stay updated with important alerts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={clearAll}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
          >
            Clear All
          </button>
          <button
            onClick={markAllRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-red-200 rounded-xl p-5">
          <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
          <div className="text-red-900 font-bold text-2xl">{outOfStock.length}</div>
          <div className="text-red-700 text-sm">Out of Stock</div>
        </div>

        <div className="bg-white border-2 border-yellow-200 rounded-xl p-5">
          <Package className="w-8 h-8 text-yellow-600 mb-2" />
          <div className="text-yellow-900 font-bold text-2xl">{lowStock.length}</div>
          <div className="text-yellow-700 text-sm">Low Stock</div>
        </div>

        <div className="bg-white border-2 border-orange-200 rounded-xl p-5">
          <DollarSign className="w-8 h-8 text-orange-600 mb-2" />
          <div className="text-orange-900 font-bold text-2xl">{overduePayments.length}</div>
          <div className="text-orange-700 text-sm">Pending Payments</div>
        </div>

        <div className="bg-white border-2 border-green-200 rounded-xl p-5">
          <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
          <div className="text-green-900 font-bold text-2xl">{todayBills.length}</div>
          <div className="text-green-700 text-sm">Sales Today</div>
        </div>
      </div>

      {/* Out of Stock Alerts */}
      {outOfStock.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-red-500">
          <div className="bg-red-50 px-6 py-4 border-b border-red-200">
            <h3 className="text-red-900 font-bold text-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              🚨 Out of Stock ({outOfStock.length})
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {outOfStock.map((item) => {
              const isRead = readNotifications.includes(`out-${item.id}`);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-2 flex justify-between items-center ${
                    isRead ? 'bg-gray-50 border-gray-300 opacity-60' : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-bold">{item.name}</div>
                      <div className="text-gray-600 text-sm">Part #: {item.partNumber}</div>
                      <div className="text-red-600 font-semibold text-sm mt-1">
                        0 units - Restock immediately!
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => markAsRead(`out-${item.id}`)}
                    disabled={isRead}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      isRead
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isRead ? '✓ Read' : 'Mark Read'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-yellow-500">
          <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
            <h3 className="text-yellow-900 font-bold text-lg flex items-center">
              <Package className="w-5 h-5 mr-2" />
              ⚠️ Low Stock ({lowStock.length})
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {lowStock.map((item) => {
              const isRead = readNotifications.includes(`low-${item.id}`);
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-2 flex justify-between items-center ${
                    isRead ? 'bg-gray-50 border-gray-300 opacity-60' : 'bg-yellow-50 border-yellow-300'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-bold">{item.name}</div>
                      <div className="text-gray-600 text-sm">Part #: {item.partNumber}</div>
                      <div className="text-yellow-700 font-semibold text-sm mt-1">
                        Only {item.quantity} units left (Min: {item.minStockLevel})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => markAsRead(`low-${item.id}`)}
                    disabled={isRead}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      isRead
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                    }`}
                  >
                    {isRead ? '✓ Read' : 'Mark Read'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Payments */}
      {overduePayments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-orange-500">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
            <h3 className="text-orange-900 font-bold text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              💰 Pending Payments ({overduePayments.length})
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {overduePayments.map((party) => {
              const isRead = readNotifications.includes(`pay-${party.id}`);
              return (
                <div
                  key={party.id}
                  className={`p-4 rounded-lg border-2 flex justify-between items-center ${
                    isRead ? 'bg-gray-50 border-gray-300 opacity-60' : 'bg-orange-50 border-orange-300'
                  }`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-bold">{party.name}</div>
                      <div className="text-gray-600 text-sm">{party.email}</div>
                      <div className="text-orange-700 font-bold text-sm mt-1">
                        NPR {party.balance.toLocaleString()} due - {party.type === 'supplier' ? 'Supplier' : 'Customer'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => markAsRead(`pay-${party.id}`)}
                    disabled={isRead}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      isRead
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {isRead ? '✓ Read' : 'Mark Read'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Activity */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-green-500">
        <div className="bg-green-50 px-6 py-4 border-b border-green-200">
          <h3 className="text-green-900 font-bold text-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            ✅ Today's Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200 text-center">
              <div className="text-green-600 text-4xl font-bold mb-2">{todayBills.length}</div>
              <div className="text-green-700 font-semibold">Sales Today</div>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200 text-center">
              <div className="text-blue-600 text-4xl font-bold mb-2">NPR {todayRevenue.toLocaleString()}</div>
              <div className="text-blue-700 font-semibold">Revenue Today</div>
            </div>
            <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200 text-center">
              <div className="text-purple-600 text-4xl font-bold mb-2">{inventory.length}</div>
              <div className="text-purple-700 font-semibold">Total Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {outOfStock.length === 0 && lowStock.length === 0 && overduePayments.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border-2 border-green-200">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-gray-900 font-bold text-xl mb-2">All Clear! 🎉</h3>
          <p className="text-gray-600">
            No urgent notifications. Everything is running smoothly.
          </p>
        </div>
      )}
    </div>
  );
};