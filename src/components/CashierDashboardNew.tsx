import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Clock,
  Users,
  Receipt,
  Printer,
  Scan,
  Calculator,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Package,
  Activity,
  BarChart3,
  History,
  RotateCcw,
  Wallet,
  Smartphone,
  Building2,
  ArrowRight,
  RefreshCw,
  Eye,
  Edit2,
  Calendar,
  FileText,
  Filter,
  Download,
  User,
  Phone,
  Mail,
  ArrowUpCircle,
  ArrowDownCircle,
  Power,
  Send,
  AlertTriangle,
  FileEdit,
  ChevronRight,
  ChevronLeft,
  Star,
  Sparkles,
  Settings,
  Wrench,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchLedger, LedgerEntry } from "../api/ledger.api";
import { useLanguage } from "../contexts/LanguageContext";
import { getFromStorage, saveToStorage } from "../utils/mockData";
import { BillCreationPanel } from "./panels/BillCreationPanel";
import { TestModeBanner } from "./TestModeBanner";
import { SuccessPopup } from "./SuccessPopup";
import { ErrorPopup } from "./ErrorPopup";
import { getBranchesForSelect } from "../api/branch.api";

interface BillItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  customerType: "retail" | "workshop";
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "esewa" | "fonepay" | "bank";
  paymentStatus: "paid" | "pending";
  bankAccountId?: string;
  createdAt: string;
  createdBy: string;
  cashierId: string;
  workspaceId: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  sellingPrice: number;
  currentStock: number;
  category?: string;
  brand?: string;
}

interface ShiftData {
  id: string;
  date: string;
  startTime: string;
  endTime?: string;
  startCash: number;
  endCash?: number;
  cashierId: string;
  cashierName: string;
  branchId?: string;
  totalSales: number;
  totalTransactions: number;
  cashIn: number;
  cashOut: number;
  variance?: number;
  varianceReason?: string;
  status: "active" | "ended" | "transferred";
  transferredTo?: string;
}

interface CashInOutTransaction {
  id: string;
  type: "cash_in" | "cash_out";
  amount: number;
  reason: string;
  date: string;
  cashierId: string;
  cashierName: string;
  shiftId: string;
}

interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayRevenue: number;
  averageOrderValue: number;
}

type MenuItem = {
  id: string;
  label: string;
  icon: any;
};

