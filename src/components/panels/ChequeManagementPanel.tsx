import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  Building,
  CreditCard,
  Bell,
  BellOff,
  Eye,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Hash,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";
import { Pagination } from "../common/Pagination";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/cheques/`;

export interface Cheque {
  id: string;
  chequeNumber: string;
  bankName: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  type: "issued" | "received";
  status: "pending" | "cleared" | "bounced" | "cancelled";
  partyName: string;
  partyPhone?: string;
  partyAddress?: string;
  accountNumber?: string;
  ifscCode?: string;
  purpose?: string;
  notes?: string;
  reminders: {
    enabled: boolean;
    daysBefore: number[];
    lastNotified?: string;
  };
  workspaceId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  clearedDate?: string;
  bouncedReason?: string;
  cancelledReason?: string;
}

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
  },
  cleared: {
    label: "Cleared",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
  },
  bounced: {
    label: "Bounced",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: XCircle,
  },
};

const TYPE_CONFIG = {
  issued: {
    label: "Issued (Given)",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: ArrowUpRight,
    gradient: "from-red-500 to-pink-600",
  },
  received: {
    label: "Received (Bearer)",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: ArrowDownLeft,
    gradient: "from-green-500 to-emerald-600",
  },
};

export const ChequeManagementPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "issued" | "received">(
    "all",
  );
  const [filterStatus, setFilterStatus] = useState<"all" | Cheque["status"]>(
    "all",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState<Cheque | null>(null);
  const [viewingCheque, setViewingCheque] = useState<Cheque | null>(null);
  const [copiedChequeNumber, setCopiedChequeNumber] = useState<string | null>(
    null,
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [formData, setFormData] = useState({
    chequeNumber: "",
    bankName: "",
    amount: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    type: "received" as "issued" | "received",
    status: "pending" as Cheque["status"],
    partyName: "",
    partyPhone: "",
    partyAddress: "",
    accountNumber: "",
    ifscCode: "",
    purpose: "",
    notes: "",
    remindersEnabled: true,
    reminderDays: [7, 3, 1, 0] as number[],
  });

  useEffect(() => {
    loadCheques();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterStatus]);

  const loadCheques = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      console.log("🔵 Fetching cheques from:", API_URL);
      console.log("🔑 Using token:", token ? "Present" : "Missing");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", errorText);
        throw new Error("Failed to fetch cheques");
      }

      const data = await response.json();
      console.log("✅ Received cheques data:", data);

      // Handle paginated response - extract results array
      const chequesList = data.results || data;

      const mappedCheques: Cheque[] = chequesList.map((item: any) => ({
        id: item.id,
        chequeNumber: item.cheque_number,
        bankName: item.bank_name,
        amount: parseFloat(item.amount),
        issueDate: item.issue_date,
        dueDate: item.due_date,
        type: item.cheque_type,
        status: item.status || "pending",
        partyName: item.party_name,
        partyPhone: item.party_phone,
        partyAddress: item.party_address,
        accountNumber: item.account_number,
        ifscCode: item.ifsc_code,
        purpose: item.purpose,
        notes: item.notes,
        reminders: {
          enabled: !!item.reminder_setting,
          daysBefore: item.reminder_setting
            ? [parseInt(item.reminder_setting)]
            : [],
          lastNotified: item.last_notified,
        },
        workspaceId: currentUser?.workspaceId,
        createdBy: currentUser?.id,
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString(),
      }));

      console.log("📊 Mapped cheques:", mappedCheques.length, "items");
      setCheques(mappedCheques);
    } catch (error) {
      console.error("❌ Error loading cheques:", error);
      popup.showError(
        "Failed to load cheques",
        "Could not fetch data from server",
        "error",
      );
    }
  };

  const checkReminders = () => {
    // Placeholder for reminder logic if needed with API
  };

  const sendChequeReminder = (cheque: Cheque, daysUntilDue: number) => {
    const message =
      daysUntilDue === 0
        ? `Cheque #${cheque.chequeNumber} is due TODAY!`
        : `Cheque #${cheque.chequeNumber} is due in ${daysUntilDue} day(s)`;

    const details = `${
      cheque.type === "issued" ? "Issued to" : "Received from"
    }: ${
      cheque.partyName
    }\nAmount: NPR ${cheque.amount.toLocaleString()}\nDue Date: ${new Date(
      cheque.dueDate,
    ).toLocaleDateString()}`;

    // Create a notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Cheque Reminder", {
        body: `${message}\n${details}`,
        icon: "/icon.png",
        badge: "/badge.png",
      });
    }

    // Also show in-app notification
    popup.showError(
      `${message}\n\n${details}`,
      "🔔 Cheque Reminder",
      "warning",
    );
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const handleOpenSidebar = (cheque?: Cheque) => {
    requestNotificationPermission();

    if (cheque) {
      setFormData({
        chequeNumber: cheque.chequeNumber,
        bankName: cheque.bankName,
        amount: cheque.amount.toString(),
        issueDate: cheque.issueDate,
        dueDate: cheque.dueDate,
        type: cheque.type,
        status: cheque.status,
        partyName: cheque.partyName,
        partyPhone: cheque.partyPhone || "",
        partyAddress: cheque.partyAddress || "",
        accountNumber: cheque.accountNumber || "",
        ifscCode: cheque.ifscCode || "",
        purpose: cheque.purpose || "",
        notes: cheque.notes || "",
        remindersEnabled: cheque.reminders.enabled,
        reminderDays: cheque.reminders.daysBefore,
      });
      setEditingCheque(cheque);
    } else {
      setFormData({
        chequeNumber: "",
        bankName: "",
        amount: "",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        type: "received",
        status: "pending",
        partyName: "",
        partyPhone: "",
        partyAddress: "",
        accountNumber: "",
        ifscCode: "",
        purpose: "",
        notes: "",
        remindersEnabled: true,
        reminderDays: [7, 3, 1, 0],
      });
      setEditingCheque(null);
    }
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setEditingCheque(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.chequeNumber ||
      !formData.bankName ||
      !formData.amount ||
      !formData.dueDate ||
      !formData.partyName
    ) {
      popup.showError(
        "Please fill in all required fields: Cheque Number, Bank Name, Amount, Due Date, and Party Name.",
        "Missing Information",
        "warning",
      );
      return;
    }

    const payload = {
      cheque_type: formData.type,
      cheque_number: formData.chequeNumber,
      bank_name: formData.bankName,
      amount: formData.amount,
      issue_date: formData.issueDate,
      due_date: formData.dueDate,
      party_name: formData.partyName,
      party_phone: formData.partyPhone,
      party_address: formData.partyAddress,
      account_number: formData.accountNumber,
      ifsc_code: formData.ifscCode,
      purpose: formData.purpose,
      notes: formData.notes,
      reminder_setting:
        formData.remindersEnabled && formData.reminderDays.length > 0
          ? formData.reminderDays[0].toString()
          : "0",
      status: formData.status,
    };

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");
      if (editingCheque) {
        // Update existing cheque
        const response = await fetch(`${API_URL}${editingCheque.id}/`, {
          method: "PATCH", // or PUT
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to update cheque");
        popup.showSuccess(
          "Cheque Updated",
          "The cheque has been successfully updated.",
        );
      } else {
        // Create new cheque
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to create cheque");
        popup.showSuccess(
          "Cheque Added",
          "The cheque has been successfully added to your records.",
        );
      }

      loadCheques();
      handleCloseSidebar();
    } catch (error) {
      console.error("Error saving cheque:", error);
      popup.showError(
        "Operation Failed",
        "Could not save cheque details.",
        "error",
      );
    }
  };

  const handleDelete = (chequeId: string) => {
    popup.showConfirm(
      "Delete Cheque",
      "Are you sure you want to delete this cheque record? This action cannot be undone.",
      async () => {
        try {
          const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("access_token") ||
            localStorage.getItem("token");
          const response = await fetch(`${API_URL}${chequeId}/`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) throw new Error("Failed to delete cheque");

          setViewingCheque(null);
          loadCheques();
          popup.showSuccess(
            "Cheque Deleted",
            "The cheque record has been successfully deleted.",
          );
        } catch (error) {
          console.error("Error deleting cheque:", error);
          popup.showError(
            "Delete Failed",
            "Could not delete the cheque record.",
            "error",
          );
        }
      },
    );
  };

  const toggleReminderDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      reminderDays: prev.reminderDays.includes(day)
        ? prev.reminderDays.filter((d) => d !== day)
        : [...prev.reminderDays, day].sort((a, b) => b - a),
    }));
  };

  const exportCheques = () => {
    if (filteredCheques.length === 0) {
      popup.showError(
        "No cheques to export. Please add cheques first.",
        "No Data",
        "warning",
      );
      return;
    }

    const csvData = filteredCheques.map((cheque) => ({
      "Cheque Number": cheque.chequeNumber,
      "Bank Name": cheque.bankName,
      "Amount (NPR)": cheque.amount,
      Type: cheque.type === "issued" ? "Issued (Given)" : "Received (Bearer)",
      Status: cheque.status,
      "Party Name": cheque.partyName,
      "Party Phone": cheque.partyPhone || "",
      "Issue Date": new Date(cheque.issueDate).toLocaleDateString(),
      "Due Date": new Date(cheque.dueDate).toLocaleDateString(),
      Purpose: cheque.purpose || "",
      Notes: cheque.notes || "",
    }));

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cheques_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    popup.showSuccess(
      "Export Complete",
      "Cheques have been exported successfully!",
    );
  };

  const copyToClipboard = (text: string, chequeNumber: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedChequeNumber(chequeNumber);
      setTimeout(() => setCopiedChequeNumber(null), 2000);
    });
  };

  const filteredCheques = cheques.filter((c) => {
    const matchesSearch =
      c.chequeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bankName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || c.type === filterType;
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCheques.length / itemsPerPage);
  const paginatedCheques = filteredCheques.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Statistics
  const stats = {
    totalIssued: cheques
      .filter((c) => c.type === "issued")
      .reduce((sum, c) => sum + c.amount, 0),
    totalReceived: cheques
      .filter((c) => c.type === "received")
      .reduce((sum, c) => sum + c.amount, 0),
    pendingIssued: cheques
      .filter((c) => c.type === "issued" && c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0),
    pendingReceived: cheques
      .filter((c) => c.type === "received" && c.status === "pending")
      .reduce((sum, c) => sum + c.amount, 0),
    totalCount: cheques.length,
    pendingCount: cheques.filter((c) => c.status === "pending").length,
  };

  // Get upcoming reminders
  const upcomingReminders = cheques
    .filter((c) => c.status === "pending" && c.reminders.enabled)
    .map((c) => {
      const daysUntilDue = Math.floor(
        (new Date(c.dueDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return { ...c, daysUntilDue };
    })
    .filter((c) => c.daysUntilDue >= 0 && c.daysUntilDue <= 7)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl mb-1">Cheque Management</h3>
          <p className="text-gray-500 text-sm">
            Track issued and received cheques with automated reminders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportCheques}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => handleOpenSidebar()}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Add Cheque</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-red-700 mb-1">Issued (Given)</p>
          <p className="text-2xl font-bold text-red-900">
            NPR {stats.totalIssued.toLocaleString()}
          </p>
          <p className="text-xs text-red-600 mt-2">
            Pending: NPR {stats.pendingIssued.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6 text-white" />
            </div>
            <TrendingDown className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-green-700 mb-1">Received (Bearer)</p>
          <p className="text-2xl font-bold text-green-900">
            NPR {stats.totalReceived.toLocaleString()}
          </p>
          <p className="text-xs text-green-600 mt-2">
            Pending: NPR {stats.pendingReceived.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <Wallet className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-sm text-amber-700 mb-1">Total Cheques</p>
          <p className="text-2xl font-bold text-amber-900">
            {stats.totalCount}
          </p>
          <p className="text-xs text-amber-600 mt-2">
            Pending: {stats.pendingCount}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <AlertCircle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm text-blue-700 mb-1">Upcoming Reminders</p>
          <p className="text-2xl font-bold text-blue-900">
            {upcomingReminders.length}
          </p>
          <p className="text-xs text-blue-600 mt-2">Next 7 days</p>
        </div>
      </div>

      {/* Upcoming Reminders Alert */}
      {upcomingReminders.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-2 border-amber-400 rounded-xl p-5 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-900 text-lg mb-2">
                🔔 Upcoming Cheque Due Dates
              </h3>
              <div className="space-y-2">
                {upcomingReminders.slice(0, 3).map((cheque) => (
                  <div
                    key={cheque.id}
                    className="bg-white/60 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        Cheque #{cheque.chequeNumber} - {cheque.partyName}
                      </p>
                      <p className="text-sm text-gray-700">
                        NPR {cheque.amount.toLocaleString()} •{" "}
                        {cheque.type === "issued"
                          ? "Issued to"
                          : "Received from"}{" "}
                        {cheque.partyName}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        cheque.daysUntilDue === 0
                          ? "bg-red-500 text-white animate-pulse"
                          : cheque.daysUntilDue <= 3
                            ? "bg-orange-500 text-white"
                            : "bg-yellow-500 text-white"
                      }`}
                    >
                      {cheque.daysUntilDue === 0
                        ? "DUE TODAY!"
                        : `${cheque.daysUntilDue} days`}
                    </div>
                  </div>
                ))}
              </div>
              {upcomingReminders.length > 3 && (
                <p className="text-sm text-amber-700 mt-2">
                  +{upcomingReminders.length - 3} more upcoming cheques
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by cheque number, party name, or bank..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Types</option>
              <option value="issued">Issued (Given)</option>
              <option value="received">Received (Bearer)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="cleared">Cleared</option>
              <option value="bounced">Bounced</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cheques Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredCheques.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Cheque #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Party Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Bank
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Amount (NPR)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Reminder
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedCheques.map((cheque) => {
                    const StatusIcon = STATUS_CONFIG[cheque.status].icon;
                    const TypeIcon = TYPE_CONFIG[cheque.type].icon;
                    const daysUntilDue = Math.floor(
                      (new Date(cheque.dueDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    const isOverdue =
                      daysUntilDue < 0 && cheque.status === "pending";
                    const isDueSoon =
                      daysUntilDue >= 0 &&
                      daysUntilDue <= 7 &&
                      cheque.status === "pending";

                    return (
                      <tr
                        key={cheque.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isOverdue
                            ? "bg-red-50"
                            : isDueSoon
                              ? "bg-amber-50"
                              : ""
                        }`}
                      >
                        {/* Cheque Number */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <span className="font-mono font-semibold text-gray-900">
                              {cheque.chequeNumber}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  cheque.chequeNumber,
                                  cheque.chequeNumber,
                                )
                              }
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Copy cheque number"
                            >
                              {copiedChequeNumber === cheque.chequeNumber ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                              TYPE_CONFIG[cheque.type].color
                            }`}
                          >
                            <TypeIcon className="w-3.5 h-3.5" />
                            <span>
                              {cheque.type === "issued" ? "Issued" : "Received"}
                            </span>
                          </div>
                        </td>

                        {/* Party Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                {cheque.partyName}
                              </p>
                              {cheque.partyPhone && (
                                <p className="text-xs text-gray-500">
                                  {cheque.partyPhone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Bank */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {cheque.bankName}
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-gray-900">
                              {cheque.amount.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        {/* Issue Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>
                              {new Date(cheque.issueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </td>

                        {/* Due Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                              <Calendar
                                className={`w-4 h-4 ${
                                  isOverdue
                                    ? "text-red-600"
                                    : isDueSoon
                                      ? "text-amber-600"
                                      : "text-gray-400"
                                }`}
                              />
                              <span
                                className={`text-sm font-medium ${
                                  isOverdue
                                    ? "text-red-700"
                                    : isDueSoon
                                      ? "text-amber-700"
                                      : "text-gray-700"
                                }`}
                              >
                                {new Date(cheque.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                            {isOverdue && (
                              <span className="text-xs font-bold text-red-600 mt-1 animate-pulse">
                                OVERDUE!
                              </span>
                            )}
                            {isDueSoon && !isOverdue && (
                              <span className="text-xs font-bold text-amber-600 mt-1">
                                {daysUntilDue === 0
                                  ? "DUE TODAY"
                                  : `${daysUntilDue}d left`}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div
                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                              STATUS_CONFIG[cheque.status].color
                            }`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{STATUS_CONFIG[cheque.status].label}</span>
                          </div>
                        </td>

                        {/* Reminder */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {cheque.reminders.enabled ? (
                            <div className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">
                              <Bell className="w-3 h-3" />
                              <span>ON</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                              <BellOff className="w-3 h-3" />
                              <span>OFF</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setViewingCheque(cheque)}
                              className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenSidebar(cheque)}
                              className="p-2 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cheque.id)}
                              className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredCheques.length)}{" "}
                  of {filteredCheques.length} cheques
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Cheques Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType !== "all" || filterStatus !== "all"
                ? "No cheques match your filters. Try adjusting your search."
                : "Get started by adding your first cheque."}
            </p>
            {!searchQuery && filterType === "all" && filterStatus === "all" && (
              <button
                onClick={() => handleOpenSidebar()}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 shadow-lg transition-all"
              >
                Add Your First Cheque
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-white h-full w-full max-w-2xl shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6 shadow-lg z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {editingCheque ? "Edit Cheque" : "Add New Cheque"}
                  </h3>
                  <p className="text-amber-100 text-sm">
                    {editingCheque
                      ? "Update cheque details"
                      : "Add a new cheque to your records"}
                  </p>
                </div>
                <button
                  onClick={handleCloseSidebar}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Cheque Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cheque Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(["issued", "received"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.type === type
                          ? `${TYPE_CONFIG[type].color} border-current shadow-lg`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {React.createElement(TYPE_CONFIG[type].icon, {
                          className: "w-5 h-5",
                        })}
                        <span className="font-medium">
                          {TYPE_CONFIG[type].label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cheque Number & Bank */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cheque Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.chequeNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, chequeNumber: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="123456"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g., Nabil Bank"
                    required
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (NPR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="10000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, issueDate: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Party Details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Party Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.partyName}
                  onChange={(e) =>
                    setFormData({ ...formData, partyName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder={
                    formData.type === "issued"
                      ? "Recipient name"
                      : "Issuer name"
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Party Phone
                  </label>
                  <input
                    type="text"
                    value={formData.partyPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, partyPhone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="+977-9801234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as Cheque["status"],
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="cleared">Cleared</option>
                    <option value="bounced">Bounced</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Party Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Party Address
                </label>
                <input
                  type="text"
                  value={formData.partyAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, partyAddress: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Full address"
                />
              </div>

              {/* Account Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) =>
                      setFormData({ ...formData, ifscCode: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Optional"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purpose
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Payment for goods, Loan repayment"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Reminder Settings */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      Reminder Settings
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        remindersEnabled: !formData.remindersEnabled,
                      })
                    }
                    className={`px-4 py-2 rounded-lg transition-all ${
                      formData.remindersEnabled
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {formData.remindersEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {formData.remindersEnabled && (
                  <div>
                    <p className="text-sm text-gray-700 mb-3">
                      Get reminded before the cheque due date:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[7, 3, 1, 0].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleReminderDay(day)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.reminderDays.includes(day)
                              ? "bg-blue-600 text-white shadow-lg"
                              : "bg-white text-gray-700 border border-gray-300"
                          }`}
                        >
                          {day === 0
                            ? "Same day"
                            : `${day} day${day > 1 ? "s" : ""}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseSidebar}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  {editingCheque ? "Update Cheque" : "Add Cheque"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingCheque && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div
              className={`bg-gradient-to-r ${
                TYPE_CONFIG[viewingCheque.type].gradient
              } p-6 text-white`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold">Cheque Details</h3>
                <button
                  onClick={() => setViewingCheque(null)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-white/90">#{viewingCheque.chequeNumber}</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Amount Highlight */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 text-center">
                <p className="text-sm text-amber-700 mb-2">Amount</p>
                <p className="text-4xl font-bold text-amber-900">
                  NPR {viewingCheque.amount.toLocaleString()}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <div
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg ${
                      TYPE_CONFIG[viewingCheque.type].color
                    }`}
                  >
                    {React.createElement(TYPE_CONFIG[viewingCheque.type].icon, {
                      className: "w-4 h-4",
                    })}
                    <span className="font-medium">
                      {TYPE_CONFIG[viewingCheque.type].label}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <div
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg border ${
                      STATUS_CONFIG[viewingCheque.status].color
                    }`}
                  >
                    {React.createElement(
                      STATUS_CONFIG[viewingCheque.status].icon,
                      { className: "w-4 h-4" },
                    )}
                    <span className="font-medium">
                      {STATUS_CONFIG[viewingCheque.status].label}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                  <p className="font-semibold text-gray-900">
                    {viewingCheque.bankName}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Party Name</p>
                  <p className="font-semibold text-gray-900">
                    {viewingCheque.partyName}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(viewingCheque.issueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Due Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(viewingCheque.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Optional Fields */}
              {viewingCheque.partyPhone && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Party Phone</p>
                  <p className="font-semibold text-gray-900">
                    {viewingCheque.partyPhone}
                  </p>
                </div>
              )}

              {viewingCheque.partyAddress && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Party Address</p>
                  <p className="font-semibold text-gray-900">
                    {viewingCheque.partyAddress}
                  </p>
                </div>
              )}

              {viewingCheque.purpose && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Purpose</p>
                  <p className="font-semibold text-gray-900">
                    {viewingCheque.purpose}
                  </p>
                </div>
              )}

              {viewingCheque.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-900">{viewingCheque.notes}</p>
                </div>
              )}

              {/* Reminder Info */}
              {viewingCheque.reminders.enabled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <p className="font-semibold text-blue-900">
                      Reminders Enabled
                    </p>
                  </div>
                  <p className="text-sm text-blue-700">
                    You will be reminded{" "}
                    {viewingCheque.reminders.daysBefore
                      .map((d) =>
                        d === 0
                          ? "on the due date"
                          : `${d} day${d > 1 ? "s" : ""} before`,
                      )
                      .join(", ")}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleOpenSidebar(viewingCheque);
                    setViewingCheque(null);
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Edit Cheque
                </button>
                <button
                  onClick={() => {
                    handleDelete(viewingCheque.id);
                    setViewingCheque(null);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
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
