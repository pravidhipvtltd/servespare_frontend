import React, { useState, useEffect, useRef } from "react";
import {
  RotateCcw,
  Search,
  Package,
  AlertCircle,
  Calendar,
  Clock,
  User,
  ShoppingCart,
  ArrowLeft,
  Check,
  X,
  FileText,
  Shield,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  DollarSign,
  TrendingDown,
  CheckCircle,
  XCircle,
  Loader,
  ArrowRight,
  Info,
  MessageSquare,
  Truck,
  AlertTriangle,
  ChevronRight,
  Eye,
} from "lucide-react";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { Bill, InventoryItem } from "../../types";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";

type ReturnStatus =
  | "initiated"
  | "approved"
  | "supplier_notified"
  | "resolved"
  | "rejected";
type ReturnType = "return" | "replace" | "refund";
type ItemCondition = "new" | "damaged" | "wrong_item";

interface ReturnRequest {
  id: string;
  returnNumber: string;
  billId: string;
  billNumber: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  originalPrice: number;
  type: ReturnType;
  reason: string;
  condition: ItemCondition;
  refundAmount: number;
  images: string[];
  status: ReturnStatus;
  timeline: TimelineEvent[];
  createdAt: string;
  workspaceId?: string;
  createdBy?: string;
  notes?: string;
}

interface TimelineEvent {
  id: string;
  status: ReturnStatus;
  label: string;
  timestamp: string;
  user?: string;
  notes?: string;
}

const RETURN_REASONS = [
  "Defective Product",
  "Wrong Item Received",
  "Not as Described",
  "Changed Mind",
  "Better Price Elsewhere",
  "Ordered by Mistake",
  "Product Damaged",
  "Missing Parts",
  "Quality Issues",
  "Other",
];

const CONDITION_OPTIONS: {
  value: ItemCondition;
  label: string;
  color: string;
}[] = [
  {
    value: "new",
    label: "New / Unused",
    color: "bg-green-50 border-green-200 text-green-700",
  },
  {
    value: "damaged",
    label: "Damaged",
    color: "bg-red-50 border-red-200 text-red-700",
  },
  {
    value: "wrong_item",
    label: "Wrong Item",
    color: "bg-yellow-50 border-yellow-200 text-yellow-700",
  },
];

const STATUS_STEPS: { id: ReturnStatus; label: string; icon: any }[] = [
  { id: "initiated", label: "Initiated", icon: FileText },
  { id: "approved", label: "Approved", icon: CheckCircle },
  { id: "supplier_notified", label: "Supplier Notified", icon: Truck },
  { id: "resolved", label: "Resolved", icon: Check },
];

