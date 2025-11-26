import React, { useEffect, useState } from 'react';
import { 
  Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle, 
  Zap, Activity, BarChart3, PieChart, MapPin, ArrowUpRight, 
  ArrowDownRight, Flame, Lightbulb, AlertCircle, ShoppingCart,
  Calendar, Clock, Target, Wallet, CreditCard, Users
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Area, AreaChart, Cell 
} from 'recharts';
import { getFromStorage, getItemSalesStats } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { InventoryItem, Bill, Party } from '../../types';

interface DashboardStats {
  totalItems: number;
  totalValue: number;
  todaysSales: number;
  monthlySales: number;
  cashflow: number;
  lowStock: number;
  pendingOrders: number;
  activeCustomers: number;
  dailyChange: number;
  monthlyChange: number;
  stockChange: number;
}

interface InventoryHeatItem {
  id: string;
  name: string;
  velocity: 'fast' | 'medium' | 'slow';
  sales: number;
  stock: number;
  profitMargin: number;
  vehicleType: string;
}

interface AIAlert {
  id: string;
  type: 'warning' | 'trending' | 'insight';
  message: string;
  icon: any;
  color: string;
}

export const DashboardPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalValue: 0,
    todaysSales: 0,
    monthlySales: 0,
    cashflow: 0,
    lowStock: 0,
    pendingOrders: 0,
    activeCustomers: 0,
    dailyChange: 0,
    monthlyChange: 0,
    stockChange: 0,
  });
  
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [stockFlowData, setStockFlowData] = useState<any[]>([]);
  const [inventoryHeat, setInventoryHeat] = useState<InventoryHeatItem[]>([]);
  const [aiAlerts, setAiAlerts] = useState<AIAlert[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    generateAIAlerts();
  }, []);

  const loadDashboardData = () => {
    const inventory = getFromStorage('inventory', []).filter((i: InventoryItem) => i.workspaceId === currentUser?.workspaceId);
    const bills = getFromStorage('bills', []).filter((b: Bill) => b.workspaceId === currentUser?.workspaceId);
    const parties = getFromStorage('parties', []).filter((p: Party) => p.workspaceId === currentUser?.workspaceId);

    // Calculate stats
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const lowStock = inventory.filter(item => item.quantity <= item.minStockLevel).length;

    // Today's sales
    const today = new Date().toISOString().split('T')[0];
    const todaysBills = bills.filter(b => new Date(b.createdAt).toISOString().split('T')[0] === today);
    const todaysSales = todaysBills.reduce((sum, bill) => sum + bill.total, 0);

    // Yesterday's sales for comparison
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const yesterdaysSales = bills
      .filter(b => new Date(b.createdAt).toISOString().split('T')[0] === yesterday)
      .reduce((sum, bill) => sum + bill.total, 0);
    const dailyChange = yesterdaysSales > 0 ? ((todaysSales - yesterdaysSales) / yesterdaysSales) * 100 : 0;

    // Monthly sales
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyBills = bills.filter(b => {
      const billDate = new Date(b.createdAt);
      return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
    });
    const monthlySales = monthlyBills.reduce((sum, bill) => sum + bill.total, 0);

    // Last month for comparison
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthSales = bills
      .filter(b => {
        const billDate = new Date(b.createdAt);
        return billDate.getMonth() === lastMonth && billDate.getFullYear() === lastMonthYear;
      })
      .reduce((sum, bill) => sum + bill.total, 0);
    const monthlyChange = lastMonthSales > 0 ? ((monthlySales - lastMonthSales) / lastMonthSales) * 100 : 0;

    // Cashflow (paid bills - pending)
    const paidBills = bills.filter(b => b.paymentStatus === 'paid');
    const cashflow = paidBills.reduce((sum, bill) => sum + bill.total, 0);

    // Pending orders
    const pendingOrders = bills.filter(b => b.paymentStatus === 'pending').length;

    // Active customers (unique this month)
    const activeCustomers = new Set(monthlyBills.map(b => b.customerPhone || b.customerName)).size;

    setStats({
      totalItems,
      totalValue,
      todaysSales,
      monthlySales,
      cashflow,
      lowStock,
      pendingOrders,
      activeCustomers,
      dailyChange,
      monthlyChange,
      stockChange: -5.2, // Mock data
    });

    // Generate revenue chart data (last 7 days)
    const revenueChart = generateDailyRevenue(bills);
    setRevenueData(revenueChart);

    // Generate stock flow data
    const stockFlow = generateStockFlow(inventory);
    setStockFlowData(stockFlow);

    // Generate inventory heatmap
    const heatmap = generateInventoryHeatmap(inventory, bills);
    setInventoryHeat(heatmap);

    // Generate branch performance
    const branches = generateBranchPerformance(bills);
    setBranchPerformance(branches);
  };

  const generateDailyRevenue = (bills: Bill[]) => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayBills = bills.filter(b => new Date(b.createdAt).toISOString().split('T')[0] === dateStr);
      const revenue = dayBills.reduce((sum, b) => sum + b.total, 0);
      
      data.push({
        day: dayName,
        revenue: Math.round(revenue),
        sales: dayBills.length,
      });
    }
    return data;
  };

  const generateStockFlow = (inventory: InventoryItem[]) => {
    const categories = ['Two Wheeler', 'Four Wheeler'];
    return categories.map(cat => {
      const items = inventory.filter(i => 
        i.vehicleType === (cat === 'Two Wheeler' ? 'two_wheeler' : 'four_wheeler')
      );
      const inStock = items.filter(i => i.quantity > i.minStockLevel).length;
      const lowStock = items.filter(i => i.quantity <= i.minStockLevel && i.quantity > 0).length;
      const outOfStock = items.filter(i => i.quantity === 0).length;
      
      return {
        category: cat,
        inStock,
        lowStock,
        outOfStock,
      };
    });
  };

  const generateInventoryHeatmap = (inventory: InventoryItem[], bills: Bill[]): InventoryHeatItem[] => {
    const itemSales = new Map<string, number>();
    
    // Calculate sales for each item
    bills.forEach(bill => {
      bill.items.forEach(item => {
        const current = itemSales.get(item.itemId) || 0;
        itemSales.set(item.itemId, current + item.quantity);
      });
    });

    // Create heatmap
    return inventory.slice(0, 12).map(item => {
      const sales = itemSales.get(item.id) || 0;
      let velocity: 'fast' | 'medium' | 'slow' = 'slow';
      
      if (sales > 20) velocity = 'fast';
      else if (sales > 5) velocity = 'medium';

      const profitMargin = ((item.mrp - item.price) / item.mrp) * 100;

      return {
        id: item.id,
        name: item.name,
        velocity,
        sales,
        stock: item.quantity,
        profitMargin: Math.round(profitMargin),
        vehicleType: item.vehicleType === 'two_wheeler' ? '2W' : '4W',
      };
    });
  };

  const generateAIAlerts = () => {
    const alerts: AIAlert[] = [
      {
        id: '1',
        type: 'warning',
        message: 'Brake Pads A123 running out in 4 days',
        icon: AlertTriangle,
        color: 'text-orange-600',
      },
      {
        id: '2',
        type: 'trending',
        message: 'Engine Oil sales increased by 45% this week',
        icon: Flame,
        color: 'text-red-600',
      },
      {
        id: '3',
        type: 'insight',
        message: 'Consider restocking Air Filters - High demand predicted',
        icon: Lightbulb,
        color: 'text-yellow-600',
      },
      {
        id: '4',
        type: 'warning',
        message: '5 items below minimum stock level',
        icon: AlertCircle,
        color: 'text-red-600',
      },
    ];
    setAiAlerts(alerts);
  };

  const generateBranchPerformance = (bills: Bill[]) => {
    // For single branch, show performance categories
    return [
      {
        branch: 'Main Store',
        sales: bills.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.total, 0),
        returns: 2,
        stockLevel: 87,
        color: '#3b82f6',
      },
    ];
  };

  const getVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'fast': return 'bg-gradient-to-br from-green-400 to-emerald-600';
      case 'medium': return 'bg-gradient-to-br from-yellow-400 to-orange-500';
      case 'slow': return 'bg-gradient-to-br from-gray-400 to-gray-600';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-white mb-2">Business Overview</h1>
            <p className="text-gray-400">Real-time insights and analytics for {currentUser?.workspace || 'your business'}</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right mr-4">
              <div className="text-sm text-gray-400">Last updated</div>
              <div className="text-white">{new Date().toLocaleTimeString()}</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Top KPI Cards with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stock Flow */}
          <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <span className={`flex items-center space-x-1 text-sm ${stats.stockChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {stats.stockChange < 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  <span>{Math.abs(stats.stockChange).toFixed(1)}%</span>
                </span>
              </div>
              <div className="text-gray-400 text-sm mb-2">Stock Flow</div>
              <div className="text-white text-3xl mb-3">{stats.totalItems}</div>
              
              {/* Mini bar chart */}
              <div className="flex items-end space-x-1 h-12">
                {stockFlowData.map((data, idx) => (
                  <div key={idx} className="flex-1 bg-blue-500/30 rounded-t" style={{ height: `${(data.inStock / stats.totalItems) * 100}%` }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Sales */}
          <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl group-hover:bg-green-500/30 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <span className={`flex items-center space-x-1 text-sm ${stats.dailyChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {stats.dailyChange < 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  <span>{Math.abs(stats.dailyChange).toFixed(1)}%</span>
                </span>
              </div>
              <div className="text-gray-400 text-sm mb-2">Today's Sales</div>
              <div className="text-white text-3xl mb-3">₹{(stats.todaysSales / 1000).toFixed(1)}k</div>
              
              {/* Sparkline */}
              <ResponsiveContainer width="100%" height={48}>
                <AreaChart data={revenueData.slice(-7)}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cashflow Status */}
          <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-purple-400" />
                </div>
                <span className={`flex items-center space-x-1 text-sm ${stats.monthlyChange < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {stats.monthlyChange < 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  <span>{Math.abs(stats.monthlyChange).toFixed(1)}%</span>
                </span>
              </div>
              <div className="text-gray-400 text-sm mb-2">Cashflow Status</div>
              <div className="text-white text-3xl mb-3">₹{(stats.cashflow / 1000).toFixed(1)}k</div>
              
              {/* Status bars */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Received</span>
                  <span>{stats.cashflow > 0 ? 85 : 0}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '85%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Pending</span>
                  <span>15%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl group-hover:bg-red-500/30 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                {stats.lowStock > 0 && (
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs animate-pulse">
                    {stats.lowStock}
                  </div>
                )}
              </div>
              <div className="text-gray-400 text-sm mb-2">Low Stock Alerts</div>
              <div className="text-white text-3xl mb-3">{stats.lowStock}</div>
              
              {/* Alert indicators */}
              <div className="flex items-center space-x-2">
                {[...Array(Math.min(stats.lowStock, 5))].map((_, i) => (
                  <div key={i} className="flex-1 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                ))}
              </div>
              <div className="mt-3 text-xs text-red-400">Immediate action required</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Inventory Heatmap (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Inventory Heatmap */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white text-xl mb-1">Inventory Velocity Heatmap</h3>
                  <p className="text-gray-400 text-sm">Real-time sales velocity tracking</p>
                </div>
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-green-400 to-emerald-600"></div>
                    <span className="text-gray-400">Fast</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-yellow-400 to-orange-500"></div>
                    <span className="text-gray-400">Medium</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-gray-400 to-gray-600"></div>
                    <span className="text-gray-400">Slow</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {inventoryHeat.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative ${getVelocityColor(item.velocity)} rounded-xl p-4 cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden`}
                  >
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-3 text-white text-xs space-y-1 z-10">
                      <div className="text-center mb-2 font-medium truncate w-full">{item.name}</div>
                      <div className="w-full space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Sales:</span>
                          <span>{item.sales}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Stock:</span>
                          <span>{item.stock}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Margin:</span>
                          <span>{item.profitMargin}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Vehicle:</span>
                          <span>{item.vehicleType}</span>
                        </div>
                      </div>
                    </div>

                    {/* Default view - Fades out on hover */}
                    <div className="text-white transition-opacity duration-300 group-hover:opacity-0">
                      <div className="text-2xl mb-1">{item.sales}</div>
                      <div className="text-xs opacity-90 truncate">{item.name.substring(0, 15)}</div>
                    </div>
                    
                    {/* Velocity badge - Fades out on hover */}
                    <div className="absolute top-2 right-2 transition-opacity duration-300 group-hover:opacity-0">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white text-xl mb-1">Revenue Analytics</h3>
                  <p className="text-gray-400 text-sm">Last 7 days performance</p>
                </div>
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{stats.dailyChange.toFixed(1)}%</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="day" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#colorGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column - AI Alerts */}
          <div className="space-y-6">
            {/* AI Alerts Panel */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white">AI Insights</h3>
                  <p className="text-gray-400 text-xs">Real-time alerts & predictions</p>
                </div>
              </div>

              <div className="space-y-3">
                {aiAlerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div 
                      key={alert.id}
                      className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 ${
                          alert.type === 'warning' ? 'animate-pulse' : ''
                        }`}>
                          <Icon className={`w-4 h-4 ${alert.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm leading-relaxed">{alert.message}</p>
                          <div className="mt-2 text-xs text-gray-500">Just now</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center space-x-2">
                <span>View All Insights</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
              <h3 className="text-white mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => {
                    // Dispatch event to navigate to Order History panel
                    window.dispatchEvent(new CustomEvent('quickStatClick', {
                      detail: { panel: 'order-management', filter: 'pending' }
                    }));
                  }}
                  className="w-full group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShoppingCart className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-400 text-xs">Pending Orders</div>
                      <div className="text-white text-lg font-semibold">{stats.pendingOrders}</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </button>

                <button
                  onClick={() => {
                    // Dispatch event to navigate to Parties panel
                    window.dispatchEvent(new CustomEvent('quickStatClick', {
                      detail: { panel: 'parties', filter: 'customer' }
                    }));
                  }}
                  className="w-full group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-400 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-400 text-xs">Active Customers</div>
                      <div className="text-white text-lg font-semibold">{stats.activeCustomers}</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-green-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </button>

                <button
                  onClick={() => {
                    // Dispatch event to navigate to Financial Reports
                    window.dispatchEvent(new CustomEvent('quickStatClick', {
                      detail: { panel: 'financial-reports', filter: 'monthly' }
                    }));
                  }}
                  className="w-full group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-400 text-xs">Monthly Target</div>
                      <div className="text-white text-lg font-semibold">{((stats.monthlySales / 500000) * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${((stats.monthlySales / 500000) * 100)}%` }}></div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    // Dispatch event to navigate to Total Inventory
                    window.dispatchEvent(new CustomEvent('quickStatClick', {
                      detail: { panel: 'total-inventory', filter: 'all' }
                    }));
                  }}
                  className="w-full group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-400 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-gray-400 text-xs">Total Inventory Value</div>
                      <div className="text-white text-lg font-semibold">₹{(stats.totalValue / 1000).toFixed(0)}k</div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Branch Performance */}
        <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white text-xl">Store Performance</h3>
                <p className="text-gray-400 text-sm">Comprehensive store metrics</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {branchPerformance.map((branch, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white">{branch.branch}</h4>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Total Sales</span>
                      <span className="text-white">₹{(branch.sales / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Stock Level</span>
                      <span className="text-white">{branch.stockLevel}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${branch.stockLevel}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Returns</span>
                    <span className="text-white">{branch.returns}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new metrics */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-white/20 flex flex-col items-center justify-center text-center">
              <BarChart3 className="w-12 h-12 text-blue-400 mb-3" />
              <h4 className="text-white mb-2">Monthly Performance</h4>
              <div className="text-3xl text-white mb-1">₹{(stats.monthlySales / 1000).toFixed(1)}k</div>
              <div className="text-green-400 text-sm flex items-center space-x-1">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{stats.monthlyChange.toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-white/20 flex flex-col items-center justify-center text-center">
              <PieChart className="w-12 h-12 text-green-400 mb-3" />
              <h4 className="text-white mb-2">Payment Collection</h4>
              <div className="text-3xl text-white mb-1">{stats.cashflow > 0 ? 95 : 0}%</div>
              <div className="text-gray-400 text-sm">Collection Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};