// Audit Log - Simple, Clear & Fully Detailed
import React, { useState, useEffect } from 'react';
import {
  Shield, Search, Filter, Download, Calendar, Clock, User, Activity,
  Plus, Edit, Trash2, Eye, Lock, Unlock, CheckCircle, XCircle,
  AlertTriangle, DollarSign, Package, Users, Settings, FileText,
  LogIn, LogOut, RefreshCw, Database, Key, Mail, Phone, MapPin,
  CreditCard, Percent, Tag, Archive, RotateCcw, Save, Upload, Printer
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import { copyToClipboard } from '../utils/printExport';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  status: 'success' | 'failed' | 'warning';
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
}

export const AuditLogDetailed: React.FC<{ users: any[] }> = ({ users }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = () => {
    let savedLogs = getFromStorage('auditLogs', []);
    
    // Generate sample logs if empty
    if (savedLogs.length === 0) {
      savedLogs = generateSampleLogs();
      saveToStorage('auditLogs', savedLogs);
    }
    
    setLogs(savedLogs);
  };

  const generateSampleLogs = (): AuditLog[] => {
    const actions = [
      { action: 'login', module: 'Authentication', details: 'User logged into the system', status: 'success' },
      { action: 'logout', module: 'Authentication', details: 'User logged out of the system', status: 'success' },
      { action: 'create_user', module: 'User Management', details: 'Created new user account', status: 'success' },
      { action: 'update_user', module: 'User Management', details: 'Updated user profile information', status: 'success' },
      { action: 'delete_user', module: 'User Management', details: 'Deleted user account', status: 'success' },
      { action: 'create_bill', module: 'Billing', details: 'Created new invoice/bill', status: 'success' },
      { action: 'update_inventory', module: 'Inventory', details: 'Updated inventory item', status: 'success' },
      { action: 'add_inventory', module: 'Inventory', details: 'Added new inventory item', status: 'success' },
      { action: 'delete_inventory', module: 'Inventory', details: 'Removed inventory item', status: 'warning' },
      { action: 'create_party', module: 'Parties', details: 'Created new customer/supplier', status: 'success' },
      { action: 'update_settings', module: 'Settings', details: 'Modified system settings', status: 'success' },
      { action: 'password_reset', module: 'Security', details: 'Reset user password', status: 'success' },
      { action: 'failed_login', module: 'Authentication', details: 'Failed login attempt', status: 'failed' },
      { action: 'permission_change', module: 'Security', details: 'Changed user permissions', status: 'success' },
      { action: 'export_data', module: 'Reports', details: 'Exported financial report', status: 'success' },
    ];

    const sampleLogs: AuditLog[] = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)] || { 
        id: 'user1', 
        name: 'Admin User', 
        role: 'super_admin' 
      };
      const actionData = actions[Math.floor(Math.random() * actions.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      sampleLogs.push({
        id: `log${Date.now()}_${i}`,
        timestamp: timestamp.toISOString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: actionData.action,
        module: actionData.module,
        details: actionData.details,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        status: actionData.status as 'success' | 'failed' | 'warning',
        changes: actionData.action.includes('update') ? [
          { field: 'Email', oldValue: 'old@example.com', newValue: 'new@example.com' },
          { field: 'Phone', oldValue: '+977-9800000000', newValue: '+977-9811111111' }
        ] : undefined
      });
    }

    return sampleLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    // Search filter
    const searchMatch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter
    let dateMatch = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateFilter === 'today') dateMatch = daysDiff === 0;
      else if (dateFilter === 'week') dateMatch = daysDiff <= 7;
      else if (dateFilter === 'month') dateMatch = daysDiff <= 30;
    }

    // Action filter
    const actionMatch = actionFilter === 'all' || log.action === actionFilter;

    // Module filter
    const moduleMatch = moduleFilter === 'all' || log.module === moduleFilter;

    // Status filter
    const statusMatch = statusFilter === 'all' || log.status === statusFilter;

    return searchMatch && dateMatch && actionMatch && moduleMatch && statusMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  // Get unique values for filters
  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));
  const uniqueModules = Array.from(new Set(logs.map(l => l.module)));

  // Statistics
  const todayLogs = logs.filter(l => {
    const logDate = new Date(l.timestamp);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  const successLogs = logs.filter(l => l.status === 'success');
  const failedLogs = logs.filter(l => l.status === 'failed');
  const warningLogs = logs.filter(l => l.status === 'warning');

  // Action icon mapping
  const getActionIcon = (action: string) => {
    if (action.includes('login')) return LogIn;
    if (action.includes('logout')) return LogOut;
    if (action.includes('create')) return Plus;
    if (action.includes('update') || action.includes('edit')) return Edit;
    if (action.includes('delete')) return Trash2;
    if (action.includes('view')) return Eye;
    if (action.includes('lock')) return Lock;
    if (action.includes('unlock')) return Unlock;
    if (action.includes('password')) return Key;
    if (action.includes('permission')) return Shield;
    if (action.includes('export')) return Download;
    if (action.includes('import')) return Upload;
    if (action.includes('settings')) return Settings;
    return Activity;
  };

  // Module icon mapping
  const getModuleIcon = (module: string) => {
    if (module === 'User Management') return Users;
    if (module === 'Authentication') return Shield;
    if (module === 'Billing') return DollarSign;
    if (module === 'Inventory') return Package;
    if (module === 'Parties') return Users;
    if (module === 'Settings') return Settings;
    if (module === 'Security') return Lock;
    if (module === 'Reports') return FileText;
    return Database;
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Details', 'Status', 'IP Address'];
    const rows = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.userName,
      log.userRole,
      log.action,
      log.module,
      log.details,
      log.status,
      log.ipAddress || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Print Audit Log
  const printAuditLog = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Audit Log - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-card { border: 2px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: bold; border: 1px solid #d1d5db; }
            td { padding: 10px; border: 1px solid #d1d5db; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .status-success { color: #059669; font-weight: bold; }
            .status-failed { color: #dc2626; font-weight: bold; }
            .status-warning { color: #d97706; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🛡️ Audit Log Report</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleString('en-NP')}</p>
            <p><strong>Total Records:</strong> ${filteredLogs.length}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div style="color: #3b82f6;">Total Activities</div>
              <div class="stat-value" style="color: #3b82f6;">${logs.length}</div>
            </div>
            <div class="stat-card">
              <div style="color: #059669;">Successful</div>
              <div class="stat-value" style="color: #059669;">${logs.filter(l => l.status === 'success').length}</div>
            </div>
            <div class="stat-card">
              <div style="color: #dc2626;">Failed</div>
              <div class="stat-value" style="color: #dc2626;">${logs.filter(l => l.status === 'failed').length}</div>
            </div>
            <div class="stat-card">
              <div style="color: #7c3aed;">Today</div>
              <div class="stat-value" style="color: #7c3aed;">${todayLogs.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Module</th>
                <th>Details</th>
                <th>Status</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLogs.map(log => `
                <tr>
                  <td>${new Date(log.timestamp).toLocaleString('en-NP')}</td>
                  <td>
                    <strong>${log.userName}</strong><br>
                    <small style="color: #6b7280;">${log.userRole.replace(/_/g, ' ').toUpperCase()}</small>
                  </td>
                  <td>${log.action.replace(/_/g, ' ').toUpperCase()}</td>
                  <td>${log.module}</td>
                  <td>${log.details}</td>
                  <td class="status-${log.status}">
                    ${log.status === 'success' ? '✓ Success' : log.status === 'failed' ? '✗ Failed' : '⚠ Warning'}
                  </td>
                  <td style="font-family: monospace; font-size: 12px;">${log.ipAddress || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Serve Spares - Inventory Management System</p>
            <p>This is a confidential document. Handle with care.</p>
          </div>

          <script>
            window.onload = function() { 
              window.print(); 
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Clear old logs
  const clearOldLogs = () => {
    if (window.confirm('⚠️ Clear logs older than 30 days? This cannot be undone.')) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentLogs = logs.filter(log => new Date(log.timestamp) > thirtyDaysAgo);
      saveToStorage('auditLogs', recentLogs);
      setLogs(recentLogs);
      alert('✅ Old logs cleared successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold flex items-center">
            <Shield className="w-7 h-7 mr-3 text-blue-600" />
            Audit Log
            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              {filteredLogs.length} Records
            </span>
          </h2>
          <p className="text-gray-600 mt-1">Complete system activity tracking and monitoring</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={clearOldLogs}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Old</span>
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={printAuditLog}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={loadAuditLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <Activity className="w-8 h-8 text-blue-600 mb-2" />
          <div className="text-blue-900 font-bold text-3xl">{logs.length}</div>
          <div className="text-blue-700 text-sm">Total Activities</div>
        </div>

        <div className="bg-white border-2 border-green-200 rounded-xl p-6">
          <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
          <div className="text-green-900 font-bold text-3xl">{successLogs.length}</div>
          <div className="text-green-700 text-sm">Successful Actions</div>
        </div>

        <div className="bg-white border-2 border-red-200 rounded-xl p-6">
          <XCircle className="w-8 h-8 text-red-600 mb-2" />
          <div className="text-red-900 font-bold text-3xl">{failedLogs.length}</div>
          <div className="text-red-700 text-sm">Failed Actions</div>
        </div>

        <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
          <Clock className="w-8 h-8 text-purple-600 mb-2" />
          <div className="text-purple-900 font-bold text-3xl">{todayLogs.length}</div>
          <div className="text-purple-700 text-sm">Today's Activities</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-gray-900 font-bold mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          Filters & Search
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action.replace(/_/g, ' ').toUpperCase()}</option>
            ))}
          </select>

          {/* Module Filter */}
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Modules</option>
            {uniqueModules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="warning">Warning</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-gray-700 font-bold">Timestamp</th>
                <th className="text-left py-4 px-6 text-gray-700 font-bold">User</th>
                <th className="text-left py-4 px-6 text-gray-700 font-bold">Action</th>
                <th className="text-left py-4 px-6 text-gray-700 font-bold">Module</th>
                <th className="text-left py-4 px-6 text-gray-700 font-bold">Details</th>
                <th className="text-left py-4 px-6 text-gray-700 font-bold">IP Address</th>
                <th className="text-center py-4 px-6 text-gray-700 font-bold">Status</th>
                <th className="text-center py-4 px-6 text-gray-700 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                const ModuleIcon = getModuleIcon(log.module);
                const logDate = new Date(log.timestamp);

                return (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-gray-900 font-semibold text-sm">
                            {logDate.toLocaleDateString('en-NP')}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {logDate.toLocaleTimeString('en-NP')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-900 font-semibold text-sm">{log.userName}</div>
                          <div className="text-gray-500 text-xs">
                            {log.userRole.replace(/_/g, ' ').toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          log.status === 'success' ? 'bg-green-100' :
                          log.status === 'failed' ? 'bg-red-100' :
                          'bg-yellow-100'
                        }`}>
                          <ActionIcon className={`w-4 h-4 ${
                            log.status === 'success' ? 'text-green-600' :
                            log.status === 'failed' ? 'text-red-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                        <span className="text-gray-700 font-semibold text-sm">
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <ModuleIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 text-sm">{log.module}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600 text-sm max-w-xs truncate">
                        {log.details}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600 text-sm font-mono">
                        {log.ipAddress || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        log.status === 'success' ? 'bg-green-100 text-green-700' :
                        log.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.status === 'success' ? '✓ Success' :
                         log.status === 'failed' ? '✗ Failed' :
                         '⚠ Warning'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold flex items-center space-x-1 mx-auto"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-gray-600 text-sm">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} records
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Previous
              </button>
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <Shield className="w-6 h-6 mr-2 text-blue-600" />
                Audit Log Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex justify-center">
                <span className={`inline-flex px-6 py-3 rounded-full text-lg font-bold ${
                  selectedLog.status === 'success' ? 'bg-green-100 text-green-700' :
                  selectedLog.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {selectedLog.status === 'success' ? '✓ Successful Action' :
                   selectedLog.status === 'failed' ? '✗ Failed Action' :
                   '⚠ Warning Action'}
                </span>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-gray-600 text-sm font-semibold mb-1">Timestamp</div>
                  <div className="text-gray-900 font-bold">
                    {new Date(selectedLog.timestamp).toLocaleString('en-NP')}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-gray-600 text-sm font-semibold mb-1">Log ID</div>
                  <div className="text-gray-900 font-mono text-sm">{selectedLog.id}</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-blue-600 text-sm font-semibold mb-1">User</div>
                  <div className="text-blue-900 font-bold">{selectedLog.userName}</div>
                  <div className="text-blue-700 text-xs mt-1">
                    {selectedLog.userRole.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="text-blue-600 text-sm font-semibold mb-1">User ID</div>
                  <div className="text-blue-900 font-mono text-sm">{selectedLog.userId}</div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-purple-600 text-sm font-semibold mb-1">Action</div>
                  <div className="text-purple-900 font-bold">
                    {selectedLog.action.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="text-purple-600 text-sm font-semibold mb-1">Module</div>
                  <div className="text-purple-900 font-bold">{selectedLog.module}</div>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl col-span-2">
                  <div className="text-orange-600 text-sm font-semibold mb-1">IP Address</div>
                  <div className="text-orange-900 font-mono">{selectedLog.ipAddress || 'N/A'}</div>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-gray-700 font-bold mb-2">Action Details</div>
                <div className="text-gray-600">{selectedLog.details}</div>
              </div>

              {/* Changes */}
              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <div className="text-yellow-800 font-bold mb-3 flex items-center">
                    <Edit className="w-5 h-5 mr-2" />
                    Changes Made
                  </div>
                  <div className="space-y-3">
                    {selectedLog.changes.map((change, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-yellow-200">
                        <div className="text-gray-700 font-bold mb-2">{change.field}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-red-600 text-xs font-semibold mb-1">Old Value</div>
                            <div className="text-red-700 font-mono text-sm line-through">
                              {change.oldValue}
                            </div>
                          </div>
                          <div>
                            <div className="text-green-600 text-xs font-semibold mb-1">New Value</div>
                            <div className="text-green-700 font-mono text-sm font-bold">
                              {change.newValue}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    copyToClipboard(JSON.stringify(selectedLog, null, 2));
                    alert('✅ Log details copied to clipboard!');
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Copy Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};