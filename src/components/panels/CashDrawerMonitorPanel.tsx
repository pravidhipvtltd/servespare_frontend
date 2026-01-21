import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Eye,
  Flag,
  XCircle,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Building2,
} from "lucide-react";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { CashDrawerShift, CashTransaction } from "../../types";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-700 border-blue-300",
  closed: "bg-gray-100 text-gray-700 border-gray-300",
  force_closed: "bg-red-100 text-red-700 border-red-300",
  transferred: "bg-purple-100 text-purple-700 border-purple-300",
};

const STATUS_LABELS = {
  open: "Open",
  closed: "Closed",
  force_closed: "Force Closed",
  transferred: "Transferred",
};

export const CashDrawerMonitorPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [shifts, setShifts] = useState<CashDrawerShift[]>([]);
  const [apiShifts, setApiShifts] = useState<CashDrawerShift[]>([]);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedShift, setSelectedShift] = useState<CashDrawerShift | null>(
    null,
  );
  const [viewingSidebar, setViewingSidebar] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [shiftToFlag, setShiftToFlag] = useState<CashDrawerShift | null>(null);

  useEffect(() => {
    loadShifts(); // Keeps mock data for stats if needed
    fetchApiShifts(); // New API call for the list
    loadBranches();
  }, [currentUser]);

  const fetchApiShifts = async () => {
    if (!currentUser) return;
    setLoading(true);
    toast.error("apiii", {
      description: "Backend shift monitor API integration in progress",
      duration: 10000,
    });
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/shifts/`,
        { headers },
      );
      if (!res.ok) throw new Error(`API responded with ${res.status}`);
      const data = await res.json();
      const results = data.results || [];

      // Map API results to CashDrawerShift type
      const mappedShifts: CashDrawerShift[] = results.map((it: any) => ({
        id: String(it.id),
        cashierId: String(it.cashier),
        cashierName: it.cashier_name || "Unknown Cashier",
        branchId: String(it.branch),
        branchName:
          branches.find((b) => String(b.id) === String(it.branch))?.name ||
          `Branch ${it.branch}`,
        openedAt: it.opened_at,
        closedAt: it.closed_at || undefined,
        openingAmount: parseFloat(it.opening_float) || 0,
        closingAmount: it.actual_amount
          ? parseFloat(it.actual_amount)
          : undefined,
        expectedAmount: it.expected_amount
          ? parseFloat(it.expected_amount)
          : undefined,
        actualAmount: it.actual_amount
          ? parseFloat(it.actual_amount)
          : undefined,
        difference: it.variance_amount
          ? parseFloat(it.variance_amount)
          : undefined,
        status: it.status as any,
        flagged: it.is_flagged || false,
        workspaceId: String(it.tenant),
        createdAt: it.created,
        transactions: [],
      }));

      setApiShifts(mappedShifts);
    } catch (err) {
      console.error("Error fetching API shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadShifts = () => {
    const allShifts = getFromStorage("cashDrawerShifts", []);
    setShifts(
      allShifts.filter(
        (s: CashDrawerShift) => s.workspaceId === currentUser?.workspaceId,
      ),
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

  const handleForceCloseShift = (shift: CashDrawerShift) => {
    popup.showConfirm(
      "Force Close Shift",
      `Are you sure you want to force-close ${shift.cashierName}'s shift? This action will immediately end their active session.`,
      () => {
        const allShifts = getFromStorage("cashDrawerShifts", []);
        const updatedShifts = allShifts.map((s: CashDrawerShift) => {
          if (s.id === shift.id) {
            const closingTime = new Date().toISOString();
            const duration =
              new Date(closingTime).getTime() - new Date(s.openedAt).getTime();

            return {
              ...s,
              status: "force_closed",
              closedAt: closingTime,
              closingAmount: s.actualAmount || s.openingAmount,
              difference:
                (s.actualAmount || s.openingAmount) -
                (s.expectedAmount || s.openingAmount),
            };
          }
          return s;
        });

        saveToStorage("cashDrawerShifts", updatedShifts);
        loadShifts();
        popup.showSuccess(
          "Shift Force-Closed",
          `${shift.cashierName}'s shift has been successfully force-closed.`,
        );
      },
      { type: "danger" },
    );
  };

  const handleViewShift = (shift: CashDrawerShift) => {
    setSelectedShift(shift);
    setViewingSidebar(true);
  };

  const handleCloseViewSidebar = () => {
    setViewingSidebar(false);
    setSelectedShift(null);
  };

  const handleOpenFlagModal = (shift: CashDrawerShift) => {
    setShiftToFlag(shift);
    setFlagReason("");
    setFlagModalOpen(true);
  };

  const handleCloseFlagModal = () => {
    setFlagModalOpen(false);
    setShiftToFlag(null);
    setFlagReason("");
  };

  const handleFlagShift = () => {
    if (!shiftToFlag || !flagReason.trim()) {
      popup.showError(
        "Please provide a reason for flagging this shift.",
        "Reason Required",
        "warning",
      );
      return;
    }

    const allShifts = getFromStorage("cashDrawerShifts", []);
    const updatedShifts = allShifts.map((s: CashDrawerShift) => {
      if (s.id === shiftToFlag.id) {
        return {
          ...s,
          flagged: true,
          flagReason: flagReason,
          flaggedBy: currentUser?.name,
          flaggedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    saveToStorage("cashDrawerShifts", updatedShifts);
    loadShifts();
    handleCloseFlagModal();
    popup.showSuccess(
      "Shift Flagged",
      "The shift has been flagged for review successfully.",
    );
  };

  const handleUnflagShift = (shift: CashDrawerShift) => {
    popup.showConfirm(
      "Remove Flag",
      "Are you sure you want to remove the flag from this shift? This will clear all flag information.",
      () => {
        const allShifts = getFromStorage("cashDrawerShifts", []);
        const updatedShifts = allShifts.map((s: CashDrawerShift) => {
          if (s.id === shift.id) {
            return {
              ...s,
              flagged: false,
              flagReason: undefined,
              flaggedBy: undefined,
              flaggedAt: undefined,
            };
          }
          return s;
        });

        saveToStorage("cashDrawerShifts", updatedShifts);
        loadShifts();
        popup.showSuccess(
          "Flag Removed",
          "The flag has been removed from this shift successfully.",
        );
      },
    );
  };

  const calculateDuration = (openedAt: string, closedAt?: string) => {
    const start = new Date(openedAt);
    const end = closedAt ? new Date(closedAt) : new Date();
    const diff = end.getTime() - start.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const getDifferenceColor = (difference?: number) => {
    if (!difference || difference === 0) return "text-gray-600";
    return difference > 0 ? "text-green-600" : "text-red-600";
  };

  const getShiftRowClass = (shift: CashDrawerShift) => {
    if (shift.flagged) {
      return "bg-orange-50 border-l-4 border-orange-500";
    }

    const diff = shift.difference || 0;
    if (diff < 0) {
      return "bg-red-50 border-l-4 border-red-500 shadow-lg shadow-red-200/50 animate-glow-red";
    } else if (diff > 0) {
      return "bg-green-50 border-l-4 border-green-500 shadow-lg shadow-green-200/50 animate-glow-green";
    }
    return "bg-gray-50 border-l-4 border-gray-300";
  };

  const filteredShifts = shifts.filter((shift) => {
    if (selectedBranch === "all") return true;
    return shift.branchId === selectedBranch;
  });

  const tableShifts = apiShifts.filter((shift) => {
    if (selectedBranch === "all") return true;
    return String(shift.branchId) === String(selectedBranch);
  });

  const stats = {
    totalShifts: filteredShifts.length,
    openShifts: filteredShifts.filter((s) => s.status === "open").length,
    closedShifts: filteredShifts.filter(
      (s) => s.status === "closed" || s.status === "force_closed",
    ).length,
    totalLoss: filteredShifts.reduce((sum, s) => {
      const diff = s.difference || 0;
      return sum + (diff < 0 ? Math.abs(diff) : 0);
    }, 0),
    totalSurplus: filteredShifts.reduce((sum, s) => {
      const diff = s.difference || 0;
      return sum + (diff > 0 ? diff : 0);
    }, 0),
    flaggedShifts: filteredShifts.filter((s) => s.flagged).length,
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Shifts</p>
              <p className="text-gray-900 text-2xl mt-1">{stats.totalShifts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Open Now</p>
              <p className="text-gray-900 text-2xl mt-1">{stats.openShifts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Closed</p>
              <p className="text-gray-900 text-2xl mt-1">
                {stats.closedShifts}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-red-200 p-4 shadow-lg shadow-red-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm">Total Loss</p>
              <p className="text-red-700 text-2xl mt-1">
                NPR {stats.totalLoss.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-green-200 p-4 shadow-lg shadow-green-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm">Total Surplus</p>
              <p className="text-green-700 text-2xl mt-1">
                NPR {stats.totalSurplus.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-orange-200 p-4 shadow-lg shadow-orange-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm">Flagged</p>
              <p className="text-orange-700 text-2xl mt-1">
                {stats.flaggedShifts}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Flag className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900 text-lg">Cash Drawer & Shift Monitor</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-gray-500" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded animate-glow-red"></div>
            <span className="text-sm text-gray-600">Loss (Red Glow)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded animate-glow-green"></div>
            <span className="text-sm text-gray-600">Surplus (Green Glow)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span className="text-sm text-gray-600">Balanced (Grey)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Flag className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600">Flagged Shift</span>
          </div>
        </div>

        {/* Shifts Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-500">Fetching latest shift data...</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-gray-500 text-sm py-3 px-4">
                      Cashier
                    </th>
                    <th className="text-left text-gray-500 text-sm py-3 px-4">
                      Opened
                    </th>
                    <th className="text-left text-gray-500 text-sm py-3 px-4">
                      Closed
                    </th>
                    <th className="text-left text-gray-500 text-sm py-3 px-4">
                      Duration
                    </th>
                    <th className="text-right text-gray-500 text-sm py-3 px-4">
                      Opening Amt
                    </th>
                    <th className="text-right text-gray-500 text-sm py-3 px-4">
                      Closing Amt
                    </th>
                    <th className="text-right text-gray-500 text-sm py-3 px-4">
                      Difference
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
                  {tableShifts.map((shift) => (
                    <tr
                      key={shift.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${getShiftRowClass(shift)}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {shift.flagged && (
                            <Flag className="w-4 h-4 text-orange-500 animate-pulse" />
                          )}
                          <div>
                            <div className="text-gray-900">
                              {shift.cashierName}
                            </div>
                            {shift.branchId && (
                              <div className="text-xs text-gray-500">
                                {branches.find(
                                  (b) =>
                                    String(b.id) === String(shift.branchId),
                                )?.name || `Branch ${shift.branchId}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-900 text-sm">
                          {new Date(shift.openedAt).toLocaleDateString("en-NP")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(shift.openedAt).toLocaleTimeString(
                            "en-NP",
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {shift.closedAt ? (
                          <>
                            <div className="text-gray-900 text-sm">
                              {new Date(shift.closedAt).toLocaleDateString(
                                "en-NP",
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(shift.closedAt).toLocaleTimeString(
                                "en-NP",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="text-blue-600 text-sm flex items-center">
                            <Clock className="w-3 h-3 mr-1 animate-pulse" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-900 text-sm">
                        {calculateDuration(shift.openedAt, shift.closedAt)}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900">
                        NPR {shift.openingAmount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right text-gray-900">
                        {shift.closingAmount !== undefined
                          ? `NPR ${shift.closingAmount.toLocaleString()}`
                          : "-"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {shift.difference !== undefined ? (
                          <div className="flex items-center justify-end space-x-1">
                            {shift.difference < 0 && (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            {shift.difference > 0 && (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            )}
                            {shift.difference === 0 && (
                              <Minus className="w-4 h-4 text-gray-600" />
                            )}
                            <span
                              className={getDifferenceColor(shift.difference)}
                            >
                              NPR {Math.abs(shift.difference).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm border ${STATUS_COLORS[shift.status] || STATUS_COLORS.closed}`}
                        >
                          {STATUS_LABELS[shift.status] || shift.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewShift(shift)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Summary"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {shift.status === "open" && (
                            <button
                              onClick={() => handleForceCloseShift(shift)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Force Close"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {!shift.flagged ? (
                            <button
                              onClick={() => handleOpenFlagModal(shift)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                              title="Flag Suspicious Activity"
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnflagShift(shift)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Unflag"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tableShifts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No shifts found from API
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Shift Summary Sidebar */}
      {viewingSidebar && selectedShift && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseViewSidebar}
          />

          <div className="fixed right-0 top-0 h-full w-full md:w-[700px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-xl">Shift Summary Report</h3>
                <button
                  onClick={handleCloseViewSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Shift Header */}
              <div
                className={`rounded-lg p-6 mb-6 ${
                  selectedShift.flagged
                    ? "bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300"
                    : "bg-gradient-to-r from-blue-50 to-purple-50"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-gray-900 text-2xl">
                        {selectedShift.cashierName}
                      </h4>
                      {selectedShift.flagged && (
                        <Flag className="w-6 h-6 text-orange-600 animate-pulse" />
                      )}
                    </div>
                    {selectedShift.branchName && (
                      <p className="text-gray-600">
                        {selectedShift.branchName}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm border ${STATUS_COLORS[selectedShift.status]}`}
                  >
                    {STATUS_LABELS[selectedShift.status]}
                  </span>
                </div>

                {selectedShift.flagged && (
                  <div className="mt-4 p-4 bg-orange-100 rounded-lg border-2 border-orange-300">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-orange-900 font-medium">
                          Flagged for Suspicious Activity
                        </p>
                        <p className="text-orange-800 text-sm mt-1">
                          Reason: {selectedShift.flagReason}
                        </p>
                        <p className="text-orange-700 text-xs mt-1">
                          Flagged by {selectedShift.flaggedBy} on{" "}
                          {selectedShift.flaggedAt
                            ? new Date(selectedShift.flaggedAt).toLocaleString(
                                "en-NP",
                              )
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-gray-500 text-sm">Opened At</p>
                    <p className="text-gray-900">
                      {new Date(selectedShift.openedAt).toLocaleString("en-NP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Closed At</p>
                    <p className="text-gray-900">
                      {selectedShift.closedAt
                        ? new Date(selectedShift.closedAt).toLocaleString(
                            "en-NP",
                          )
                        : "Still Open"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Duration</p>
                    <p className="text-gray-900">
                      {calculateDuration(
                        selectedShift.openedAt,
                        selectedShift.closedAt,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Transactions</p>
                    <p className="text-gray-900">
                      {selectedShift.transactions.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cash Summary */}
              <div className="mb-6">
                <h4 className="text-gray-900 mb-3">Cash Summary</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 divide-x divide-gray-200">
                    <div className="p-4 bg-blue-50">
                      <p className="text-gray-600 text-sm mb-1">
                        Opening Amount
                      </p>
                      <p className="text-blue-700 text-2xl">
                        NPR {selectedShift.openingAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50">
                      <p className="text-gray-600 text-sm mb-1">
                        Closing Amount
                      </p>
                      <p className="text-purple-700 text-2xl">
                        {selectedShift.closingAmount !== undefined
                          ? `NPR ${selectedShift.closingAmount.toLocaleString()}`
                          : "Not Closed"}
                      </p>
                    </div>
                  </div>
                  {selectedShift.difference !== undefined && (
                    <div
                      className={`p-4 border-t ${
                        selectedShift.difference < 0
                          ? "bg-red-50 border-red-200"
                          : selectedShift.difference > 0
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {selectedShift.difference < 0 && (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                          {selectedShift.difference > 0 && (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          )}
                          {selectedShift.difference === 0 && (
                            <Minus className="w-5 h-5 text-gray-600" />
                          )}
                          <span className="text-gray-700">
                            {selectedShift.difference < 0
                              ? "Loss"
                              : selectedShift.difference > 0
                                ? "Surplus"
                                : "Balanced"}
                          </span>
                        </div>
                        <p
                          className={`text-2xl ${getDifferenceColor(selectedShift.difference)}`}
                        >
                          NPR{" "}
                          {Math.abs(selectedShift.difference).toLocaleString()}
                        </p>
                      </div>
                      {/* Show variance reason if exists */}
                      {selectedShift.varianceReason && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                              <p className="text-gray-700">Cashier's Reason:</p>
                              <p className="text-gray-900 mt-1">
                                {selectedShift.varianceReason}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction History */}
              <div className="mb-6">
                <h4 className="text-gray-900 mb-3">Transaction History</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left text-gray-600 text-sm py-3 px-4">
                          Time
                        </th>
                        <th className="text-left text-gray-600 text-sm py-3 px-4">
                          Type
                        </th>
                        <th className="text-left text-gray-600 text-sm py-3 px-4">
                          Description
                        </th>
                        <th className="text-right text-gray-600 text-sm py-3 px-4">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedShift.transactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="border-b border-gray-100"
                        >
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {new Date(transaction.timestamp).toLocaleTimeString(
                              "en-NP",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                transaction.type === "sale"
                                  ? "bg-green-100 text-green-700"
                                  : transaction.type === "refund"
                                    ? "bg-red-100 text-red-700"
                                    : transaction.type === "cash_in"
                                      ? "bg-blue-100 text-blue-700"
                                      : transaction.type === "cash_out"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {transaction.type.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900 text-sm">
                            {transaction.description ||
                              transaction.billNumber ||
                              "-"}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            NPR {transaction.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedShift.notes && (
                <div className="mb-6">
                  <h4 className="text-gray-900 mb-2">Notes</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600 text-sm">
                      {selectedShift.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {selectedShift.status === "open" && (
                  <button
                    onClick={() => {
                      handleForceCloseShift(selectedShift);
                      handleCloseViewSidebar();
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Force Close Shift</span>
                  </button>
                )}
                <button
                  onClick={handleCloseViewSidebar}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Flag Modal */}
      {flagModalOpen && shiftToFlag && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleCloseFlagModal}
          />

          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 text-lg flex items-center">
                <Flag className="w-5 h-5 mr-2 text-orange-600" />
                Flag Suspicious Activity
              </h3>
              <button
                onClick={handleCloseFlagModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-gray-700 text-sm">
                <strong>Cashier:</strong> {shiftToFlag.cashierName}
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Shift:</strong>{" "}
                {new Date(shiftToFlag.openedAt).toLocaleString("en-NP")}
              </p>
              {shiftToFlag.difference !== undefined && (
                <p
                  className={`text-sm mt-2 ${getDifferenceColor(shiftToFlag.difference)}`}
                >
                  <strong>Difference:</strong> NPR{" "}
                  {Math.abs(shiftToFlag.difference).toLocaleString()}
                  {shiftToFlag.difference < 0
                    ? " (Loss)"
                    : shiftToFlag.difference > 0
                      ? " (Surplus)"
                      : " (Balanced)"}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm mb-2">
                Reason for Flagging *
              </label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
                placeholder="Describe the suspicious activity..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCloseFlagModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagShift}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Flag Shift
              </button>
            </div>
          </div>
        </>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes glow-red {
          0%, 100% {
            box-shadow: 0 0 5px rgba(239, 68, 68, 0.3), 0 0 10px rgba(239, 68, 68, 0.2);
          }
          50% {
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3);
          }
        }

        @keyframes glow-green {
          0%, 100% {
            box-shadow: 0 0 5px rgba(34, 197, 94, 0.3), 0 0 10px rgba(34, 197, 94, 0.2);
          }
          50% {
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.5), 0 0 20px rgba(34, 197, 94, 0.3);
          }
        }

        .animate-glow-red {
          animation: glow-red 2s ease-in-out infinite;
        }

        .animate-glow-green {
          animation: glow-green 2s ease-in-out infinite;
        }
      `}</style>

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