export const ReturnRefundPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [viewMode, setViewMode] = useState<"list" | "create" | "details">(
    "list"
  );
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(
    null
  );
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [returnType, setReturnType] = useState<ReturnType>("return");
  const [reason, setReason] = useState("");
  const [condition, setCondition] = useState<ItemCondition>("new");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allBills = getFromStorage("bills", []).filter(
      (b: Bill) =>
        b.workspaceId === currentUser?.workspaceId && b.paymentStatus === "paid"
    );
    setBills(allBills);

    const allInventory = getFromStorage("inventory", []).filter(
      (i: InventoryItem) => i.workspaceId === currentUser?.workspaceId
    );
    setInventory(allInventory);

    const allReturns = getFromStorage("returnRequests", []).filter(
      (r: ReturnRequest) => r.workspaceId === currentUser?.workspaceId
    );
    setReturnRequests(allReturns);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name);
      setImages([...images, ...fileNames]);
    }
  };

  const calculateRefund = () => {
    if (!selectedProduct) return 0;

    let refundAmount = selectedProduct.mrp * quantity;

    // Reduce refund if damaged
    if (condition === "damaged") {
      refundAmount *= 0.7; // 30% reduction for damaged items
    } else if (condition === "wrong_item") {
      refundAmount *= 1.0; // Full refund for wrong item
    }

    return Math.round(refundAmount);
  };

  const createReturnRequest = () => {
    if (!selectedBill || !selectedProduct) {
      popup.showError("Please select a bill and product", "Validation Error");
      return;
    }

    if (!reason) {
      popup.showError("Please select a reason", "Validation Error");
      return;
    }

    const refundAmount = calculateRefund();

    const newRequest: ReturnRequest = {
      id: Date.now().toString(),
      returnNumber: `RET-${Date.now().toString().slice(-6)}`,
      billId: selectedBill.id,
      billNumber: selectedBill.billNumber,
      customerName: selectedBill.customerName,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      originalPrice: selectedProduct.mrp,
      type: returnType,
      reason,
      condition,
      refundAmount,
      images,
      status: "initiated",
      timeline: [
        {
          id: Date.now().toString(),
          status: "initiated",
          label: "Return request created",
          timestamp: new Date().toISOString(),
          user: currentUser?.name,
        },
      ],
      createdAt: new Date().toISOString(),
      workspaceId: currentUser?.workspaceId,
      createdBy: currentUser?.id,
      notes,
    };

    const allReturns = getFromStorage("returnRequests", []);
    saveToStorage("returnRequests", [...allReturns, newRequest]);

    loadData();
    resetForm();
    setViewMode("list");
  };

  const resetForm = () => {
    setSelectedBill(null);
    setSelectedProduct(null);
    setReturnType("return");
    setReason("");
    setCondition("new");
    setQuantity(1);
    setNotes("");
    setImages([]);
  };

  const updateReturnStatus = (
    request: ReturnRequest,
    newStatus: ReturnStatus,
    notes?: string
  ) => {
    const allReturns = getFromStorage("returnRequests", []);
    const updated = allReturns.map((r: ReturnRequest) => {
      if (r.id === request.id) {
        const newTimeline: TimelineEvent = {
          id: Date.now().toString(),
          status: newStatus,
          label: getStatusLabel(newStatus),
          timestamp: new Date().toISOString(),
          user: currentUser?.name,
          notes,
        };
        return {
          ...r,
          status: newStatus,
          timeline: [...r.timeline, newTimeline],
        };
      }
      return r;
    });
    saveToStorage("returnRequests", updated);
    loadData();

    if (selectedRequest?.id === request.id) {
      const updatedRequest = updated.find(
        (r: ReturnRequest) => r.id === request.id
      );
      setSelectedRequest(updatedRequest || null);
    }
  };

  const getStatusLabel = (status: ReturnStatus): string => {
    switch (status) {
      case "initiated":
        return "Return request initiated";
      case "approved":
        return "Request approved by manager";
      case "supplier_notified":
        return "Supplier has been notified";
      case "resolved":
        return "Return completed successfully";
      case "rejected":
        return "Request rejected";
      default:
        return status;
    }
  };

  const getStatusColor = (status: ReturnStatus): string => {
    switch (status) {
      case "resolved":
        return "text-green-600 bg-green-50 border-green-200";
      case "approved":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "supplier_notified":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "initiated":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTimelineColor = (status: ReturnStatus): string => {
    switch (status) {
      case "resolved":
        return "from-green-400 to-green-600";
      case "approved":
        return "from-blue-400 to-blue-600";
      case "supplier_notified":
        return "from-purple-400 to-purple-600";
      case "initiated":
        return "from-yellow-400 to-yellow-600";
      case "rejected":
        return "from-red-400 to-red-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const filteredBills = bills.filter(
    (bill) =>
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReturns = returnRequests.filter(
    (r) =>
      r.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConditionIcon = (condition: ItemCondition) => {
    switch (condition) {
      case "new":
        return <CheckCircle className="w-4 h-4" />;
      case "damaged":
        return <XCircle className="w-4 h-4" />;
      case "wrong_item":
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl mb-1">
            Return, Refund & Replacement
          </h3>
          <p className="text-gray-500 text-sm">
            Manage product returns and refund requests
          </p>
        </div>
        {viewMode === "list" && (
          <button
            onClick={() => {
              resetForm();
              setViewMode("create");
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>New Return Request</span>
          </button>
        )}
        {viewMode !== "list" && (
          <button
            onClick={() => {
              resetForm();
              setViewMode("list");
              setSelectedRequest(null);
            }}
            className="flex items-center space-x-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to List</span>
          </button>
        )}
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by return number, customer name, or product..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <Loader className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-gray-600 text-sm mb-1">Pending</div>
              <div className="text-gray-900 text-2xl font-semibold">
                {returnRequests.filter((r) => r.status === "initiated").length}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-gray-600 text-sm mb-1">Approved</div>
              <div className="text-gray-900 text-2xl font-semibold">
                {
                  returnRequests.filter(
                    (r) =>
                      r.status === "approved" ||
                      r.status === "supplier_notified"
                  ).length
                }
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-gray-600 text-sm mb-1">Resolved</div>
              <div className="text-gray-900 text-2xl font-semibold">
                {returnRequests.filter((r) => r.status === "resolved").length}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-red-400 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <X className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-gray-600 text-sm mb-1">Rejected</div>
              <div className="text-gray-900 text-2xl font-semibold">
                {returnRequests.filter((r) => r.status === "rejected").length}
              </div>
            </div>
          </div>

          {/* Returns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReturns.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                onClick={() => {
                  setSelectedRequest(request);
                  setViewMode("details");
                }}
              >
                {/* Status Header */}
                <div
                  className={`px-4 py-3 border-b-2 ${getStatusColor(
                    request.status
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {request.returnNumber}
                    </span>
                    <span className="text-xs uppercase tracking-wide">
                      {request.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-gray-900 font-semibold truncate">
                        {request.productName}
                      </h4>
                      <p className="text-gray-500 text-sm">
                        {request.customerName}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bill:</span>
                      <span className="text-gray-900 font-medium">
                        {request.billNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900 font-medium capitalize">
                        {request.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="text-gray-900 font-medium">
                        {request.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Refund:</span>
                      <span className="text-orange-600 font-bold">
                        Rs{request.refundAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                      CONDITION_OPTIONS.find(
                        (c) => c.value === request.condition
                      )?.color
                    }`}
                  >
                    {getConditionIcon(request.condition)}
                    <span className="font-medium">
                      {
                        CONDITION_OPTIONS.find(
                          (c) => c.value === request.condition
                        )?.label
                      }
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                    <button className="text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-1">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredReturns.length === 0 && (
              <div className="col-span-full text-center py-12">
                <RotateCcw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No return requests found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Return View */}
      {viewMode === "create" && (
        <div className="space-y-6">
          {/* Step 1: Select Bill */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h4 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-orange-600" />
              <span>Step 1: Select Bill</span>
            </h4>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by bill number or customer name..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
              {filteredBills.map((bill) => (
                <button
                  key={bill.id}
                  onClick={() => setSelectedBill(bill)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedBill?.id === bill.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-900 font-medium">
                      {bill.billNumber}
                    </span>
                    {selectedBill?.id === bill.id && (
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {bill.customerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Rs{bill.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Select Product */}
          {selectedBill && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="text-gray-900 font-semibold mb-4 flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-600" />
                <span>Step 2: Select Product from Bill</span>
              </h4>

              <div className="space-y-3">
                {selectedBill.items.map((item) => {
                  const product = inventory.find((p) => p.id === item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => product && setSelectedProduct(product)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedProduct?.id === item.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-900 font-medium">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Qty: {item.quantity} × Rs
                            {item.price.toLocaleString()}
                          </div>
                        </div>
                        {selectedProduct?.id === item.id && (
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Return Details */}
          {selectedProduct && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="text-gray-900 font-semibold mb-6 flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-orange-600" />
                <span>Step 3: Return Details</span>
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Return Type */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-3">
                      Return Type
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setReturnType("return")}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          returnType === "return"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <RotateCcw className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">Return</div>
                      </button>
                      <button
                        onClick={() => setReturnType("replace")}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          returnType === "replace"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <RefreshCw className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">Replace</div>
                      </button>
                      <button
                        onClick={() => setReturnType("refund")}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          returnType === "refund"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <DollarSign className="w-5 h-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">Refund</div>
                      </button>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Reason
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select a reason</option>
                      {RETURN_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-3">
                      Item Condition
                    </label>
                    <div className="space-y-2">
                      {CONDITION_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setCondition(opt.value)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            condition === opt.value
                              ? `${opt.color} border-current`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {getConditionIcon(opt.value)}
                            <span className="font-medium">{opt.label}</span>
                            {condition === opt.value && (
                              <CheckCircle className="w-5 h-5 ml-auto" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Quantity to Return
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, Number(e.target.value)))
                      }
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Upload Images
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-gray-600 hover:text-orange-600"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-medium">Upload product images</div>
                      <div className="text-sm">
                        Photos of the item condition
                      </div>
                    </button>

                    {images.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {images.map((img, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <ImageIcon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">
                                {img}
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                setImages(images.filter((_, i) => i !== index))
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional details about the return..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Refund Calculation */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                    <h5 className="text-gray-900 font-semibold mb-4">
                      Refund Calculation
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Original Price:</span>
                        <span className="text-gray-900 font-medium">
                          Rs{selectedProduct.mrp.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Quantity:</span>
                        <span className="text-gray-900 font-medium">
                          {quantity}
                        </span>
                      </div>
                      {condition === "damaged" && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">
                            Damage Deduction (30%):
                          </span>
                          <span className="text-red-600 font-medium">
                            -Rs
                            {Math.round(
                              selectedProduct.mrp * quantity * 0.3
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="pt-3 border-t-2 border-orange-300 flex items-center justify-between">
                        <span className="text-gray-900 font-semibold">
                          Refund Amount:
                        </span>
                        <span className="text-orange-600 font-bold text-xl">
                          Rs{calculateRefund().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={createReturnRequest}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Submit Return Request
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details View */}
      {viewMode === "details" && selectedRequest && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-3xl font-bold mb-2">
                  {selectedRequest.returnNumber}
                </h3>
                <p className="text-orange-100">
                  Return request details and timeline
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-xl font-semibold ${
                  selectedRequest.status === "resolved"
                    ? "bg-green-500"
                    : selectedRequest.status === "rejected"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {selectedRequest.status.replace("_", " ").toUpperCase()}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-orange-100">
              <div>
                <div className="text-sm mb-1">Customer</div>
                <div className="text-white font-semibold">
                  {selectedRequest.customerName}
                </div>
              </div>
              <div>
                <div className="text-sm mb-1">Product</div>
                <div className="text-white font-semibold">
                  {selectedRequest.productName}
                </div>
              </div>
              <div>
                <div className="text-sm mb-1">Refund Amount</div>
                <div className="text-white font-semibold text-xl">
                  Rs{selectedRequest.refundAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h4 className="text-gray-900 font-semibold mb-6 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span>Timeline Tracker</span>
                </h4>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                  {/* Timeline Events */}
                  <div className="space-y-6">
                    {selectedRequest.timeline.map((event, index) => (
                      <div key={event.id} className="relative pl-16">
                        {/* Timeline Dot */}
                        <div
                          className={`absolute left-0 w-12 h-12 rounded-full bg-gradient-to-br ${getTimelineColor(
                            event.status
                          )} flex items-center justify-center text-white shadow-lg`}
                        >
                          {STATUS_STEPS.find((s) => s.id === event.status)
                            ?.icon ? (
                            React.createElement(
                              STATUS_STEPS.find((s) => s.id === event.status)!
                                .icon,
                              { className: "w-6 h-6" }
                            )
                          ) : (
                            <Check className="w-6 h-6" />
                          )}
                        </div>

                        {/* Event Content */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-gray-900 font-semibold">
                              {event.label}
                            </h5>
                            <span className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {event.user && (
                            <div className="text-sm text-gray-600 mb-1">
                              By: {event.user}
                            </div>
                          )}
                          {event.notes && (
                            <div className="text-sm text-gray-600 bg-white p-3 rounded-lg mt-2">
                              {event.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Details */}
            <div className="space-y-6">
              {/* Request Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h4 className="text-gray-900 font-semibold mb-4">
                  Request Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Bill Number
                    </div>
                    <div className="text-gray-900 font-medium">
                      {selectedRequest.billNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      Return Type
                    </div>
                    <div className="text-gray-900 font-medium capitalize">
                      {selectedRequest.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Reason</div>
                    <div className="text-gray-900 font-medium">
                      {selectedRequest.reason}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Quantity</div>
                    <div className="text-gray-900 font-medium">
                      {selectedRequest.quantity}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Condition</div>
                    <div
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg text-sm ${
                        CONDITION_OPTIONS.find(
                          (c) => c.value === selectedRequest.condition
                        )?.color
                      }`}
                    >
                      {getConditionIcon(selectedRequest.condition)}
                      <span className="font-medium">
                        {
                          CONDITION_OPTIONS.find(
                            (c) => c.value === selectedRequest.condition
                          )?.label
                        }
                      </span>
                    </div>
                  </div>
                  {selectedRequest.notes && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Notes</div>
                      <div className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                        {selectedRequest.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedRequest.status !== "resolved" &&
                selectedRequest.status !== "rejected" && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h4 className="text-gray-900 font-semibold mb-4">
                      Actions
                    </h4>
                    <div className="space-y-3">
                      {selectedRequest.status === "initiated" && (
                        <>
                          <button
                            onClick={() =>
                              updateReturnStatus(
                                selectedRequest,
                                "approved",
                                "Return request approved by manager"
                              )
                            }
                            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-medium shadow-lg hover:shadow-xl transition-all"
                          >
                            Approve Request
                          </button>
                          <button
                            onClick={() =>
                              updateReturnStatus(
                                selectedRequest,
                                "rejected",
                                "Return request rejected"
                              )
                            }
                            className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 font-medium shadow-lg hover:shadow-xl transition-all"
                          >
                            Reject Request
                          </button>
                        </>
                      )}
                      {selectedRequest.status === "approved" && (
                        <button
                          onClick={() =>
                            updateReturnStatus(
                              selectedRequest,
                              "supplier_notified",
                              "Supplier has been notified about the return"
                            )
                          }
                          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                          Notify Supplier
                        </button>
                      )}
                      {selectedRequest.status === "supplier_notified" && (
                        <button
                          onClick={() =>
                            updateReturnStatus(
                              selectedRequest,
                              "resolved",
                              "Return completed successfully"
                            )
                          }
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                )}

              {/* Images */}
              {selectedRequest.images.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h4 className="text-gray-900 font-semibold mb-4">
                    Uploaded Images
                  </h4>
                  <div className="space-y-2">
                    {selectedRequest.images.map((img, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                      >
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 flex-1">
                          {img}
                        </span>
                        <Eye className="w-4 h-4 text-blue-600 cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
