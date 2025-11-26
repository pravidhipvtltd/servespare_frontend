import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Search, X, Info, 
  AlertCircle, CheckCircle, Lightbulb, Target, ArrowUp, 
  ArrowDown, BarChart3, Users, Building, Store, Percent,
  ChevronRight, Calculator, Zap, Package
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { InventoryItem } from '../../types';

interface PricingTier {
  retail: number;
  wholesale: number;
  distributor: number;
}

interface PricingData extends InventoryItem {
  pricing?: PricingTier;
  costPrice?: number;
}

interface MarginData {
  amount: number;
  percentage: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

export const PricingControlPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<PricingData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<PricingData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'two_wheeler' | 'four_wheeler'>('all');
  
  const [pricing, setPricing] = useState<PricingTier>({
    retail: 0,
    wholesale: 0,
    distributor: 0,
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    const inventory = getFromStorage('inventory', []).filter(
      (i: InventoryItem) => i.workspaceId === currentUser?.workspaceId
    );
    
    // Add mock pricing data
    const itemsWithPricing = inventory.map((item: InventoryItem) => ({
      ...item,
      costPrice: item.price,
      pricing: {
        retail: item.mrp,
        wholesale: Math.round(item.mrp * 0.85),
        distributor: Math.round(item.mrp * 0.75),
      },
    }));
    
    setItems(itemsWithPricing);
  };

  const handleOpenModal = (item: PricingData) => {
    setSelectedItem(item);
    setPricing(item.pricing || {
      retail: item.mrp,
      wholesale: Math.round(item.mrp * 0.85),
      distributor: Math.round(item.mrp * 0.75),
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleSavePricing = () => {
    if (!selectedItem) return;

    const allItems = getFromStorage('inventory', []);
    const updated = allItems.map((item: InventoryItem) =>
      item.id === selectedItem.id
        ? { ...item, mrp: pricing.retail, price: selectedItem.costPrice }
        : item
    );
    saveToStorage('inventory', updated);
    
    // Update local state
    const updatedItems = items.map((item) =>
      item.id === selectedItem.id
        ? { ...item, pricing, mrp: pricing.retail }
        : item
    );
    setItems(updatedItems);
    
    handleCloseModal();
  };

  const calculateMargin = (sellPrice: number, costPrice: number): MarginData => {
    const amount = sellPrice - costPrice;
    const percentage = ((amount / sellPrice) * 100);
    
    let status: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    if (percentage >= 40) status = 'excellent';
    else if (percentage >= 25) status = 'good';
    else if (percentage >= 15) status = 'fair';
    
    return { amount, percentage, status };
  };

  const getMarginColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'fair': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getMarginIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <TrendingUp className="w-4 h-4" />;
      case 'fair': return <AlertCircle className="w-4 h-4" />;
      case 'poor': return <TrendingDown className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const handlePriceChange = (tier: keyof PricingTier, value: number) => {
    setPricing({ ...pricing, [tier]: Math.max(0, value) });
  };

  const incrementPrice = (tier: keyof PricingTier, amount: number) => {
    setPricing({ ...pricing, [tier]: Math.max(0, pricing[tier] + amount) });
  };

  const generateSmartRecommendations = (costPrice: number) => {
    const targetMargin = 30; // 30% target margin
    const suggestedRetail = Math.round(costPrice / (1 - targetMargin / 100));
    const suggestedWholesale = Math.round(suggestedRetail * 0.85);
    const suggestedDistributor = Math.round(suggestedRetail * 0.75);
    
    const competitorMin = Math.round(suggestedRetail * 0.95);
    const competitorMax = Math.round(suggestedRetail * 1.15);
    
    return {
      retail: suggestedRetail,
      wholesale: suggestedWholesale,
      distributor: suggestedDistributor,
      competitorRange: { min: competitorMin, max: competitorMax },
    };
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVehicle = vehicleFilter === 'all' || item.vehicleType === vehicleFilter;
    return matchesSearch && matchesVehicle;
  });

  const stats = {
    totalItems: items.length,
    avgRetailPrice: Math.round(items.reduce((sum, item) => sum + (item.pricing?.retail || item.mrp), 0) / items.length || 0),
    avgMargin: Math.round(items.reduce((sum, item) => {
      const margin = calculateMargin(item.pricing?.retail || item.mrp, item.costPrice || item.price);
      return sum + margin.percentage;
    }, 0) / items.length || 0),
    itemsNeedReview: items.filter(item => {
      const margin = calculateMargin(item.pricing?.retail || item.mrp, item.costPrice || item.price);
      return margin.percentage < 15;
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl mb-1">Pricing Control</h3>
          <p className="text-gray-500 text-sm">Manage retail, wholesale, and distributor pricing</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-gray-600 text-sm mb-1">Total Items</div>
          <div className="text-gray-900 text-2xl font-semibold">{stats.totalItems}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-gray-600 text-sm mb-1">Avg Retail Price</div>
          <div className="text-gray-900 text-2xl font-semibold">₹{stats.avgRetailPrice}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-gray-600 text-sm mb-1">Avg Margin</div>
          <div className="text-gray-900 text-2xl font-semibold">{stats.avgMargin}%</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <Zap className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-gray-600 text-sm mb-1">Needs Review</div>
          <div className="text-gray-900 text-2xl font-semibold">{stats.itemsNeedReview}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name or part number..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVehicleFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                vehicleFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVehicleFilter('two_wheeler')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                vehicleFilter === 'two_wheeler' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              2 Wheeler
            </button>
            <button
              onClick={() => setVehicleFilter('four_wheeler')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                vehicleFilter === 'four_wheeler' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              4 Wheeler
            </button>
          </div>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Product</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Vehicle Type</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Cost Price</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Retail Price</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Wholesale</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Distributor</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Margin</th>
                <th className="text-left text-gray-600 text-sm font-semibold py-4 px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const costPrice = item.costPrice || item.price || 0;
                const retailPrice = item.pricing?.retail || item.mrp || 0;
                const wholesalePrice = item.pricing?.wholesale || (retailPrice ? Math.round(retailPrice * 0.85) : 0);
                const distributorPrice = item.pricing?.distributor || (retailPrice ? Math.round(retailPrice * 0.75) : 0);
                const margin = calculateMargin(retailPrice, costPrice);
                
                return (
                  <tr 
                    key={item.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleOpenModal(item)}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-gray-900 font-medium">{item.name}</div>
                        <div className="text-gray-500 text-sm">{item.partNumber || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.vehicleType === 'two_wheeler' 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {item.vehicleType === 'two_wheeler' ? '2 Wheeler' : '4 Wheeler'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900">₹{costPrice.toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-900 font-medium">₹{retailPrice.toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-700">₹{wholesalePrice.toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-700">₹{distributorPrice.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getMarginColor(margin.status)}`}>
                        {getMarginIcon(margin.status)}
                        <span>{margin.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(item);
                        }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <span>Edit Pricing</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Modal */}
      {modalOpen && selectedItem && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />
          
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{selectedItem.name}</h3>
                      <p className="text-blue-100 text-sm mt-1">Configure pricing tiers for this product</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Pricing Section */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Retail Column */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Store className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="text-gray-900 font-semibold text-lg">Retail</h4>
                          <p className="text-gray-500 text-sm">End customer price</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-xl p-6">
                          <label className="block text-gray-700 text-sm font-medium mb-3">Price (NPR)</label>
                          <div className="space-y-3">
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                              <input
                                type="number"
                                value={pricing.retail}
                                onChange={(e) => handlePriceChange('retail', Number(e.target.value))}
                                className="w-full pl-8 pr-4 py-4 border-2 border-gray-300 rounded-xl text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => incrementPrice('retail', -10)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <ArrowDown className="w-4 h-4 mx-auto" />
                              </button>
                              <button
                                onClick={() => incrementPrice('retail', -1)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                                -1
                              </button>
                              <button
                                onClick={() => incrementPrice('retail', 1)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                                +1
                              </button>
                              <button
                                onClick={() => incrementPrice('retail', 10)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <ArrowUp className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>

                          {/* Margin Display */}
                          <div className="mt-4 pt-4 border-t border-green-200">
                            {(() => {
                              const margin = calculateMargin(pricing.retail, selectedItem.costPrice || selectedItem.price);
                              return (
                                <div className={`text-center p-3 rounded-lg ${getMarginColor(margin.status)}`}>
                                  <div className="flex items-center justify-center space-x-2 mb-1">
                                    {getMarginIcon(margin.status)}
                                    <span className="font-semibold">{margin.percentage.toFixed(1)}%</span>
                                  </div>
                                  <div className="text-xs">Profit: ₹{margin.amount.toLocaleString()}</div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Wholesale Column */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="text-gray-900 font-semibold text-lg">Wholesale</h4>
                          <p className="text-gray-500 text-sm">Bulk buyers</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-xl p-6">
                          <label className="block text-gray-700 text-sm font-medium mb-3">Price (NPR)</label>
                          <div className="space-y-3">
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                              <input
                                type="number"
                                value={pricing.wholesale}
                                onChange={(e) => handlePriceChange('wholesale', Number(e.target.value))}
                                className="w-full pl-8 pr-4 py-4 border-2 border-gray-300 rounded-xl text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => incrementPrice('wholesale', -10)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <ArrowDown className="w-4 h-4 mx-auto" />
                              </button>
                              <button
                                onClick={() => incrementPrice('wholesale', -1)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                                -1
                              </button>
                              <button
                                onClick={() => incrementPrice('wholesale', 1)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                                +1
                              </button>
                              <button
                                onClick={() => incrementPrice('wholesale', 10)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <ArrowUp className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-blue-200">
                            {(() => {
                              const margin = calculateMargin(pricing.wholesale, selectedItem.costPrice || selectedItem.price);
                              return (
                                <div className={`text-center p-3 rounded-lg ${getMarginColor(margin.status)}`}>
                                  <div className="flex items-center justify-center space-x-2 mb-1">
                                    {getMarginIcon(margin.status)}
                                    <span className="font-semibold">{margin.percentage.toFixed(1)}%</span>
                                  </div>
                                  <div className="text-xs">Profit: ₹{margin.amount.toLocaleString()}</div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Distributor Column */}
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <Building className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="text-gray-900 font-semibold text-lg">Distributor</h4>
                          <p className="text-gray-500 text-sm">Trade partners</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-xl p-6">
                          <label className="block text-gray-700 text-sm font-medium mb-3">Price (NPR)</label>
                          <div className="space-y-3">
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                              <input
                                type="number"
                                value={pricing.distributor}
                                onChange={(e) => handlePriceChange('distributor', Number(e.target.value))}
                                className="w-full pl-8 pr-4 py-4 border-2 border-gray-300 rounded-xl text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => incrementPrice('distributor', -10)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <ArrowDown className="w-4 h-4 mx-auto" />
                              </button>
                              <button
                                onClick={() => incrementPrice('distributor', -1)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                                -1
                              </button>
                              <button
                                onClick={() => incrementPrice('distributor', 1)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                                +1
                              </button>
                              <button
                                onClick={() => incrementPrice('distributor', 10)}
                                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                <ArrowUp className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-purple-200">
                            {(() => {
                              const margin = calculateMargin(pricing.distributor, selectedItem.costPrice || selectedItem.price);
                              return (
                                <div className={`text-center p-3 rounded-lg ${getMarginColor(margin.status)}`}>
                                  <div className="flex items-center justify-center space-x-2 mb-1">
                                    {getMarginIcon(margin.status)}
                                    <span className="font-semibold">{margin.percentage.toFixed(1)}%</span>
                                  </div>
                                  <div className="text-xs">Profit: ₹{margin.amount.toLocaleString()}</div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost Price Reference */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calculator className="w-5 h-5 text-gray-500" />
                          <span className="text-gray-700">Cost Price (Your Purchase)</span>
                        </div>
                        <span className="text-gray-900 font-semibold text-lg">₹{(selectedItem.costPrice || selectedItem.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Smart Recommendations Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-gray-900 font-semibold">Smart Recommendations</h4>
                      </div>

                      {(() => {
                        const recommendations = generateSmartRecommendations(selectedItem.costPrice || selectedItem.price);
                        return (
                          <div className="space-y-4">
                            <div className="bg-white rounded-lg p-4 border border-yellow-200">
                              <div className="text-sm text-gray-600 mb-2">Suggested Retail Price</div>
                              <div className="text-2xl font-bold text-green-600">₹{recommendations.retail.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 mt-1">Based on 30% margin target</div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-yellow-200">
                              <div className="text-sm text-gray-600 mb-2">Suggested Wholesale</div>
                              <div className="text-xl font-bold text-blue-600">₹{recommendations.wholesale.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 mt-1">15% discount from retail</div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-yellow-200">
                              <div className="text-sm text-gray-600 mb-2">Suggested Distributor</div>
                              <div className="text-xl font-bold text-purple-600">₹{recommendations.distributor.toLocaleString()}</div>
                              <div className="text-xs text-gray-500 mt-1">25% discount from retail</div>
                            </div>

                            <div className="bg-white rounded-lg p-4 border border-yellow-200">
                              <div className="flex items-center space-x-2 mb-2">
                                <Target className="w-4 h-4 text-gray-600" />
                                <div className="text-sm text-gray-600">Competitor Price Range</div>
                              </div>
                              <div className="text-lg font-bold text-gray-900">
                                ₹{recommendations.competitorRange.min.toLocaleString()} - ₹{recommendations.competitorRange.max.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">Market analysis estimate</div>
                            </div>

                            <button
                              onClick={() => {
                                setPricing({
                                  retail: recommendations.retail,
                                  wholesale: recommendations.wholesale,
                                  distributor: recommendations.distributor,
                                });
                              }}
                              className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all font-medium shadow-md"
                            >
                              Apply Recommendations
                            </button>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-medium mb-1">Pricing Tips</p>
                          <ul className="space-y-1 text-xs text-blue-700">
                            <li>• Maintain minimum 15% margin</li>
                            <li>• Wholesale: 10-20% below retail</li>
                            <li>• Distributor: 20-30% below retail</li>
                            <li>• Check competitor prices regularly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePricing}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Save Pricing
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};