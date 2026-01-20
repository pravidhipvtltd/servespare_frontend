import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  AlertCircle,
  Printer,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Eye,
  RefreshCw,
  Wallet,
  Building2,
  CreditCard,
  Tag,
  Activity,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { getFromStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";
import {
  Bill,
  InventoryItem,
  Expense,
  BankAccount,
  CashTransaction,
} from "../../types";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";

type ReportType =
  | "comprehensive"
  | "profit_loss"
  | "cash_flow"
  | "pricing_analysis"
  | "stock_valuation"
  | "tax_report"
  | "sales_summary";

interface ReportData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
  taxableIncome: number;
  vatCollected: number;
  profitMargin: number;
  totalBankBalance: number;
  totalCashInHand: number;
  totalAssets: number;
  stockValue: number;
  cashIn: number;
  cashOut: number;
}

export const FinancialReportsPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [reportType, setReportType] = useState<ReportType>("comprehensive");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [reportData, setReportData] = useState<ReportData>({
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    expenses: 0,
    netProfit: 0,
    taxableIncome: 0,
    vatCollected: 0,
    profitMargin: 0,
    totalBankBalance: 0,
    totalCashInHand: 0,
    totalAssets: 0,
    stockValue: 0,
    cashIn: 0,
    cashOut: 0,
  });
  const [bills, setBills] = useState<Bill[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(
    []
  );
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = () => {
    toast.error("apiii", {
      description: "Backend data integration required for comprehensive financial reporting",
      duration: 10000,
    });
    // Load bills
    const allBills = getFromStorage("bills", []).filter((b: Bill) => {
      if (!b.createdAt) return false;
      const date = new Date(b.createdAt);
      if (isNaN(date.getTime())) return false;
      const billDate = date.toISOString().split("T")[0];
      return (
        b.workspaceId === currentUser?.workspaceId &&
        b.paymentStatus === "paid" &&
        billDate >= dateRange.start &&
        billDate <= dateRange.end
      );
    });
    setBills(allBills);

    // Load inventory
    const allInventory = getFromStorage("inventory", []).filter(
      (i: InventoryItem) => i.workspaceId === currentUser?.workspaceId
    );
    setInventory(allInventory);

    // Load expenses
    const allExpenses = getFromStorage("expenses", []).filter((e: any) => {
      const expenseDate = new Date(e.date).toISOString().split("T")[0];
      return (
        e.workspaceId === currentUser?.workspaceId &&
        expenseDate >= dateRange.start &&
        expenseDate <= dateRange.end
      );
    });
    setExpenses(allExpenses);

    // Load bank accounts
    const allBankAccounts = getFromStorage("bankAccounts", []).filter(
      (a: BankAccount) => a.workspaceId === currentUser?.workspaceId
    );
    setBankAccounts(allBankAccounts);

    // Load cash transactions
    const allCashTransactions = getFromStorage("cashTransactions", []).filter(
      (t: CashTransaction) => t.workspaceId === currentUser?.workspaceId
    );
    setCashTransactions(allCashTransactions);

    // Load purchase orders
    const allPurchaseOrders = getFromStorage("purchaseOrders", []).filter(
      (po: any) => {
        if (!po.createdAt) return false;
        const date = new Date(po.createdAt);
        if (isNaN(date.getTime())) return false;
        const poDate = date.toISOString().split("T")[0];
        return (
          po.workspaceId === currentUser?.workspaceId &&
          poDate >= dateRange.start &&
          poDate <= dateRange.end
        );
      }
    );
    setPurchaseOrders(allPurchaseOrders);

    // Calculate comprehensive report data
    calculateReportData(
      allBills,
      allExpenses,
      allBankAccounts,
      allCashTransactions,
      allInventory,
      allPurchaseOrders
    );
  };

  const calculateReportData = (
    billsData: Bill[],
    expensesData: any[],
    bankData: BankAccount[],
    cashData: CashTransaction[],
    inventoryData: InventoryItem[],
    purchaseData: any[]
  ) => {
    const revenue = billsData.reduce((sum, bill) => sum + bill.total, 0);
    const cogs = billsData.reduce((sum, bill) => sum + bill.subtotal * 0.6, 0);
    const grossProfit = revenue - cogs;
    const totalExpenses = expensesData.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );
    const netProfit = grossProfit - totalExpenses;
    const vatCollected = billsData.reduce((sum, bill) => sum + bill.tax, 0);
    const taxableIncome = netProfit;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    const totalBankBalance = bankData.reduce(
      (sum, acc) => sum + acc.balance,
      0
    );
    const cashIn = cashData
      .filter((t) => t.type === "in")
      .reduce((sum, t) => sum + t.amount, 0);
    const cashOut = cashData
      .filter((t) => t.type === "out")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCashInHand = cashIn - cashOut;
    const stockValue = inventoryData.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const totalAssets = totalBankBalance + totalCashInHand + stockValue;

    setReportData({
      revenue,
      cogs,
      grossProfit,
      expenses: totalExpenses,
      netProfit,
      taxableIncome,
      vatCollected,
      profitMargin,
      totalBankBalance,
      totalCashInHand,
      totalAssets,
      stockValue,
      cashIn,
      cashOut,
    });
  };

  const getStockValuation = () => {
    return inventory.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const downloadPDF = () => {
    popup.showError(
      "PDF download feature would be implemented with a library like jsPDF. This is a demo feature.",
      "Feature Not Available"
    );
  };

  const downloadExcel = () => {
    popup.showError(
      "Excel download feature would be implemented with a library like xlsx. This is a demo feature.",
      "Feature Not Available"
    );
  };

  const printReport = () => {
    window.print();
  };

  // Calculate pricing analysis
  const getPricingAnalysis = () => {
    const categoryData: any = {};

    inventory.forEach((item) => {
      if (!categoryData[item.category]) {
        categoryData[item.category] = {
          category: item.category,
          totalItems: 0,
          totalValue: 0,
          avgPrice: 0,
          minPrice: item.price,
          maxPrice: item.price,
          totalQuantity: 0,
        };
      }

      categoryData[item.category].totalItems++;
      categoryData[item.category].totalValue += item.quantity * item.price;
      categoryData[item.category].totalQuantity += item.quantity;
      categoryData[item.category].minPrice = Math.min(
        categoryData[item.category].minPrice,
        item.price
      );
      categoryData[item.category].maxPrice = Math.max(
        categoryData[item.category].maxPrice,
        item.price
      );
    });

    Object.keys(categoryData).forEach((cat) => {
      categoryData[cat].avgPrice =
        categoryData[cat].totalValue / categoryData[cat].totalQuantity;
    });

    return Object.values(categoryData);
  };

  // Calculate cash flow
  const getCashFlowData = () => {
    const cashFlowIn = [
      { source: "Sales Revenue", amount: reportData.revenue },
      { source: "Cash Receipts", amount: reportData.cashIn },
    ];

    const cashFlowOut = [
      { source: "Operating Expenses", amount: reportData.expenses },
      { source: "Cash Payments", amount: reportData.cashOut },
      { source: "COGS", amount: reportData.cogs },
    ];

    return { cashFlowIn, cashFlowOut };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h3 className="text-gray-900 text-2xl">Financial Reports</h3>
          <p className="text-gray-500 text-sm mt-1">
            Comprehensive financial analysis and reporting
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="flex items-center space-x-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={printReport}
            className="flex items-center space-x-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={downloadExcel}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={downloadPDF}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 shadow-lg shadow-red-500/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="comprehensive">
                Comprehensive Financial Overview
              </option>
              <option value="profit_loss">Profit & Loss Statement</option>
              <option value="cash_flow">Cash Flow Analysis</option>
              <option value="pricing_analysis">
                Pricing & Inventory Analysis
              </option>
              <option value="stock_valuation">Stock Valuation Report</option>
              <option value="tax_report">Tax Report (VAT)</option>
              <option value="sales_summary">Sales Summary</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Comprehensive Financial Overview */}
      {reportType === "comprehensive" && (
        <div className="space-y-6">
          {/* Main Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <ArrowUp className="w-5 h-5" />
              </div>
              <div className="text-white/80 text-sm mb-2">Total Revenue</div>
              <div className="text-white text-3xl">
                Rs{reportData.revenue.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                {reportData.netProfit >= 0 ? (
                  <ArrowUp className="w-5 h-5" />
                ) : (
                  <ArrowDown className="w-5 h-5" />
                )}
              </div>
              <div className="text-white/80 text-sm mb-2">Net Profit</div>
              <div className="text-white text-3xl">
                Rs{reportData.netProfit.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-white/80 text-sm mb-2">Total Assets</div>
              <div className="text-white text-3xl">
                Rs{reportData.totalAssets.toLocaleString()}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6 text-white" />
                </div>
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-white/80 text-sm mb-2">Profit Margin</div>
              <div className="text-white text-3xl">
                {reportData.profitMargin.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Assets Breakdown */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <h4 className="text-gray-900 text-xl mb-6 flex items-center space-x-2">
              <Wallet className="w-6 h-6 text-blue-600" />
              <span>Assets Breakdown</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-blue-700 text-sm">Bank Accounts</div>
                    <div className="text-gray-500 text-xs">
                      {bankAccounts.length} account(s)
                    </div>
                  </div>
                </div>
                <div className="text-blue-900 text-3xl">
                  Rs{reportData.totalBankBalance.toLocaleString()}
                </div>
                <div className="mt-3 text-blue-600 text-sm">
                  {(
                    (reportData.totalBankBalance / reportData.totalAssets) *
                    100
                  ).toFixed(1)}
                  % of total assets
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-green-700 text-sm">Cash In Hand</div>
                    <div className="text-gray-500 text-xs">
                      {cashTransactions.length} transaction(s)
                    </div>
                  </div>
                </div>
                <div className="text-green-900 text-3xl">
                  Rs{reportData.totalCashInHand.toLocaleString()}
                </div>
                <div className="mt-3 text-green-600 text-sm">
                  {(
                    (reportData.totalCashInHand / reportData.totalAssets) *
                    100
                  ).toFixed(1)}
                  % of total assets
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-purple-700 text-sm">Stock Value</div>
                    <div className="text-gray-500 text-xs">
                      {inventory.length} item(s)
                    </div>
                  </div>
                </div>
                <div className="text-purple-900 text-3xl">
                  Rs{reportData.stockValue.toLocaleString()}
                </div>
                <div className="mt-3 text-purple-600 text-sm">
                  {(
                    (reportData.stockValue / reportData.totalAssets) *
                    100
                  ).toFixed(1)}
                  % of total assets
                </div>
              </div>
            </div>
          </div>

          {/* Revenue & Expenses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Sources */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <h4 className="text-gray-900 text-xl mb-6 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span>Revenue Sources</span>
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-900">Sales Revenue</div>
                      <div className="text-gray-500 text-sm">
                        {bills.length} bills
                      </div>
                    </div>
                  </div>
                  <div className="text-green-900 text-xl">
                    Rs{reportData.revenue.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-900">Cash Receipts</div>
                      <div className="text-gray-500 text-sm">
                        Direct payments
                      </div>
                    </div>
                  </div>
                  <div className="text-blue-900 text-xl">
                    Rs{reportData.cashIn.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Expense Categories */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
              <h4 className="text-gray-900 text-xl mb-6 flex items-center space-x-2">
                <TrendingDown className="w-6 h-6 text-red-600" />
                <span>Expense Categories</span>
              </h4>
              <div className="space-y-4">
                {expenses.length > 0 ? (
                  expenses.slice(0, 4).map((exp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-red-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-900 capitalize">
                            {exp.category?.replace("_", " ")}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {new Date(exp.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-red-900 text-xl">
                        Rs{exp.amount?.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No expenses recorded
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Summary Table */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
              <h4 className="text-2xl">Financial Summary</h4>
              <p className="text-slate-300 text-sm mt-1">
                Complete overview of financial position
              </p>
            </div>
            <div className="p-6">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 text-gray-900">Total Revenue</td>
                    <td className="py-4 text-right text-green-600 text-xl">
                      Rs{reportData.revenue.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 text-gray-900">Cost of Goods Sold</td>
                    <td className="py-4 text-right text-orange-600 text-xl">
                      Rs{reportData.cogs.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-green-50">
                    <td className="py-4 text-green-900">Gross Profit</td>
                    <td className="py-4 text-right text-green-900 text-xl">
                      Rs{reportData.grossProfit.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 text-gray-900">Operating Expenses</td>
                    <td className="py-4 text-right text-red-600 text-xl">
                      Rs{reportData.expenses.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 bg-blue-50">
                    <td className="py-4 text-blue-900">Net Profit</td>
                    <td className="py-4 text-right text-blue-900 text-2xl">
                      Rs{reportData.netProfit.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 text-gray-900">Total Assets</td>
                    <td className="py-4 text-right text-purple-600 text-xl">
                      Rs{reportData.totalAssets.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 text-gray-900">Profit Margin</td>
                    <td className="py-4 text-right text-indigo-600 text-xl">
                      {reportData.profitMargin.toFixed(2)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pricing & Inventory Analysis */}
      {reportType === "pricing_analysis" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl mb-2">
                    Pricing & Inventory Analysis
                  </h4>
                  <p className="text-indigo-100 text-sm">
                    Comprehensive pricing breakdown by category
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Tag className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {inventory.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-gray-900 text-xl mb-2">No Inventory</h3>
                <p className="text-gray-500">
                  Add inventory items to see pricing analysis
                </p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                    <div className="text-blue-700 text-sm mb-2">
                      Total Items
                    </div>
                    <div className="text-blue-900 text-4xl">
                      {inventory.length}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="text-green-700 text-sm mb-2">
                      Total Stock Value
                    </div>
                    <div className="text-green-900 text-4xl">
                      Rs{getStockValuation().toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                    <div className="text-purple-700 text-sm mb-2">
                      Avg Item Value
                    </div>
                    <div className="text-purple-900 text-4xl">
                      Rs
                      {Math.round(
                        getStockValuation() / inventory.length
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="text-left text-gray-700 py-4 px-6">
                          Category
                        </th>
                        <th className="text-left text-gray-700 py-4 px-6">
                          Total Items
                        </th>
                        <th className="text-left text-gray-700 py-4 px-6">
                          Total Quantity
                        </th>
                        <th className="text-left text-gray-700 py-4 px-6">
                          Min Price
                        </th>
                        <th className="text-left text-gray-700 py-4 px-6">
                          Max Price
                        </th>
                        <th className="text-left text-gray-700 py-4 px-6">
                          Avg Price
                        </th>
                        <th className="text-left text-gray-700 py-4 px-6">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getPricingAnalysis().map((cat: any, idx: number) => (
                        <tr
                          key={idx}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm capitalize">
                              {cat.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-900">
                            {cat.totalItems}
                          </td>
                          <td className="py-4 px-6 text-gray-700">
                            {cat.totalQuantity}
                          </td>
                          <td className="py-4 px-6 text-gray-700">
                            Rs{cat.minPrice.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-gray-700">
                            Rs{cat.maxPrice.toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-gray-900">
                            Rs{Math.round(cat.avgPrice).toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-gray-900">
                            Rs{Math.round(cat.totalValue).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Individual Item Pricing */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-gray-900 text-xl">Detailed Item Pricing</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Item Name
                    </th>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Category
                    </th>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Quantity
                    </th>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Unit Price
                    </th>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Total Value
                    </th>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Stock Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-gray-900">{item.name}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        Rs{item.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-gray-900">
                        Rs{(item.quantity * item.price).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            item.quantity < item.minStockLevel
                              ? "bg-red-100 text-red-700"
                              : item.quantity < item.minStockLevel * 2
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.quantity < item.minStockLevel
                            ? "Low"
                            : item.quantity < item.minStockLevel * 2
                            ? "Medium"
                            : "Good"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow Analysis */}
      {reportType === "cash_flow" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl mb-2">Cash Flow Analysis</h4>
                  <p className="text-teal-100 text-sm">
                    Period: {new Date(dateRange.start).toLocaleDateString()} -{" "}
                    {new Date(dateRange.end).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <Activity className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cash Inflow */}
                <div className="border-2 border-green-200 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-green-900 text-2xl">Cash Inflow</div>
                  </div>
                  <div className="space-y-4">
                    {getCashFlowData().cashFlowIn.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-white rounded-xl"
                      >
                        <span className="text-gray-700">{item.source}</span>
                        <span className="text-green-900 text-xl">
                          Rs{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-4 bg-green-600 text-white rounded-xl">
                      <span>Total Inflow</span>
                      <span className="text-2xl">
                        Rs
                        {(
                          reportData.revenue + reportData.cashIn
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cash Outflow */}
                <div className="border-2 border-red-200 rounded-2xl p-6 bg-gradient-to-br from-red-50 to-pink-50">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-red-900 text-2xl">Cash Outflow</div>
                  </div>
                  <div className="space-y-4">
                    {getCashFlowData().cashFlowOut.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-white rounded-xl"
                      >
                        <span className="text-gray-700">{item.source}</span>
                        <span className="text-red-900 text-xl">
                          Rs{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-4 bg-red-600 text-white rounded-xl">
                      <span>Total Outflow</span>
                      <span className="text-2xl">
                        Rs
                        {(
                          reportData.expenses +
                          reportData.cashOut +
                          reportData.cogs
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Cash Flow */}
              <div
                className={`mt-6 p-6 rounded-2xl border-2 ${
                  reportData.revenue +
                    reportData.cashIn -
                    (reportData.expenses +
                      reportData.cashOut +
                      reportData.cogs) >=
                  0
                    ? "bg-gradient-to-br from-green-100 to-emerald-100 border-green-300"
                    : "bg-gradient-to-br from-red-100 to-pink-100 border-red-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`text-2xl ${
                      reportData.revenue +
                        reportData.cashIn -
                        (reportData.expenses +
                          reportData.cashOut +
                          reportData.cogs) >=
                      0
                        ? "text-green-900"
                        : "text-red-900"
                    }`}
                  >
                    Net Cash Flow
                  </div>
                  <div
                    className={`text-4xl ${
                      reportData.revenue +
                        reportData.cashIn -
                        (reportData.expenses +
                          reportData.cashOut +
                          reportData.cogs) >=
                      0
                        ? "text-green-900"
                        : "text-red-900"
                    }`}
                  >
                    Rs
                    {(
                      reportData.revenue +
                      reportData.cashIn -
                      (reportData.expenses +
                        reportData.cashOut +
                        reportData.cogs)
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profit & Loss Statement */}
      {reportType === "profit_loss" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl mb-2">Profit & Loss Statement</h4>
                  <p className="text-blue-100 text-sm">
                    Period: {new Date(dateRange.start).toLocaleDateString()} -{" "}
                    {new Date(dateRange.end).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="p-8">
              <table className="w-full">
                <tbody>
                  {/* Revenue Section */}
                  <tr className="border-b-2 border-gray-300">
                    <td className="py-4 text-gray-900 text-xl" colSpan={2}>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span>Revenue</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-8 text-gray-700">Total Sales</td>
                    <td className="py-3 text-right text-gray-900">
                      Rs{reportData.revenue.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-blue-50">
                    <td className="py-4 pl-8 text-blue-900">Total Revenue</td>
                    <td className="py-4 text-right text-blue-900 text-xl">
                      Rs{reportData.revenue.toLocaleString()}
                    </td>
                  </tr>

                  {/* Cost of Goods Sold */}
                  <tr className="border-b-2 border-gray-300">
                    <td className="py-4 text-gray-900 text-xl pt-8" colSpan={2}>
                      <div className="flex items-center space-x-2">
                        <Package className="w-5 h-5 text-orange-600" />
                        <span>Cost of Goods Sold</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-8 text-gray-700">Direct Costs</td>
                    <td className="py-3 text-right text-gray-900">
                      Rs{reportData.cogs.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-orange-50">
                    <td className="py-4 pl-8 text-orange-900">Total COGS</td>
                    <td className="py-4 text-right text-orange-900 text-xl">
                      Rs{reportData.cogs.toLocaleString()}
                    </td>
                  </tr>

                  {/* Gross Profit */}
                  <tr className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300">
                    <td className="py-5 pl-8 text-green-900 text-xl">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5" />
                        <span>Gross Profit</span>
                      </div>
                    </td>
                    <td className="py-5 text-right text-green-900 text-2xl">
                      Rs{reportData.grossProfit.toLocaleString()}
                    </td>
                  </tr>

                  {/* Operating Expenses */}
                  <tr className="border-b-2 border-gray-300">
                    <td className="py-4 text-gray-900 text-xl pt-8" colSpan={2}>
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        <span>Operating Expenses</span>
                      </div>
                    </td>
                  </tr>
                  {expenses.length > 0 ? (
                    expenses.map((exp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 pl-8 text-gray-700 capitalize">
                          {exp.category?.replace("_", " ")}
                        </td>
                        <td className="py-3 text-right text-gray-900">
                          Rs{exp.amount?.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="py-3 pl-8 text-gray-500 italic"
                        colSpan={2}
                      >
                        No expenses recorded
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-gray-200 bg-red-50">
                    <td className="py-4 pl-8 text-red-900">Total Expenses</td>
                    <td className="py-4 text-right text-red-900 text-xl">
                      Rs{reportData.expenses.toLocaleString()}
                    </td>
                  </tr>

                  {/* Net Profit */}
                  <tr
                    className={`border-2 ${
                      reportData.netProfit >= 0
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300"
                        : "bg-gradient-to-r from-red-100 to-pink-100 border-red-300"
                    }`}
                  >
                    <td
                      className={`py-6 pl-8 text-xl ${
                        reportData.netProfit >= 0
                          ? "text-green-900"
                          : "text-red-900"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {reportData.netProfit >= 0 ? (
                          <ArrowUp className="w-6 h-6" />
                        ) : (
                          <ArrowDown className="w-6 h-6" />
                        )}
                        <span>Net Profit</span>
                      </div>
                    </td>
                    <td
                      className={`py-6 text-right text-3xl ${
                        reportData.netProfit >= 0
                          ? "text-green-900"
                          : "text-red-900"
                      }`}
                    >
                      Rs{reportData.netProfit.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="text-green-700 text-sm mb-2">
                Gross Profit Margin
              </div>
              <div className="text-green-900 text-4xl mb-3">
                {reportData.revenue > 0
                  ? (
                      (reportData.grossProfit / reportData.revenue) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="flex items-center space-x-1 text-green-600 text-sm">
                <ArrowUp className="w-4 h-4" />
                <span>Healthy margin</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="text-blue-700 text-sm mb-2">
                Operating Expense Ratio
              </div>
              <div className="text-blue-900 text-4xl mb-3">
                {reportData.revenue > 0
                  ? ((reportData.expenses / reportData.revenue) * 100).toFixed(
                      1
                    )
                  : 0}
                %
              </div>
              <div className="flex items-center space-x-1 text-blue-600 text-sm">
                <TrendingDown className="w-4 h-4" />
                <span>Well controlled</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
              <div className="text-purple-700 text-sm mb-2">
                Return on Sales
              </div>
              <div className="text-purple-900 text-4xl mb-3">
                {reportData.profitMargin.toFixed(1)}%
              </div>
              <div className="flex items-center space-x-1 text-purple-600 text-sm">
                <BarChart3 className="w-4 h-4" />
                <span>Strong performance</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Valuation Report */}
      {reportType === "stock_valuation" && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl mb-2">Stock Valuation Report</h4>
                <p className="text-purple-100 text-sm">
                  Current inventory value and analysis
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {inventory.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-gray-900 text-xl mb-2">No Inventory</h3>
              <p className="text-gray-500">
                Add inventory items to see stock valuation
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Item Name
                    </th>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Category
                    </th>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Quantity
                    </th>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Unit Price
                    </th>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Total Value
                    </th>
                    <th className="text-left text-gray-700 py-4 px-6">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inventory.map((item) => {
                    const totalValue = item.quantity * item.price;
                    const stockStatus =
                      item.quantity < item.minStockLevel ? "Low" : "Good";
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-gray-900">{item.name}</td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          Rs{item.price.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          Rs{totalValue.toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              stockStatus === "Low"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {stockStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gradient-to-r from-purple-50 to-pink-50 border-t-2 border-purple-300">
                  <tr>
                    <td
                      colSpan={4}
                      className="py-5 px-6 text-purple-900 text-xl"
                    >
                      Total Stock Value
                    </td>
                    <td className="py-5 px-6 text-purple-900 text-2xl">
                      Rs{getStockValuation().toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tax Report */}
      {reportType === "tax_report" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl mb-2">VAT Tax Report</h4>
                  <p className="text-orange-100 text-sm">
                    Period: {new Date(dateRange.start).toLocaleDateString()} -{" "}
                    {new Date(dateRange.end).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-blue-200 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-blue-900 text-xl">VAT Collected</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Sales VAT (13%)</span>
                      <span className="text-blue-900 text-2xl">
                        Rs{reportData.vatCollected.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-blue-200">
                      <span className="text-blue-600">Total Taxable Sales</span>
                      <span className="text-blue-800">
                        Rs
                        {(reportData.vatCollected / 0.13)
                          .toFixed(0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-green-200 rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-green-900 text-xl">
                      Net Tax Payable
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700">Amount Due</span>
                      <span className="text-green-900 text-2xl">
                        Rs{reportData.vatCollected.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-green-200">
                      <span className="text-green-600">Payment Status</span>
                      <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sales Summary */}
      {reportType === "sales_summary" && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-2xl mb-2">Sales Summary</h4>
                <p className="text-cyan-100 text-sm">
                  Period: {new Date(dateRange.start).toLocaleDateString()} -{" "}
                  {new Date(dateRange.end).toLocaleDateString()}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="text-blue-700 text-sm mb-2">Total Bills</div>
                <div className="text-blue-900 text-4xl">{bills.length}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                <div className="text-green-700 text-sm mb-2">
                  Average Bill Value
                </div>
                <div className="text-green-900 text-4xl">
                  Rs
                  {bills.length > 0
                    ? Math.round(
                        reportData.revenue / bills.length
                      ).toLocaleString()
                    : "0"}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="text-purple-700 text-sm mb-2">
                  Total Tax Collected
                </div>
                <div className="text-purple-900 text-4xl">
                  Rs{reportData.vatCollected.toLocaleString()}
                </div>
              </div>
            </div>

            {bills.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No sales in selected period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left text-gray-700 py-4 px-6">
                        Bill Number
                      </th>
                      <th className="text-left text-gray-700 py-4 px-6">
                        Customer
                      </th>
                      <th className="text-left text-gray-700 py-4 px-6">
                        Date
                      </th>
                      <th className="text-left text-gray-700 py-4 px-6">
                        Subtotal
                      </th>
                      <th className="text-left text-gray-700 py-4 px-6">Tax</th>
                      <th className="text-left text-gray-700 py-4 px-6">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bills.map((bill) => (
                      <tr
                        key={bill.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-gray-900">
                          {bill.billNumber}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {bill.customerName}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          Rs{bill.subtotal.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          Rs{bill.tax.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-gray-900">
                          Rs{bill.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

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
