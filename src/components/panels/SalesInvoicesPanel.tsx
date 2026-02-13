import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Eye,
  Printer,
  RotateCcw,
  Download,
  Calendar,
  Users,
  CreditCard,
  DollarSign,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Ban,
  RefreshCw,
  Receipt,
  History,
} from "lucide-react";
import { getFromStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { Bill, DiscountHistoryEntry } from "../../types";
import { useBranch } from "../../contexts/BranchContext";

type PaymentStatus =
  | "paid"
  | "pending"
  | "draft"
  | "hold"
  | "cancelled"
  | "refunded"
  | "credit";

const STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  draft: "Draft",
  hold: "On Hold",
  cancelled: "Cancelled",
  refunded: "Refunded",
  credit: "Credit Sale",
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-700 border-green-300",
  pending: "bg-orange-100 text-orange-700 border-orange-300",
  draft: "bg-gray-100 text-gray-700 border-gray-300",
  hold: "bg-yellow-100 text-yellow-700 border-yellow-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
  refunded: "bg-blue-100 text-blue-700 border-blue-300",
  credit: "bg-purple-100 text-purple-700 border-purple-300",
};

const STATUS_ICONS: Record<PaymentStatus, React.ReactNode> = {
  paid: <CheckCircle className="w-4 h-4" />,
  pending: <Clock className="w-4 h-4" />,
  draft: <Receipt className="w-4 h-4" />,
  hold: <AlertCircle className="w-4 h-4" />,
  cancelled: <Ban className="w-4 h-4" />,
  refunded: <RefreshCw className="w-4 h-4" />,
  credit: <CreditCard className="w-4 h-4" />,
};

