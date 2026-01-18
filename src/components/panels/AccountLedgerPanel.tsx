import React, { useState, useEffect } from "react";
import {
  FileText,
  Wallet,
  ShoppingCart,
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  Power,
  Send,
  Printer,
  Receipt,
  Banknote,
  Smartphone,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getFromStorage } from "../../utils/mockData";

interface LedgerEntry {
  id: string;
  date: string;
  time: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
  type: string;
  shiftId?: string;
}

export const AccountLedgerPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [ledgerTab, setLedgerTab] = useState<"general" | "sales" | "purchase">(
    "general"
  );
  const [ledgerDateFrom, setLedgerDateFrom] = useState("");
  const [ledgerDateTo, setLedgerDateTo] = useState("");
  const [ledgerFilterShift, setLedgerFilterShift] = useState("all");
  const [ledgerFilterType, setLedgerFilterType] = useState("all");

  // Render tabs
  const renderLedgerTabs = () => (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-2 flex space-x-2">
      <button
        onClick={() => setLedgerTab("general")}
        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
          ledgerTab === "general"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <Wallet className="w-5 h-5" />
          <span>General Ledger</span>
        </div>
      </button>
      <button
        onClick={() => setLedgerTab("sales")}
        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
          ledgerTab === "sales"
            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <ShoppingCart className="w-5 h-5" />
          <span>Sales Ledger</span>
        </div>
      </button>
      <button
        onClick={() => setLedgerTab("purchase")}
        className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
          ledgerTab === "purchase"
            ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Purchase Ledger</span>
        </div>
      </button>
    </div>
  );

  // GENERAL LEDGER
  const renderGeneralLedger = () => {
    const ledgerEntries: LedgerEntry[] = [];
    const allShifts = getFromStorage("cashier_shifts", []);
    const allBills = getFromStorage("bills", []).filter(
      (b: any) => b.workspaceId === currentUser?.workspaceId
    );
    const cashTransactions = getFromStorage("cash_in_out_transactions", []);

    // Add shift openings
    allShifts
      .filter(
        (s: any) => s.workspaceId === currentUser?.workspaceId || !s.workspaceId
      )
      .forEach((shift: any) => {
        const shiftDate = new Date(shift.startTime);
        ledgerEntries.push({
          id: `shift-open-${shift.id}`,
          date: shiftDate.toLocaleDateString("en-GB"),
          time: shiftDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          description: `Shift Opening - ${shift.cashierName}`,
          reference: `Shift #${shift.id.slice(0, 8)}`,
          debit: shift.startCash,
          credit: 0,
          balance: 0,
          type: "shift_open",
          shiftId: shift.id,
        });
      });

    // Add sales from bills
    allBills.forEach((bill: any) => {
      const billDate = new Date(bill.createdAt);
      ledgerEntries.push({
        id: `sale-${bill.id}`,
        date: billDate.toLocaleDateString("en-GB"),
        time: billDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        description: `Sales - ${bill.customerName || "Walk-in Customer"}`,
        reference: bill.billNumber,
        debit: bill.paymentMethod === "cash" ? bill.total : 0,
        credit: 0,
        balance: 0,
        type: "sale",
        shiftId: bill.cashierId,
      });
    });

    // Add cash in transactions
    cashTransactions
      .filter((t: any) => t.type === "cash_in")
      .forEach((trans: any) => {
        const transDate = new Date(trans.date);
        ledgerEntries.push({
          id: trans.id,
          date: transDate.toLocaleDateString("en-GB"),
          time: transDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          description: `Cash In - ${trans.reason}`,
          reference: `CI-${trans.id.slice(0, 8)}`,
          debit: trans.amount,
          credit: 0,
          balance: 0,
          type: "cash_in",
          shiftId: trans.shiftId,
        });
      });

    // Add cash out transactions
    cashTransactions
      .filter((t: any) => t.type === "cash_out")
      .forEach((trans: any) => {
        const transDate = new Date(trans.date);
        ledgerEntries.push({
          id: trans.id,
          date: transDate.toLocaleDateString("en-GB"),
          time: transDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          description: `Cash Out - ${trans.reason}`,
          reference: `CO-${trans.id.slice(0, 8)}`,
          debit: 0,
          credit: trans.amount,
          balance: 0,
          type: "cash_out",
          shiftId: trans.shiftId,
        });
      });

    // Add shift closings
    allShifts
      .filter(
        (s: any) =>
          s.endTime &&
          (s.workspaceId === currentUser?.workspaceId || !s.workspaceId)
      )
      .forEach((shift: any) => {
        const shiftDate = new Date(shift.endTime);
        ledgerEntries.push({
          id: `shift-close-${shift.id}`,
          date: shiftDate.toLocaleDateString("en-GB"),
          time: shiftDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          description:
            shift.status === "transferred"
              ? `Shift Transfer to ${shift.transferredTo}`
              : `Shift Closing - ${shift.cashierName}`,
          reference: `Shift #${shift.id.slice(0, 8)}`,
          debit: 0,
          credit: shift.endCash || 0,
          balance: 0,
          type:
            shift.status === "transferred" ? "shift_transfer" : "shift_close",
          shiftId: shift.id,
        });
      });

    // Sort by date and time
    ledgerEntries.sort((a, b) => {
      const dateA = new Date(
        `${a.date.split("/").reverse().join("-")} ${a.time}`
      ).getTime();
      const dateB = new Date(
        `${b.date.split("/").reverse().join("-")} ${b.time}`
      ).getTime();
      return dateA - dateB;
    });

    // Calculate running balance
    let runningBalance = 0;
    ledgerEntries.forEach((entry) => {
      runningBalance += entry.debit - entry.credit;
      entry.balance = runningBalance;
    });

    // Apply filters
    let filteredEntries = ledgerEntries;

    if (ledgerDateFrom) {
      filteredEntries = filteredEntries.filter((entry) => {
        const entryDate = new Date(entry.date.split("/").reverse().join("-"));
        const fromDate = new Date(ledgerDateFrom);
        return entryDate >= fromDate;
      });
    }

    if (ledgerDateTo) {
      filteredEntries = filteredEntries.filter((entry) => {
        const entryDate = new Date(entry.date.split("/").reverse().join("-"));
        const toDate = new Date(ledgerDateTo);
        return entryDate <= toDate;
      });
    }

    if (ledgerFilterShift !== "all") {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.shiftId === ledgerFilterShift
      );
    }

    if (ledgerFilterType !== "all") {
      filteredEntries = filteredEntries.filter(
        (entry) => entry.type === ledgerFilterType
      );
    }

    // Calculate totals
    const totalDebit = filteredEntries.reduce(
      (sum, entry) => sum + entry.debit,
      0
    );
    const totalCredit = filteredEntries.reduce(
      (sum, entry) => sum + entry.credit,
      0
    );
    const netBalance = totalDebit - totalCredit;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-semibold">
                  Total Debit (Inflow)
                </p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  Rs{totalDebit.toLocaleString()}
                </p>
              </div>
              <ArrowDownCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-semibold">
                  Total Credit (Outflow)
                </p>
                <p className="text-3xl font-bold text-red-900 mt-2">
                  Rs{totalCredit.toLocaleString()}
                </p>
              </div>
              <ArrowUpCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <div
            className={`bg-gradient-to-br ${
              netBalance >= 0
                ? "from-blue-50 to-blue-100 border-blue-200"
                : "from-orange-50 to-orange-100 border-orange-200"
            } border-2 rounded-xl p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`${
                    netBalance >= 0 ? "text-blue-700" : "text-orange-700"
                  } text-sm font-semibold`}
                >
                  Net Balance
                </p>
                <p
                  className={`text-3xl font-bold ${
                    netBalance >= 0 ? "text-blue-900" : "text-orange-900"
                  } mt-2`}
                >
                  Rs{netBalance.toLocaleString()}
                </p>
              </div>
              <Wallet
                className={`w-12 h-12 ${
                  netBalance >= 0 ? "text-blue-600" : "text-orange-600"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Time
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Description
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Reference
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold">
                    Debit (Rs)
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold">
                    Credit (Rs)
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold">
                    Balance (Rs)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-semibold">
                        No transactions found
                      </p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {entry.time}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          {entry.type === "shift_open" && (
                            <ArrowDownCircle className="w-4 h-4 text-green-600" />
                          )}
                          {entry.type === "sale" && (
                            <ShoppingCart className="w-4 h-4 text-blue-600" />
                          )}
                          {entry.type === "cash_in" && (
                            <ArrowDownCircle className="w-4 h-4 text-green-600" />
                          )}
                          {entry.type === "cash_out" && (
                            <ArrowUpCircle className="w-4 h-4 text-red-600" />
                          )}
                          {entry.type === "shift_close" && (
                            <Power className="w-4 h-4 text-gray-600" />
                          )}
                          {entry.type === "shift_transfer" && (
                            <Send className="w-4 h-4 text-purple-600" />
                          )}
                          <span>{entry.description}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {entry.reference}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                        {entry.debit > 0 ? entry.debit.toLocaleString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                        {entry.credit > 0 ? entry.credit.toLocaleString() : "-"}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm text-right font-bold ${
                          entry.balance >= 0 ? "text-blue-600" : "text-red-600"
                        }`}
                      >
                        {entry.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {filteredEntries.length > 0 && (
                <tfoot>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold">
                    <td
                      colSpan={4}
                      className="px-4 py-4 text-right text-gray-900"
                    >
                      TOTALS:
                    </td>
                    <td className="px-4 py-4 text-right text-green-700">
                      Rs{totalDebit.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-red-700">
                      Rs{totalCredit.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-4 text-right ${
                        netBalance >= 0 ? "text-blue-700" : "text-red-700"
                      }`}
                    >
                      Rs{netBalance.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 p-6">
          <h4 className="font-bold text-gray-900 mb-4">
            Transaction Types Legend:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <ArrowDownCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">
                Shift Opening / Cash In
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700">Sales Transaction</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUpCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-700">Cash Out</span>
            </div>
            <div className="flex items-center space-x-2">
              <Power className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Shift Closing</span>
            </div>
            <div className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700">Shift Transfer</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // SALES LEDGER (same as in CashierDashboard but workspace-filtered)
  const renderSalesLedger = () => {
    const allBills = getFromStorage("bills", []).filter(
      (b: any) => b.workspaceId === currentUser?.workspaceId
    );

    let salesEntries = allBills.map((bill: any) => {
      const billDate = new Date(bill.createdAt);
      return {
        id: bill.id,
        date: billDate.toLocaleDateString("en-GB"),
        time: billDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        billNumber: bill.billNumber,
        customerName: bill.customerName || "Walk-in",
        customerPhone: bill.customerPhone || "-",
        customerType: bill.customerType,
        items: bill.items.length,
        subtotal: bill.subtotal,
        discount: bill.discount,
        tax: bill.tax,
        total: bill.total,
        paymentMethod: bill.paymentMethod,
        paymentStatus: bill.paymentStatus,
      };
    });

    // Apply date filters
    if (ledgerDateFrom) {
      salesEntries = salesEntries.filter((entry: any) => {
        const entryDate = new Date(entry.date.split("/").reverse().join("-"));
        const fromDate = new Date(ledgerDateFrom);
        return entryDate >= fromDate;
      });
    }

    if (ledgerDateTo) {
      salesEntries = salesEntries.filter((entry: any) => {
        const entryDate = new Date(entry.date.split("/").reverse().join("-"));
        const toDate = new Date(ledgerDateTo);
        return entryDate <= toDate;
      });
    }

    // Sort by date
    salesEntries.sort((a: any, b: any) => {
      const dateA = new Date(
        `${a.date.split("/").reverse().join("-")} ${a.time}`
      ).getTime();
      const dateB = new Date(
        `${b.date.split("/").reverse().join("-")} ${b.time}`
      ).getTime();
      return dateB - dateA;
    });

    // Calculate totals
    const totalSales = salesEntries.reduce(
      (sum: number, entry: any) => sum + entry.total,
      0
    );
    const totalSubtotal = salesEntries.reduce(
      (sum: number, entry: any) => sum + entry.subtotal,
      0
    );
    const totalDiscount = salesEntries.reduce(
      (sum: number, entry: any) => sum + entry.discount,
      0
    );
    const totalTax = salesEntries.reduce(
      (sum: number, entry: any) => sum + entry.tax,
      0
    );
    const cashSales = salesEntries
      .filter((e: any) => e.paymentMethod === "cash")
      .reduce((sum: number, entry: any) => sum + entry.total, 0);
    const digitalSales = totalSales - cashSales;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-semibold">
                  Total Sales
                </p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  Rs{totalSales.toLocaleString()}
                </p>
              </div>
              <Receipt className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-semibold">
                  Cash Sales
                </p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  Rs{cashSales.toLocaleString()}
                </p>
              </div>
              <Banknote className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-semibold">
                  Digital Sales
                </p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  Rs{digitalSales.toLocaleString()}
                </p>
              </div>
              <Smartphone className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-semibold">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  {salesEntries.length}
                </p>
              </div>
              <ShoppingCart className="w-10 h-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Time
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Bill #
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Customer
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Type
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold">
                    Items
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold">
                    Subtotal (Rs)
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold">
                    Discount (Rs)
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold">
                    Tax (Rs)
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold">
                    Total (Rs)
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-semibold">No sales found</p>
                      <p className="text-sm">Try adjusting your date filters</p>
                    </td>
                  </tr>
                ) : (
                  salesEntries.map((entry: any, index: number) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {entry.time}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">
                        {entry.billNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <p className="font-semibold">{entry.customerName}</p>
                          <p className="text-xs text-gray-500">
                            {entry.customerPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            entry.customerType === "retail"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {entry.customerType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-semibold">
                        {entry.items}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">
                        {entry.subtotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-orange-600 font-semibold">
                        {entry.discount > 0
                          ? `-${entry.discount.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">
                        {entry.tax.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                        {entry.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                            entry.paymentMethod === "cash"
                              ? "bg-green-100 text-green-700"
                              : entry.paymentMethod === "esewa"
                              ? "bg-yellow-100 text-yellow-700"
                              : entry.paymentMethod === "fonepay"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {entry.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {salesEntries.length > 0 && (
                <tfoot>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold">
                    <td
                      colSpan={6}
                      className="px-4 py-4 text-right text-gray-900"
                    >
                      TOTALS:
                    </td>
                    <td className="px-4 py-4 text-right text-gray-900">
                      Rs{totalSubtotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-orange-700">
                      -Rs{totalDiscount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-900">
                      Rs{totalTax.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-green-700">
                      Rs{totalSales.toLocaleString()}
                    </td>
                    <td className="px-4 py-4"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    );
  };

  // PURCHASE LEDGER
  const renderPurchaseLedger = () => {
    const allPurchaseOrders = getFromStorage("purchase_orders", []).filter(
      (po: any) => po.workspaceId === currentUser?.workspaceId
    );

    let purchaseEntries = allPurchaseOrders.map((po: any) => {
      const poDate = new Date(po.createdAt);
      return {
        id: po.id,
        date: poDate.toLocaleDateString("en-GB"),
        time: poDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        poNumber: po.poNumber,
        supplierName: po.supplierName || "Unknown Supplier",
        supplierPhone: po.supplierPhone || "-",
        items: po.items?.length || 0,
        subtotal: po.subtotal || 0,
        tax: po.tax || 0,
        total: po.total || 0,
        status: po.status || "pending",
        paymentStatus: po.paymentStatus || "pending",
      };
    });

    // Apply date filters
    if (ledgerDateFrom) {
      purchaseEntries = purchaseEntries.filter((entry: any) => {
        const entryDate = new Date(entry.date.split("/").reverse().join("-"));
        const fromDate = new Date(ledgerDateFrom);
        return entryDate >= fromDate;
      });
    }

    if (ledgerDateTo) {
      purchaseEntries = purchaseEntries.filter((entry: any) => {
        const entryDate = new Date(entry.date.split("/").reverse().join("-"));
        const toDate = new Date(ledgerDateTo);
        return entryDate <= toDate;
      });
    }

    // Sort by date
    purchaseEntries.sort((a: any, b: any) => {
      const dateA = new Date(
        `${a.date.split("/").reverse().join("-")} ${a.time}`
      ).getTime();
      const dateB = new Date(
        `${b.date.split("/").reverse().join("-")} ${b.time}`
      ).getTime();
      return dateB - dateA;
    });

    // Calculate totals
    const totalPurchases = purchaseEntries.reduce(
      (sum: number, entry: any) => sum + entry.total,
      0
    );
    const totalSubtotal = purchaseEntries.reduce(
      (sum: number, entry: any) => sum + entry.subtotal,
      0
    );
    const totalTax = purchaseEntries.reduce(
      (sum: number, entry: any) => sum + entry.tax,
      0
    );
    const paidPurchases = purchaseEntries
      .filter((e: any) => e.paymentStatus === "paid")
      .reduce((sum: number, entry: any) => sum + entry.total, 0);
    const pendingPurchases = totalPurchases - paidPurchases;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-semibold">
                  Total Purchases
                </p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  Rs{totalPurchases.toLocaleString()}
                </p>
              </div>
              <Package className="w-10 h-10 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-semibold">Paid</p>
                <p className="text-2xl font-bold text-green-900 mt-1">
                  Rs{paidPurchases.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-semibold">
                  Pending Payment
                </p>
                <p className="text-2xl font-bold text-orange-900 mt-1">
                  Rs{pendingPurchases.toLocaleString()}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-semibold">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {purchaseEntries.length}
                </p>
              </div>
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Purchase Table */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Time
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    PO #
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Supplier
                  </th>
                  <th className="px-4 py-4 text-center text-sm font-bold">
                    Items
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold">
                    Subtotal (Rs)
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold">
                    Tax (Rs)
                  </th>
                  <th className="px-4 py-4 text-right text-sm font-bold">
                    Total (Rs)
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-bold">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchaseEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-semibold">
                        No purchases found
                      </p>
                      <p className="text-sm">Try adjusting your date filters</p>
                    </td>
                  </tr>
                ) : (
                  purchaseEntries.map((entry: any, index: number) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-200 hover:bg-purple-50 transition-colors ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.date}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {entry.time}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-purple-600">
                        {entry.poNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div>
                          <p className="font-semibold">{entry.supplierName}</p>
                          <p className="text-xs text-gray-500">
                            {entry.supplierPhone}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-semibold">
                        {entry.items}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">
                        {entry.subtotal.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">
                        {entry.tax.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-purple-600">
                        {entry.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                            entry.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : entry.status === "in_transit"
                              ? "bg-blue-100 text-blue-700"
                              : entry.status === "confirmed"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {entry.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
                            entry.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : entry.paymentStatus === "partial"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {entry.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {purchaseEntries.length > 0 && (
                <tfoot>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold">
                    <td
                      colSpan={5}
                      className="px-4 py-4 text-right text-gray-900"
                    >
                      TOTALS:
                    </td>
                    <td className="px-4 py-4 text-right text-gray-900">
                      Rs{totalSubtotal.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-900">
                      Rs{totalTax.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-purple-700">
                      Rs{totalPurchases.toLocaleString()}
                    </td>
                    <td colSpan={2} className="px-4 py-4"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <span>Account Ledger</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Complete financial records - General, Sales & Purchase ledgers
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Printer className="w-5 h-5" />
          <span>Print Ledger</span>
        </button>
      </div>

      {/* Tabs */}
      {renderLedgerTabs()}

      {/* Filters */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={ledgerDateFrom}
              onChange={(e) => setLedgerDateFrom(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={ledgerDateTo}
              onChange={(e) => setLedgerDateTo(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {ledgerTab === "general" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Shift
                </label>
                <select
                  value={ledgerFilterShift}
                  onChange={(e) => setLedgerFilterShift(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Shifts</option>
                  {getFromStorage("cashier_shifts", [])
                    .filter(
                      (s: any) =>
                        s.workspaceId === currentUser?.workspaceId ||
                        !s.workspaceId
                    )
                    .map((shift: any) => (
                      <option key={shift.id} value={shift.id}>
                        Shift #{shift.id.slice(0, 8)} -{" "}
                        {new Date(shift.startTime).toLocaleDateString()}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Transaction Type
                </label>
                <select
                  value={ledgerFilterType}
                  onChange={(e) => setLedgerFilterType(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="shift_open">Shift Opening</option>
                  <option value="sale">Sales</option>
                  <option value="cash_in">Cash In</option>
                  <option value="cash_out">Cash Out</option>
                  <option value="shift_close">Shift Closing</option>
                  <option value="shift_transfer">Shift Transfer</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Render appropriate ledger based on active tab */}
      {ledgerTab === "general" && renderGeneralLedger()}
      {ledgerTab === "sales" && renderSalesLedger()}
      {ledgerTab === "purchase" && renderPurchaseLedger()}
    </div>
  );
};
