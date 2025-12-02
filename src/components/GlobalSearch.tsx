import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, X, Package, Users, Receipt, FileText, 
  TrendingUp, ArrowRight, Clock, Tag, Barcode
} from 'lucide-react';
import { getFromStorage } from '../utils/mockData';

interface SearchResult {
  id: string;
  type: 'product' | 'party' | 'bill' | 'order';
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  data: any;
}

interface GlobalSearchProps {
  workspaceId: string;
  onSelect: (result: SearchResult) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  workspaceId, 
  onSelect, 
  isOpen, 
  onClose 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Load recent searches from localStorage
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query, workspaceId]);

  const performSearch = useCallback((searchQuery: string) => {
    setIsSearching(true);
    const lowerQuery = searchQuery.toLowerCase();
    const foundResults: SearchResult[] = [];

    // Search Products
    const products = getFromStorage('products', []).filter(
      (p: any) => p.workspaceId === workspaceId
    );
    products.forEach((product: any) => {
      if (
        product.name?.toLowerCase().includes(lowerQuery) ||
        product.sku?.toLowerCase().includes(lowerQuery) ||
        product.barcode?.toLowerCase().includes(lowerQuery) ||
        product.partNumber?.toLowerCase().includes(lowerQuery)
      ) {
        foundResults.push({
          id: product.id,
          type: 'product',
          title: product.name,
          subtitle: `SKU: ${product.sku} | Stock: ${product.currentStock || 0} | NPR ${product.sellingPrice?.toLocaleString() || 0}`,
          icon: Package,
          color: 'text-blue-600',
          data: product
        });
      }
    });

    // Search Parties
    const parties = getFromStorage('parties', []).filter(
      (p: any) => p.workspaceId === workspaceId
    );
    parties.forEach((party: any) => {
      if (
        party.name?.toLowerCase().includes(lowerQuery) ||
        party.phone?.includes(searchQuery) ||
        party.email?.toLowerCase().includes(lowerQuery)
      ) {
        foundResults.push({
          id: party.id,
          type: 'party',
          title: party.name,
          subtitle: `${party.type} | ${party.phone} | Balance: NPR ${party.balance?.toLocaleString() || 0}`,
          icon: Users,
          color: 'text-green-600',
          data: party
        });
      }
    });

    // Search Bills
    const bills = getFromStorage('bills', []).filter(
      (b: any) => b.workspaceId === workspaceId
    );
    bills.forEach((bill: any) => {
      if (
        bill.billNumber?.toLowerCase().includes(lowerQuery) ||
        bill.customerName?.toLowerCase().includes(lowerQuery) ||
        bill.customerPhone?.includes(searchQuery)
      ) {
        foundResults.push({
          id: bill.id,
          type: 'bill',
          title: `Bill ${bill.billNumber}`,
          subtitle: `${bill.customerName} | ${bill.paymentMethod} | NPR ${bill.total?.toLocaleString() || 0}`,
          icon: Receipt,
          color: 'text-purple-600',
          data: bill
        });
      }
    });

    // Search Orders
    const orders = getFromStorage('orders', []).filter(
      (o: any) => o.workspaceId === workspaceId
    );
    orders.forEach((order: any) => {
      if (
        order.orderNumber?.toLowerCase().includes(lowerQuery) ||
        order.supplierName?.toLowerCase().includes(lowerQuery)
      ) {
        foundResults.push({
          id: order.id,
          type: 'order',
          title: `Order ${order.orderNumber}`,
          subtitle: `${order.supplierName} | ${order.status} | NPR ${order.total?.toLocaleString() || 0}`,
          icon: FileText,
          color: 'text-orange-600',
          data: order
        });
      }
    });

    setResults(foundResults.slice(0, 20)); // Limit to 20 results
    setIsSearching(false);
  }, [workspaceId]);

  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    const recent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(recent);
    localStorage.setItem('recentSearches', JSON.stringify(recent));

    onSelect(result);
    setQuery('');
    onClose();
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[600px] flex flex-col animate-in fade-in slide-in-from-top-10 duration-200">
        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, parties, bills, orders..."
              className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              autoFocus
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {query.length < 2 && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-600">Recent Searches</h3>
              </div>
              <div className="space-y-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentSearch(search)}
                    className="flex items-center space-x-3 w-full px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.length >= 2 && (
            <>
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-4">
                    Found {results.length} result{results.length !== 1 ? 's' : ''}
                  </p>
                  {results.map((result) => {
                    const Icon = result.icon;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelect(result)}
                        className="flex items-center space-x-4 w-full px-4 py-3 rounded-xl hover:bg-gray-50 border-2 border-transparent hover:border-indigo-200 transition-all group"
                      >
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${result.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {result.title}
                          </p>
                          <p className="text-sm text-gray-500">{result.subtitle}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 font-medium">No results found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Try searching for products, parties, bills, or orders
                  </p>
                </div>
              )}
            </>
          )}

          {query.length < 2 && recentSearches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium">Start typing to search</p>
              <p className="text-sm text-gray-400 mt-2">
                Search across products, parties, bills, and orders
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