export const SalesInvoicesPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedBranchId } = useBranch();
  const [bills, setBills] = useState<Bill[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | "all">(
    "all",
  );
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedCashier, setSelectedCashier] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [viewingSidebar, setViewingSidebar] = useState(false);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadBills();
    loadBranches();
  }, [selectedBranchId]);

  const loadBills = () => {
    const allBills = getFromStorage("bills", []);
    setBills(
      allBills.filter((b: Bill) => {
        // First check workspace
        if (b.workspaceId !== currentUser?.workspaceId) return false;

        // Then check branch if selected
        if (selectedBranchId && String(b.branchId) !== String(selectedBranchId))
          return false;

        return true;
      }),
    );
  };

  const loadBranches = () => {
    const allBranches = getFromStorage("branches", []);
    setBranches(
      allBranches.filter(
        (b: any) => b.workspaceId === currentUser?.workspaceId,
      ),
    );
  };

  const handleViewBill = (bill: Bill) => {
    setViewingBill(bill);
    setViewingSidebar(true);
  };

  const handleCloseViewSidebar = () => {
    setViewingSidebar(false);
    setViewingBill(null);
  };

  const handlePrintInvoice = (bill: Bill) => {
    // Create print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; text-align: right; }
            .total-row { font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Serve Spares - Inventory System</h1>
            <p>Invoice / Receipt</p>
          </div>
          <div class="invoice-details">
            <p><strong>Invoice Number:</strong> ${bill.billNumber}</p>
            <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleString("en-NP")}</p>
            <p><strong>Customer:</strong> ${bill.customerName}</p>
            ${bill.customerPhone ? `<p><strong>Phone:</strong> ${bill.customerPhone}</p>` : ""}
            ${bill.customerAddress ? `<p><strong>Address:</strong> ${bill.customerAddress}</p>` : ""}
            ${bill.cashierName ? `<p><strong>Cashier:</strong> ${bill.cashierName}</p>` : ""}
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.itemName}</td>
                  <td>${item.quantity}</td>
                  <td>NPR ${item.price.toLocaleString()}</td>
                  <td>NPR ${item.total.toLocaleString()}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: NPR ${bill.subtotal.toLocaleString()}</p>
            <p>Tax: NPR ${bill.tax.toLocaleString()}</p>
            ${bill.discount > 0 ? `<p>Discount: NPR ${bill.discount.toLocaleString()}</p>` : ""}
            <p class="total-row">Total: NPR ${bill.total.toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${bill.paymentMethod.toUpperCase()}</p>
            <p><strong>Status:</strong> ${STATUS_LABELS[bill.paymentStatus]}</p>
          </div>
          <div style="margin-top: 40px; text-align: center;">
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownloadInvoice = (bill: Bill) => {
    const csvContent = [
      ["Invoice Number", bill.billNumber],
      ["Date", new Date(bill.createdAt).toLocaleString("en-NP")],
      ["Customer", bill.customerName],
      ["Phone", bill.customerPhone || "N/A"],
      [""],
      ["Item Name", "Quantity", "Price", "Total"],
      ...bill.items.map((item) => [
        item.itemName,
        item.quantity.toString(),
        `NPR ${item.price}`,
        `NPR ${item.total}`,
      ]),
      [""],
      ["Subtotal", "", "", `NPR ${bill.subtotal}`],
      ["Tax", "", "", `NPR ${bill.tax}`],
      ["Discount", "", "", `NPR ${bill.discount}`],
      ["Total", "", "", `NPR ${bill.total}`],
      ["Payment Method", bill.paymentMethod],
      ["Status", STATUS_LABELS[bill.paymentStatus]],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${bill.billNumber}.csv`;
    a.click();
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.customerPhone && bill.customerPhone.includes(searchQuery));

    const matchesStatus =
      selectedStatus === "all" || bill.paymentStatus === selectedStatus;
    const matchesBranch =
      selectedBranch === "all" || bill.branchId === selectedBranch;
    const matchesCashier =
      selectedCashier === "all" || bill.cashierName === selectedCashier;
    const matchesPaymentMethod =
      selectedPaymentMethod === "all" ||
      bill.paymentMethod === selectedPaymentMethod;

    let matchesDateRange = true;
    if (dateRange.from && bill.createdAt) {
      const billDate = new Date(bill.createdAt);
      const fromDate = new Date(dateRange.from);
      matchesDateRange = billDate >= fromDate;
    }
    if (dateRange.to && bill.createdAt) {
      const billDate = new Date(bill.createdAt);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      matchesDateRange = matchesDateRange && billDate <= toDate;
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesBranch &&
      matchesCashier &&
      matchesPaymentMethod &&
      matchesDateRange
    );
  });

  const statusCounts = bills.reduce(
    (acc, bill) => {
      acc[bill.paymentStatus] = (acc[bill.paymentStatus] || 0) + 1;
      return acc;
    },
    {} as Record<PaymentStatus, number>,
  );

  const uniqueCashiers = Array.from(
    new Set(bills.map((b) => b.cashierName).filter(Boolean)),
  ) as string[];
  const paymentMethods = [
    "cash",
    "esewa",
    "fonepay",
    "bank",
    "credit",
    "cheque",
  ];

  const stats = {
    totalInvoices: bills.length,
    totalRevenue: bills
      .filter((b) => b.paymentStatus === "paid" || b.paymentStatus === "credit")
      .reduce((sum, b) => sum + b.total, 0),
    pendingAmount: bills
      .filter(
        (b) => b.paymentStatus === "pending" || b.paymentStatus === "hold",
      )
      .reduce((sum, b) => sum + b.total, 0),
    refundedAmount: bills
      .filter((b) => b.paymentStatus === "refunded")
      .reduce((sum, b) => sum + b.total, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Invoices</p>
              <p className="text-gray-900 text-2xl mt-1">
                {stats.totalInvoices}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-gray-900 text-2xl mt-1">
                NPR {stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Amount</p>
              <p className="text-gray-900 text-2xl mt-1">
                NPR {stats.pendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Refunded</p>
              <p className="text-gray-900 text-2xl mt-1">
                NPR {stats.refundedAmount.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900 text-lg">Sales & Invoices</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            showFilters
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice number, customer name, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-gray-900 mb-4 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Branch Filter - Only show if no global branch is selected */}
              {!selectedBranchId && (
                <div>
                  <label className="block text-gray-700 text-sm mb-2">
                    Branch
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Branches</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cashier Filter */}
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Cashier
                </label>
                <select
                  value={selectedCashier}
                  onChange={(e) => setSelectedCashier(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Cashiers</option>
                  {uniqueCashiers.map((cashier) => (
                    <option key={cashier} value={cashier}>
                      {cashier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  Payment Method
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Methods</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedBranch("all");
                    setSelectedCashier("all");
                    setSelectedPaymentMethod("all");
                    setDateRange({ from: "", to: "" });
                  }}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Filter Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              selectedStatus === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({bills.length})
          </button>
          {(
            [
              "paid",
              "pending",
              "hold",
              "credit",
              "cancelled",
              "refunded",
            ] as PaymentStatus[]
          ).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {STATUS_LABELS[status]} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Invoice #
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Customer
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Date
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Items
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Amount
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Payment
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Status
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr
                  key={bill.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="text-gray-900">{bill.billNumber}</div>
                    {bill.cashierName && (
                      <div className="text-xs text-gray-500">
                        by {bill.cashierName}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-900">{bill.customerName}</div>
                    {bill.customerPhone && (
                      <div className="text-xs text-gray-500">
                        {bill.customerPhone}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {new Date(bill.createdAt).toLocaleDateString("en-NP")}
                    <div className="text-xs text-gray-500">
                      {new Date(bill.createdAt).toLocaleTimeString("en-NP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {bill.items.length} items
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-900">
                      NPR {bill.total.toLocaleString()}
                    </div>
                    {bill.discount > 0 && (
                      <div className="text-xs text-green-600">
                        Disc: NPR {bill.discount.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      {bill.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {/* Beautiful Status Badges with Special Effects */}
                    {bill.paymentStatus === "paid" && (
                      <span className="px-3 py-1 rounded-full text-sm border flex items-center space-x-1 w-fit bg-green-100 text-green-700 border-green-300 shadow-lg shadow-green-200/50 animate-pulse-soft">
                        {STATUS_ICONS[bill.paymentStatus]}
                        <span>{STATUS_LABELS[bill.paymentStatus]}</span>
                      </span>
                    )}
                    {bill.paymentStatus === "hold" && (
                      <span className="px-3 py-1 rounded-full text-sm border flex items-center space-x-1 w-fit bg-yellow-50 text-yellow-700 border-yellow-200">
                        {STATUS_ICONS[bill.paymentStatus]}
                        <span>{STATUS_LABELS[bill.paymentStatus]}</span>
                      </span>
                    )}
                    {bill.paymentStatus === "cancelled" && (
                      <span className="px-3 py-1 rounded-full text-sm border-2 flex items-center space-x-1 w-fit bg-white text-red-700 border-red-400 animate-flash-border">
                        {STATUS_ICONS[bill.paymentStatus]}
                        <span>{STATUS_LABELS[bill.paymentStatus]}</span>
                      </span>
                    )}
                    {bill.paymentStatus === "credit" && (
                      <span className="px-3 py-1 rounded-full text-sm border flex items-center space-x-1 w-fit bg-purple-100 text-purple-700 border-purple-300">
                        {STATUS_ICONS[bill.paymentStatus]}
                        <span>{STATUS_LABELS[bill.paymentStatus]}</span>
                      </span>
                    )}
                    {bill.paymentStatus === "refunded" && (
                      <span className="px-3 py-1 rounded-full text-sm border flex items-center space-x-1 w-fit bg-blue-50 text-blue-700 border-blue-200">
                        {STATUS_ICONS[bill.paymentStatus]}
                        <span>{STATUS_LABELS[bill.paymentStatus]}</span>
                      </span>
                    )}
                    {(bill.paymentStatus === "pending" ||
                      bill.paymentStatus === "draft") && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm border flex items-center space-x-1 w-fit ${STATUS_COLORS[bill.paymentStatus]}`}
                      >
                        {STATUS_ICONS[bill.paymentStatus]}
                        <span>{STATUS_LABELS[bill.paymentStatus]}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewBill(bill)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(bill)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(bill)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBills.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No invoices found matching your filters
            </div>
          )}
        </div>
      </div>

      {/* View Invoice Detail Sidebar */}
      {viewingSidebar && viewingBill && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseViewSidebar}
          />

          <div className="fixed right-0 top-0 h-full w-full md:w-[700px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-xl">Invoice Details</h3>
                <button
                  onClick={handleCloseViewSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Invoice Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-gray-900 text-2xl mb-2">
                      {viewingBill.billNumber}
                    </h4>
                    <p className="text-gray-600">
                      {new Date(viewingBill.createdAt).toLocaleString("en-NP")}
                    </p>
                  </div>
                  {/* Status Badge */}
                  {viewingBill.paymentStatus === "paid" && (
                    <span className="px-4 py-2 rounded-full text-sm border flex items-center space-x-2 bg-green-100 text-green-700 border-green-300 shadow-lg shadow-green-200/50">
                      {STATUS_ICONS[viewingBill.paymentStatus]}
                      <span>{STATUS_LABELS[viewingBill.paymentStatus]}</span>
                    </span>
                  )}
                  {viewingBill.paymentStatus === "hold" && (
                    <span className="px-4 py-2 rounded-full text-sm border flex items-center space-x-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                      {STATUS_ICONS[viewingBill.paymentStatus]}
                      <span>{STATUS_LABELS[viewingBill.paymentStatus]}</span>
                    </span>
                  )}
                  {viewingBill.paymentStatus === "cancelled" && (
                    <span className="px-4 py-2 rounded-full text-sm border-2 flex items-center space-x-2 bg-white text-red-700 border-red-400 animate-flash-border">
                      {STATUS_ICONS[viewingBill.paymentStatus]}
                      <span>{STATUS_LABELS[viewingBill.paymentStatus]}</span>
                    </span>
                  )}
                  {viewingBill.paymentStatus === "credit" && (
                    <span className="px-4 py-2 rounded-full text-sm border flex items-center space-x-2 bg-purple-100 text-purple-700 border-purple-300">
                      {STATUS_ICONS[viewingBill.paymentStatus]}
                      <span>{STATUS_LABELS[viewingBill.paymentStatus]}</span>
                    </span>
                  )}
                  {viewingBill.paymentStatus === "refunded" && (
                    <span className="px-4 py-2 rounded-full text-sm border flex items-center space-x-2 bg-blue-50 text-blue-700 border-blue-200">
                      {STATUS_ICONS[viewingBill.paymentStatus]}
                      <span>{STATUS_LABELS[viewingBill.paymentStatus]}</span>
                    </span>
                  )}
                  {(viewingBill.paymentStatus === "pending" ||
                    viewingBill.paymentStatus === "draft") && (
                    <span
                      className={`px-4 py-2 rounded-full text-sm border flex items-center space-x-2 ${STATUS_COLORS[viewingBill.paymentStatus]}`}
                    >
                      {STATUS_ICONS[viewingBill.paymentStatus]}
                      <span>{STATUS_LABELS[viewingBill.paymentStatus]}</span>
                    </span>
                  )}
                </div>

                {/* Customer & Payment Info */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-500 text-sm">Customer</p>
                    <p className="text-gray-900">{viewingBill.customerName}</p>
                    {viewingBill.customerPhone && (
                      <p className="text-gray-600 text-sm">
                        {viewingBill.customerPhone}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Payment Method</p>
                    <p className="text-gray-900">
                      {viewingBill.paymentMethod.toUpperCase()}
                    </p>
                  </div>
                  {viewingBill.cashierName && (
                    <div>
                      <p className="text-gray-500 text-sm">Cashier</p>
                      <p className="text-gray-900">{viewingBill.cashierName}</p>
                    </div>
                  )}
                  {viewingBill.branchName && (
                    <div>
                      <p className="text-gray-500 text-sm">Branch</p>
                      <p className="text-gray-900">{viewingBill.branchName}</p>
                    </div>
                  )}
                </div>

                {/* Refund Info */}
                {viewingBill.paymentStatus === "refunded" &&
                  viewingBill.refundReason && (
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-blue-900 text-sm flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refunded on{" "}
                        {viewingBill.refundedAt
                          ? new Date(viewingBill.refundedAt).toLocaleDateString(
                              "en-NP",
                            )
                          : "N/A"}
                      </p>
                      <p className="text-blue-800 text-sm mt-1">
                        Reason: {viewingBill.refundReason}
                      </p>
                    </div>
                  )}
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h4 className="text-gray-900 mb-3">Items Purchased</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left text-gray-600 text-sm py-3 px-4">
                          Item
                        </th>
                        <th className="text-right text-gray-600 text-sm py-3 px-4">
                          Qty
                        </th>
                        <th className="text-right text-gray-600 text-sm py-3 px-4">
                          Price
                        </th>
                        <th className="text-right text-gray-600 text-sm py-3 px-4">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingBill.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-gray-900">
                            {item.itemName}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            NPR {item.price.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            NPR {item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="border-t-2 border-gray-300">
                        <td
                          colSpan={3}
                          className="py-3 px-4 text-right text-gray-700"
                        >
                          Subtotal:
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          NPR {viewingBill.subtotal.toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="py-2 px-4 text-right text-gray-700"
                        >
                          Tax:
                        </td>
                        <td className="py-2 px-4 text-right text-gray-900">
                          NPR {viewingBill.tax.toLocaleString()}
                        </td>
                      </tr>
                      {viewingBill.discount > 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="py-2 px-4 text-right text-gray-700"
                          >
                            Discount:
                          </td>
                          <td className="py-2 px-4 text-right text-green-600">
                            - NPR {viewingBill.discount.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr className="border-t border-gray-300">
                        <td
                          colSpan={3}
                          className="py-3 px-4 text-right text-gray-900"
                        >
                          Total:
                        </td>
                        <td className="py-3 px-4 text-right text-blue-600">
                          NPR {viewingBill.total.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Discount History */}
              {viewingBill.discountHistory &&
                viewingBill.discountHistory.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-gray-900 mb-3 flex items-center">
                      <History className="w-4 h-4 mr-2" />
                      Discount History
                    </h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left text-gray-600 text-sm py-3 px-4">
                              Date
                            </th>
                            <th className="text-left text-gray-600 text-sm py-3 px-4">
                              Amount
                            </th>
                            <th className="text-left text-gray-600 text-sm py-3 px-4">
                              Applied By
                            </th>
                            <th className="text-left text-gray-600 text-sm py-3 px-4">
                              Reason
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingBill.discountHistory.map((entry) => (
                            <tr
                              key={entry.id}
                              className="border-b border-gray-100"
                            >
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {new Date(entry.appliedAt).toLocaleDateString(
                                  "en-NP",
                                )}
                              </td>
                              <td className="py-3 px-4 text-green-600">
                                {entry.type === "percentage"
                                  ? `${entry.amount}%`
                                  : `NPR ${entry.amount}`}
                              </td>
                              <td className="py-3 px-4 text-gray-900">
                                {entry.appliedBy}
                              </td>
                              <td className="py-3 px-4 text-gray-600 text-sm">
                                {entry.reason || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Notes */}
              {viewingBill.notes && (
                <div className="mb-6">
                  <h4 className="text-gray-900 mb-2">Notes</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">{viewingBill.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handlePrintInvoice(viewingBill)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Reprint</span>
                </button>
                <button
                  onClick={() => handleDownloadInvoice(viewingBill)}
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleCloseViewSidebar}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.3), 0 8px 10px -6px rgba(34, 197, 94, 0.2);
          }
          50% {
            opacity: 0.95;
            box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.5), 0 8px 10px -6px rgba(34, 197, 94, 0.4);
          }
        }

        @keyframes flash-border {
          0%, 100% {
            border-color: rgb(248, 113, 113);
            box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.4);
          }
          50% {
            border-color: rgb(220, 38, 38);
            box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.2);
          }
        }

        .animate-pulse-soft {
          animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-flash-border {
          animation: flash-border 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
