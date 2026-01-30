import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingDown,
  Package,
  AlertTriangle,
  ShoppingCart,
  CreditCard,
  Wallet,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  ShoppingBag,
  Users,
  Banknote,
  Receipt,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getFromStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { useBranch } from "../../contexts/BranchContext";
import { Bill, CustomerOrder, InventoryItem } from "../../types";

type DayBookCashTransaction = {
  id: string;
  type: string;
  amount: number;
  workspaceId?: string;
  branchId?: string | number;
  branch?: string | number;
  createdAt?: string;
  timestamp?: string;
};

export const DayBookPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedBranchId } = useBranch();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [bills, setBills] = useState<Bill[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cashTransactions, setCashTransactions] = useState<
    DayBookCashTransaction[]
  >([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "overview",
  );

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedBranchId]);

  const matchesSelectedBranch = (recordBranchId: unknown) => {
    if (!selectedBranchId) return true;
    if (recordBranchId === null || recordBranchId === undefined) return false;
    return String(recordBranchId) === selectedBranchId;
  };

  const getTxDate = (tx: DayBookCashTransaction) => {
    return tx.createdAt || tx.timestamp || "";
  };

  const isCashInType = (type: string) => {
    return type === "in" || type === "cash_in" || type === "sale";
  };

  const isCashOutType = (type: string) => {
    return type === "out" || type === "cash_out" || type === "refund";
  };

  const loadData = () => {
    const allBills = getFromStorage("bills", []);
    const allOrders = getFromStorage("customerOrders", []);
    const allInventory = getFromStorage("inventory", []);
    const allCashTransactions = getFromStorage("cashTransactions", []);

    setBills(
      allBills.filter(
        (b: Bill) =>
          b.workspaceId === currentUser?.workspaceId &&
          matchesSelectedBranch((b as any).branchId),
      ),
    );
    setOrders(
      allOrders.filter(
        (o: CustomerOrder) => o.workspaceId === currentUser?.workspaceId,
      ),
    );
    setInventory(
      allInventory.filter(
        (i: InventoryItem) =>
          i.workspaceId === currentUser?.workspaceId &&
          matchesSelectedBranch((i as any).branchId),
      ),
    );
    setCashTransactions(
      allCashTransactions.filter((ct: DayBookCashTransaction) => {
        const matchesWorkspace = ct.workspaceId === currentUser?.workspaceId;
        if (!matchesWorkspace) return false;

        const branchValue = (ct as any).branchId ?? (ct as any).branch;
        return matchesSelectedBranch(branchValue);
      }),
    );
  };

  // Filter data for selected date
  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const selected = new Date(selectedDate);
    return date.toDateString() === selected.toDateString();
  };

  const todayBills = bills.filter((b) => isToday(b.createdAt));
  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const todayInventory = inventory.filter(
    (i) => i.lastRestocked && isToday(i.lastRestocked),
  );
  const todayCashIn = cashTransactions.filter(
    (ct) => isCashInType(ct.type) && isToday(getTxDate(ct)),
  );
  const todayCashOut = cashTransactions.filter(
    (ct) => isCashOutType(ct.type) && isToday(getTxDate(ct)),
  );

  // Calculate metrics
  const totalIncome =
    todayBills.reduce((sum, b) => sum + b.total, 0) +
    todayOrders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.total, 0);

  const totalExpense = todayCashOut.reduce((sum, ct) => sum + ct.amount, 0);

  const totalProductEntry = todayInventory.length;

  const lowStockProducts = inventory.filter(
    (i) => i.quantity <= i.minStockLevel,
  );

  const totalOrdersToday = todayBills.length + todayOrders.length;

  const totalItemsToday =
    todayBills.reduce(
      (sum, b) => sum + b.items.reduce((s, i) => s + i.quantity, 0),
      0,
    ) +
    todayOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );

  const cashOrders =
    todayBills.filter((b) => b.paymentMethod === "cash").length +
    todayOrders.filter(
      (o) => o.paymentMethod === "cod" || o.paymentMethod === "paid",
    ).length;

  const creditOrders =
    todayBills.filter((b) => b.paymentMethod === "credit").length +
    todayOrders.filter((o) => o.paymentMethod === "credit").length;

  const cardOrders = todayBills.filter(
    (b) => b.paymentMethod === "card",
  ).length;
  const esewaOrders = todayBills.filter(
    (b) => b.paymentMethod === "esewa",
  ).length;
  const fonepayOrders = todayBills.filter(
    (b) => b.paymentMethod === "fonepay",
  ).length;

  const totalCashReceived = todayBills
    .filter((b) => b.paymentMethod === "cash")
    .reduce((sum, b) => sum + b.total, 0);
  const totalCardReceived = todayBills
    .filter((b) => b.paymentMethod === "card")
    .reduce((sum, b) => sum + b.total, 0);
  const totalEsewaReceived = todayBills
    .filter((b) => b.paymentMethod === "esewa")
    .reduce((sum, b) => sum + b.total, 0);
  const totalFonepayReceived = todayBills
    .filter((b) => b.paymentMethod === "fonepay")
    .reduce((sum, b) => sum + b.total, 0);
  const totalCreditAmount = todayBills
    .filter((b) => b.paymentMethod === "credit")
    .reduce((sum, b) => sum + b.total, 0);

  // Get top selling items today
  const itemSales: Record<
    string,
    { name: string; quantity: number; revenue: number }
  > = {};
  todayBills.forEach((bill) => {
    bill.items.forEach((item) => {
      if (!itemSales[item.itemId]) {
        itemSales[item.itemId] = {
          name: item.itemName,
          quantity: 0,
          revenue: 0,
        };
      }
      itemSales[item.itemId].quantity += item.quantity;
      itemSales[item.itemId].revenue += item.total;
    });
  });
  const topItems = Object.values(itemSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const netProfit = totalIncome - totalExpense;
  const profitMargin =
    totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Day Book</h2>
          <p className="text-gray-500 text-sm mt-1">
            Daily business activity and metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Income</p>
              <p className="text-3xl mb-1">Rs{totalIncome.toLocaleString()}</p>
              <p className="text-green-100 text-xs">
                {todayBills.length +
                  todayOrders.filter((o) => o.status === "completed")
                    .length}{" "}
                transactions
              </p>
            </div>
            <div className="w-14 h-14  bg-opacity-20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm mb-1">Total Expense</p>
              <p className="text-3xl mb-1">Rs{totalExpense.toLocaleString()}</p>
              <p className="text-red-100 text-xs">
                {todayCashOut.length} expense entries
              </p>
            </div>
            <div className="w-14 h-14  bg-opacity-20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Net Profit</p>
              <p className="text-3xl mb-1">Rs{netProfit.toLocaleString()}</p>
              <p className="text-blue-100 text-xs">Margin: {profitMargin}%</p>
            </div>
            <div className="w-14 h-14  bg-opacity-20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Orders</p>
              <p className="text-3xl mb-1">{totalOrdersToday}</p>
              <p className="text-purple-100 text-xs">
                {totalItemsToday} items sold
              </p>
            </div>
            <div className="w-14 h-14  bg-opacity-20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New Product Entries */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl text-gray-900">{totalProductEntry}</span>
          </div>
          <p className="text-gray-600 text-sm">New Products Added</p>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl text-orange-600">
              {lowStockProducts.length}
            </span>
          </div>
          <p className="text-gray-600 text-sm">Low Stock Products</p>
        </div>

        {/* Cash Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl text-gray-900">{cashOrders}</span>
          </div>
          <p className="text-gray-600 text-sm">Cash Payments</p>
          <p className="text-green-600 text-xs mt-1">
            Rs{totalCashReceived.toLocaleString()}
          </p>
        </div>

        {/* Credit Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl text-gray-900">{creditOrders}</span>
          </div>
          <p className="text-gray-600 text-sm">Credit Orders</p>
          <p className="text-purple-600 text-xs mt-1">
            Rs{totalCreditAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("payments")}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Receipt className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">Payment Methods Breakdown</span>
          </div>
          {expandedSection === "payments" ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === "payments" && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Cash */}
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 text-sm">
                    {cashOrders} orders
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">Cash</p>
                <p className="text-green-900 text-xl">
                  Rs{totalCashReceived.toLocaleString()}
                </p>
              </div>

              {/* Card */}
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-700 text-sm">
                    {cardOrders} orders
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">Card</p>
                <p className="text-blue-900 text-xl">
                  Rs{totalCardReceived.toLocaleString()}
                </p>
              </div>

              {/* Esewa */}
              <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                  <span className="text-purple-700 text-sm">
                    {esewaOrders} orders
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">Esewa</p>
                <p className="text-purple-900 text-xl">
                  Rs{totalEsewaReceived.toLocaleString()}
                </p>
              </div>

              {/* Fonepay */}
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-700 text-sm">
                    {fonepayOrders} orders
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">Fonepay</p>
                <p className="text-orange-900 text-xl">
                  Rs{totalFonepayReceived.toLocaleString()}
                </p>
              </div>

              {/* Credit */}
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-700 text-sm">
                    {creditOrders} orders
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-1">Credit</p>
                <p className="text-orange-900 text-xl">
                  Rs{totalCreditAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Selling Items Today */}
      {topItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection("topitems")}
            className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">Top Selling Items Today</span>
            </div>
            {expandedSection === "topitems" ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "topitems" && (
            <div className="p-6">
              <div className="space-y-3">
                {topItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-orange-600"
                                : "bg-blue-500"
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-gray-900">{item.name}</p>
                        <p className="text-gray-500 text-sm">
                          {item.quantity} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600">
                        Rs{item.revenue.toLocaleString()}
                      </p>
                      <p className="text-gray-500 text-xs">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Today's Transactions Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("timeline")}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-gray-900">Today's Activity Timeline</span>
          </div>
          {expandedSection === "timeline" ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === "timeline" && (
          <div className="p-6">
            {todayBills.length === 0 && todayOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No transactions for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Bills */}
                {todayBills
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-900">{bill.billNumber}</p>
                            <p className="text-gray-600 text-sm">
                              {bill.customerName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-600">
                              +Rs{bill.total.toLocaleString()}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(bill.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{bill.items.length} items</span>
                          <span>•</span>
                          <span className="uppercase">
                            {bill.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Orders */}
                {todayOrders
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-start space-x-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500"
                    >
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-900">{order.orderNumber}</p>
                            <p className="text-gray-600 text-sm">
                              {order.customerName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-600">
                              +Rs{order.total.toLocaleString()}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(order.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{order.items.length} items</span>
                          <span>•</span>
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Low Stock Products Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-orange-300 overflow-hidden">
          <button
            onClick={() => toggleSection("lowstock")}
            className="w-full px-6 py-4 flex items-center justify-between bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-gray-900">Low Stock Alert</span>
              <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs">
                {lowStockProducts.length} items
              </span>
            </div>
            {expandedSection === "lowstock" ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "lowstock" && (
            <div className="p-6">
              <div className="space-y-2">
                {lowStockProducts.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div>
                      <p className="text-gray-900">{item.name}</p>
                      <p className="text-gray-500 text-sm">{item.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-600">
                        {item.quantity} / {item.minStockLevel} units
                      </p>
                      <p className="text-gray-500 text-xs">
                        Current / Min Stock
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-gray-900 mb-4 flex items-center space-x-2">
          <Banknote className="w-5 h-5 text-gray-600" />
          <span>Daily Summary</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-600 text-sm mb-2">Financial</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Income:</span>
                <span className="text-green-600">
                  +Rs{totalIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Expense:</span>
                <span className="text-red-600">
                  -Rs{totalExpense.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-300">
                <span className="text-gray-900">Net Profit:</span>
                <span
                  className={netProfit >= 0 ? "text-green-600" : "text-red-600"}
                >
                  Rs{netProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-2">Orders & Sales</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="text-gray-900">{totalOrdersToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items Sold:</span>
                <span className="text-gray-900">{totalItemsToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Order Value:</span>
                <span className="text-gray-900">
                  Rs
                  {totalOrdersToday > 0
                    ? Math.round(
                        totalIncome / totalOrdersToday,
                      ).toLocaleString()
                    : 0}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-gray-600 text-sm mb-2">Inventory</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Products Added:</span>
                <span className="text-gray-900">{totalProductEntry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low Stock Items:</span>
                <span className="text-orange-600">
                  {lowStockProducts.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Products:</span>
                <span className="text-gray-900">{inventory.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
