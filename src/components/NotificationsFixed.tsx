// Clean Notifications View - Simple & Functional
import React, { useState } from 'react';
import { 
  Bell, AlertTriangle, CheckCircle, Clock, Package, Users, 
  TrendingUp, DollarSign, X, Eye, Check, Filter
} from 'lucide-react';
import { InventoryItem, Party, Bill } from '../types';

interface NotificationsFixedProps {
  inventory: InventoryItem[];
  parties: Party[];
  bills: Bill[];
}

type NotificationType = 'all' | 'critical' | 'warning' | 'info';

export const NotificationsFixed: React.FC<NotificationsFixedProps> = ({ inventory, parties, bills }) => {
  const [filter, setFilter] = useState<NotificationType>('all');
  const [readNotifications, setReadNotifications] = useState<string[]>([]);

  // Low stock items (critical)
  const outOfStock = inventory.filter(item => item.quantity === 0);
  const lowStock = inventory.filter(item => item.quantity > 0 && item.quantity <= item.minStockLevel);

  // Overdue payments (critical)
  const overdueDues = parties.filter(p => p.balance > 0);
  const suppliers = overdueDues.filter(p => p.type === 'supplier');
  const customers = overdueDues.filter(p => p.type === 'customer');

  // Today's activity (info)
  const today = new Date().toISOString().split('T')[0];
  const todayBills = bills.filter(b => b.date && b.date.startsWith(today));
  const todayRevenue = todayBills.reduce((sum, b) => sum + b.total, 0);

  // Mark notification as read
  const markAsRead = (id: string) => {
    if (!readNotifications.includes(id)) {
      setReadNotifications([...readNotifications, id]);
    }
  };

  const markAllAsRead = () => {
    const allIds = [
      ...outOfStock.map(i => `out-${i.id}`),
      ...lowStock.map(i => `low-${i.id}`),
      ...overdueDues.map(p => `due-${p.id}`)
    ];
    setReadNotifications(allIds);
  };

  const clearRead = () => {
    setReadNotifications([]);
  };

  // Count unread notifications
  const criticalCount = outOfStock.filter(i => !readNotifications.includes(`out-${i.id}`)).length +
                       suppliers.filter(s => !readNotifications.includes(`due-${s.id}`)).length;
  const warningCount = lowStock.filter(i => !readNotifications.includes(`low-${i.id}`)).length +
                      customers.filter(c => !readNotifications.includes(`due-${c.id}`)).length;
  const totalUnread = criticalCount + warningCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold flex items-center">
            <Bell className="w-7 h-7 mr-3 text-blue-600" />
            Notifications
          </h2>
          <p className="text-gray-600 mt-1">Stay updated with important alerts and system activities</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={clearRead}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
          >
            Clear All
          </button>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
              {criticalCount}
            </span>
          </div>
          <div className="text-red-900 font-bold text-xl">{outOfStock.length + suppliers.length}</div>
          <div className="text-red-700 text-sm">Critical Alerts</div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-xs font-bold">
              {warningCount}
            </span>
          </div>
          <div className="text-yellow-900 font-bold text-xl">{lowStock.length + customers.length}</div>
          <div className="text-yellow-700 text-sm">Warnings</div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
              {totalUnread}
            </span>
          </div>
          <div className="text-blue-900 font-bold text-xl">{totalUnread}</div>
          <div className="text-blue-700 text-sm">Unread Total</div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-green-900 font-bold text-xl">{todayBills.length}</div>
          <div className="text-green-700 text-sm">Sales Today</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-200 flex space-x-2">
        {[
          { id: 'all', label: 'All Notifications', count: totalUnread },
          { id: 'critical', label: 'Critical', count: criticalCount },
          { id: 'warning', label: 'Warnings', count: warningCount },
          { id: 'info', label: 'Activity', count: 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as NotificationType)}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                filter === tab.id ? 'bg-white text-blue-600' : 'bg-red-500 text-white'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {/* Out of Stock - Critical */}
        {(filter === 'all' || filter === 'critical') && outOfStock.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-red-500 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <h3 className="text-red-900 font-bold text-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                🚨 Out of Stock - Immediate Action Required ({outOfStock.length})
              </h3>
              <p className="text-red-700 text-sm mt-1">These items are completely out of stock</p>
            </div>
            <div className="p-6 space-y-3">
              {outOfStock.map((item) => {
                const isRead = readNotifications.includes(`out-${item.id}`);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-2 flex justify-between items-center transition-all ${
                      isRead 
                        ? 'bg-gray-50 border-gray-200 opacity-60' 
                        : 'bg-red-50 border-red-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-gray-900 font-bold">{item.name}</span>
                          <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                            OUT OF STOCK
                          </span>
                        </div>
                        <div className="text-gray-600 text-sm">Part #: {item.partNumber}</div>
                        <div className="text-red-600 font-semibold text-sm mt-1">
                          ⚠️ 0 units available - Restock immediately
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(`out-${item.id}`)}
                      disabled={isRead}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isRead
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                      }`}
                    >
                      {isRead ? (
                        <><Check className="w-4 h-4 inline mr-1" /> Read</>
                      ) : (
                        'Mark Read'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Low Stock - Warning */}
        {(filter === 'all' || filter === 'warning') && lowStock.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-yellow-500 overflow-hidden">
            <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
              <h3 className="text-yellow-900 font-bold text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                ⚠️ Low Stock Alert ({lowStock.length})
              </h3>
              <p className="text-yellow-700 text-sm mt-1">These items are running low and need restocking soon</p>
            </div>
            <div className="p-6 space-y-3">
              {lowStock.map((item) => {
                const isRead = readNotifications.includes(`low-${item.id}`);
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-2 flex justify-between items-center transition-all ${
                      isRead 
                        ? 'bg-gray-50 border-gray-200 opacity-60' 
                        : 'bg-yellow-50 border-yellow-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-gray-900 font-bold">{item.name}</span>
                          <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full">
                            LOW STOCK
                          </span>
                        </div>
                        <div className="text-gray-600 text-sm">Part #: {item.partNumber}</div>
                        <div className="text-yellow-700 font-semibold text-sm mt-1">
                          📦 Only {item.quantity} units left (Min: {item.minStockLevel})
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(`low-${item.id}`)}
                      disabled={isRead}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isRead
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700 hover:shadow-lg'
                      }`}
                    >
                      {isRead ? (
                        <><Check className="w-4 h-4 inline mr-1" /> Read</>
                      ) : (
                        'Mark Read'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Overdue Supplier Payments - Critical */}
        {(filter === 'all' || filter === 'critical') && suppliers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-red-500 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <h3 className="text-red-900 font-bold text-lg flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                💰 Supplier Payments Due ({suppliers.length})
              </h3>
              <p className="text-red-700 text-sm mt-1">Outstanding payments to suppliers</p>
            </div>
            <div className="p-6 space-y-3">
              {suppliers.map((supplier) => {
                const isRead = readNotifications.includes(`due-${supplier.id}`);
                return (
                  <div
                    key={supplier.id}
                    className={`p-4 rounded-xl border-2 flex justify-between items-center transition-all ${
                      isRead 
                        ? 'bg-gray-50 border-gray-200 opacity-60' 
                        : 'bg-red-50 border-red-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-900 font-bold mb-1">{supplier.name}</div>
                        <div className="text-gray-600 text-sm">{supplier.email}</div>
                        <div className="text-red-600 font-bold text-lg mt-2">
                          NPR {supplier.balance.toLocaleString()} due
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(`due-${supplier.id}`)}
                      disabled={isRead}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isRead
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                      }`}
                    >
                      {isRead ? (
                        <><Check className="w-4 h-4 inline mr-1" /> Read</>
                      ) : (
                        'Mark Read'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer Dues - Warning */}
        {(filter === 'all' || filter === 'warning') && customers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-yellow-500 overflow-hidden">
            <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
              <h3 className="text-yellow-900 font-bold text-lg flex items-center">
                <Users className="w-5 h-5 mr-2" />
                💵 Customer Payments Pending ({customers.length})
              </h3>
              <p className="text-yellow-700 text-sm mt-1">Outstanding receivables from customers</p>
            </div>
            <div className="p-6 space-y-3">
              {customers.map((customer) => {
                const isRead = readNotifications.includes(`due-${customer.id}`);
                return (
                  <div
                    key={customer.id}
                    className={`p-4 rounded-xl border-2 flex justify-between items-center transition-all ${
                      isRead 
                        ? 'bg-gray-50 border-gray-200 opacity-60' 
                        : 'bg-yellow-50 border-yellow-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-900 font-bold mb-1">{customer.name}</div>
                        <div className="text-gray-600 text-sm">{customer.email}</div>
                        <div className="text-yellow-600 font-bold text-lg mt-2">
                          NPR {customer.balance.toLocaleString()} pending
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(`due-${customer.id}`)}
                      disabled={isRead}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        isRead
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700 hover:shadow-lg'
                      }`}
                    >
                      {isRead ? (
                        <><Check className="w-4 h-4 inline mr-1" /> Read</>
                      ) : (
                        'Mark Read'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Today's Activity - Info */}
        {(filter === 'all' || filter === 'info') && (
          <div className="bg-white rounded-2xl shadow-sm border-l-4 border-green-500 overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <h3 className="text-green-900 font-bold text-lg flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                ✅ Today's Activity
              </h3>
              <p className="text-green-700 text-sm mt-1">Current day summary</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-green-50 rounded-xl text-center border-2 border-green-200">
                  <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <div className="text-green-600 text-3xl font-bold">{todayBills.length}</div>
                  <div className="text-green-700 font-semibold">Sales Today</div>
                </div>
                <div className="p-6 bg-blue-50 rounded-xl text-center border-2 border-blue-200">
                  <DollarSign className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <div className="text-blue-600 text-3xl font-bold">NPR {todayRevenue.toLocaleString()}</div>
                  <div className="text-blue-700 font-semibold">Revenue Today</div>
                </div>
                <div className="p-6 bg-purple-50 rounded-xl text-center border-2 border-purple-200">
                  <Package className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                  <div className="text-purple-600 text-3xl font-bold">{inventory.length}</div>
                  <div className="text-purple-700 font-semibold">Total Items</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalUnread === 0 && filter !== 'info' && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-gray-900 font-bold text-xl mb-2">All Clear! 🎉</h3>
            <p className="text-gray-600">
              No {filter === 'all' ? '' : filter} notifications at the moment. Everything is running smoothly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};