import React, { useState, useEffect } from 'react';
import { 
  Activity, Database, Zap, Clock, AlertTriangle, 
  CheckCircle, TrendingUp, Server, Cpu, HardDrive
} from 'lucide-react';

interface HealthMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: any;
  color: string;
}

interface SystemHealthWidgetProps {
  workspaceId: string;
}

export const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({ workspaceId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [overallHealth, setOverallHealth] = useState<'good' | 'warning' | 'critical'>('good');

  useEffect(() => {
    calculateMetrics();
    const interval = setInterval(calculateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [workspaceId]);

  const calculateMetrics = () => {
    // Calculate storage usage
    const storageUsed = new Blob(Object.values(localStorage)).size;
    const storageLimit = 10 * 1024 * 1024; // 10MB typical limit
    const storagePercent = (storageUsed / storageLimit) * 100;

    // Count records
    const productsCount = JSON.parse(localStorage.getItem('products') || '[]').length;
    const billsCount = JSON.parse(localStorage.getItem('bills') || '[]').length;
    const partiesCount = JSON.parse(localStorage.getItem('parties') || '[]').length;
    const totalRecords = productsCount + billsCount + partiesCount;

    // Calculate data freshness (time since last update)
    const lastUpdate = localStorage.getItem('lastDataUpdate');
    const minutesSinceUpdate = lastUpdate 
      ? Math.floor((Date.now() - parseInt(lastUpdate)) / 60000)
      : 0;

    // Performance score (simulated based on record count)
    const performanceScore = Math.max(0, 100 - (totalRecords / 100));

    const newMetrics: HealthMetric[] = [
      {
        id: 'storage',
        label: 'Storage Used',
        value: storagePercent,
        unit: '%',
        status: storagePercent > 80 ? 'critical' : storagePercent > 60 ? 'warning' : 'good',
        icon: HardDrive,
        color: storagePercent > 80 ? 'text-red-600' : storagePercent > 60 ? 'text-yellow-600' : 'text-green-600'
      },
      {
        id: 'records',
        label: 'Total Records',
        value: totalRecords,
        unit: '',
        status: totalRecords > 5000 ? 'warning' : 'good',
        icon: Database,
        color: totalRecords > 5000 ? 'text-yellow-600' : 'text-green-600'
      },
      {
        id: 'performance',
        label: 'Performance',
        value: performanceScore,
        unit: '%',
        status: performanceScore < 50 ? 'warning' : performanceScore < 30 ? 'critical' : 'good',
        icon: Zap,
        color: performanceScore < 50 ? 'text-yellow-600' : performanceScore < 30 ? 'text-red-600' : 'text-green-600'
      },
      {
        id: 'freshness',
        label: 'Data Sync',
        value: minutesSinceUpdate,
        unit: 'min ago',
        status: minutesSinceUpdate > 10 ? 'warning' : 'good',
        icon: Clock,
        color: minutesSinceUpdate > 10 ? 'text-yellow-600' : 'text-green-600'
      }
    ];

    setMetrics(newMetrics);

    // Calculate overall health
    const criticalCount = newMetrics.filter(m => m.status === 'critical').length;
    const warningCount = newMetrics.filter(m => m.status === 'warning').length;
    
    if (criticalCount > 0) {
      setOverallHealth('critical');
    } else if (warningCount > 1) {
      setOverallHealth('warning');
    } else {
      setOverallHealth('good');
    }
  };

  const getHealthColor = () => {
    switch (overallHealth) {
      case 'good':
        return 'from-green-500 to-emerald-600';
      case 'warning':
        return 'from-yellow-500 to-orange-600';
      case 'critical':
        return 'from-red-500 to-rose-600';
    }
  };

  const getHealthIcon = () => {
    switch (overallHealth) {
      case 'good':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return AlertTriangle;
    }
  };

  const HealthIcon = getHealthIcon();

  return (
    <div className="fixed top-4 right-20 z-40">
      {!isExpanded ? (
        // Compact View
        <button
          onClick={() => setIsExpanded(true)}
          className={`bg-gradient-to-br ${getHealthColor()} text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 group`}
        >
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="font-medium text-sm">System Health</span>
          <HealthIcon className="w-4 h-4" />
        </button>
      ) : (
        // Expanded View
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 w-80 animate-in fade-in slide-in-from-top-5 duration-200">
          {/* Header */}
          <div className={`bg-gradient-to-br ${getHealthColor()} text-white px-6 py-4 rounded-t-2xl`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold">System Health</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <HealthIcon className="w-6 h-6" />
              <span className="text-sm font-medium">
                {overallHealth === 'good' && 'All Systems Operational'}
                {overallHealth === 'warning' && 'Minor Issues Detected'}
                {overallHealth === 'critical' && 'Attention Required'}
              </span>
            </div>
          </div>

          {/* Metrics */}
          <div className="p-6 space-y-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${metric.color}`} />
                      <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${metric.color}`}>
                      {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}{metric.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        metric.status === 'critical' 
                          ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                          : metric.status === 'warning'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600'
                      }`}
                      style={{ 
                        width: metric.unit === '%' 
                          ? `${metric.value}%` 
                          : metric.id === 'records'
                          ? `${Math.min(100, (metric.value / 1000) * 10)}%`
                          : `${metric.value}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Server className="w-3 h-3" />
                <span>Local Storage</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Updates every 5s</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
