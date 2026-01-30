import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Plus,
  Trash2,
  Search,
  User,
  Phone,
  MapPin,
  FileText,
  Calculator,
  Percent,
  CreditCard,
  Printer,
  Save,
  Check,
  X,
  Edit2,
  Package,
  AlertCircle,
  ChevronRight,
  Eye,
  Download,
  ArrowLeft,
  Receipt,
  Banknote,
  Smartphone,
  Building2,
  Clock,
  Calendar,
  Hash,
  DollarSign,
  CreditCard as CreditIcon,
  FileCheck,
  Badge,
  Link as LinkIcon,
  Barcode,
  Camera,
  UserCheck,
  Users,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { getBranches, getCurrentTenantId } from "../../api/branch.api";
import {
  InventoryItem,
  Bill,
  BillItem,
  Party,
  CustomerType,
} from "../../types";
import { BankAccount } from "./BankAccountsPanel";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";

interface BillFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerPanVat: string;
  customerType: CustomerType;
  partyId?: string;
  isWalkIn: boolean;
  items: BillItemWithWarranty[];
  subtotal: number;
  discount: number | string;
  discountType: "percentage" | "fixed";
  tax: number | string;
  total: number;
  paymentMethod: "cash" | "esewa" | "fonepay" | "bank" | "credit" | "cheque";
  bankAccountId?: string;
  notes: string;
}

interface BillItemWithWarranty extends Omit<BillItem, "quantity" | "price"> {
  quantity: number | string;
  price: number | string;
  warranty?: string;
  barcode?: string;
}

interface BillCreationPanelProps {
  editingBill?: Bill | null;
  onSave?: () => void;
  branchId?: string | number | undefined;
}

const WARRANTY_OPTIONS = [
  "No Warranty",
  "6 Months",
  "1 Year",
  "2 Years",
  "3 Years",
];

