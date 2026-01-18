import React, { useEffect, useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  Filter,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Smartphone,
  Banknote,
  RefreshCw,
  Eye,
  X,
  CheckCircle,
  Clock,
  Receipt,
  ShoppingCart,
  RotateCcw,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";
import { Pagination } from "../common/Pagination";

interface CashTransaction {
  id: string;
  type: "cash_in" | "cash_out" | "transfer";
  source: string;
  amount: number;
  description: string;
  billId?: string;
  returnId?: string;
  bankAccountId?: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

interface BankAccount {
  id: string;
  accountType: "bank" | "esewa" | "fonepay" | "cash";
  accountName: string;
  bankName?: string;
  accountNumber?: string;
  currentBalance: number;
  totalReceived?: number;
}

export const CashInHandPanel: React.FC = () => {
  const popup = useCustomPopup();
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "cash_in" | "cash_out" | "transfer"
  >("all");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualAmount, setManualAmount] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualType, setManualType] = useState<"cash_in" | "cash_out">(
    "cash_in"
  );
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadApiTransactions(currentPage);
  }, [currentPage]);

  const parseNumber = (value: any) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const mapApiTransaction = (item: any): CashTransaction => {
    const rawType = (item?.transaction_type || "").toLowerCase();
    const type: CashTransaction["type"] =
      rawType === "cash_out"
        ? "cash_out"
        : rawType === "transfer"
        ? "transfer"
        : "cash_in";

    const signedAmount = parseNumber(item?.signed_amount || item?.amount);
    const amount = Math.abs(signedAmount || parseNumber(item?.amount));

    return {
      id: item?.id?.toString?.() || `cash_${Date.now()}`,
      type,
      source:
        item?.type_label || item?.source_description || "Cash Transaction",
      amount,
      description:
        item?.source_description || item?.type_label || "Cash transaction",
      date:
        item?.transaction_date ||
        item?.created ||
        item?.modified ||
        new Date().toISOString(),
      createdBy: "System",
      createdAt: item?.created || new Date().toISOString(),
    };
  };

  const loadApiTransactions = async (page: number) => {
    setIsLoadingApi(true);
    setApiError(null);

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/cash-and-bank/cash-transactions/?page=${page}`,
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch cash transactions (${response.status})`
        );
      }

      const data = await response.json();
      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];

      const mapped = results.map(mapApiTransaction);
      setTransactions(mapped);

      const pageSize = results.length || 1;
      const total = parseNumber(data?.count) || mapped.length;
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
    } catch (error: any) {
      console.error("Error fetching cash transactions:", error);
      setApiError(error?.message || "Unable to load cash transactions");
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Calculate active drawer amount
  const calculateBalance = () => {
    const cashIn = transactions
      .filter((t) => t.type === "cash_in")
      .reduce((sum, t) => sum + t.amount, 0);

    const cashOut = transactions
      .filter((t) => t.type === "cash_out" || t.type === "transfer")
      .reduce((sum, t) => sum + t.amount, 0);

    return cashIn - cashOut;
  };

  const getTodayTransactions = () => {
    const today = new Date().toDateString();
    return transactions.filter(
      (t) => new Date(t.date).toDateString() === today
    );
  };

  const getTodayStats = () => {
    const todayTxns = getTodayTransactions();
    const cashIn = todayTxns
      .filter((t) => t.type === "cash_in")
      .reduce((sum, t) => sum + t.amount, 0);
    const cashOut = todayTxns
      .filter((t) => t.type === "cash_out" || t.type === "transfer")
      .reduce((sum, t) => sum + t.amount, 0);
    return { cashIn, cashOut, count: todayTxns.length };
  };

  const handleTransferToBankAccount = async () => {
    if (
      !selectedAccount ||
      !transferAmount ||
      parseFloat(transferAmount) <= 0
    ) {
      popup.showError(
        "Please select account and enter valid amount",
        "Validation Error"
      );
      return;
    }

    const amount = parseFloat(transferAmount);
    const currentBalance = calculateBalance();

    if (amount > currentBalance) {
      popup.showError(
        `Insufficient cash in drawer! Available: NPR ${currentBalance.toLocaleString()}`,
        "Insufficient Balance"
      );
      return;
    }

    const account = bankAccounts.find((a) => a.id === selectedAccount);
    if (!account) return;

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");

      const payload = {
        transaction_type: "transfer",
        source_description: `Transfer to ${account.accountName}`,
        amount: amount.toString(),
        transaction_date: new Date().toISOString(),
        bank_account_id: selectedAccount,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/cash-transactions/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create transfer (${response.status})`);
      }

      // Reload transactions to show the new transfer
      setCurrentPage(1);

      setShowTransferModal(false);
      setTransferAmount("");
      setSelectedAccount("");
      popup.showSuccess(
        `NPR ${amount.toLocaleString()} transferred to ${account.accountName}`,
        "Transfer Successful!"
      );
    } catch (error: any) {
      console.error("Error creating transfer:", error);
      popup.showError(
        error?.message || "Unable to create transfer",
        "Transfer Failed"
      );
    }
  };

  const handleManualEntry = async () => {
    if (!manualAmount || parseFloat(manualAmount) <= 0 || !manualDescription) {
      popup.showError(
        "Please enter valid amount and description",
        "Validation Error"
      );
      return;
    }

    const amount = parseFloat(manualAmount);

    if (manualType === "cash_out") {
      const currentBalance = calculateBalance();
      if (amount > currentBalance) {
        popup.showError(
          `Insufficient cash in drawer! Available: NPR ${currentBalance.toLocaleString()}`,
          "Insufficient Balance"
        );
        return;
      }
    }

    setIsSubmittingManual(true);

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");

      const payload = {
        transaction_type: manualType,
        source_description: manualDescription,
        amount: amount.toString(),
        transaction_date: new Date().toISOString(),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/cash-transactions/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const message = `Failed to add cash transaction (${response.status})`;
        throw new Error(message);
      }

      const data = await response.json();

      // Navigate to page 1 to see the newly added transaction
      setCurrentPage(1);

      setShowAddModal(false);
      setManualAmount("");
      setManualDescription("");
      popup.showSuccess(
        `${
          manualType === "cash_in" ? "Cash In" : "Cash Out"
        } of NPR ${amount.toLocaleString()} recorded`,
        "Transaction Added!"
      );
    } catch (error: any) {
      console.error("Error adding cash transaction:", error);
      popup.showError(
        error?.message || "Unable to add cash transaction",
        "Save Failed"
      );
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const todayStats = getTodayStats();
  const activeBalance = calculateBalance();

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterType === "all" || t.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getTransactionIcon = (transaction: CashTransaction) => {
    if (transaction.type === "cash_in") {
      return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
    } else if (transaction.type === "transfer") {
      return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
    } else {
      return <ArrowUpRight className="w-5 h-5 text-red-600" />;
    }
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      bill_payment: "Bill Payment",
      sales_return: "Sales Return",
      bank_transfer: "Bank Transfer",
      opening_balance: "Opening Balance",
      manual: "Manual Entry",
    };
    return labels[source] || source;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-green-600" />
            <span>Cash in Hand</span>
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Track physical cash drawer and manage transfers
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>Manual Entry</span>
          </button>
          {/* Transfer feature disabled - requires bank accounts API
          <button
            onClick={() => setShowTransferModal(true)}
            disabled={true}
            className="px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 bg-gray-300 text-gray-500 cursor-not-allowed"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Transfer to Bank</span>
          </button>
          */}
        </div>
      </div>

      {/* Active Drawer Amount - Big Display */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <Wallet className="w-10 h-10 opacity-80" />
              <span className="text-green-100 text-lg">Cash Balance</span>
            </div>
            <p className="text-5xl font-bold mb-2">
              NPR {activeBalance.toLocaleString()}
            </p>
            <div className="flex items-center space-x-4 text-green-100">
              <div className="flex items-center space-x-2">
                <ArrowDownLeft className="w-4 h-4" />
                <span className="text-sm">
                  Cash In: NPR {todayStats.cashIn.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm">
                  Cash Out: NPR {todayStats.cashOut.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <Clock className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-sm text-green-100">Today's Transactions</p>
              <p className="text-3xl font-bold">{todayStats.count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border-2 border-green-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              TODAY
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Cash In</p>
          <p className="text-2xl font-bold text-green-900">
            NPR {todayStats.cashIn.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl border-2 border-red-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
              TODAY
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Cash Out</p>
          <p className="text-2xl font-bold text-red-900">
            NPR {todayStats.cashOut.toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <RefreshCw className="w-8 h-8 text-blue-600" />
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              NET
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Today's Net</p>
          <p
            className={`text-2xl font-bold ${
              todayStats.cashIn - todayStats.cashOut >= 0
                ? "text-green-900"
                : "text-red-900"
            }`}
          >
            NPR {(todayStats.cashIn - todayStats.cashOut).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex space-x-2">
            {[
              { value: "all", label: "All", icon: Filter },
              { value: "cash_in", label: "Cash In", icon: ArrowDownLeft },
              { value: "cash_out", label: "Cash Out", icon: ArrowUpRight },
              { value: "transfer", label: "Transfers", icon: RefreshCw },
            ].map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setFilterType(filter.value as any)}
                  className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all ${
                    filterType === filter.value
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {apiError && (
          <div className="px-6 py-4 text-sm text-red-600 border-b border-red-200 bg-red-50">
            {apiError}
          </div>
        )}

        {isLoadingApi && filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-spin" />
            <h3 className="text-gray-900 text-xl mb-2">
              Loading transactions...
            </h3>
            <p className="text-gray-500">
              Fetching cash transactions from server
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl mb-2">No Transactions</h3>
            <p className="text-gray-500">Cash transactions will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-900 font-semibold">
                      Date & Time
                    </th>
                    <th className="px-6 py-4 text-left text-gray-900 font-semibold">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-left text-gray-900 font-semibold">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-gray-900 font-semibold">
                      Source
                    </th>
                    <th className="px-6 py-4 text-left text-gray-900 font-semibold">
                      Description
                    </th>
                    <th className="px-6 py-4 text-right text-gray-900 font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">
                          {transaction.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              transaction.type === "cash_in"
                                ? "bg-green-100 text-green-700"
                                : transaction.type === "transfer"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type === "cash_in"
                              ? "CASH IN"
                              : transaction.type === "transfer"
                              ? "TRANSFER"
                              : "CASH OUT"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 text-sm">
                          {getSourceLabel(transaction.source)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900">
                          {transaction.description}
                        </div>
                        {transaction.billId && (
                          <div className="text-xs text-blue-600 mt-1">
                            Bill: {transaction.billId}
                          </div>
                        )}
                        {transaction.bankAccountId && (
                          <div className="text-xs text-purple-600 mt-1">
                            To:{" "}
                            {
                              bankAccounts.find(
                                (a) => a.id === transaction.bankAccountId
                              )?.accountName
                            }
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-bold text-lg ${
                            transaction.type === "cash_in"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "cash_in" ? "+" : "-"}NPR{" "}
                          {transaction.amount.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    if (page < 1 || page > totalPages) return;
                    setCurrentPage(page);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Transfer to Bank Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <ArrowUpRight className="w-6 h-6 text-green-600 mr-2" />
                Transfer to Bank
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-700 mb-1">
                Available Cash in Drawer
              </p>
              <p className="text-3xl font-bold text-green-900">
                NPR {activeBalance.toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Account *
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose account...</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountName} ({account.accountType.toUpperCase()}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Transfer Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    NPR
                  </span>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferToBankAccount}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
                Manual Entry
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Transaction Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setManualType("cash_in")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      manualType === "cash_in"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <ArrowDownLeft
                      className={`w-6 h-6 mx-auto mb-2 ${
                        manualType === "cash_in"
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        manualType === "cash_in"
                          ? "text-green-700"
                          : "text-gray-700"
                      }`}
                    >
                      Cash In
                    </span>
                  </button>
                  <button
                    onClick={() => setManualType("cash_out")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      manualType === "cash_out"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <ArrowUpRight
                      className={`w-6 h-6 mx-auto mb-2 ${
                        manualType === "cash_out"
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        manualType === "cash_out"
                          ? "text-red-700"
                          : "text-gray-700"
                      }`}
                    >
                      Cash Out
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    NPR
                  </span>
                  <input
                    type="number"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Description *
                </label>
                <textarea
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Enter transaction description..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleManualEntry}
                disabled={isSubmittingManual}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white transition-colors ${
                  isSubmittingManual
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmittingManual ? "Saving..." : "Add Transaction"}
              </button>
            </div>
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
