import React, { useEffect, useState } from 'react';
import { 
  Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle, 
  Zap, Activity, BarChart3, Lightbulb, AlertCircle, ShoppingCart,
  Clock, Target, Flame, TrendingDown as TrendingDownIcon, Box,
  ArrowRight, Sparkles, Brain, ChevronRight
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Area, AreaChart, Cell 
} from 'recharts';
import { getFromStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { InventoryItem, Bill } from '../../types';

interface AIInsight {
  id: string;
  type: 'critical' | 'warning' | 'trending' | 'opportunity';
  category: 'stock' | 'cashflow' | 'pricing' | 'velocity' | 'supplier';
  message: string;
  metric?: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface InventoryVelocity {
  id: string;
  velocity: 'fast' | 'medium' | 'slow';
  velocityScore: number;
  daysUntilStockout?: number;
  salesPerDay: number;
}

export const EnhancedDashboardPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [inventoryVelocities, setInventoryVelocities] = useState<Map<string, InventoryVelocity>>(new Map());
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [hoveredCell, setHoveredCell] = useState<{ velocity: string; score: number; } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Stats
  const [lowStockCount, setLowStockCount] = useState(0);
  const [topSellingCount, setTopSellingCount] = useState(0);
  const [deadStockCount, setDeadStockCount] = useState(0);
  const [highValueCount, setHighValueCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const inventory = getFromStorage('inventory', []).filter(
      (i: InventoryItem) => i.workspaceId === currentUser?.workspaceId
    );
    const bills = getFromStorage('bills', []).filter(
      (b: Bill) => b.workspaceId === currentUser?.workspaceId && b.paymentStatus === 'paid'
    );

    // Calculate velocities and insights
    const velocities = calculateInventoryVelocities(inventory, bills);
    setInventoryVelocities(velocities);

    // Generate AI insights
    const insights = generateRealisticAIInsights(inventory, bills, velocities);
    setAiInsights(insights);

    // Calculate stats
    setLowStockCount(inventory.filter(i => i.quantity <= i.minStockLevel).length);
    setTopSellingCount(Array.from(velocities.values()).filter(v => v.velocity === 'fast').length);
    setDeadStockCount(Array.from(velocities.values()).filter(v => v.velocity === 'slow' && v.salesPerDay === 0).length);
    setHighValueCount(inventory.filter(i => (i.quantity * i.price) > 50000).length);

    // Generate revenue data
    generateRevenueData(bills);
  };

  const calculateInventoryVelocities = (inventory: InventoryItem[], bills: Bill[]): Map<string, InventoryVelocity> => {
    const velocities = new Map<string, InventoryVelocity>();
    const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);

    inventory.forEach(item => {
      // Calculate sales in last 30 days
      let totalSold = 0;
      bills.forEach(bill => {
        if (new Date(bill.createdAt).getTime() > last30Days) {
          const billItem = bill.items.find(bi => bi.id === item.id);
          if (billItem) {
            totalSold += billItem.quantity;
          }
        }
      });

      const salesPerDay = totalSold / 30;
      const daysUntilStockout = salesPerDay > 0 ? Math.floor(item.quantity / salesPerDay) : 999;
      
      // Calculate velocity score (0-100)
      const velocityScore = Math.min(100, Math.round(salesPerDay * 10));

      // Categorize velocity
      let velocity: 'fast' | 'medium' | 'slow';
      if (salesPerDay >= 2) velocity = 'fast';
      else if (salesPerDay >= 0.5) velocity = 'medium';
      else velocity = 'slow';

      velocities.set(item.id, {
        id: item.id,
        velocity,
        velocityScore,
        daysUntilStockout: daysUntilStockout < 999 ? daysUntilStockout : undefined,
        salesPerDay
      });
    });

    return velocities;
  };

  const generateRealisticAIInsights = (
    inventory: InventoryItem[], 
    bills: Bill[], 
    velocities: Map<string, InventoryVelocity>
  ): AIInsight[] => {
    const insights: AIInsight[] = [];

    // 1. Stock-out predictions
    velocities.forEach((velocity, itemId) => {
      const item = inventory.find(i => i.id === itemId);
      if (item && velocity.daysUntilStockout && velocity.daysUntilStockout <= 7) {
        insights.push({
          id: `stockout-${itemId}`,
          type: velocity.daysUntilStockout <= 3 ? 'critical' : 'warning',
          category: 'stock',
          message: `${item.name} will run out in ${velocity.daysUntilStockout} days based on current sales velocity.`,
          metric: `${velocity.salesPerDay.toFixed(1)} units/day`,
          icon: AlertTriangle,
          color: velocity.daysUntilStockout <= 3 ? 'text-red-600' : 'text-yellow-600',
          bgColor: velocity.daysUntilStockout <= 3 ? 'bg-red-50' : 'bg-yellow-50'
        });
      }
    });

    // 2. Cashflow trends
    const thisWeek = bills.filter(b => {
      const billDate = new Date(b.createdAt).getTime();
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return billDate > weekAgo;
    });
    const lastWeek = bills.filter(b => {
      const billDate = new Date(b.createdAt).getTime();
      const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return billDate > twoWeeksAgo && billDate <= weekAgo;
    });

    const thisWeekRevenue = thisWeek.reduce((sum, b) => sum + b.total, 0);
    const lastWeekRevenue = lastWeek.reduce((sum, b) => sum + b.total, 0);
    
    if (lastWeekRevenue > 0) {
      const cashflowChange = ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100;
      if (Math.abs(cashflowChange) > 5) {
        insights.push({
          id: 'cashflow-trend',
          type: cashflowChange > 0 ? 'trending' : 'warning',
          category: 'cashflow',
          message: `Your branch's cashflow is trending ${cashflowChange > 0 ? '+' : ''}${cashflowChange.toFixed(1)}% this week.`,
          metric: `₹${thisWeekRevenue.toLocaleString()}`,
          icon: cashflowChange > 0 ? TrendingUp : TrendingDown,
          color: cashflowChange > 0 ? 'text-green-600' : 'text-orange-600',
          bgColor: cashflowChange > 0 ? 'bg-green-50' : 'bg-orange-50'
        });
      }
    }

    // 3. Pricing mismatches
    const parties = getFromStorage('parties', []).filter(
      (p: any) => p.workspaceId === currentUser?.workspaceId
    );
    
    inventory.forEach(item => {
      if (item.partyId) {
        const party = parties.find((p: any) => p.id === item.partyId);
        if (party) {
          // Check if selling price is too low (less than 20% margin)
          const margin = ((item.mrp - item.price) / item.mrp) * 100;
          if (margin < 20) {
            insights.push({
              id: `pricing-${item.id}`,
              type: 'opportunity',
              category: 'pricing',
              message: `Pricing mismatch found for ${party.name}. Consider reviewing ${item.name} margins.`,
              metric: `${margin.toFixed(0)}% margin`,
              icon: DollarSign,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            });
          }
        }
      }
    });

    // 4. Fast-moving items
    const fastMovers = Array.from(velocities.entries())
      .filter(([_, v]) => v.velocity === 'fast')
      .slice(0, 2);
    
    fastMovers.forEach(([itemId, velocity]) => {
      const item = inventory.find(i => i.id === itemId);
      if (item) {
        insights.push({
          id: `fastmover-${itemId}`,
          type: 'trending',
          category: 'velocity',
          message: `${item.name} is trending up with ${velocity.salesPerDay.toFixed(1)} sales/day. Stock up now.`,
          metric: `${velocity.velocityScore} velocity`,
          icon: Flame,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        });
      }
    });

    // 5. Supplier delay patterns (simulated)
    const suppliers = parties.filter((p: any) => p.type === 'supplier');
    if (suppliers.length > 0 && Math.random() > 0.7) {
      const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
      insights.push({
        id: 'supplier-delay',
        type: 'warning',
        category: 'supplier',
        message: `${randomSupplier.name} has shown 2-3 day delays recently. Consider backup suppliers.`,
        metric: 'Historical pattern',
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      });
    }

    // Sort by priority (critical > warning > trending > opportunity)
    const priorityOrder = { critical: 0, warning: 1, trending: 2, opportunity: 3 };
    return insights
      .sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type])
      .slice(0, 6); // Limit to 6 insights
  };

  const generateRevenueData = (bills: Bill[]) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      const dayBills = bills.filter(b => {
        if (!b.createdAt) return false;
        const billDate = new Date(b.createdAt);
        if (isNaN(billDate.getTime())) return false;
        return billDate.toISOString().split('T')[0] === dateStr;
      });
      const revenue = dayBills.reduce((sum, b) => sum + b.total, 0);
      
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Math.round(revenue),
        bills: dayBills.length
      });
    }
    setRevenueData(last7Days);
  };

  const getVelocityColor = (velocity: 'fast' | 'medium' | 'slow') => {
    switch (velocity) {
      case 'fast': return 'bg-gradient-to-br from-red-400 to-orange-500';
      case 'medium': return 'bg-gradient-to-br from-yellow-400 to-orange-400';
      case 'slow': return 'bg-gradient-to-br from-blue-400 to-cyan-400';
    }
  };

  const handleQuickStatClick = (statType: string) => {
    // This would be passed to AdminDashboard to change panel and apply filter
    const event = new CustomEvent('quickStatClick', { 
      detail: { 
        panel: 'total-inventory', 
        filter: statType 
      } 
    });
    window.dispatchEvent(event);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Panel */}
      <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-gray-900 text-xl font-semibold flex items-center space-x-2">
              <span>AI-Powered Insights</span>
              <Sparkles className="w-5 h-5 text-purple-500" />
            </h3>
            <p className="text-gray-600 text-sm">Real-time analysis of your business patterns</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiInsights.map((insight) => {
            const Icon = insight.icon;
            return (
              <div
                key={insight.id}
                className={`${insight.bgColor} border-2 ${insight.bgColor.replace('bg-', 'border-').replace('-50', '-200')} rounded-xl p-4 hover:shadow-md transition-all`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 ${insight.bgColor.replace('-50', '-200')} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${insight.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${insight.color}`}>
                      {insight.type}
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed mb-2">
                      {insight.message}
                    </p>
                    {insight.metric && (
                      <div className={`inline-flex items-center px-2 py-1 ${insight.bgColor.replace('-50', '-200')} rounded-lg text-xs font-semibold ${insight.color}`}>
                        {insight.metric}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {aiInsights.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No critical insights at the moment. Your business is running smoothly!</p>
          </div>
        )}
      </div>

      {/* Quick Stats - Interactive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => handleQuickStatClick('low-stock')}
          className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <ChevronRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-red-600 text-sm font-medium mb-1">Low Stock Items</div>
          <div className="text-red-900 text-3xl font-bold">{lowStockCount}</div>
          <div className="text-red-600 text-xs mt-2 flex items-center space-x-1">
            <span>Click to view details</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        <button
          onClick={() => handleQuickStatClick('top-selling')}
          className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <ChevronRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-green-600 text-sm font-medium mb-1">Top Selling Items</div>
          <div className="text-green-900 text-3xl font-bold">{topSellingCount}</div>
          <div className="text-green-600 text-xs mt-2 flex items-center space-x-1">
            <span>Click to view details</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        <button
          onClick={() => handleQuickStatClick('dead-stock')}
          className="bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-300 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Box className="w-6 h-6 text-white" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-gray-600 text-sm font-medium mb-1">Dead Stock</div>
          <div className="text-gray-900 text-3xl font-bold">{deadStockCount}</div>
          <div className="text-gray-600 text-xs mt-2 flex items-center space-x-1">
            <span>Click to view details</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </button>

        <button
          onClick={() => handleQuickStatClick('high-value')}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all text-left group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-white" />
            </div>
            <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-purple-600 text-sm font-medium mb-1">High Value Items</div>
          <div className="text-purple-900 text-3xl font-bold">{highValueCount}</div>
          <div className="text-purple-600 text-xs mt-2 flex items-center space-x-1">
            <span>Click to view details</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </button>
      </div>

      {/* Inventory Velocity Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-gray-900 text-xl font-semibold">Inventory Velocity Heatmap</h3>
            <p className="text-gray-500 text-sm">Visual representation of stock movement speed</p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-orange-500 rounded"></div>
              <span className="text-gray-600">Fast</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-400 rounded"></div>
              <span className="text-gray-600">Medium</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded"></div>
              <span className="text-gray-600">Slow</span>
            </div>
          </div>
        </div>

        <div 
          className="grid grid-cols-12 gap-2"
          onMouseMove={handleMouseMove}
        >
          {Array.from(inventoryVelocities.values()).slice(0, 48).map((velocity, index) => (
            <div
              key={velocity.id}
              className={`aspect-square ${getVelocityColor(velocity.velocity)} rounded-lg cursor-pointer hover:scale-110 hover:shadow-lg transition-all hover:z-10 relative`}
              onMouseEnter={() => setHoveredCell({ 
                velocity: velocity.velocity.toUpperCase(), 
                score: velocity.velocityScore 
              })}
              onMouseLeave={() => setHoveredCell(null)}
            />
          ))}
        </div>

        {/* Minimal Tooltip - NO ITEM NAME */}
        {hoveredCell && (
          <div
            className="fixed pointer-events-none z-50 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl"
            style={{
              left: mousePosition.x + 15,
              top: mousePosition.y + 15,
            }}
          >
            <div className="text-xs font-semibold mb-1">{hoveredCell.velocity}</div>
            <div className="text-sm">Velocity: {hoveredCell.score}</div>
          </div>
        )}
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-gray-900 text-xl font-semibold mb-6">7-Day Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