export const BillCreationPanel: React.FC<BillCreationPanelProps> = ({
  editingBill,
  onSave,
  branchId,
}) => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Item search states
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(),
  );

  // Customer auto-detect states
  const [nameSuggestions, setNameSuggestions] = useState<Party[]>([]);
  const [phoneSuggestions, setPhoneSuggestions] = useState<Party[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showPhoneSuggestions, setShowPhoneSuggestions] = useState(false);

  // Barcode scanning state
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<any>(null);

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.warn("Stop scanner error:", err);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleScanning = async () => {
    if (isScanning) {
      await stopScanning();
    } else {
      setIsScanning(true);
    }
  };

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (isScanning) {
      // Small timeout to ensure the "reader" div is mounted in the DOM
      const startScanner = async () => {
        try {
          html5QrCode = new Html5Qrcode("reader");
          scannerRef.current = html5QrCode;

          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          };

          await html5QrCode.start(
            { facingMode: "environment" }, // Prefer back camera on mobile, laptop camera otherwise
            config,
            (decodedText) => {
              // Success callback
              const item = inventory.find(
                (i) =>
                  i.barcode === decodedText || i.partNumber === decodedText,
              );
              if (item) {
                addItemToCart(item);
                stopScanning();
              } else {
                console.log("Barcode not found in inventory:", decodedText);
              }
            },
            (errorMessage) => {
              // This is called for every frame where no code is found
            },
          );
        } catch (err) {
          console.error("Failed to start scanner:", err);

          try {
            if (html5QrCode) {
              await html5QrCode.start(
                { facingMode: "user" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                  const item = inventory.find((i) => i.barcode === decodedText);
                  if (item) {
                    addItemToCart(item);
                    stopScanning();
                  }
                },
                () => {},
              );
            }
          } catch (fallbackErr) {
            console.error("Scanner fallback failed:", fallbackErr);
            popup.showError(
              "Could not access camera. Please check permissions.",
            );
            stopScanning();
          }
        }
      };

      startScanner();
    }

    return () => {
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;

        // Use a more robust check or just try to stop
        try {
          scanner.stop().catch((err: any) => {
            // This often happens if the scanner wasn't fully started or already stopped
            console.warn("Scanner stop ignored:", err);
          });
        } catch (err) {
          console.error("Immediate scanner stop error:", err);
        }
      }
    };
  }, [isScanning, inventory]);

  const [formData, setFormData] = useState<BillFormData>({
    customerName: "",
    customerPhone: "+977",
    customerAddress: "",
    customerPanVat: "",
    customerType: "retail",
    isWalkIn: true,
    items: [],
    subtotal: 0,
    discount: 0,
    discountType: "percentage",
    tax: 13,
    total: 0,
    paymentMethod: "cash",
    notes: "",
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const tenantId = currentUser?.workspaceId || getCurrentTenantId();

        console.log("🔍 [fetchBranches] Starting fetch for tenant:", tenantId);

        const data = await getBranches(tenantId || undefined);
        console.log("📦 [fetchBranches] API response:", data);

        const branchList = data.results || [];

        console.log(
          "🔄 [fetchBranches] Branch list to map:",
          branchList.length,
          branchList,
        );

        const mappedBranches = branchList.map((apiBranch: any) => ({
          id: apiBranch.id.toString(),
          name: apiBranch.branch_name || apiBranch.name,
          location: `${apiBranch.city || ""}, ${apiBranch.state || ""}`.trim(),
          address: apiBranch.Address || apiBranch.address,
          city: apiBranch.city,
          state: apiBranch.state,
          phone: apiBranch.phone,
          email: apiBranch.Email || apiBranch.email,
          isActive: apiBranch.is_active,
          code: apiBranch.branch_code,
        }));

        console.log("✅ [fetchBranches] Mapped branches:", mappedBranches);

        // For Bill Creation, we should NOT have "All Branches" option
        const finalBranches = [...mappedBranches];
        setBranches(finalBranches);

        // Default to first branch if none selected
        if (currentUser?.role === "cashier" && currentUser?.branchId) {
          setSelectedBranchId(Number(currentUser.branchId));
        } else if (finalBranches.length > 0 && !selectedBranchId) {
          setSelectedBranchId(Number(finalBranches[0].id));
        }
      } catch (err) {
        console.warn("Failed to fetch branches from API:", err);
      }
    };
    fetchBranches();
    loadData();
  }, [currentUser]);

  useEffect(() => {
    // Enforce cashier branch selection
    if (currentUser?.role === "cashier" && currentUser?.branchId) {
      setSelectedBranchId(Number(currentUser.branchId));
    }
  }, [currentUser]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.discount, formData.discountType, formData.tax]);

  useEffect(() => {
    if (formData.customerName && !formData.isWalkIn) {
      const matches = parties.filter(
        (p) =>
          p.type === "customer" &&
          p.name.toLowerCase().includes(formData.customerName.toLowerCase()),
      );
      setNameSuggestions(matches);
    } else {
      setNameSuggestions([]);
    }
  }, [formData.customerName, parties, formData.isWalkIn]);

  useEffect(() => {
    if (
      formData.customerPhone &&
      formData.customerPhone !== "+977" &&
      !formData.isWalkIn
    ) {
      const matches = parties.filter(
        (p) =>
          p.type === "customer" && p.phone.includes(formData.customerPhone),
      );
      setPhoneSuggestions(matches);

      // Auto-fill if exact match
      if (matches.length === 1) {
        selectCustomer(matches[0]);
      }
    } else {
      setPhoneSuggestions([]);
    }
  }, [formData.customerPhone, parties, formData.isWalkIn]);

  useEffect(() => {
    const searchItems = async () => {
      setSearchLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const headers: HeadersInit = {};

        if (token) headers["Authorization"] = `Bearer ${token}`;

        if (itemSearchQuery.trim()) {
          const response = await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/stock-management/inventory/?search=${encodeURIComponent(
              itemSearchQuery.trim(),
            )}`,
            { headers },
          );

          if (response.ok) {
            const data = await response.json();
            const results = Array.isArray(data.results) ? data.results : data;
            const mappedItems = results.map((item: any) => ({
              id: item.id,
              name: item.item_name,
              partNumber: item.part_number || "",
              barcode: item.barcode || "",
              category: item.category || "",
              quantity: item.quantity || item.current_stock || 0,
              warrantyPeriod:
                item.warranty_period || item.warranty || "No Warranty",
              retailPrice: parseFloat(item.retail_pricing) || 0,
              wholesalePrice: parseFloat(item.wholesale_price) || 0,
              distributorPrice: parseFloat(item.distributor_price) || 0,
              price: parseFloat(item.price) || 0,
              mrp: parseFloat(item.mrp) || 0,
              costPrice: parseFloat(item.cost_price) || 0,
              location: item.location || "",
            }));
            const stockItems = mappedItems.filter((i: any) => i.quantity > 0);
            setFilteredItems(stockItems.slice(0, 50));
            setShowItemSuggestions(true);
          } else {
            setFilteredItems([]);
            setShowItemSuggestions(false);
          }
        } else {
          const mapped = inventory.map((i: any) => ({
            id: i.id,
            name: i.name || i.item_name || "",
            partNumber: i.partNumber || i.part_number || "",
            barcode: i.barcode || "",
            category: i.category || "local",
            quantity: i.quantity || i.currentStock || 0,
            warrantyPeriod: i.warrantyPeriod || "No Warranty",
            retailPrice: i.retailPrice || i.price || 0,
            wholesalePrice: i.wholesalePrice || 0,
            costPrice: i.costPrice || 0,
            location: i.location || "",
            vehicleType: i.vehicleType || "two_wheeler",
            minStockLevel: i.minStockLevel || 0,
            price: i.price || 0,
            mrp: i.mrp || 0,
            createdAt: i.createdAt || new Date().toISOString(),
          }));
          const stockItems = mapped.filter((i: any) => i.quantity > 0);
          setFilteredItems(stockItems.slice(0, 50));
          setShowItemSuggestions(stockItems.length > 0);
        }
      } catch (error) {
        setFilteredItems([]);
        setShowItemSuggestions(false);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchItems();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [itemSearchQuery, inventory]);

  // Barcode scanning
  useEffect(() => {
    if (barcodeInput.trim()) {
      const item = inventory.find((i) => i.barcode === barcodeInput.trim());
      if (item) {
        addItemToCart(item);
        setBarcodeInput("");
      }
    }
  }, [barcodeInput, inventory]);

  const loadData = async () => {
    // Load from 'products' key (standardized across system)
    const storedInventory = getFromStorage("products", []).filter(
      (i: InventoryItem) =>
        i.workspaceId === currentUser?.workspaceId && i.quantity > 0,
    );
    const storedParties = getFromStorage("parties", []).filter(
      (p: Party) =>
        p.workspaceId === currentUser?.workspaceId && p.type === "customer",
    );
    const storedAccounts = getFromStorage("bankAccounts", []).filter(
      (a: BankAccount) =>
        a.workspaceId === currentUser?.workspaceId && a.isActive,
    );

    setInventory(storedInventory);
    setParties(storedParties);
    setBankAccounts(storedAccounts);

    // If parent (AdminDashboard) provides a branch filter, use it
    if (branchId !== undefined && branchId !== null) {
      const num = Number(branchId);
      if (!isNaN(num) && num > 0) {
        setSelectedBranchId(num);
      }
    }

    // Try fetching inventory from remote API and replace/augment local list
    try {
      const token = localStorage.getItem("accessToken");
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/stock-management/inventory/`,
        { headers },
      );

      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : data;
        const mapped = results.map((item: any) => ({
          id: item.id,
          name: item.item_name,
          partNumber: item.part_number || "",
          barcode: item.barcode || "",
          category: item.category || "",
          quantity: item.quantity || item.current_stock || 0,
          warrantyPeriod:
            item.warranty_period || item.warranty || "No Warranty",
          retailPrice: parseFloat(item.retail_pricing) || 0,
          wholesalePrice: parseFloat(item.wholesale_price) || 0,
          distributorPrice: parseFloat(item.distributor_price) || 0,
          price: parseFloat(item.price) || 0,
          mrp: parseFloat(item.mrp) || 0,
          costPrice: parseFloat(item.cost_price) || 0,
          location: item.location || "",
          workspaceId: item.branch || currentUser?.workspaceId,
        }));

        // Use remote inventory if available, otherwise keep local
        if (mapped.length > 0) {
          setInventory(mapped.filter((i: any) => i.quantity > 0));
        }
      }
    } catch (err) {
      // Ignore remote fetch errors — local inventory remains available
      console.warn("Inventory fetch failed:", err);
    }
  };

  const selectCustomer = (party: Party) => {
    setFormData((prev) => ({
      ...prev,
      customerName: party.name,
      customerPhone: party.phone,
      customerAddress: party.address,
      customerPanVat: party.panNumber || party.gstNumber || "",
      customerType: party.customerType || "retail",
      partyId: party.id,
      isWalkIn: false,
    }));
    setShowNameSuggestions(false);
    setShowPhoneSuggestions(false);
  };

  const getCustomerPricing = (item: InventoryItem): number => {
    // Always use MRP as the rate
    return item.mrp || item.price || 0;
  };

  const addItemToCart = (item: InventoryItem) => {
    const price = getCustomerPricing(item);
    const existingItem = formData.items.find((i) => i.itemId === item.id);

    if (existingItem) {
      // Increment quantity
      const updatedItems = formData.items.map((i) =>
        i.itemId === item.id
          ? {
              ...i,
              quantity: Number(i.quantity) + 1,
              total: (Number(i.quantity) + 1) * i.price,
            }
          : i,
      );
      setFormData({ ...formData, items: updatedItems });
    } else {
      // Add new item
      const newItem: BillItemWithWarranty = {
        itemId: item.id,
        itemName: item.name,
        quantity: 1,
        price: price,
        total: price,
        warranty: item.warrantyPeriod || "No Warranty",
        barcode: item.barcode,
      };
      setFormData({ ...formData, items: [...formData.items, newItem] });
    }

    setItemSearchQuery("");
    setShowItemSuggestions(false);
    setSelectedItemIds(new Set());
  };

  const addMultipleItemsToCart = () => {
    const itemsToAdd = filteredItems.filter((item) =>
      selectedItemIds.has(item.id),
    );

    if (itemsToAdd.length === 0) return;

    const updatedItems = [...formData.items];

    itemsToAdd.forEach((item) => {
      const price = getCustomerPricing(item);
      const existingItemIndex = updatedItems.findIndex(
        (i) => i.itemId === item.id,
      );

      if (existingItemIndex !== -1) {
        // Increment quantity of existing item
        const newQuantity =
          Number(updatedItems[existingItemIndex].quantity) + 1;
        updatedItems[existingItemIndex].quantity = newQuantity;
        updatedItems[existingItemIndex].total =
          newQuantity * Number(updatedItems[existingItemIndex].price);
      } else {
        // Add new item
        const newItem: BillItemWithWarranty = {
          itemId: item.id,
          itemName: item.name,
          quantity: 1,
          price: price,
          total: price,
          warranty: item.warrantyPeriod || "No Warranty",
          barcode: item.barcode,
        };
        updatedItems.push(newItem);
      }
    });

    setFormData({ ...formData, items: updatedItems });
    setSelectedItemIds(new Set());
    setItemSearchQuery("");
    setShowItemSuggestions(false);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItemIds);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItemIds(newSelection);
  };

  const updateItem = (
    index: number,
    field: keyof BillItemWithWarranty,
    value: any,
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate total for this item
    if (field === "quantity" || field === "price") {
      const qty = Number(updatedItems[index].quantity) || 0;
      const prc = Number(updatedItems[index].price) || 0;
      updatedItems[index].total = qty * prc;
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );
    const discountValue = Number(formData.discount) || 0;
    const discountAmount =
      formData.discountType === "percentage"
        ? (subtotal * discountValue) / 100
        : discountValue;
    const afterDiscount = subtotal - discountAmount;
    const taxVal = Number(formData.tax) || 0;
    const taxAmount = (afterDiscount * taxVal) / 100;
    const total = afterDiscount + taxAmount;

    setFormData((prev) => ({
      ...prev,
      subtotal,
      total,
    }));
  };

  const updateBankAccountBalance = (accountId: string, amount: number) => {
    const allAccounts = getFromStorage("bankAccounts", []);
    const updatedAccounts = allAccounts.map((acc: BankAccount) => {
      if (acc.id === accountId) {
        return {
          ...acc,
          currentBalance: (acc.currentBalance || 0) + amount,
          totalReceived: (acc.totalReceived || 0) + amount,
        };
      }
      return acc;
    });
    saveToStorage("bankAccounts", updatedAccounts);
  };

  const handleSaveBill = async (
    status: "paid" | "pending" | "draft" = "paid",
  ) => {
    // Validation
    if (!formData.customerName.trim()) {
      popup.showError("Please enter customer name", "Validation Error");
      return;
    }

    if (formData.items.length === 0) {
      popup.showError("Please add at least one item", "Validation Error");
      return;
    }

    // Generate bill number
    const bills = getFromStorage<Bill>("bills", []);
    const billNumber = `INV${Date.now().toString().slice(-8)}`;

    const newBill: Bill = {
      id: `BILL${Date.now()}`,
      billNumber,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      customerPanVat: formData.customerPanVat,
      customerType: formData.customerType as any,
      partyId: formData.partyId,
      customerId: formData.partyId, // For ledger compatibility
      items: formData.items.map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: Number(item.quantity),
        price: Number(item.price),
        total: item.total,
        warranty: item.warranty,
      })),
      subtotal: formData.subtotal,
      tax: Number(formData.tax),
      discount: Number(formData.discount),
      discountType: formData.discountType,
      total: formData.total,
      paymentMethod: formData.paymentMethod,
      bankAccountId: formData.bankAccountId,
      paymentStatus: status,
      notes: formData.notes,
      cashierName: currentUser?.name,
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id,
    };

    // Ensure branch selected
    if (!selectedBranchId) {
      popup.showError(
        "Please select a branch before saving the bill",
        "Validation Error",
      );
      return;
    }

    // Try to POST bill to remote API
    let apiCreated = false;
    try {
      const token = localStorage.getItem("accessToken");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const subtotal = formData.subtotal;
      const discountAmount =
        formData.discountType === "percentage"
          ? (subtotal * Number(formData.discount)) / 100
          : formData.discount;
      const afterDiscount = subtotal - Number(discountAmount);
      const taxAmount = (afterDiscount * Number(formData.tax)) / 100;
      const totalAfterDiscount = afterDiscount;

      const payload = {
        tenant: currentUser?.workspaceId || 0,
        branch: Number(selectedBranchId),
        customer_name: formData.customerName,
        address: formData.customerAddress,
        phone_numbers: formData.customerPhone,
        pan_vat_number: formData.customerPanVat,
        customer_type: formData.customerType,
        price: Number(formData.total).toFixed(2),
        subtotal: Number(subtotal).toFixed(2),
        discount_method:
          formData.discountType === "percentage" ? "percentage" : "amount",
        discount_value: Number(formData.discount).toFixed(2),
        discount_amount: Number(discountAmount).toFixed(2),
        total_after_discount: Number(totalAfterDiscount).toFixed(2),
        payment_method: formData.paymentMethod,
        status: status,
        purchase_items_data: formData.items.map((it) => ({
          inventory_id: it.itemId,
          product_name: it.itemName,
          quantity: Number(it.quantity),
          price: Number(it.price).toFixed(2),
          total_price: Number(it.total).toFixed(2),
        })),
        is_active: true,
      };

      const resp = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/sales/bills/`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        },
      );

      if (resp.ok) {
        const respData = await resp.json();
        popup.showSuccess("Bill created successfully", "Success");
        // Use server response to populate generated bill where possible
        setGeneratedBill({
          ...newBill,
          id: respData.id ? String(respData.id) : newBill.id,
          billNumber: respData.bill_number || newBill.billNumber,
          createdAt: respData.created || newBill.createdAt,
        });
        setShowPreview(true);
        apiCreated = true;
      } else {
        const errText = await resp.text();
        popup.showError(`Bill Creation Failed`, "API Error");
      }
    } catch (err) {
      console.warn("Bill creation API failed:", err);
      popup.showError(
        "Failed to create bill on server. Saved locally.",
        "Network Error",
      );
    }

    // Update inventory stock in 'products' (standardized key)
    const updatedInventory = getFromStorage("products", []).map(
      (item: InventoryItem) => {
        const billItem = formData.items.find((i) => i.itemId === item.id);
        if (billItem) {
          return {
            ...item,
            currentStock: (item.quantity || 0) - Number(billItem.quantity),
            quantity: (item.quantity || 0) - Number(billItem.quantity), // Support both fields
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      },
    );
    saveToStorage("products", updatedInventory);

    // Update bank account balance if paid
    if (status === "paid" && formData.bankAccountId) {
      updateBankAccountBalance(formData.bankAccountId, formData.total);
    }

    // Track cash in hand if payment method is cash
    if (status === "paid" && formData.paymentMethod === "cash") {
      const cashTransactions = getFromStorage("cashTransactions", []);
      const cashTransaction = {
        id: `CASH-${Date.now()}`,
        type: "cash_in",
        source: "bill_payment",
        amount: formData.total,
        description: `Bill Payment - ${billNumber} (${formData.customerName})`,
        billId: billNumber,
        date: new Date().toISOString(),
        createdBy: currentUser?.name || "Unknown",
        createdAt: new Date().toISOString(),
      };
      saveToStorage("cashTransactions", [cashTransaction, ...cashTransactions]);
    }

    // Save bill
    bills.push(newBill);
    saveToStorage("bills", bills);

    // If API did not create the bill, use local generated bill preview
    if (!apiCreated) {
      setGeneratedBill(newBill);
      setShowPreview(true);
    }

    if (onSave) {
      onSave();
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "+977",
      customerAddress: "",
      customerPanVat: "",
      customerType: "retail",
      isWalkIn: true,
      items: [],
      subtotal: 0,
      discount: 0,
      discountType: "percentage",
      tax: 13,
      total: 0,
      paymentMethod: "cash",
      notes: "",
    });
    setShowPreview(false);
    setGeneratedBill(null);
  };

  if (showPreview && generatedBill) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Bill Creation</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Printer className="w-5 h-5" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={resetForm}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>New Bill</span>
            </button>
          </div>
        </div>

        {/* Bill Preview */}
        <div
          ref={printRef}
          className="bg-white rounded-xl border-2 border-gray-200 p-8 max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <p className="text-gray-600">Serve Spares - Inventory System</p>
            <p className="text-sm text-gray-500 mt-2">
              Bill No: {generatedBill.billNumber}
            </p>
            <p className="text-sm text-gray-500">
              Date:{" "}
              {new Date(generatedBill.createdAt).toLocaleDateString("en-NP")}
            </p>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Bill To:</h3>
              <p className="text-gray-700">{generatedBill.customerName}</p>
              {generatedBill.customerPhone && (
                <p className="text-gray-600 text-sm">
                  {generatedBill.customerPhone}
                </p>
              )}
              {generatedBill.customerAddress && (
                <p className="text-gray-600 text-sm">
                  {generatedBill.customerAddress}
                </p>
              )}
              {generatedBill.customerPanVat && (
                <p className="text-gray-600 text-sm">
                  PAN/VAT: {generatedBill.customerPanVat}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Payment Method:{" "}
                <span className="font-semibold">
                  {generatedBill.paymentMethod.toUpperCase()}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    generatedBill.paymentStatus === "paid"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {generatedBill.paymentStatus.toUpperCase()}
                </span>
              </p>
              {generatedBill.cashierName && (
                <p className="text-sm text-gray-600 mt-2">
                  Cashier: {generatedBill.cashierName}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">
                  S.N
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">
                  Part Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">
                  Warranty
                </th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  Rate
                </th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {generatedBill.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.itemName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.warranty || "No Warranty"}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-700">
                    Rs{item.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 font-semibold">
                    Rs{item.total.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900 font-semibold">
                  Rs{generatedBill.subtotal.toLocaleString()}
                </span>
              </div>
              {generatedBill.discount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">
                    Discount (
                    {generatedBill.discountType === "percentage"
                      ? `${generatedBill.discount}%`
                      : "Fixed"}
                    ):
                  </span>
                  <span className="text-red-600 font-semibold">
                    -Rs
                    {(generatedBill.discountType === "percentage"
                      ? (generatedBill.subtotal * generatedBill.discount) / 100
                      : generatedBill.discount
                    ).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">
                  Tax ({generatedBill.tax}%):
                </span>
                <span className="text-gray-900 font-semibold">
                  Rs
                  {(
                    ((generatedBill.subtotal -
                      (generatedBill.discountType === "percentage"
                        ? (generatedBill.subtotal * generatedBill.discount) /
                          100
                        : generatedBill.discount)) *
                      generatedBill.tax) /
                    100
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-300">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  Rs{generatedBill.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {generatedBill.notes && (
            <div className="border-t-2 border-gray-300 pt-4">
              <h3 className="font-bold text-gray-900 mb-2">Notes:</h3>
              <p className="text-gray-600 text-sm">{generatedBill.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-8 pt-6 border-t border-gray-300">
            <p>Thank you for your business!</p>
            <p className="mt-1">
              Generated on{" "}
              {new Date(generatedBill.createdAt).toLocaleString("en-NP")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-gray-900 text-2xl flex items-center space-x-3">
          <Receipt className="w-8 h-8 text-blue-600" />
          <span>Create New Bill</span>
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Generate professional invoices for your customers
        </p>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900 flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Customer Details</span>
              </h4>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isWalkIn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isWalkIn: e.target.checked,
                      partyId: undefined,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Walk-in Customer</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => {
                    setFormData({ ...formData, customerName: e.target.value });
                    setShowNameSuggestions(true);
                  }}
                  placeholder="Enter name"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showNameSuggestions && nameSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {nameSuggestions.map((party) => (
                      <button
                        key={party.id}
                        onClick={() => selectCustomer(party)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                      >
                        <p className="font-semibold text-gray-900">
                          {party.name}
                        </p>
                        <p className="text-sm text-gray-500">{party.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.customerPhone}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow +977 followed by up to 10 digits
                    if (value.startsWith("+977") && value.length <= 14) {
                      setFormData({ ...formData, customerPhone: value });
                      setShowPhoneSuggestions(true);
                    } else if (
                      !value.startsWith("+977") &&
                      value.length <= 14
                    ) {
                      // Allow typing even if doesn't start with +977 yet
                      setFormData({ ...formData, customerPhone: value });
                      setShowPhoneSuggestions(true);
                    }
                  }}
                  placeholder="+977"
                  maxLength={14}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showPhoneSuggestions && phoneSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {phoneSuggestions.map((party) => (
                      <button
                        key={party.id}
                        onClick={() => selectCustomer(party)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors"
                      >
                        <p className="font-semibold text-gray-900">
                          {party.name}
                        </p>
                        <p className="text-sm text-gray-500">{party.phone}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.customerAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerAddress: e.target.value,
                    })
                  }
                  placeholder="Enter address"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PAN / VAT Number
                </label>
                <input
                  type="text"
                  value={formData.customerPanVat}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPanVat: e.target.value })
                  }
                  placeholder="Enter PAN/VAT"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Type
                </label>
                <select
                  value={formData.customerType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customerType: e.target.value as CustomerType,
                    })
                  }
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="retail">Retail</option>
                  <option value="retailer">Retailer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="distributor">Distributor</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
            </div>
          </div>

          {/* Barcode Scanner */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <Barcode className="w-6 h-6" />
              <div className="flex-1 flex items-center justify-between">
                <label className="block text-sm text-purple-100 mb-1">
                  Scan Barcode
                </label>
                <button
                  onClick={toggleScanning}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-all ${
                    isScanning
                      ? "bg-red-500 text-white"
                      : "bg-white text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  {isScanning ? (
                    <>
                      <X className="w-4 h-4" />
                      <span>Close Camera</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Open Camera</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isScanning && (
              <div className="mb-4 bg-white rounded-lg overflow-hidden border-2 border-purple-200">
                <div
                  id="reader"
                  className="w-full"
                  style={{ minHeight: "300px" }}
                ></div>
                <p className="text-center text-xs text-gray-500 p-2 italic bg-purple-50">
                  Align barcode within the square to scan
                </p>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const item = inventory.find(
                      (i) => i.barcode === barcodeInput.trim(),
                    );
                    if (item) {
                      addItemToCart(item);
                    } else {
                      popup.showError(
                        "Item not found with this barcode",
                        "Barcode Not Found",
                      );
                    }
                    setBarcodeInput("");
                  }
                }}
                placeholder="Scan or enter barcode..."
                className="w-full px-4 py-2 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>

          {/* Item Search & Add */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h4 className="font-bold text-gray-900 flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-blue-600" />
              <span>Add Items</span>
            </h4>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                placeholder="Search by item name, part number, or barcode..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showItemSuggestions && filteredItems.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {/* Add Selected Items Button */}
                  {selectedItemIds.size > 0 && (
                    <div className="sticky top-0 bg-blue-50 border-b-2 border-blue-200 p-3 z-10">
                      <button
                        onClick={addMultipleItemsToCart}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        <Plus className="w-4 h-4" />
                        <span>
                          Add {selectedItemIds.size} Selected Item
                          {selectedItemIds.size > 1 ? "s" : ""}
                        </span>
                      </button>
                    </div>
                  )}

                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0"
                    >
                      {/* Checkbox for multi-select */}
                      <input
                        type="checkbox"
                        checked={selectedItemIds.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="mt-1 mr-3 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />

                      {/* Item details - clicking adds item directly */}
                      <button
                        onClick={() => addItemToCart(item)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.name}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              {item.partNumber && (
                                <span className="text-xs text-gray-500">
                                  PN: {item.partNumber}
                                </span>
                              )}
                              {item.barcode && (
                                <span className="text-xs text-gray-500">
                                  BC: {item.barcode}
                                </span>
                              )}
                              <span className="text-xs text-blue-600">
                                Stock: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-blue-600">
                              Rs{getCustomerPricing(item).toLocaleString()}
                            </p>
                            {item.warrantyPeriod && (
                              <span className="text-xs text-gray-500">
                                {item.warrantyPeriod}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Items Table */}
            {formData.items.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No items added yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Search and add items to the bill
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-900">
                        S.N
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-900">
                        Part Name
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-900">
                        Warranty
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-bold text-gray-900">
                        Quantity
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-bold text-gray-900">
                        Rate
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-bold text-gray-900">
                        Amount
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-bold text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-3 py-3 text-sm text-gray-700">
                          {index + 1}
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-sm font-semibold text-gray-900">
                            {item.itemName}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={item.warranty || "No Warranty"}
                            onChange={(e) =>
                              updateItem(index, "warranty", e.target.value)
                            }
                            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {WARRANTY_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity === "" ? "" : item.quantity}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                e.target.value === ""
                                  ? ""
                                  : parseInt(e.target.value),
                              )
                            }
                            className="w-20 text-center px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={item.price === "" ? "" : item.price}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "price",
                                e.target.value === ""
                                  ? ""
                                  : parseFloat(e.target.value),
                              )
                            }
                            className="w-24 text-right px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className="font-bold text-blue-600">
                            Rs{item.total.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => removeItem(index)}
                            className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary & Payment */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sticky top-6">
            <h4 className="font-bold text-gray-900 flex items-center space-x-2 mb-4">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>Bill Summary</span>
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  Rs{formData.subtotal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Discount
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.discount === "" ? "" : formData.discount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount:
                          e.target.value === ""
                            ? ""
                            : parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">Rs</option>
                  </select>
                </div>
                {formData.discount > 0 && (
                  <p className="text-xs text-red-600">
                    -Rs
                    {(formData.discountType === "percentage"
                      ? (formData.subtotal * formData.discount) / 100
                      : formData.discount
                    ).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({formData.tax}%):</span>
                <span className="font-semibold text-gray-900">
                  Rs
                  {(
                    ((formData.subtotal -
                      (formData.discountType === "percentage"
                        ? (formData.subtotal * Number(formData.discount)) / 100
                        : Number(formData.discount))) *
                      Number(formData.tax)) /
                    100
                  ).toLocaleString()}
                </span>
              </div>

              <div className="border-t-2 border-gray-300 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    Rs{formData.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Branch Selection */}
            {currentUser?.role !== "cashier" && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branch
                </label>
                <select
                  value={selectedBranchId ?? ""}
                  onChange={(e) => setSelectedBranchId(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                      {b.location ? ` (${b.location})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Payment Method */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as any,
                    bankAccountId: undefined,
                  })
                }
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
              </select>

              {/* Bank Account Selection */}
              {(formData.paymentMethod === "esewa" ||
                formData.paymentMethod === "fonepay" ||
                formData.paymentMethod === "bank") && (
                <div className="mt-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Account
                  </label>
                  <select
                    value={formData.bankAccountId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankAccountId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select account...</option>
                    {bankAccounts
                      .filter(
                        (acc) => acc.accountType === formData.paymentMethod,
                      )
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.accountName}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any notes..."
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => handleSaveBill("paid")}
                disabled={formData.items.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                <span>Save & Mark Paid</span>
              </button>
              <button
                onClick={() => handleSaveBill("pending")}
                disabled={formData.items.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="w-5 h-5" />
                <span>Save as Pending</span>
              </button>
              <button
                onClick={() => handleSaveBill("draft")}
                disabled={formData.items.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>Save as Draft</span>
              </button>
              <button
                onClick={resetForm}
                className="w-full px-6 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

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
