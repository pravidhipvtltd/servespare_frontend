import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Filter,
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  DollarSign,
  Download,
} from "lucide-react";
import { getFromStorage } from "../../utils/mockData";
import { BankAccount } from "../panels/BankAccountsPanel";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  source: string;
  amount: number;
  description: string;
  billId?: string;
  date: string;
  createdAt: string;
}

interface TransactionDetailsModalProps {
  account: BankAccount;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: "all" | "credit" | "debit";
  onFilterChange: (filter: "all" | "credit" | "debit") => void;
}

export const TransactionDetailsModal: React.FC<
  TransactionDetailsModalProps
> = ({
  account,
  onClose,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, [account]);

  const loadTransactions = () => {
    const allTransactions: Transaction[] = [];

    // Get cash transactions (transfers to this account)
    const cashTxns = getFromStorage("cashTransactions", []);
    cashTxns.forEach((txn: any) => {
      if (txn.bankAccountId === account.id && txn.type === "transfer") {
        allTransactions.push({
          id: txn.id,
          type: "credit",
          source: "Cash Transfer",
          amount: txn.amount,
          description: txn.description || `Transfer from Cash Drawer`,
          date: txn.date,
          createdAt: txn.createdAt,
        });
      }
    });

    // Get bill payments (if payment method matches this account type)
    const bills = getFromStorage("bills", []);
    bills.forEach((bill: any) => {
      if (bill.bankAccountId === account.id && bill.paymentStatus === "paid") {
        allTransactions.push({
          id: `BILL-${bill.id}`,
          type: "credit",
          source: "Bill Payment",
          amount: bill.total,
          description: `Payment from ${bill.customerName} - Bill #${bill.billNumber}`,
          billId: bill.billNumber,
          date: bill.createdAt,
          createdAt: bill.createdAt,
        });
      }
    });

    // Sort by date (newest first)
    allTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setTransactions(allTransactions);
  };

  // Calculate stats
  const totalCredit = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebit = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalCredit - totalDebit;

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.billId &&
        txn.billId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = filter === "all" || txn.type === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Transaction History</h3>
              <p className="text-blue-100 mt-1">{account.accountName}</p>
              {account.accountType === "bank" && (
                <p className="text-sm text-blue-100 mt-1">
                  {account.bankName} - {account.accountNumber}
                </p>
              )}
              {account.accountType === "esewa" && (
                <p className="text-sm text-blue-100 mt-1">
                  eSewa ID: {account.esewaId}
                </p>
              )}
              {account.accountType === "fonepay" && (
                <p className="text-sm text-blue-100 mt-1">
                  FonePay ID: {account.fonepayId}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Current Balance</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              Rs{account.currentBalance.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowDownCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Total Credits</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              Rs{totalCredit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {transactions.filter((t) => t.type === "credit").length}{" "}
              transactions
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-red-200">
            <div className="flex items-center space-x-2 mb-2">
              <ArrowUpCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-600">Total Debits</span>
            </div>
            <p className="text-2xl font-bold text-red-900">
              Rs{totalDebit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {transactions.filter((t) => t.type === "debit").length}{" "}
              transactions
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Net Flow</span>
            </div>
            <p
              className={`text-2xl font-bold ${
                netBalance >= 0 ? "text-green-900" : "text-red-900"
              }`}
            >
              Rs{netBalance.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {transactions.length} total transactions
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search transactions by description, ID, or bill number..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-2">
              {[
                { value: "all", label: "All", icon: Filter },
                { value: "credit", label: "Credits", icon: ArrowDownCircle },
                { value: "debit", label: "Debits", icon: ArrowUpCircle },
              ].map((filterOption) => {
                const Icon = filterOption.icon;
                return (
                  <button
                    key={filterOption.value}
                    onClick={() => onFilterChange(filterOption.value as any)}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-all ${
                      filter === filterOption.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{filterOption.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 text-xl mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "Try adjusting your search or filter"
                  : "Transactions will appear here"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className={`bg-white rounded-xl border-2 p-4 hover:shadow-md transition-all ${
                    txn.type === "credit"
                      ? "border-green-200"
                      : "border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-3 rounded-full ${
                          txn.type === "credit"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {txn.type === "credit" ? (
                          <ArrowDownCircle className="w-6 h-6" />
                        ) : (
                          <ArrowUpCircle className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <p className="font-semibold text-gray-900">
                            {txn.description}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              txn.type === "credit"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {txn.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Receipt className="w-4 h-4" />
                            <span>{txn.source}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(txn.date).toLocaleDateString("en-NP")}
                            </span>
                            <span>
                              {new Date(txn.date).toLocaleTimeString("en-NP", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </span>
                          {txn.billId && (
                            <span className="text-blue-600 font-mono text-xs">
                              Bill: {txn.billId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold ${
                          txn.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {txn.type === "credit" ? "+" : "-"}Rs
                        {txn.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {txn.id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  /* Add export functionality */
                  alert("Export functionality coming soon!");
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
