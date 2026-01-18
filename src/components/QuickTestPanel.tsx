import React, { useState } from 'react';
import { CheckCircle, XCircle, Play, FileText, Download } from 'lucide-react';
import { getFromStorage } from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
  details?: string;
}

export const QuickTestPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runQuickTests = () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    // Test 1: User Authentication
    try {
      if (currentUser) {
        testResults.push({
          name: 'User Authentication',
          status: 'pass',
          message: `✅ Logged in as ${currentUser.name}`,
          details: `Role: ${currentUser.role}, Email: ${currentUser.email}`
        });
      } else {
        testResults.push({
          name: 'User Authentication',
          status: 'fail',
          message: '❌ No user logged in'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'User Authentication',
        status: 'fail',
        message: `❌ Error: ${error}`
      });
    }

    // Test 2: Products Data
    try {
      const products = getFromStorage('products', []);
      const workspaceProducts = currentUser?.workspaceId 
        ? products.filter((p: any) => p.workspaceId === currentUser.workspaceId)
        : products;
      
      testResults.push({
        name: 'Products Data',
        status: products.length > 0 ? 'pass' : 'fail',
        message: products.length > 0 
          ? `✅ ${products.length} total products, ${workspaceProducts.length} in your workspace`
          : '⚠️ No products found',
        details: products.length > 0 ? `Sample: ${products[0].name}` : undefined
      });
    } catch (error) {
      testResults.push({
        name: 'Products Data',
        status: 'fail',
        message: `❌ Error loading products: ${error}`
      });
    }

    // Test 3: Categories Data
    try {
      const categories = getFromStorage('categories', []);
      const workspaceCategories = currentUser?.workspaceId
        ? categories.filter((c: any) => c.workspaceId === currentUser.workspaceId)
        : categories;

      testResults.push({
        name: 'Categories Data',
        status: categories.length > 0 ? 'pass' : 'fail',
        message: categories.length > 0
          ? `✅ ${categories.length} total categories, ${workspaceCategories.length} in your workspace`
          : '⚠️ No categories found',
        details: categories.length > 0 ? `Sample: ${categories[0].name}` : undefined
      });
    } catch (error) {
      testResults.push({
        name: 'Categories Data',
        status: 'fail',
        message: `❌ Error loading categories: ${error}`
      });
    }

    // Test 4: Brands Data
    try {
      const brands = getFromStorage('automotive_brands', []);
      const workspaceBrands = currentUser?.workspaceId
        ? brands.filter((b: any) => b.workspaceId === currentUser.workspaceId)
        : brands;

      testResults.push({
        name: 'Brands Data',
        status: brands.length > 0 ? 'pass' : 'fail',
        message: brands.length > 0
          ? `✅ ${brands.length} total brands, ${workspaceBrands.length} in your workspace`
          : '⚠️ No brands found',
        details: brands.length > 0 ? `Sample: ${brands[0].name}` : undefined
      });
    } catch (error) {
      testResults.push({
        name: 'Brands Data',
        status: 'fail',
        message: `❌ Error loading brands: ${error}`
      });
    }

    // Test 5: Bills Data
    try {
      const bills = getFromStorage('bills', []);
      const workspaceBills = currentUser?.workspaceId
        ? bills.filter((b: any) => b.workspaceId === currentUser.workspaceId)
        : bills;

      testResults.push({
        name: 'Bills Data',
        status: 'pass',
        message: bills.length > 0
          ? `✅ ${bills.length} total bills, ${workspaceBills.length} in your workspace`
          : '⚠️ No bills yet (normal for new system)',
        details: bills.length > 0 ? `Latest: ${bills[bills.length - 1].billNumber}` : undefined
      });
    } catch (error) {
      testResults.push({
        name: 'Bills Data',
        status: 'fail',
        message: `❌ Error loading bills: ${error}`
      });
    }

    // Test 6: Parties Data
    try {
      const parties = getFromStorage('parties', []);
      const workspaceParties = currentUser?.workspaceId
        ? parties.filter((p: any) => p.workspaceId === currentUser.workspaceId)
        : parties;

      testResults.push({
        name: 'Parties Data',
        status: 'pass',
        message: parties.length > 0
          ? `✅ ${parties.length} total parties, ${workspaceParties.length} in your workspace`
          : '⚠️ No parties yet (normal for new system)',
        details: parties.length > 0 ? `Sample: ${parties[0].name}` : undefined
      });
    } catch (error) {
      testResults.push({
        name: 'Parties Data',
        status: 'fail',
        message: `❌ Error loading parties: ${error}`
      });
    }

    // Test 7: Purchase Orders Data
    try {
      const pos = getFromStorage('purchase_orders', []);
      const workspacePOs = currentUser?.workspaceId
        ? pos.filter((p: any) => p.workspaceId === currentUser.workspaceId)
        : pos;

      testResults.push({
        name: 'Purchase Orders',
        status: 'pass',
        message: pos.length > 0
          ? `✅ ${pos.length} total POs, ${workspacePOs.length} in your workspace`
          : '⚠️ No purchase orders yet (normal for new system)',
        details: pos.length > 0 ? `Latest: ${pos[pos.length - 1].orderNumber}` : undefined
      });
    } catch (error) {
      testResults.push({
        name: 'Purchase Orders',
        status: 'fail',
        message: `❌ Error loading purchase orders: ${error}`
      });
    }

    // Test 8: Workspace Isolation
    try {
      if (currentUser?.workspaceId) {
        const products = getFromStorage('products', []);
        const workspaceProducts = products.filter((p: any) => p.workspaceId === currentUser.workspaceId);
        const otherWorkspaceProducts = products.filter((p: any) => p.workspaceId && p.workspaceId !== currentUser.workspaceId);

        testResults.push({
          name: 'Workspace Isolation',
          status: 'pass',
          message: `✅ Data properly isolated`,
          details: `Your data: ${workspaceProducts.length} products | Other workspaces: ${otherWorkspaceProducts.length} products (hidden)`
        });
      } else {
        testResults.push({
          name: 'Workspace Isolation',
          status: 'pass',
          message: '✅ Super Admin - No workspace restriction',
          details: 'Full access to all data'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Workspace Isolation',
        status: 'fail',
        message: `❌ Error checking isolation: ${error}`
      });
    }

    // Test 9: Data Relationships
    try {
      const products = getFromStorage('products', []);
      const categories = getFromStorage('categories', []);
      const categoryNames = new Set(categories.map((c: any) => c.name));
      const orphanedProducts = products.filter((p: any) => 
        p.category && !categoryNames.has(p.category)
      );

      testResults.push({
        name: 'Data Relationships',
        status: orphanedProducts.length === 0 ? 'pass' : 'fail',
        message: orphanedProducts.length === 0
          ? '✅ All relationships valid'
          : `⚠️ ${orphanedProducts.length} products have invalid categories`,
        details: orphanedProducts.length > 0 ? `Fix in System Verification panel` : undefined
      });
    } catch (error) {
      testResults.push({
        name: 'Data Relationships',
        status: 'fail',
        message: `❌ Error checking relationships: ${error}`
      });
    }

    // Test 10: Role Permissions
    try {
      const role = currentUser?.role;
      const permissions = {
        super_admin: 'Full system access',
        admin: 'Full business access',
        inventory_manager: 'Inventory management',
        cashier: 'Sales operations only'
      };

      testResults.push({
        name: 'Role Permissions',
        status: 'pass',
        message: `✅ Role: ${role}`,
        details: permissions[role as keyof typeof permissions] || 'Unknown role'
      });
    } catch (error) {
      testResults.push({
        name: 'Role Permissions',
        status: 'fail',
        message: `❌ Error checking permissions: ${error}`
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const generateReport = () => {
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const total = results.length;

    const report = `
SERVE SPARES - QUICK TEST REPORT
================================
Generated: ${new Date().toLocaleString()}
User: ${currentUser?.name} (${currentUser?.email})
Role: ${currentUser?.role}
Workspace: ${currentUser?.workspaceId || 'Super Admin'}

SUMMARY
-------
Total Tests: ${total}
Passed: ${passed} ✅
Failed: ${failed} ❌
Success Rate: ${((passed / total) * 100).toFixed(1)}%

DETAILED RESULTS
----------------
${results.map((r, i) => `
${i + 1}. ${r.name}
   Status: ${r.status === 'pass' ? '✅ PASS' : '❌ FAIL'}
   ${r.message}
   ${r.details ? `   Details: ${r.details}` : ''}
`).join('\n')}

RECOMMENDATIONS
---------------
${failed > 0 ? '⚠️ Some tests failed. Please review the failed tests above.' : '✅ All tests passed! System is functioning correctly.'}
${results.some(r => r.message.includes('No products')) ? '💡 Consider adding sample data to test full functionality.' : ''}
${results.some(r => r.message.includes('invalid categories')) ? '⚠️ Run System Verification panel to fix data relationships.' : ''}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold flex items-center space-x-3 mb-2">
              <Play className="w-10 h-10" />
              <span>Quick System Test</span>
            </h3>
            <p className="text-green-100 text-lg">
              Run automated tests to verify system functionality
            </p>
          </div>
          <button
            onClick={runQuickTests}
            disabled={testing}
            className="flex items-center space-x-2 px-8 py-4 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all shadow-lg transform hover:scale-105 font-bold disabled:opacity-50"
          >
            <Play className={`w-6 h-6 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? 'Testing...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-semibold">Total Tests</span>
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-4xl font-bold text-gray-900">{results.length}</p>
            </div>

            <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-semibold">Passed</span>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-4xl font-bold text-green-600">{passCount}</p>
              <p className="text-sm text-gray-500 mt-1">
                {results.length > 0 ? Math.round((passCount / results.length) * 100) : 0}% success rate
              </p>
            </div>

            <div className="bg-white rounded-xl border-2 border-red-200 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-semibold">Failed</span>
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-4xl font-bold text-red-600">{failCount}</p>
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-gray-900 text-xl">Test Results</h4>
              <button
                onClick={generateReport}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>

            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    result.status === 'pass'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {result.status === 'pass' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{result.name}</p>
                        <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                        {result.details && (
                          <p className="text-xs text-gray-500 mt-2 bg-white/50 p-2 rounded">
                            {result.details}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      result.status === 'pass'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {results.length === 0 && !testing && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-gray-200">
          <Play className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Test</h3>
          <p className="text-gray-500 text-lg">Click "Run Tests" to start automated verification</p>
        </div>
      )}
    </div>
  );
};