export const CashierDashboardNew: React.FC = () => {
  // General Ledger API state (must be at top level, not inside render function)
  const [generalLedger, setGeneralLedger] = useState<any[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [activePanel, setActivePanel] = useState("dashboard");

  // Effect to sync panel with URL
  useEffect(() => {
    const path = location.pathname;
    const prefix = "/admin/cashier";

    if (
      path === prefix ||
      path === prefix + "/" ||
      path === prefix + "/dashboard"
    ) {
      setActivePanel("dashboard");
      return;
    }

    let relativePart = "";
    if (path.startsWith(prefix + "/")) {
      relativePart = path.substring((prefix + "/").length);
    }

    if (relativePart.endsWith("/")) {
      relativePart = relativePart.slice(0, -1);
    }

    if (relativePart) {
      setActivePanel(relativePart);
    }
  }, [location.pathname]);

  const handleNavigate = (panel: string) => {
    navigate(`/admin/cashier/${panel}`);
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const menuItemsList: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "bill-creation", label: "Create Bill", icon: FileEdit },
    { id: "cash-drawer", label: "Cash Drawer", icon: Wallet },
    { id: "sales", label: "Sales History", icon: History },
    { id: "returns", label: "Sales Returns", icon: RotateCcw },
    { id: "ledger", label: "Account Ledger", icon: FileText },
  ];

  const menuStructure = [
    {
      id: "main",
      label: "MAIN MENU",
      children: menuItemsList.map((item) => ({ ...item, panel: item.id })),
    },
  ];

  const [filteredMenuStructure, setFilteredMenuStructure] =
    useState(menuStructure);

  useEffect(() => {
    if (!menuSearchQuery.trim()) {
      setFilteredMenuStructure(menuStructure);
      return;
    }

    const query = menuSearchQuery.toLowerCase();
    const filtered = menuStructure
      .map((section) => {
        const filteredChildren = section.children?.filter((item) =>
          item.label.toLowerCase().includes(query),
        );

        if (filteredChildren && filteredChildren.length > 0) {
          return {
            ...section,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter(Boolean) as any[];

    setFilteredMenuStructure(filtered);
  }, [menuSearchQuery]);

  const toggleFavorite = (panelId: string) => {
    const updated = favorites.includes(panelId)
      ? favorites.filter((f) => f !== panelId)
      : [...favorites, panelId];
    setFavorites(updated);
    localStorage.setItem(
      "cashier_dashboard_favorites",
      JSON.stringify(updated),
    );
  };

  const clearSearch = () => {
    setMenuSearchQuery("");
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  // Shift Management
  const [currentShift, setCurrentShift] = useState<ShiftData | null>(null);
  const [allShifts, setAllShifts] = useState<ShiftData[]>([]);
  const [showStartShift, setShowStartShift] = useState(false);
  const [showEndShift, setShowEndShift] = useState(false);
  const [showTransferShift, setShowTransferShift] = useState(false);
  const [startingCash, setStartingCash] = useState(0);
  const [endingCash, setEndingCash] = useState(0);
  const [transferToName, setTransferToName] = useState("");
  const [showVarianceReason, setShowVarianceReason] = useState(false);
  const [varianceReason, setVarianceReason] = useState("");
  const [showTransferVarianceReason, setShowTransferVarianceReason] =
    useState(false);
  const [transferVarianceReason, setTransferVarianceReason] = useState("");
  const [transferCashCount, setTransferCashCount] = useState(0);
  const [previousShiftClosing, setPreviousShiftClosing] = useState<
    number | null
  >(null);
  const [isStartingShift, setIsStartingShift] = useState(false);

  // Cash In/Out
  const [showCashIn, setShowCashIn] = useState(false);
  const [showCashOut, setShowCashOut] = useState(false);
  const [showTransferToBank, setShowTransferToBank] = useState(false);
  const [cashInAmount, setCashInAmount] = useState(0);
  const [cashOutAmount, setCashOutAmount] = useState(0);
  const [cashInReason, setCashInReason] = useState("");
  const [cashOutReason, setCashOutReason] = useState("");
  const [cashTransactions, setCashTransactions] = useState<
    CashInOutTransaction[]
  >([]);
  const [transferBankAmount, setTransferBankAmount] = useState(0);
  const [selectedTransferBank, setSelectedTransferBank] = useState("");

  // POS State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<BillItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerType, setCustomerType] = useState<"retail" | "workshop">(
    "retail",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "esewa" | "fonepay" | "bank"
  >("cash");
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );

  // Bills and Stats
  const [myBills, setMyBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayOrders: 0,
    todayRevenue: 0,
    averageOrderValue: 0,
  });

  // Sales Returns State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBillForReturn, setSelectedBillForReturn] =
    useState<Bill | null>(null);
  const [returnItems, setReturnItems] = useState<BillItem[]>([]);
  const [returnReason, setReturnReason] = useState("");

  // Bank accounts
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  // Account Ledger
  const [showLedger, setShowLedger] = useState(false);
  const [ledgerDateFrom, setLedgerDateFrom] = useState("");
  const [ledgerDateTo, setLedgerDateTo] = useState("");
  const [ledgerFilterShift, setLedgerFilterShift] = useState("all");
  const [ledgerFilterType, setLedgerFilterType] = useState("all");
  const [ledgerTab, setLedgerTab] = useState<"general" | "sales" | "purchase">(
    "general",
  );
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLedger = async () => {
    setIsLoading(true);
    try {
      // ledgerTab is "general" | "sales" | "purchase"
      const data = await fetchLedger(ledgerTab as any, {
        start_date: ledgerDateFrom,
        end_date: ledgerDateTo,
        shift: ledgerFilterShift,
      });
      setLedgerData(data);
    } catch (err: any) {
      showError(err.message, "Ledger Error");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger when tab or filters change
  useEffect(() => {
    if (activePanel === "ledger") {
      loadLedger();
    }
  }, [ledgerTab, ledgerDateFrom, ledgerDateTo, ledgerFilterShift, activePanel]);

  // Success Popup State
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successTitle, setSuccessTitle] = useState("Success");

  const showSuccess = (message: string, title: string = "Success") => {
    setSuccessMessage(message);
    setSuccessTitle(title);
    setShowSuccessPopup(true);
  };

  // Error Popup State
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [errorType, setErrorType] = useState<"error" | "warning" | "info">(
    "warning",
  );

  const showError = (
    message: string,
    title?: string,
    type: "error" | "warning" | "info" = "warning",
  ) => {
    setErrorMessage(message);
    setErrorTitle(title || "");
    setErrorType(type);
    setShowErrorPopup(true);
  };

  useEffect(() => {
    loadData();
    loadShiftData();
    loadCashTransactions();
    fetchBankAccounts();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      loadData(); // Real-time sync
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentShift?.id) {
      loadCashTransactions();
    }
  }, [currentShift?.id]);

  const fetchBankAccounts = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/bank-accounts/`,
        {
          headers: {
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        const results = data.results || data;
        const mapped = (results || []).map((it: any) => ({
          id: String(it.id),
          accountType:
            it.account_type === "bank_account" ? "bank" : it.account_type,
          accountName: it.account_name || "",
          bankName: it.bank_name || "",
          currentBalance: parseFloat(it.current_balance) || 0,
          isActive: it.is_active ?? true,
          workspaceId: it.tenant || it.workspace,
        }));
        setBankAccounts(mapped.filter((a: any) => a.isActive));
        saveToStorage("bankAccounts", mapped);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const loadData = () => {
    // Load products
    const allProducts = getFromStorage("products", []).filter(
      (p: any) => p.workspaceId === currentUser?.workspaceId,
    );
    setProducts(allProducts);

    // Load bills (fetch entire dataset as admin does - no cashierId filter)
    let allBills = getFromStorage("bills", []).filter(
      (b: Bill) => b.workspaceId === currentUser?.workspaceId,
    );

    // Add dummy bills if none exist - REMOVED

    setMyBills(allBills);

    // Calculate today's stats
    const today = new Date().toISOString().split("T")[0];
    const todayBills = allBills.filter(
      (b: Bill) =>
        b.createdAt &&
        b.createdAt.startsWith(today) &&
        b.paymentStatus === "paid",
    );

    const todayRevenue = todayBills.reduce(
      (sum: number, b: Bill) => sum + b.total,
      0,
    );
    const avgOrderValue =
      todayBills.length > 0 ? todayRevenue / todayBills.length : 0;

    setStats({
      todaySales: todayBills.length,
      todayOrders: allBills.filter(
        (b: Bill) => b.createdAt && b.createdAt.startsWith(today),
      ).length,
      todayRevenue,
      averageOrderValue: avgOrderValue,
    });

    // Add dummy purchase orders if none exist
    const allPOs = getFromStorage("purchase_orders", []).filter(
      (po: any) => po.workspaceId === currentUser?.workspaceId,
    );

    if (allPOs.length === 0 && currentUser?.workspaceId) {
      // Removed dummy POs insertion
    }
  };

  const loadShiftData = () => {
    const shifts: ShiftData[] = getFromStorage("cashier_shifts", []);
    setAllShifts(shifts);

    const activeShift = shifts.find(
      (s) => s.cashierId === currentUser?.id && s.status === "active",
    );
    setCurrentShift(activeShift || null);

    // Get previous shift closing amount for this cashier
    const cashierShifts = shifts.filter(
      (s) =>
        s.cashierId === currentUser?.id &&
        (s.status === "ended" || s.status === "transferred"),
    );
    if (cashierShifts.length > 0) {
      // Sort by date/time descending to get the most recent
      const sortedShifts = cashierShifts.sort((a, b) => {
        const dateA = new Date(a.endTime || a.startTime).getTime();
        const dateB = new Date(b.endTime || b.startTime).getTime();
        return dateB - dateA;
      });
      const lastShift = sortedShifts[0];
      setPreviousShiftClosing(lastShift.endCash || null);
    } else {
      setPreviousShiftClosing(null);
    }
  };

  const loadCashTransactions = async () => {
    if (!currentShift?.id) {
      setCashTransactions([]);
      return;
    }

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/shifts/${
          currentShift.id
        }/transactions/`,
        {
          headers: {
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        const mapped: CashInOutTransaction[] = (data || []).map((t: any) => ({
          id: String(t.id),
          type: t.transaction_type,
          amount: parseFloat(t.amount) || 0,
          reason: t.description || "",
          date: t.transaction_date || t.created,
          cashierId: String(t.performed_by),
          cashierName: t.performed_by_name || "Cashier",
          shiftId: String(t.shift),
        }));
        setCashTransactions(mapped);
      } else {
        const transactions: CashInOutTransaction[] = getFromStorage(
          "cash_in_out_transactions",
          [],
        );
        setCashTransactions(
          transactions.filter(
            (t) =>
              t.cashierId === currentUser?.id &&
              (currentShift ? t.shiftId === currentShift.id : true),
          ),
        );
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      const transactions: CashInOutTransaction[] = getFromStorage(
        "cash_in_out_transactions",
        [],
      );
      setCashTransactions(
        transactions.filter(
          (t) =>
            t.cashierId === currentUser?.id &&
            (currentShift ? t.shiftId === currentShift.id : true),
        ),
      );
    }
  };

  // Shift Management Functions
  const startShift = async () => {
    if (startingCash < 0) {
      showError(
        "Please enter a valid starting cash amount!",
        "Invalid Amount",
        "warning",
      );
      return;
    }

    const rawUser = localStorage.getItem("user");
    let parsedUser: any = null;

    if (rawUser) {
      try {
        parsedUser = JSON.parse(rawUser);
      } catch (error) {
        // Ignore parse error
      }
    }

    // Check all possible places where branch ID might be stored
    // ...existing code...

    const latestShiftWithBranch = allShifts
      .filter((s) => s.branchId)
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      )[0];

    // Get branch ID directly from the cashier's user object (no API call needed)
    let resolvedBranchId =
      parsedUser?.branch ||
      parsedUser?.branch_id ||
      parsedUser?.branchId ||
      localStorage.getItem("branch_id") ||
      localStorage.getItem("branchId") ||
      currentUser?.branchId ||
      latestShiftWithBranch?.branchId;

    // ...existing code...

    if (!resolvedBranchId) {
      showError(
        "You don't have a branch assigned. Please contact your administrator to assign you to a branch.",
        "Branch Required",
        "warning",
      );
      return;
    }

    // Ensure branch ID is always a number for the API
    const branchIdPayload = Number(resolvedBranchId);

    if (isNaN(branchIdPayload) || branchIdPayload <= 0) {
      showError(
        "Invalid branch information. Please contact admin to fix your branch assignment.",
        "Invalid Branch",
        "error",
      );
      return;
    }

    return startShiftWithBranchId(branchIdPayload);
  };

  const startShiftWithBranchId = async (branchIdPayload: number) => {
    const rawUser = localStorage.getItem("user");
    let parsedUser: any = null;

    if (rawUser) {
      try {
        parsedUser = JSON.parse(rawUser);
      } catch (error) {
        // Ignore parse error
      }
    }

    const tenantId =
      currentUser?.workspaceId ||
      parsedUser?.workspaceId ||
      parsedUser?.tenant_id ||
      localStorage.getItem("tenant_id") ||
      localStorage.getItem("workspace_id") ||
      undefined;

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("auth_token");

    setIsStartingShift(true);

    try {
      const payload = {
        opening_float: String(startingCash),
        tenant: Number(currentUser?.workspaceId || tenantId || 0),
        branch: branchIdPayload,
        status: "open",
        cashier: currentUser?.id,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/shifts/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          errorText || `Failed to start shift (${response.status})`,
        );
      }

      const data = await response.json().catch(() => ({}));
      const startTimestamp =
        data?.opened_at ||
        data?.start_time ||
        data?.startTime ||
        data?.created ||
        new Date().toISOString();

      const startCashAmount =
        Number(
          data?.amount ??
            data?.starting_cash ??
            data?.start_cash ??
            data?.opening_float ??
            startingCash,
        ) || startingCash;

      const newShift: ShiftData = {
        id: data?.id?.toString?.() || `shift_${Date.now()}`,
        date: data?.date || startTimestamp,
        startTime: startTimestamp,
        startCash: startCashAmount,
        cashierId: currentUser?.id || "",
        cashierName: currentUser?.name || "",
        totalSales: Number(data?.total_sales) || 0,
        totalTransactions: Number(data?.total_transactions) || 0,
        cashIn: Number(data?.cash_in) || 0,
        cashOut: Number(data?.cash_out) || 0,
        status: (data?.status as ShiftData["status"]) || "active",
        branchId:
          data?.branch?.toString?.() ||
          data?.branch_id?.toString?.() ||
          branchIdPayload.toString(),
      };

      const shifts = getFromStorage("cashier_shifts", []) as ShiftData[];
      shifts.push(newShift);
      saveToStorage("cashier_shifts", shifts);

      setCurrentShift(newShift);
      setAllShifts(shifts);
      setShowStartShift(false);
      setStartingCash(0);
      showSuccess("Shift started successfully!", "Shift Started");
    } catch (error: any) {
      showError(
        error?.message || "Unable to start shift. Please try again.",
        "Start Failed",
        "error",
      );
    } finally {
      setIsStartingShift(false);
    }
  };

  const endShift = async () => {
    if (!currentShift) return;

    if (endingCash < 0) {
      showError(
        "Please enter a valid ending cash amount!",
        "Invalid Amount",
        "warning",
      );
      return;
    }

    if (!transferToName.trim()) {
      showError(
        "Please specify where the cash is being transferred (e.g., Vault).",
        "Missing Information",
        "warning",
      );
      return;
    }

    // Calculate expected cash
    const expectedCash =
      currentShift.startCash +
      currentShift.totalSales +
      currentShift.cashIn -
      currentShift.cashOut;
    const variance = endingCash - expectedCash;

    // If there's a variance, show reason popup
    if (variance !== 0 && !showVarianceReason) {
      setShowEndShift(false);
      setShowVarianceReason(true);
      return;
    }

    // End shift via API
    await completeEndShift(variance);
  };

  const completeEndShift = async (varianceOverride?: number) => {
    if (!currentShift) return;

    const expectedCash =
      currentShift.startCash +
      currentShift.totalSales +
      currentShift.cashIn -
      currentShift.cashOut;
    const variance =
      typeof varianceOverride === "number"
        ? varianceOverride
        : endingCash - expectedCash;

    const rawUser = localStorage.getItem("user");
    let parsedUser: any = null;
    if (rawUser) {
      try {
        parsedUser = JSON.parse(rawUser);
      } catch (error) {}
    }

    // Get branch ID
    const latestShiftWithBranch = allShifts
      .filter((s) => s.branchId)
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      )[0];
    let resolvedBranchId =
      parsedUser?.branch ||
      parsedUser?.branch_id ||
      parsedUser?.branchId ||
      localStorage.getItem("branch_id") ||
      localStorage.getItem("branchId") ||
      currentUser?.branchId ||
      latestShiftWithBranch?.branchId;
    const branchIdPayload = Number(resolvedBranchId);

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("auth_token");

    const isBalanced = Math.abs(variance) < 0.01;
    const endpointSuffix = isBalanced ? "close_balanced" : "close_variance";

    const payload: any = {
      actual_amount: endingCash,
      notes: isBalanced ? "Shift ended balanced" : "Shift ended with variance",
      transferred_to: transferToName,
    };

    if (!isBalanced) {
      payload.variance_reason = varianceReason || "Unspecified variance";
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/shifts/${
          currentShift.id
        }/${endpointSuffix}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          errorText || `Failed to close shift (${response.status})`,
        );
      }

      // Update local shift data
      const updatedShift: ShiftData = {
        ...currentShift,
        endTime: new Date().toISOString(),
        endCash: endingCash,
        variance: variance,
        varianceReason: variance !== 0 ? varianceReason : undefined,
        status: "ended",
      };

      const shifts = allShifts.map((s) =>
        s.id === currentShift.id ? updatedShift : s,
      );
      saveToStorage("cashier_shifts", shifts);

      setCurrentShift(null);
      setAllShifts(shifts);
      setShowEndShift(false);
      setShowVarianceReason(false);
      setEndingCash(0);
      setVarianceReason("");
      showSuccess("Shift ended successfully!", "Shift Ended");
    } catch (error: any) {
      showError(
        error?.message || "Unable to end shift. Please try again.",
        "End Failed",
        "error",
      );
    }
  };

  const transferShift = async () => {
    if (!currentShift) return;

    if (!transferToName.trim()) {
      showError(
        "Please enter the name of the person you are transferring to!",
        "Name Required",
        "warning",
      );
      return;
    }

    if (transferCashCount <= 0) {
      showError(
        "Please count and enter the cash amount!",
        "Invalid Amount",
        "warning",
      );
      return;
    }

    // Calculate expected cash
    const expectedCash =
      currentShift.startCash +
      currentShift.totalSales +
      currentShift.cashIn -
      currentShift.cashOut;
    const variance = transferCashCount - expectedCash;

    // If there's a variance, show reason popup
    if (variance !== 0 && !showTransferVarianceReason) {
      setShowTransferShift(false);
      setShowTransferVarianceReason(true);
      return;
    }

    // Transfer shift via API
    await completeTransferShift(variance);
  };

  const completeTransferShift = async (varianceOverride?: number) => {
    if (!currentShift) return;

    const expectedCash =
      currentShift.startCash +
      currentShift.totalSales +
      currentShift.cashIn -
      currentShift.cashOut;
    const variance =
      typeof varianceOverride === "number"
        ? varianceOverride
        : transferCashCount - expectedCash;

    const rawUser = localStorage.getItem("user");
    let parsedUser: any = null;
    if (rawUser) {
      try {
        parsedUser = JSON.parse(rawUser);
      } catch (error) {}
    }

    // Get branch ID
    const latestShiftWithBranch = allShifts
      .filter((s) => s.branchId)
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      )[0];
    let resolvedBranchId =
      parsedUser?.branch ||
      parsedUser?.branch_id ||
      parsedUser?.branchId ||
      localStorage.getItem("branch_id") ||
      localStorage.getItem("branchId") ||
      currentUser?.branchId ||
      latestShiftWithBranch?.branchId;
    const branchIdPayload = Number(resolvedBranchId);

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("auth_token");

    try {
      const payload: any = {
        counted_cash: transferCashCount,
        transferred_to: transferToName,
      };

      if (variance !== 0) {
        payload.variance_reason = transferVarianceReason;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/shifts/${
          currentShift.id
        }/transfer_shift/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          errorText || `Failed to transfer shift (${response.status})`,
        );
      }

      // Update local shift data
      const updatedShift: ShiftData = {
        ...currentShift,
        endTime: new Date().toISOString(),
        endCash: transferCashCount,
        variance: variance,
        varianceReason: variance !== 0 ? transferVarianceReason : undefined,
        status: "transferred",
        transferredTo: transferToName,
      };

      const shifts = allShifts.map((s) =>
        s.id === currentShift.id ? updatedShift : s,
      );
      saveToStorage("cashier_shifts", shifts);

      setCurrentShift(null);
      setAllShifts(shifts);
      setShowTransferShift(false);
      setShowTransferVarianceReason(false);
      setTransferToName("");
      setTransferCashCount(0);
      setTransferVarianceReason("");
      showSuccess("Shift transferred successfully!", "Shift Transferred");
    } catch (error: any) {
      showError(
        error?.message || "Unable to transfer shift. Please try again.",
        "Transfer Failed",
        "error",
      );
    }
  };

  // Cash In/Out Functions
  const handleCashIn = async () => {
    if (!currentShift) {
      showError("Please start a shift first!", "Shift Required", "warning");
      return;
    }

    if (cashInAmount <= 0 || !cashInReason.trim()) {
      showError("Please fill all fields!", "Missing Information", "warning");
      return;
    }

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("auth_token");

    try {
      const payload = {
        amount: Number(cashInAmount),
        description: cashInReason,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/shifts/${
          currentShift.id
        }/cash_in/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.detail || "Failed to record Cash In",
        );
      }

      const data = await response.json();

      const transaction: CashInOutTransaction = {
        id: data.id?.toString() || `cashin_${Date.now()}`,
        type: "cash_in",
        amount: cashInAmount,
        reason: cashInReason,
        date: new Date().toISOString(),
        cashierId: currentUser?.id || "",
        cashierName: currentUser?.name || "",
        shiftId: currentShift.id,
      };

      const allTransactions = getFromStorage("cash_in_out_transactions", []);
      allTransactions.push(transaction);
      saveToStorage("cash_in_out_transactions", allTransactions);

      // Update shift
      const updatedShift = {
        ...currentShift,
        cashIn: currentShift.cashIn + cashInAmount,
      };
      const shifts = allShifts.map((s) =>
        s.id === currentShift.id ? updatedShift : s,
      );
      saveToStorage("cashier_shifts", shifts);
      setCurrentShift(updatedShift);

      setCashInAmount(0);
      setCashInReason("");
      setShowCashIn(false);
      loadCashTransactions();
      showSuccess("Cash In recorded successfully!", "Cash In Recorded");
    } catch (error: any) {
      showError(
        error?.message || "Unable to record cash in. Please try again.",
        "Cash In Failed",
        "error",
      );
    }
  };

  const handleCashOut = async () => {
    if (!currentShift) {
      showError("Please start a shift first!", "Shift Required", "warning");
      return;
    }

    if (cashOutAmount <= 0 || !cashOutReason.trim()) {
      showError("Please fill all fields!", "Missing Information", "warning");
      return;
    }

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("auth_token");

    try {
      const payload = {
        amount: Number(cashOutAmount),
        description: cashOutReason,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/shifts/${
          currentShift.id
        }/cash_out/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.detail || "Failed to record Cash Out",
        );
      }

      const data = await response.json();

      const transaction: CashInOutTransaction = {
        id: data.id?.toString() || `cashout_${Date.now()}`,
        type: "cash_out",
        amount: cashOutAmount,
        reason: cashOutReason,
        date: new Date().toISOString(),
        cashierId: currentUser?.id || "",
        cashierName: currentUser?.name || "",
        shiftId: currentShift.id,
      };

      const allTransactions = getFromStorage("cash_in_out_transactions", []);
      allTransactions.push(transaction);
      saveToStorage("cash_in_out_transactions", allTransactions);

      // Update shift
      const updatedShift = {
        ...currentShift,
        cashOut: currentShift.cashOut + cashOutAmount,
      };
      const shifts = allShifts.map((s) =>
        s.id === currentShift.id ? updatedShift : s,
      );
      saveToStorage("cashier_shifts", shifts);
      setCurrentShift(updatedShift);

      setCashOutAmount(0);
      setCashOutReason("");
      setShowCashOut(false);
      loadCashTransactions();
      showSuccess("Cash Out recorded successfully!", "Cash Out Recorded");
    } catch (error: any) {
      showError(
        error?.message || "Unable to record cash out. Please try again.",
        "Cash Out Failed",
        "error",
      );
    }
  };

  const handleTransferToBank = async () => {
    if (!currentShift) {
      showError("Please start a shift first!", "Shift Required", "warning");
      return;
    }

    if (transferBankAmount <= 0 || !selectedTransferBank) {
      showError(
        "Please select bank and enter amount!",
        "Invalid Input",
        "warning",
      );
      return;
    }

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("auth_token");

    try {
      const selectedBank = bankAccounts.find(
        (b) => b.id === selectedTransferBank,
      );
      const payload = {
        tenant: Number(currentUser?.workspaceId || 0),
        branch: Number(currentShift.branchId || 0),
        bank_account: Number(selectedTransferBank),
        amount: String(transferBankAmount),
        description: `Bank transfer to ${
          selectedBank?.bankName || selectedBank?.accountName || "Bank"
        }`,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/cash-and-bank/bank-transfers/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            errorData.detail ||
            "Failed to process bank transfer",
        );
      }

      // Record cash out transaction locally
      const transaction: CashInOutTransaction = {
        id: `bank_transfer_${Date.now()}`,
        type: "cash_out",
        amount: transferBankAmount,
        reason: `Bank transfer to ${
          selectedBank?.bankName || selectedBank?.accountName || "Bank"
        }`,
        date: new Date().toISOString(),
        cashierId: currentUser?.id || "",
        cashierName: currentUser?.name || "",
        shiftId: currentShift.id,
      };

      const allTransactions = getFromStorage("cash_in_out_transactions", []);
      allTransactions.push(transaction);
      saveToStorage("cash_in_out_transactions", allTransactions);

      // Update shift
      const updatedShift = {
        ...currentShift,
        cashOut: currentShift.cashOut + transferBankAmount,
      };
      const shifts = allShifts.map((s) =>
        s.id === currentShift.id ? updatedShift : s,
      );
      saveToStorage("cashier_shifts", shifts);
      setCurrentShift(updatedShift);

      setTransferBankAmount(0);
      setSelectedTransferBank("");
      setShowTransferToBank(false);
      loadCashTransactions();
      showSuccess(
        "Cash transferred to bank successfully!",
        "Transfer Complete",
      );
    } catch (error: any) {
      showError(
        error?.message || "Unable to process bank transfer. Please try again.",
        "Transfer Failed",
        "error",
      );
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!currentShift) {
      showError("Please start a shift first!", "Shift Required", "warning");
      return;
    }

    if (product.currentStock <= 0) {
      showError("This product is out of stock!", "Out of Stock", "warning");
      return;
    }

    const existingItem = cart.find((item) => item.productId === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.currentStock) {
        showError(
          "Cannot add more than available stock!",
          "Stock Limit",
          "warning",
        );
        return;
      }
      handleUpdateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: BillItem = {
        id: `ITEM${Date.now()}${Math.random()}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        price: product.sellingPrice,
        discount: 0,
        tax: 13,
        total: product.sellingPrice * 1.13,
      };
      setCart([...cart, newItem]);
    }
    setSearchQuery("");
  };

  const handleBarcodeSearch = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      handleAddToCart(product);
      setBarcodeInput("");
    } else {
      showError(
        "Product not found with this barcode!",
        "Product Not Found",
        "warning",
      );
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter((item) => item.id !== itemId));
      return;
    }

    const item = cart.find((i) => i.id === itemId);
    if (item) {
      const product = products.find((p) => p.id === item.productId);
      if (product && newQuantity > product.currentStock) {
        alert("Cannot exceed available stock!");
        return;
      }
    }

    setCart(
      cart.map((item) => {
        if (item.id === itemId) {
          const subtotal = item.price * newQuantity;
          const taxAmount = (subtotal * item.tax) / 100;
          return {
            ...item,
            quantity: newQuantity,
            total: subtotal + taxAmount - item.discount,
          };
        }
        return item;
      }),
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const discountAmount =
      discountType === "percentage" ? (subtotal * discount) / 100 : discount;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * 13) / 100;
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleCompleteSale = () => {
    if (!currentShift) {
      alert("Please start a shift first!");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (!customerName.trim()) {
      alert("Please enter customer name!");
      return;
    }

    if (paymentMethod === "bank" && !selectedBankAccount) {
      alert("Please select a bank account!");
      return;
    }

    const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

    // Create bill
    const newBill: Bill = {
      id: `BILL${Date.now()}`,
      billNumber: `INV-${Date.now()}`,
      customerName,
      customerPhone,
      customerType,
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      paymentMethod,
      paymentStatus: "paid",
      bankAccountId: paymentMethod === "bank" ? selectedBankAccount : undefined,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || "",
      cashierId: currentUser?.id || "",
      workspaceId: currentUser?.workspaceId || "",
    };

    // Save bill
    const allBills = getFromStorage("bills", []);
    allBills.push(newBill);
    saveToStorage("bills", allBills);

    // Update product stock
    const allProducts = getFromStorage("products", []);
    const updatedProducts = allProducts.map((p: Product) => {
      const cartItem = cart.find((item) => item.productId === p.id);
      if (cartItem) {
        return {
          ...p,
          currentStock: p.currentStock - cartItem.quantity,
        };
      }
      return p;
    });
    saveToStorage("products", updatedProducts);

    // Handle payment method specific logic
    if (paymentMethod === "cash") {
      // Add to cash transactions
      const cashTxns = getFromStorage("cashTransactions", []);
      cashTxns.push({
        id: `CASH${Date.now()}`,
        type: "cash_in",
        amount: total,
        source: "bill_payment",
        billId: newBill.billNumber,
        description: `Payment from ${customerName}`,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id,
        workspaceId: currentUser?.workspaceId,
      });
      saveToStorage("cashTransactions", cashTxns);

      // Update shift sales
      const updatedShift = {
        ...currentShift!,
        totalSales: currentShift!.totalSales + total,
        totalTransactions: currentShift!.totalTransactions + 1,
      };
      const shifts = allShifts.map((s) =>
        s.id === currentShift!.id ? updatedShift : s,
      );
      saveToStorage("cashier_shifts", shifts);
      setCurrentShift(updatedShift);
    } else if (paymentMethod === "bank" && selectedBankAccount) {
      // Update bank account balance
      const accounts = getFromStorage("bankAccounts", []);
      const updatedAccounts = accounts.map((a: any) => {
        if (a.id === selectedBankAccount) {
          return {
            ...a,
            currentBalance: (a.currentBalance || 0) + total,
            totalReceived: (a.totalReceived || 0) + total,
          };
        }
        return a;
      });
      saveToStorage("bankAccounts", updatedAccounts);
    }

    alert("Sale completed successfully!");

    // Reset cart and customer info
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscount(0);
    setSelectedBankAccount("");

    loadData();
  };

  const handlePrintBill = (bill: Bill) => {
    window.print();
  };

  const handleInitiateReturn = (bill: Bill) => {
    setSelectedBillForReturn(bill);
    setReturnItems(bill.items.map((item) => ({ ...item, quantity: 0 })));
    setShowReturnModal(true);
  };

  const handleProcessReturn = () => {
    if (!selectedBillForReturn) return;

    const itemsToReturn = returnItems.filter((item) => item.quantity > 0);
    if (itemsToReturn.length === 0) {
      alert("Please select items to return!");
      return;
    }

    if (!returnReason.trim()) {
      alert("Please provide a reason for return!");
      return;
    }

    // Calculate return totals
    const returnSubtotal = itemsToReturn.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const returnTax = (returnSubtotal * 13) / 100;
    const returnTotal = returnSubtotal + returnTax;

    // Create return record
    const salesReturn = {
      id: `RET${Date.now()}`,
      billId: selectedBillForReturn.id,
      billNumber: selectedBillForReturn.billNumber,
      returnDate: new Date().toISOString(),
      items: itemsToReturn,
      subtotal: returnSubtotal,
      discount: 0,
      tax: returnTax,
      total: returnTotal,
      reason: returnReason,
      returnedBy: currentUser?.name || "",
      cashierId: currentUser?.id || "",
      workspaceId: currentUser?.workspaceId || "",
    };

    // Save return
    const allReturns = getFromStorage("salesReturns", []);
    allReturns.push(salesReturn);
    saveToStorage("salesReturns", allReturns);

    // Restore product stock
    const allProducts = getFromStorage("products", []);
    const updatedProducts = allProducts.map((p: Product) => {
      const returnItem = itemsToReturn.find((item) => item.productId === p.id);
      if (returnItem) {
        return {
          ...p,
          currentStock: p.currentStock + returnItem.quantity,
        };
      }
      return p;
    });
    saveToStorage("products", updatedProducts);

    alert("Return processed successfully!");
    setShowReturnModal(false);
    setSelectedBillForReturn(null);
    setReturnItems([]);
    setReturnReason("");
    loadData();
  };

  const calculateCurrentCash = () => {
    if (!currentShift) return 0;
    return (
      currentShift.startCash +
      currentShift.totalSales +
      currentShift.cashIn -
      currentShift.cashOut
    );
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "bill-creation", label: "Create Bill", icon: FileEdit },
    { id: "cash-drawer", label: "Cash Drawer", icon: Wallet },
    { id: "sales", label: "Sales History", icon: History },
    { id: "returns", label: "Sales Returns", icon: RotateCcw },
    { id: "ledger", label: "Account Ledger", icon: FileText },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Shift Status Banner */}
      {!currentShift ? (
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="w-12 h-12" />
              <div>
                <h3 className="text-2xl font-bold">No Active Shift</h3>
                <p className="text-red-100 mt-1">
                  Please start your shift to begin taking orders
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                loadShiftData();
                setShowStartShift(true);
              }}
              className="px-6 py-3 bg-white text-red-600 rounded-xl hover:bg-red-50 transition-all font-bold flex items-center space-x-2"
            >
              <Power className="w-5 h-5" />
              <span>Start Shift</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Active Shift</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                {[
                  {
                    key: "started",
                    label: "Started At",
                    value: new Date(currentShift.startTime).toLocaleTimeString(
                      "en-NP",
                      { hour: "2-digit", minute: "2-digit" },
                    ),
                  },
                  {
                    key: "startcash",
                    label: "Starting Cash",
                    value: `Rs${currentShift.startCash.toLocaleString()}`,
                  },
                  {
                    key: "totalsales",
                    label: "Total Sales",
                    value: `Rs${currentShift.totalSales.toLocaleString()}`,
                  },
                  {
                    key: "currentcash",
                    label: "Current Cash",
                    value: `Rs${calculateCurrentCash().toLocaleString()}`,
                  },
                ].map((item) => (
                  <div key={item.key}>
                    <p className="text-green-100 text-sm">{item.label}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEndShift(true)}
                className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-all font-semibold"
              >
                End Shift
              </button>
              <button
                onClick={() => setShowTransferShift(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all font-semibold"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome, {currentUser?.name || "Cashier"} 👋
            </h2>
            <p className="text-blue-100">
              Ready to serve customers and process sales
            </p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Current Date & Time</p>
            <p className="text-2xl font-bold">
              {currentTime.toLocaleDateString("en-NP")}
            </p>
            <p className="text-lg">{currentTime.toLocaleTimeString("en-NP")}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            key: "revenue",
            icon: DollarSign,
            secondIcon: TrendingUp,
            label: "Today's Revenue",
            value: `Rs${stats.todayRevenue.toLocaleString()}`,
            gradient: "from-green-500 to-green-600",
            textColor: "text-green-100",
          },
          {
            key: "sales",
            icon: ShoppingCart,
            secondIcon: Activity,
            label: "Today's Sales",
            value: stats.todaySales,
            gradient: "from-blue-500 to-blue-600",
            textColor: "text-blue-100",
          },
          {
            key: "orders",
            icon: Receipt,
            secondIcon: CheckCircle,
            label: "Total Orders",
            value: stats.todayOrders,
            gradient: "from-purple-500 to-purple-600",
            textColor: "text-purple-100",
          },
          {
            key: "avg",
            icon: Calculator,
            secondIcon: BarChart3,
            label: "Avg Order Value",
            value: `Rs${Math.round(stats.averageOrderValue).toLocaleString()}`,
            gradient: "from-orange-500 to-orange-600",
            textColor: "text-orange-100",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          const SecondIcon = stat.secondIcon;
          return (
            <div
              key={stat.key}
              className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-6 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-12 h-12 opacity-80" />
                <SecondIcon className="w-6 h-6" />
              </div>
              <p className={`${stat.textColor} text-sm mb-1`}>{stat.label}</p>
              <p className="text-4xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => handleNavigate("bill-creation")}
            className="flex flex-col items-center space-y-2 p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:from-indigo-100 hover:to-indigo-200 transition-all border-2 border-indigo-200"
          >
            <FileEdit className="w-10 h-10 text-indigo-600" />
            <span className="font-semibold text-gray-900">Create Bill</span>
          </button>

          <button
            onClick={() => handleNavigate("cash-drawer")}
            className="flex flex-col items-center space-y-2 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all border-2 border-green-200"
          >
            <Wallet className="w-10 h-10 text-green-600" />
            <span className="font-semibold text-gray-900">Cash Drawer</span>
          </button>

          <button
            onClick={() => handleNavigate("returns")}
            className="flex flex-col items-center space-y-2 p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all border-2 border-orange-200"
          >
            <RotateCcw className="w-10 h-10 text-orange-600" />
            <span className="font-semibold text-gray-900">Process Return</span>
          </button>

          <button
            onClick={() => handleNavigate("sales")}
            className="flex flex-col items-center space-y-2 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all border-2 border-purple-200"
          >
            <History className="w-10 h-10 text-purple-600" />
            <span className="font-semibold text-gray-900">Sales History</span>
          </button>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="w-6 h-6 text-white" />
            <h3 className="text-white font-bold text-lg">Recent Sales</h3>
          </div>
          <button
            onClick={() => handleNavigate("sales")}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-colors"
          >
            View All
          </button>
        </div>
        <div className="p-4">
          {myBills.slice(0, 5).length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No sales yet today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myBills.slice(0, 5).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {bill.billNumber}
                    </p>
                    <p className="text-sm text-gray-500">{bill.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      Rs{bill.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(bill.createdAt).toLocaleTimeString("en-NP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCashDrawer = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <Wallet className="w-8 h-8 text-green-600" />
            <span>Cash Drawer Management</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Manage cash in, cash out, and bank transfers
          </p>
        </div>
      </div>

      {/* Current Cash Status */}
      {currentShift && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                key: "starting",
                label: "Starting Cash",
                value: `Rs${currentShift.startCash.toLocaleString()}`,
              },
              {
                key: "salestoday",
                label: "Sales Today",
                value: `Rs${currentShift.totalSales.toLocaleString()}`,
              },
              {
                key: "cashinout",
                label: "Cash In/Out",
                value: `Rs${(
                  currentShift.cashIn - currentShift.cashOut
                ).toLocaleString()}`,
              },
              {
                key: "currenttotal",
                label: "Current Total",
                value: `Rs${calculateCurrentCash().toLocaleString()}`,
              },
            ].map((item) => (
              <div key={item.key}>
                <p className="text-green-100 text-sm mb-1">{item.label}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cash Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowCashIn(true)}
          disabled={!currentShift}
          className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all border-2 border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDownCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="font-bold text-gray-900 text-lg">Cash In</p>
          <p className="text-sm text-gray-600 mt-1">Add cash to drawer</p>
        </button>

        <button
          onClick={() => setShowCashOut(true)}
          disabled={!currentShift}
          className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all border-2 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUpCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <p className="font-bold text-gray-900 text-lg">Cash Out</p>
          <p className="text-sm text-gray-600 mt-1">Remove cash from drawer</p>
        </button>

        <button
          onClick={() => setShowTransferToBank(true)}
          disabled={!currentShift}
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all border-2 border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <p className="font-bold text-gray-900 text-lg">Transfer to Bank</p>
          <p className="text-sm text-gray-600 mt-1">Deposit cash to bank</p>
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-4">
          <h3 className="text-white font-bold text-lg">Transaction History</h3>
        </div>
        <div className="p-4">
          {cashTransactions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cashTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    txn.type === "cash_in"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {txn.type === "cash_in" ? (
                      <ArrowDownCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {txn.type === "cash_in" ? "Cash In" : "Cash Out"}
                      </p>
                      <p className="text-sm text-gray-500">{txn.reason}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(txn.date).toLocaleString("en-NP")}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold text-lg ${
                      txn.type === "cash_in" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {txn.type === "cash_in" ? "+" : "-"}Rs
                    {txn.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPOS = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Product Selection */}
      <div className="lg:col-span-2 space-y-4">
        {!currentShift && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <p className="text-yellow-800 font-semibold">
              Please start your shift to begin taking orders
            </p>
          </div>
        )}

        {/* Search and Barcode */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or SKU..."
                disabled={!currentShift}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div className="relative">
              <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && barcodeInput.trim()) {
                    handleBarcodeSearch(barcodeInput.trim());
                  }
                }}
                placeholder="Scan or enter barcode..."
                disabled={!currentShift}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Available Products</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
            {products
              .filter(
                (p) =>
                  searchQuery === "" ||
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.currentStock <= 0 || !currentShift}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    product.currentStock <= 0 || !currentShift
                      ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                      : "border-blue-200 hover:border-blue-400 hover:shadow-md bg-blue-50"
                  }`}
                >
                  <p className="font-semibold text-gray-900 text-sm mb-1 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                  <p className="text-lg font-bold text-blue-600">
                    Rs{product.sellingPrice}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      product.currentStock <= 10
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    Stock: {product.currentStock}
                  </p>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Right: Cart and Checkout */}
      <div className="space-y-4">
        {/* Cart */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden sticky top-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart ({cart.length})</span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Cart Items */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-500">{item.sku}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-gray-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-bold text-blue-600">
                        Rs{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Info */}
            <div className="space-y-2 border-t pt-4">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name *"
                disabled={!currentShift}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Customer Phone (Optional)"
                disabled={!currentShift}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Discount */}
            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-semibold text-gray-700">
                Discount
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  disabled={!currentShift}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <select
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(e.target.value as "percentage" | "fixed")
                  }
                  disabled={!currentShift}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">Rs</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2 border-t pt-4">
              <label className="text-sm font-semibold text-gray-700">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "cash", label: "Cash", icon: Banknote },
                  { value: "esewa", label: "eSewa", icon: Smartphone },
                  { value: "fonepay", label: "FonePay", icon: Smartphone },
                  { value: "bank", label: "Bank", icon: Building2 },
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value as any)}
                      disabled={!currentShift}
                      className={`p-2 rounded-lg border-2 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 ${
                        paymentMethod === method.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {method.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "bank" && (
                <select
                  value={selectedBankAccount}
                  onChange={(e) => setSelectedBankAccount(e.target.value)}
                  disabled={!currentShift}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} -{" "}
                      {acc.bankName || acc.accountType.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  Rs{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold text-orange-600">
                  -Rs{discountAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (13%):</span>
                <span className="font-semibold text-gray-900">
                  Rs{taxAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-blue-600">
                  Rs{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Complete Sale Button */}
            <button
              onClick={handleCompleteSale}
              disabled={
                cart.length === 0 || !customerName.trim() || !currentShift
              }
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Complete Sale</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <History className="w-8 h-8 text-blue-600" />
            <span>Sales History</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            View all sales transactions from all cashiers
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {myBills.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 text-xl mb-2">No Sales Yet</h3>
            <p className="text-gray-500">
              Start selling to see your sales history
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-900">
                    Bill No.
                  </th>
                  <th className="px-6 py-4 text-left text-gray-900">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-gray-900">Items</th>
                  <th className="px-6 py-4 text-left text-gray-900">Total</th>
                  <th className="px-6 py-4 text-left text-gray-900">Payment</th>
                  <th className="px-6 py-4 text-left text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {myBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-gray-900">
                      {bill.billNumber}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {bill.customerName}
                      </p>
                      {bill.customerPhone && (
                        <p className="text-sm text-gray-500">
                          {bill.customerPhone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {bill.items.length}
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">
                      Rs{bill.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase">
                        {bill.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 text-sm">
                      {new Date(bill.createdAt).toLocaleDateString("en-NP")}
                      <br />
                      {new Date(bill.createdAt).toLocaleTimeString("en-NP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePrintBill(bill)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleInitiateReturn(bill)}
                          className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                          title="Return"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderReturns = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
            <RotateCcw className="w-8 h-8 text-orange-600" />
            <span>Sales Returns</span>
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Process and track product returns
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 p-8 text-center">
        <RotateCcw className="w-16 h-16 text-orange-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Process Returns from Sales History
        </h3>
        <p className="text-gray-600 mb-4">
          Go to Sales History and click the return button on any bill to process
          a return
        </p>
        <button
          onClick={() => handleNavigate("sales")}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Go to Sales History
        </button>
      </div>
    </div>
  );

  const renderAccountLedger = () => {
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
      // Loading and error states
      if (isLoading) {
        return (
          <div className="flex items-center justify-center py-12">
            <span className="text-lg text-blue-600 font-semibold">
              Loading general ledger...
            </span>
          </div>
        );
      }
      if (ledgerError) {
        return (
          <div className="flex items-center justify-center py-12">
            <span className="text-lg text-red-600 font-semibold">
              {ledgerError}
            </span>
          </div>
        );
      }
      if (!ledgerData.length) {
        return (
          <div className="flex items-center justify-center py-12">
            <span className="text-lg text-gray-500 font-semibold">
              No general ledger entries found.
            </span>
          </div>
        );
      }

      // Calculate totals
      const totalDebit = ledgerData.reduce(
        (sum, entry) => sum + Number(entry.debit || 0),
        0,
      );
      const totalCredit = ledgerData.reduce(
        (sum, entry) => sum + Number(entry.credit || 0),
        0,
      );
      const netBalance = ledgerData.length
        ? Number(ledgerData[ledgerData.length - 1].balance)
        : 0;

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <span>Account Ledger</span>
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                General ledger from server
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
                  {ledgerData.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.transaction_date_display ||
                          entry.transaction_date?.split("T")[0]}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {entry.transaction_time_display ||
                          (entry.transaction_date
                            ? new Date(
                                entry.transaction_date,
                              ).toLocaleTimeString()
                            : "")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {entry.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {entry.reference}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                        {Number(entry.debit).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">
                        {Number(entry.credit).toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm text-right font-bold ${
                          Number(entry.balance) >= 0
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {Number(entry.balance).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {ledgerData.length > 0 && (
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
        </div>
      );
    };

    // SALES LEDGER
    const renderSalesLedger = () => {
      interface SalesEntry {
        id: string;
        date: string;
        time: string;
        billNumber: string;
        customerName: string;
        customerPhone: string;
        customerType: string;
        items: number;
        subtotal: number;
        discount: number;
        tax: number;
        total: number;
        paymentMethod: string;
        paymentStatus: string;
      }

      let salesEntries: SalesEntry[] = myBills
        .filter((b) => b.cashierId === currentUser?.id)
        .map((bill) => {
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
        salesEntries = salesEntries.filter((entry) => {
          const entryDate = new Date(entry.date.split("/").reverse().join("-"));
          const fromDate = new Date(ledgerDateFrom);
          return entryDate >= fromDate;
        });
      }

      if (ledgerDateTo) {
        salesEntries = salesEntries.filter((entry) => {
          const entryDate = new Date(entry.date.split("/").reverse().join("-"));
          const toDate = new Date(ledgerDateTo);
          return entryDate <= toDate;
        });
      }

      // Sort by date
      salesEntries.sort((a, b) => {
        const dateA = new Date(
          `${a.date.split("/").reverse().join("-")} ${a.time}`,
        ).getTime();
        const dateB = new Date(
          `${b.date.split("/").reverse().join("-")} ${b.time}`,
        ).getTime();
        return dateB - dateA;
      });

      // Calculate totals
      const totalSales = salesEntries.reduce(
        (sum, entry) => sum + entry.total,
        0,
      );
      const totalSubtotal = salesEntries.reduce(
        (sum, entry) => sum + entry.subtotal,
        0,
      );
      const totalDiscount = salesEntries.reduce(
        (sum, entry) => sum + entry.discount,
        0,
      );
      const totalTax = salesEntries.reduce((sum, entry) => sum + entry.tax, 0);
      const cashSales = salesEntries
        .filter((e) => e.paymentMethod === "cash")
        .reduce((sum, entry) => sum + entry.total, 0);
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
                        <p className="text-sm">
                          Try adjusting your date filters
                        </p>
                      </td>
                    </tr>
                  ) : (
                    salesEntries.map((entry, index) => (
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
                            <p className="font-semibold">
                              {entry.customerName}
                            </p>
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
      // Get purchase orders from storage
      const allPurchaseOrders = getFromStorage("purchase_orders", []);

      interface PurchaseEntry {
        id: string;
        date: string;
        time: string;
        poNumber: string;
        supplierName: string;
        supplierPhone: string;
        items: number;
        subtotal: number;
        tax: number;
        total: number;
        status: string;
        paymentStatus: string;
      }

      let purchaseEntries: PurchaseEntry[] = allPurchaseOrders
        .filter((po: any) => po.workspaceId === currentUser?.workspaceId)
        .map((po: any) => {
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
        purchaseEntries = purchaseEntries.filter((entry) => {
          const entryDate = new Date(entry.date.split("/").reverse().join("-"));
          const fromDate = new Date(ledgerDateFrom);
          return entryDate >= fromDate;
        });
      }

      if (ledgerDateTo) {
        purchaseEntries = purchaseEntries.filter((entry) => {
          const entryDate = new Date(entry.date.split("/").reverse().join("-"));
          const toDate = new Date(ledgerDateTo);
          return entryDate <= toDate;
        });
      }

      // Sort by date
      purchaseEntries.sort((a, b) => {
        const dateA = new Date(
          `${a.date.split("/").reverse().join("-")} ${a.time}`,
        ).getTime();
        const dateB = new Date(
          `${b.date.split("/").reverse().join("-")} ${b.time}`,
        ).getTime();
        return dateB - dateA;
      });

      // Calculate totals
      const totalPurchases = purchaseEntries.reduce(
        (sum, entry) => sum + entry.total,
        0,
      );
      const totalSubtotal = purchaseEntries.reduce(
        (sum, entry) => sum + entry.subtotal,
        0,
      );
      const totalTax = purchaseEntries.reduce(
        (sum, entry) => sum + entry.tax,
        0,
      );
      const paidPurchases = purchaseEntries
        .filter((e) => e.paymentStatus === "paid")
        .reduce((sum, entry) => sum + entry.total, 0);
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
                        <p className="text-sm">
                          Try adjusting your date filters
                        </p>
                      </td>
                    </tr>
                  ) : (
                    purchaseEntries.map((entry, index) => (
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
                            <p className="font-semibold">
                              {entry.supplierName}
                            </p>
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

        {/* Filters - Show for all tabs */}
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
                    {allShifts
                      .filter((s) => s.cashierId === currentUser?.id)
                      .map((shift) => (
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

  return (
    <>
      <TestModeBanner />
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Enhanced Sidebar - Full Height */}
        <aside
          className={`${
            sidebarOpen ? (sidebarCollapsed ? "w-20" : "w-72") : "w-0"
          } bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 ease-in-out flex flex-col fixed lg:relative h-full z-50 shadow-2xl border-r border-white/10 overflow-hidden`}
        >
          {/* Sidebar Header / Logo */}
          <div
            className={`p-6 flex items-center ${
              sidebarCollapsed ? "justify-center" : "space-x-3"
            } border-b border-white/10 relative overflow-hidden`}
          >
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shrink-0 shadow-lg shadow-green-500/20">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 pr-6">
                <h1 className="text-white font-bold text-lg truncate tracking-tight">
                  Cashier POS
                </h1>
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                  Serve Spares
                </p>
              </div>
            )}

            {/* Close Button (Mobile and Tablet) */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-6 right-2 p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            >
              <X size={18} />
            </button>

            {/* Collapse Button (Desktop) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 border-2 border-gray-900 z-10"
            >
              {sidebarCollapsed ? (
                <ChevronRight size={12} className="text-white" />
              ) : (
                <ChevronLeft size={12} className="text-white" />
              )}
            </button>
          </div>

          {/* Navigation Menu Area */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigate(item.id);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className={`group w-full flex items-center ${
                    sidebarCollapsed ? "justify-center" : "space-x-4 px-4"
                  } py-3.5 rounded-xl transition-all relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1"
                  }`}
                  title={sidebarCollapsed ? item.label : ""}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isActive
                        ? "scale-110 drop-shadow-glow"
                        : "group-hover:scale-110"
                    }`}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-bold text-sm tracking-wide">
                      {item.label}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Section: User & Logout */}
          <div className="p-4 mt-auto border-t border-white/10 bg-white/5">
            <div
              className={`flex items-center ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                    {currentUser?.name?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900 shadow-sm"></div>
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                      Cashier
                    </p>
                  </div>
                )}
              </div>
              {!sidebarCollapsed && (
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Panel Header (No Logo) */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all shadow-sm"
                >
                  {sidebarOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h2 className="text-gray-900 text-lg font-bold capitalize leading-none">
                      {activePanel.replace(/-/g, " ")}
                    </h2>
                    <p className="text-gray-500 text-[10px] mt-1 uppercase font-bold tracking-widest">
                      Point of Sale
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Shift Status
                  </span>
                  {currentShift ? (
                    <span className="flex items-center space-x-1.5 text-green-600 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span>Active</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1.5 text-red-500 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span>Inactive</span>
                    </span>
                  )}
                </div>

                <div className="w-px h-8 bg-gray-200 mx-2 hidden sm:block" />

                <button
                  onClick={() => setActivePanel("bill-creation")}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center group"
                  title="New Bill"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content Body */}
          <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <div className="max-w-[1600px] mx-auto">
              {activePanel === "dashboard" && renderDashboard()}
              {activePanel === "bill-creation" && <BillCreationPanel />}
              {activePanel === "cash-drawer" && renderCashDrawer()}
              {activePanel === "sales" && renderSalesHistory()}
              {activePanel === "returns" && renderReturns()}
              {activePanel === "ledger" && renderAccountLedger()}
            </div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Start Shift Modal */}
        {showStartShift && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Power className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">Start Shift</h3>
                  </div>
                  <button
                    onClick={() => setShowStartShift(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {previousShiftClosing !== null && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <History className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-blue-900">
                        Previous Shift Info
                      </h4>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">
                        Last Closing Amount:
                      </span>
                      <span className="font-bold text-xl text-blue-600">
                        Rs{previousShiftClosing.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => setStartingCash(previousShiftClosing)}
                      className="w-full mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                    >
                      Use This as Starting Cash
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Starting Cash Amount *
                  </label>
                  <input
                    type="number"
                    value={startingCash}
                    onChange={(e) => setStartingCash(Number(e.target.value))}
                    placeholder="Enter starting cash..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={startShift}
                    disabled={isStartingShift}
                    className={`flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold ${
                      isStartingShift ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {isStartingShift ? "Starting..." : "Start Shift"}
                  </button>
                  <button
                    onClick={() => setShowStartShift(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* End Shift Modal */}
        {showEndShift && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Power className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">End Shift</h3>
                  </div>
                  <button
                    onClick={() => setShowEndShift(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Cash:</span>
                    <span className="font-bold text-gray-900">
                      Rs{calculateCurrentCash().toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Actual Ending Cash *
                  </label>
                  <input
                    type="number"
                    value={endingCash}
                    onChange={(e) => setEndingCash(Number(e.target.value))}
                    placeholder="Enter actual cash in drawer..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transferred To *
                  </label>
                  <input
                    type="text"
                    value={transferToName}
                    onChange={(e) => setTransferToName(e.target.value)}
                    placeholder="e.g. Vault, Manager Name..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {endingCash > 0 && (
                  <div
                    className={`p-3 rounded-lg ${
                      Math.abs(endingCash - calculateCurrentCash()) > 0
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      Difference: Rs
                      {(endingCash - calculateCurrentCash()).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <button
                    onClick={endShift}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold"
                  >
                    End Shift
                  </button>
                  <button
                    onClick={() => setShowEndShift(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash Variance Reason Modal */}
        {showVarianceReason && currentShift && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">
                      Cash Variance Detected
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowVarianceReason(false);
                      setShowEndShift(true);
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">
                      Expected Cash:
                    </span>
                    <span className="font-bold text-lg">
                      Rs
                      {(
                        currentShift.startCash +
                        currentShift.totalSales +
                        currentShift.cashIn -
                        currentShift.cashOut
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">
                      Actual Cash:
                    </span>
                    <span className="font-bold text-lg">
                      Rs{endingCash.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t-2 border-orange-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">
                        Variance:
                      </span>
                      <span
                        className={`font-bold text-xl ${
                          endingCash -
                            (currentShift.startCash +
                              currentShift.totalSales +
                              currentShift.cashIn -
                              currentShift.cashOut) >
                          0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {endingCash -
                          (currentShift.startCash +
                            currentShift.totalSales +
                            currentShift.cashIn -
                            currentShift.cashOut) >
                        0
                          ? "+"
                          : ""}
                        Rs
                        {(
                          endingCash -
                          (currentShift.startCash +
                            currentShift.totalSales +
                            currentShift.cashIn -
                            currentShift.cashOut)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Variance <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={varianceReason}
                    onChange={(e) => setVarianceReason(e.target.value)}
                    placeholder="Please explain the reason for cash variance..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
                  />
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      This variance will be recorded in your shift report and
                      may require manager approval.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => completeEndShift()}
                    disabled={!varianceReason.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm & End Shift
                  </button>
                  <button
                    onClick={() => {
                      setShowVarianceReason(false);
                      setShowEndShift(true);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Shift Modal */}
        {showTransferShift && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Send className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">Transfer Shift</h3>
                  </div>
                  <button
                    onClick={() => setShowTransferShift(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {previousShiftClosing !== null && (
                  <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                      <History className="w-5 h-5 text-purple-600" />
                      <h4 className="font-bold text-purple-900">
                        Your Previous Shift
                      </h4>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">
                        Last Closing Amount:
                      </span>
                      <span className="font-bold text-xl text-purple-600">
                        Rs{previousShiftClosing.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => setTransferCashCount(previousShiftClosing)}
                      className="w-full mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold"
                    >
                      Use This for Cash Count
                    </button>
                    <p className="text-xs text-purple-700 mt-2">
                      ℹ️ This is the amount you ended with in your last shift
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Transfer To (Name) *
                  </label>
                  <input
                    type="text"
                    value={transferToName}
                    onChange={(e) => setTransferToName(e.target.value)}
                    placeholder="Enter name of person..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Expected cash:{" "}
                    <span className="font-bold">
                      Rs{calculateCurrentCash().toLocaleString()}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Count Cash in Drawer *
                  </label>
                  <input
                    type="number"
                    value={transferCashCount}
                    onChange={(e) =>
                      setTransferCashCount(Number(e.target.value))
                    }
                    placeholder="Enter actual cash count..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {transferCashCount > 0 && (
                  <div
                    className={`p-3 rounded-lg ${
                      Math.abs(transferCashCount - calculateCurrentCash()) > 0
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-green-50 border border-green-200"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      Difference: Rs
                      {(
                        transferCashCount - calculateCurrentCash()
                      ).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <button
                    onClick={transferShift}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold"
                  >
                    Transfer Shift
                  </button>
                  <button
                    onClick={() => setShowTransferShift(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Cash Variance Reason Modal */}
        {showTransferVarianceReason && currentShift && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">
                      Cash Variance Detected
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowTransferVarianceReason(false);
                      setShowTransferShift(true);
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">
                      Expected Cash:
                    </span>
                    <span className="font-bold text-lg">
                      Rs
                      {(
                        currentShift.startCash +
                        currentShift.totalSales +
                        currentShift.cashIn -
                        currentShift.cashOut
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">
                      Counted Cash:
                    </span>
                    <span className="font-bold text-lg">
                      Rs{transferCashCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t-2 border-orange-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">
                        Variance:
                      </span>
                      <span
                        className={`font-bold text-xl ${
                          transferCashCount -
                            (currentShift.startCash +
                              currentShift.totalSales +
                              currentShift.cashIn -
                              currentShift.cashOut) >
                          0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transferCashCount -
                          (currentShift.startCash +
                            currentShift.totalSales +
                            currentShift.cashIn -
                            currentShift.cashOut) >
                        0
                          ? "+"
                          : ""}
                        Rs
                        {(
                          transferCashCount -
                          (currentShift.startCash +
                            currentShift.totalSales +
                            currentShift.cashIn -
                            currentShift.cashOut)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="border-t-2 border-orange-300 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-semibold">
                        Transferring To:
                      </span>
                      <span className="font-bold text-blue-600">
                        {transferToName}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Variance <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={transferVarianceReason}
                    onChange={(e) => setTransferVarianceReason(e.target.value)}
                    placeholder="Please explain the reason for cash variance..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
                  />
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      This variance will be recorded and transferred to{" "}
                      {transferToName} along with the shift.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => completeTransferShift()}
                    disabled={!transferVarianceReason.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm & Transfer
                  </button>
                  <button
                    onClick={() => {
                      setShowTransferVarianceReason(false);
                      setShowTransferShift(true);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash In Modal */}
        {showCashIn && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ArrowDownCircle className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">Cash In</h3>
                  </div>
                  <button
                    onClick={() => setShowCashIn(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={cashInAmount}
                    onChange={(e) => setCashInAmount(Number(e.target.value))}
                    placeholder="Enter amount..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    value={cashInReason}
                    onChange={(e) => setCashInReason(e.target.value)}
                    placeholder="Enter reason..."
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCashIn}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold"
                  >
                    Record Cash In
                  </button>
                  <button
                    onClick={() => setShowCashIn(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash Out Modal */}
        {showCashOut && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ArrowUpCircle className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">Cash Out</h3>
                  </div>
                  <button
                    onClick={() => setShowCashOut(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={cashOutAmount}
                    onChange={(e) => setCashOutAmount(Number(e.target.value))}
                    placeholder="Enter amount..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    value={cashOutReason}
                    onChange={(e) => setCashOutReason(e.target.value)}
                    placeholder="Enter reason..."
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCashOut}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold"
                  >
                    Record Cash Out
                  </button>
                  <button
                    onClick={() => setShowCashOut(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer to Bank Modal */}
        {showTransferToBank && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Send className="w-8 h-8" />
                    <h3 className="text-2xl font-bold">Transfer to Bank</h3>
                  </div>
                  <button
                    onClick={() => setShowTransferToBank(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Bank Account *
                  </label>
                  <select
                    value={selectedTransferBank}
                    onChange={(e) => setSelectedTransferBank(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Bank Account</option>
                    {bankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.bankName || acc.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={transferBankAmount}
                    onChange={(e) =>
                      setTransferBankAmount(Number(e.target.value))
                    }
                    placeholder="Enter amount to transfer..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Available cash:{" "}
                    <span className="font-bold">
                      Rs{calculateCurrentCash().toLocaleString()}
                    </span>
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleTransferToBank}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold"
                  >
                    Transfer to Bank
                  </button>
                  <button
                    onClick={() => setShowTransferToBank(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && selectedBillForReturn && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Process Return</h3>
                    <p className="text-orange-100 mt-1">
                      Bill: {selectedBillForReturn.billNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowReturnModal(false);
                      setSelectedBillForReturn(null);
                      setReturnItems([]);
                      setReturnReason("");
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Customer:{" "}
                    <span className="font-semibold text-gray-900">
                      {selectedBillForReturn.customerName}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Date:{" "}
                    <span className="font-semibold text-gray-900">
                      {new Date(selectedBillForReturn.createdAt).toLocaleString(
                        "en-NP",
                      )}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Items to Return
                  </label>
                  <div className="space-y-2">
                    {selectedBillForReturn.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Sold: {item.quantity} units @ Rs{item.price}
                          </p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={returnItems[idx]?.quantity || 0}
                          onChange={(e) => {
                            const newReturnItems = [...returnItems];
                            newReturnItems[idx] = {
                              ...item,
                              quantity: Math.min(
                                Number(e.target.value),
                                item.quantity,
                              ),
                            };
                            setReturnItems(newReturnItems);
                          }}
                          className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Return *
                  </label>
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="Enter reason for return..."
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleProcessReturn}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all font-semibold"
                  >
                    Process Return
                  </button>
                  <button
                    onClick={() => {
                      setShowReturnModal(false);
                      setSelectedBillForReturn(null);
                      setReturnItems([]);
                      setReturnReason("");
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Popup */}
        <SuccessPopup
          isOpen={showSuccessPopup}
          onClose={() => setShowSuccessPopup(false)}
          title={successTitle}
          message={successMessage}
          autoClose={true}
          autoCloseDelay={3000}
        />

        {/* Error Popup */}
       {/* Error Popup */}
        <ErrorPopup
          isOpen={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          title={errorTitle}
          message={errorMessage}
          type={errorType}
        />
    </>
  );
};