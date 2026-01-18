import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Database,
  Activity,
  Shield,
} from "lucide-react";
import { getFromStorage } from "../utils/mockData";
import {
  STORAGE_KEYS,
  getDataStatistics,
  exportAllData,
  cleanupOldData,
  autoFixAllData,
} from "../utils/dataInitializer";
import { useAuth } from "../contexts/AuthContext";
import { PopupContainer } from "./PopupContainer";
import { useCustomPopup } from "../hooks/useCustomPopup";

interface VerificationResult {
  key: string;
  status: "success" | "warning" | "error";
  message: string;
  count?: number;
}

export const SystemVerificationPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    runVerification();
  }, []);

  const runVerification = () => {
    setVerifying(true);
    const verificationResults: VerificationResult[] = [];

    // Check all critical storage keys
    const criticalKeys = [
      { key: STORAGE_KEYS.USERS, name: "Users", required: true },
      { key: STORAGE_KEYS.PRODUCTS, name: "Products", required: false },
      { key: STORAGE_KEYS.CATEGORIES, name: "Categories", required: false },
      { key: STORAGE_KEYS.AUTOMOTIVE_BRANDS, name: "Brands", required: false },
      {
        key: STORAGE_KEYS.AUTOMOTIVE_VEHICLES,
        name: "Vehicles",
        required: false,
      },
      { key: STORAGE_KEYS.PARTIES, name: "Parties", required: false },
      { key: STORAGE_KEYS.BILLS, name: "Bills", required: false },
      {
        key: STORAGE_KEYS.PURCHASE_ORDERS,
        name: "Purchase Orders",
        required: false,
      },
      { key: STORAGE_KEYS.SHIFTS, name: "Shifts", required: false },
      {
        key: STORAGE_KEYS.BANK_ACCOUNTS,
        name: "Bank Accounts",
        required: false,
      },
    ];

    criticalKeys.forEach(({ key, name, required }) => {
      const data = getFromStorage(key, null);

      if (data === null) {
        verificationResults.push({
          key: name,
          status: required ? "error" : "warning",
          message: `${name} not initialized`,
          count: 0,
        });
      } else if (Array.isArray(data)) {
        verificationResults.push({
          key: name,
          status: "success",
          message: `${name} initialized`,
          count: data.length,
        });
      } else {
        verificationResults.push({
          key: name,
          status: "success",
          message: `${name} initialized (object)`,
          count: 1,
        });
      }
    });

    // Check data relationships
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS, []);
    const categories = getFromStorage(STORAGE_KEYS.CATEGORIES, []);
    const bills = getFromStorage(STORAGE_KEYS.BILLS, []);

    // Verify product categories
    const productCategories = new Set(
      products.map((p: any) => p.category).filter(Boolean)
    );
    const categoryNames = new Set(categories.map((c: any) => c.name));
    const orphanedCategories = Array.from(productCategories).filter(
      (cat) => !categoryNames.has(cat)
    );

    if (orphanedCategories.length > 0) {
      verificationResults.push({
        key: "Product Categories",
        status: "warning",
        message: `${orphanedCategories.length} products have non-existent categories`,
        count: orphanedCategories.length,
      });
    } else if (products.length > 0) {
      verificationResults.push({
        key: "Product Categories",
        status: "success",
        message: "All product categories valid",
        count: 0,
      });
    }

    // Verify bills data integrity
    const billsWithInvalidDates = bills.filter((bill: any) => {
      if (!bill.createdAt) return true;
      const date = new Date(bill.createdAt);
      return isNaN(date.getTime());
    });

    if (billsWithInvalidDates.length > 0) {
      verificationResults.push({
        key: "Bills Integrity",
        status: "warning",
        message: `${billsWithInvalidDates.length} bills have invalid dates`,
        count: billsWithInvalidDates.length,
      });
    } else if (bills.length > 0) {
      verificationResults.push({
        key: "Bills Integrity",
        status: "success",
        message: "All bills have valid data",
        count: 0,
      });
    }

    // Check workspace data isolation
    if (currentUser?.workspaceId) {
      const workspaceProducts = products.filter(
        (p: any) => p.workspaceId === currentUser.workspaceId
      );
      const workspaceBills = bills.filter(
        (b: any) => b.workspaceId === currentUser.workspaceId
      );

      verificationResults.push({
        key: "Workspace Isolation",
        status: "success",
        message: `Your workspace has ${workspaceProducts.length} products and ${workspaceBills.length} bills`,
        count: workspaceProducts.length + workspaceBills.length,
      });
    }

    setResults(verificationResults);
    setStats(getDataStatistics());
    setVerifying(false);
  };

  const handleCleanup = () => {
    popup.showConfirm(
      "Auto-Fix Data Issues",
      "This will automatically fix data integrity issues including bills with missing products, invalid categories, and corrupted dates. Do you want to continue?",
      () => {
        const result = autoFixAllData();
        runVerification();

        if (result.fixed > 0) {
          const issuesList = result.issues.join("\n");
          popup.showSuccess(
            `Fixed ${result.fixed} issue(s)`,
            `✅ Auto-Fix Complete!\n\n${issuesList}`,
            "success"
          );
        } else {
          popup.showSuccess(
            "All Clean!",
            "No issues found! Your data is clean.",
            "success"
          );
        }
      }
    );
  };

  const handleExport = () => {
    exportAllData();
    popup.showSuccess(
      "Export Complete",
      "Data exported successfully! Check your downloads folder.",
      "success"
    );
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const warningCount = results.filter((r) => r.status === "warning").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold flex items-center space-x-3 mb-2">
              <Activity className="w-10 h-10" />
              <span>System Verification</span>
            </h3>
            <p className="text-blue-100 text-lg">Check data integrity</p>
          </div>
          <button
            onClick={runVerification}
            disabled={verifying}
            className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg font-bold"
          >
            <RefreshCw
              className={`w-5 h-5 ${verifying ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-semibold">Success</span>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-4xl font-bold text-green-600">{successCount}</p>
          <p className="text-sm text-gray-500 mt-1">All systems operational</p>
        </div>

        <div className="bg-white rounded-xl border-2 border-yellow-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-semibold">Warnings</span>
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-4xl font-bold text-yellow-600">{warningCount}</p>
          <p className="text-sm text-gray-500 mt-1">Minor issues detected</p>
        </div>

        <div className="bg-white rounded-xl border-2 border-red-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-semibold">Errors</span>
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-4xl font-bold text-red-600">{errorCount}</p>
          <p className="text-sm text-gray-500 mt-1">Critical issues found</p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
          <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center space-x-2">
            <Database className="w-6 h-6 text-blue-600" />
            <span>Data Statistics</span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-3xl font-bold text-blue-600">
                {stats.products}
              </p>
              <p className="text-sm text-gray-600 mt-1">Products</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-3xl font-bold text-purple-600">
                {stats.categories}
              </p>
              <p className="text-sm text-gray-600 mt-1">Categories</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-3xl font-bold text-green-600">
                {stats.brands}
              </p>
              <p className="text-sm text-gray-600 mt-1">Brands</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-3xl font-bold text-orange-600">
                {stats.vehicles}
              </p>
              <p className="text-sm text-gray-600 mt-1">Vehicles</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-3xl font-bold text-red-600">{stats.parties}</p>
              <p className="text-sm text-gray-600 mt-1">Parties</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-3xl font-bold text-indigo-600">
                {stats.bills}
              </p>
              <p className="text-sm text-gray-600 mt-1">Bills</p>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-200">
              <p className="text-3xl font-bold text-pink-600">
                {stats.purchaseOrders}
              </p>
              <p className="text-sm text-gray-600 mt-1">Purchase Orders</p>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg border border-teal-200">
              <p className="text-3xl font-bold text-teal-600">{stats.users}</p>
              <p className="text-sm text-gray-600 mt-1">Users</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <p className="text-3xl font-bold text-cyan-600">
                {stats.workspaces}
              </p>
              <p className="text-sm text-gray-600 mt-1">Workspaces</p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Results */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
        <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <span>Verification Results</span>
        </h4>
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                result.status === "success"
                  ? "bg-green-50 border-green-200"
                  : result.status === "warning"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                {result.status === "success" && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {result.status === "warning" && (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                {result.status === "error" && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="font-bold text-gray-900">{result.key}</p>
                  <p className="text-sm text-gray-600">{result.message}</p>
                </div>
              </div>
              {result.count !== undefined && result.count > 0 && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    result.status === "success"
                      ? "bg-green-200 text-green-800"
                      : result.status === "warning"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {result.count} records
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {warningCount > 0 || errorCount > 0 ? (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-300 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-bold text-orange-900 text-xl mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6" />
                <span>Data Integrity Issues Detected</span>
              </h4>
              <p className="text-orange-700 mb-4">
                {warningCount} warning(s) and {errorCount} error(s) found. Click
                the button below to automatically fix all issues.
              </p>
              <button
                onClick={handleCleanup}
                className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg font-bold text-lg transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Auto-Fix All Issues Now</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-bold text-green-900 text-xl">
                  All Systems Healthy!
                </h4>
                <p className="text-green-700">
                  No data integrity issues detected.
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-bold"
            >
              <Download className="w-5 h-5" />
              <span>Backup Data</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleCleanup}
          className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-bold text-lg"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Run Auto-Fix</span>
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-bold text-lg"
        >
          <Download className="w-5 h-5" />
          <span>Export All Data (Backup)</span>
        </button>
      </div>

      {/* Popup Container */}
      <PopupContainer
        showSuccessPopup={popup.showSuccessPopup}
        successTitle={popup.successTitle}
        successMessage={popup.successMessage}
        onSuccessClose={popup.hideSuccess}
        showErrorPopup={popup.showErrorPopup}
        errorTitle={popup.errorTitle}
        errorMessage={popup.errorMessage}
        errorType={popup.errorType}
        onErrorClose={popup.hideError}
        showConfirmDialog={popup.showConfirmDialog}
        confirmConfig={popup.confirmConfig}
        onConfirmCancel={popup.hideConfirm}
      />
    </div>
  );
};
