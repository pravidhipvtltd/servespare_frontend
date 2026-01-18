import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart,
  Calendar, Clock, Activity, BarChart3, PieChart, AlertCircle, CheckCircle,
  XCircle, ArrowUp, ArrowDown, Minus, RefreshCw, Download, Maximize2,
  Minimize2, X, Settings, Eye, EyeOff, Grid3x3, List, Plus, Move,
  Sparkles, Zap, Target, Award, Gift, Star, Heart, Bookmark
} from 'lucide-react';
import { getFromStorage } from '../utils/mockData';

interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'activity' | 'quick-actions' | 'alerts' | 'goals';
  title: string;
  icon: any;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  visible: boolean;
  data?: any;
}

interface DashboardWidgetSystemProps {
  workspaceId: string;
}

export const DashboardWidgetSystem: React.FC<DashboardWidgetSystemProps> = ({ workspaceId }) => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    loadWidgets();
    loadStats();
  }, [workspaceId]);

  const loadWidgets = () => {
    const savedWidgets = localStorage.getItem(`dashboard_widgets_${workspaceId}`);
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      // Default widgets
      setWidgets([
        { id: 'revenue', type: 'stats', title: 'Total Revenue', icon: DollarSign, size: 'small', position: { x: 0, y: 0 }, visible: true },
        { id: 'orders', type: 'stats', title: 'Total Orders', icon: ShoppingCart, size: 'small', position: { x: 1, y: 0 }, visible: true },
        { id: 'customers', type: 'stats', title: 'Total Customers', icon: Users, size: 'small', position: { x: 2, y: 0 }, visible: true },
        { id: 'products', type: 'stats', title: 'Total Products', icon: Package, size: 'small', position: { x: 3, y: 0 }, visible: true },
        { id: 'sales-chart', type: 'chart', title: 'Sales Overview', icon: BarChart3, size: 'large', position: { x: 0, y: 1 }, visible: true },
        { id: 'activity', type: 'activity', title: 'Recent Activity', icon: Activity, size: 'medium', position: { x: 2, y: 1 }, visible: true },
        { id: 'alerts', type: 'alerts', title: 'System Alerts', icon: AlertCircle, size: 'medium', position: { x: 0, y: 2 }, visible: true },
        { id: 'goals', type: 'goals', title: 'Monthly Goals', icon: Target, size: 'medium', position: { x: 2, y: 2 }, visible: true },
      ]);
    }
  };

  const loadStats = () => {
    const bills = getFromStorage('bills', []).filter((b: any) => b.workspaceId === workspaceId);
    const inventory = getFromStorage('inventory', []).filter((i: any) => i.workspaceId === workspaceId);
    const parties = getFromStorage('parties', []).filter((p: any) => p.workspaceId === workspaceId);
    const orders = getFromStorage('purchase_orders', []).filter((o: any) => o.workspaceId === workspaceId);

    const totalRevenue = bills.reduce((sum: number, bill: any) => sum + (bill.total || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = parties.filter((p: any) => p.type === 'customer').length;
    const totalProducts = inventory.length;
    const lowStockItems = inventory.filter((i: any) => (i.quantity || 0) < (i.minQuantity || 10)).length;

    // Calculate trends (mock data for now)
    const revenueChange = 12.5;
    const ordersChange = -3.2;
    const customersChange = 8.7;
    const productsChange = 5.1;

    setStats({
      revenue: { value: totalRevenue, change: revenueChange, trend: revenueChange > 0 ? 'up' : 'down' },
      orders: { value: totalOrders, change: ordersChange, trend: ordersChange > 0 ? 'up' : 'down' },
      customers: { value: totalCustomers, change: customersChange, trend: customersChange > 0 ? 'up' : 'down' },
      products: { value: totalProducts, change: productsChange, trend: productsChange > 0 ? 'up' : 'down' },
      lowStock: lowStockItems,
      recentActivity: [
        { id: 1, type: 'sale', message: 'New sale completed', amount: 'NPR 15,000', time: '5m ago', icon: CheckCircle, color: 'green' },
        { id: 2, type: 'order', message: 'Purchase order received', amount: 'NPR 50,000', time: '15m ago', icon: ShoppingCart, color: 'blue' },
        { id: 3, type: 'alert', message: 'Low stock alert: ABC123', amount: '5 units', time: '1h ago', icon: AlertCircle, color: 'yellow' },
        { id: 4, type: 'customer', message: 'New customer registered', amount: 'John Doe', time: '2h ago', icon: Users, color: 'purple' },
      ],
      alerts: [
        { id: 1, type: 'warning', message: `${lowStockItems} products are low on stock`, icon: AlertCircle, color: 'yellow' },
        { id: 2, type: 'info', message: '3 orders pending approval', icon: Clock, color: 'blue' },
        { id: 3, type: 'success', message: '15 payments received today', icon: CheckCircle, color: 'green' },
      ],
      goals: [
        { id: 1, title: 'Monthly Revenue', current: totalRevenue, target: 500000, unit: 'NPR', icon: DollarSign },
        { id: 2, title: 'New Customers', current: 45, target: 100, unit: 'customers', icon: Users },
        { id: 3, title: 'Products Sold', current: 230, target: 500, unit: 'items', icon: Package },
      ],
    });
  };

  const saveWidgets = (updatedWidgets: Widget[]) => {
    localStorage.setItem(`dashboard_widgets_${workspaceId}`, JSON.stringify(updatedWidgets));
    setWidgets(updatedWidgets);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const updated = widgets.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    saveWidgets(updated);
  };

  const removeWidget = (widgetId: string) => {
    const updated = widgets.filter(w => w.id !== widgetId);
    saveWidgets(updated);
  };

  const refreshWidget = (widgetId: string) => {
    loadStats();
  };

  const renderStatsWidget = (widget: Widget) => {
    const stat = stats[widget.id];
    if (!stat) return null;

    const TrendIcon = stat.trend === 'up' ? ArrowUp : stat.trend === 'down' ? ArrowDown : Minus;
    const trendColor = stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600';

    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <widget.icon className="w-6 h-6 text-white" />
            </div>
            <div className={`flex items-center space-x-1 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-sm font-bold">{Math.abs(stat.change)}%</span>
            </div>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm mb-1">{widget.title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {widget.id === 'revenue' ? `NPR ${stat.value.toLocaleString()}` : stat.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">vs last month</p>
          </div>
        </div>

        {/* Widget controls (shown in edit mode) */}
        {isEditMode && (
          <div className="absolute top-2 right-2 flex items-center space-x-1">
            <button
              onClick={() => toggleWidgetVisibility(widget.id)}
              className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
              title={widget.visible ? 'Hide' : 'Show'}
            >
              {widget.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button
              onClick={() => removeWidget(widget.id)}
              className="p-1.5 bg-white/90 hover:bg-red-100 rounded-lg shadow-sm transition-colors"
              title="Remove"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderChartWidget = (widget: Widget) => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <widget.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">{widget.title}</h3>
          </div>
          <button
            onClick={() => refreshWidget(widget.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Simple bar chart visualization */}
        <div className="space-y-3">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const height = Math.random() * 100 + 20;
            return (
              <div key={day} className="flex items-center space-x-3">
                <span className="text-xs text-gray-600 w-8">{day}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{ width: `${height}%` }}
                  >
                    <span className="text-xs text-white font-semibold">
                      {Math.round(height)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isEditMode && (
          <div className="absolute top-2 right-2 flex items-center space-x-1">
            <button
              onClick={() => toggleWidgetVisibility(widget.id)}
              className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
            >
              {widget.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button
              onClick={() => removeWidget(widget.id)}
              className="p-1.5 bg-white/90 hover:bg-red-100 rounded-lg shadow-sm transition-colors"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderActivityWidget = (widget: Widget) => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <widget.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">{widget.title}</h3>
          </div>
        </div>

        <div className="space-y-3">
          {stats.recentActivity?.map((activity: any) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`w-8 h-8 bg-${activity.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <activity.icon className={`w-4 h-4 text-${activity.color}-600`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-600">{activity.amount}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isEditMode && (
          <div className="absolute top-2 right-2 flex items-center space-x-1">
            <button
              onClick={() => toggleWidgetVisibility(widget.id)}
              className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
            >
              {widget.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button
              onClick={() => removeWidget(widget.id)}
              className="p-1.5 bg-white/90 hover:bg-red-100 rounded-lg shadow-sm transition-colors"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderAlertsWidget = (widget: Widget) => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <widget.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">{widget.title}</h3>
          </div>
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            {stats.alerts?.length || 0}
          </span>
        </div>

        <div className="space-y-3">
          {stats.alerts?.map((alert: any) => (
            <div key={alert.id} className={`flex items-start space-x-3 p-3 bg-${alert.color}-50 border border-${alert.color}-200 rounded-lg`}>
              <alert.icon className={`w-5 h-5 text-${alert.color}-600 flex-shrink-0 mt-0.5`} />
              <p className="text-sm text-gray-900 flex-1">{alert.message}</p>
            </div>
          ))}
        </div>

        {isEditMode && (
          <div className="absolute top-2 right-2 flex items-center space-x-1">
            <button
              onClick={() => toggleWidgetVisibility(widget.id)}
              className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
            >
              {widget.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button
              onClick={() => removeWidget(widget.id)}
              className="p-1.5 bg-white/90 hover:bg-red-100 rounded-lg shadow-sm transition-colors"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderGoalsWidget = (widget: Widget) => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <widget.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-gray-900">{widget.title}</h3>
          </div>
        </div>

        <div className="space-y-4">
          {stats.goals?.map((goal: any) => {
            const progress = (goal.current / goal.target) * 100;
            const isComplete = progress >= 100;
            
            return (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <goal.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{goal.title}</span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    {isComplete && (
                      <div className="flex items-center justify-center h-full">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(progress)}%</p>
              </div>
            );
          })}
        </div>

        {isEditMode && (
          <div className="absolute top-2 right-2 flex items-center space-x-1">
            <button
              onClick={() => toggleWidgetVisibility(widget.id)}
              className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition-colors"
            >
              {widget.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </button>
            <button
              onClick={() => removeWidget(widget.id)}
              className="p-1.5 bg-white/90 hover:bg-red-100 rounded-lg shadow-sm transition-colors"
            >
              <X className="w-3 h-3 text-red-600" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderWidget = (widget: Widget) => {
    if (!widget.visible && !isEditMode) return null;

    switch (widget.type) {
      case 'stats':
        return renderStatsWidget(widget);
      case 'chart':
        return renderChartWidget(widget);
      case 'activity':
        return renderActivityWidget(widget);
      case 'alerts':
        return renderAlertsWidget(widget);
      case 'goals':
        return renderGoalsWidget(widget);
      default:
        return null;
    }
  };

  const visibleWidgets = widgets.filter(w => w.visible || isEditMode);

  return (
    <div className="space-y-6">
      {/* Widget Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-600">Customize your dashboard with widgets</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadStats()}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh All</span>
          </button>
          
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              isEditMode 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isEditMode ? 'Done Editing' : 'Customize'}</span>
          </button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleWidgets.map(widget => (
          <div
            key={widget.id}
            className={`${
              widget.size === 'large' ? 'lg:col-span-2' : 
              widget.size === 'medium' ? 'lg:col-span-2' : 
              'lg:col-span-1'
            } ${!widget.visible && isEditMode ? 'opacity-50' : ''}`}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {isEditMode && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Customize Your Dashboard</h3>
              <p className="text-sm text-gray-700 mb-3">
                Click the eye icon to show/hide widgets, or click the X to remove them completely. 
                You can refresh individual widgets or all at once.
              </p>
              <p className="text-xs text-gray-600">
                💡 Tip: Widgets automatically save their state, so your customizations persist across sessions!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
