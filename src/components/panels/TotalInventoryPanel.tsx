import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  AlertCircle,
  Edit,
  Trash2,
  Package,
  TrendingDown,
  DollarSign,
  X,
  Eye,
  Download,
  Filter,
  BarChart3,
  Archive,
  Scan,
  Upload,
} from "lucide-react";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { InventoryItem, Party, VehicleType, ItemCategory } from "../../types";
import { Pagination } from "../common/Pagination";
import { InventoryFilterPanel } from "./InventoryFilterPanel";
import {
  listenToEvent,
  emitItemCreated,
  emitItemUpdated,
  emitItemDeleted,
} from "../../utils/eventBus";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  two_wheeler: "2-Wheeler",
  four_wheeler: "4-Wheeler",
};

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  local: "Local",
  original: "Original",
};

const WARRANTY_LABELS: Record<string, string> = {
  no_warranty: "No Warranty",
  "1_month": "1 Month",
  "2_month": "2 Month",
  "3_month": "3 Month",
  "4_month": "4 Month",
  "5_month": "5 Month",
  "6_month": "6 Month",
  "9_month": "9 Month",
  "12_month": "12 Month",
  "24_month": "24 Month",
};

import { getBranches } from "../../api/branch.api";

export const TotalInventoryPanel: React.FC<{ filter?: string }> = ({
  filter,
}) => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    [],
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [parties, setParties] = useState<Party[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<ItemCategory | "all">(
    "all",
  );
  const [filterVehicleType, setFilterVehicleType] = useState<
    VehicleType | "all"
  >("all");
  const [quickFilter, setQuickFilter] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewingSidebar, setViewingSidebar] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scanError, setScanError] = useState<string>("");
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [currentBranchId, setCurrentBranchId] = useState<number>(0);

  const [formData, setFormData] = useState<
    Partial<InventoryItem> & { imageFiles?: File[]; multipleImageFiles?: File[] }
  >({
    name: "",
    category: "local",
    vehicleType: "two_wheeler",
    quantity: "",
    minStockLevel: "",
    price: "",
    mrp: "",
    partyId: "",
    partNumber: "",
    hsnCode: "",
    location: "",
    warrantyPeriod: "",
    image: "",
    imageFiles: [],
    multipleImageFiles: [],
    bikeName: "",
    bikeModel: "",
    bikeType: "",
    retailPrice: "",
    wholesalePrice: "",
    distributorPrice: "",
  });

  useEffect(() => {
    if (!currentUser) return;

    loadInventory();
    loadParties();

    // Listen for real-time events
    const cleanup1 = listenToEvent("IMPORT_COMPLETE", () => {
      console.log("📥 Auto-refreshing inventory after import");
      loadInventory();
      setRefreshTrigger((prev) => prev + 1);
    });

    const cleanup2 = listenToEvent("ITEM_UPDATED", () => {
      console.log("🔄 Auto-refreshing inventory after update");
      loadInventory();
      setRefreshTrigger((prev) => prev + 1);
    });

    const cleanup3 = listenToEvent("ITEM_CREATED", () => {
      console.log("✅ Auto-refreshing inventory after creation");
      loadInventory();
      setRefreshTrigger((prev) => prev + 1);
    });

    return () => {
      cleanup1();
      cleanup2();
      cleanup3();
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchBranchId = async () => {
      if (currentUser?.branchId) {
        setCurrentBranchId(parseInt(currentUser.branchId));
      } else if (currentUser?.branch && !isNaN(parseInt(currentUser.branch))) {
        setCurrentBranchId(parseInt(currentUser.branch));
      } else {
        try {
          const response = await getBranches();
          if (response.results && response.results.length > 0) {
            setCurrentBranchId(response.results[0].id);
          }
        } catch (err) {
          console.error("Error fetching branches:", err);
        }
      }
    };
    fetchBranchId();
  }, [currentUser]);

  useEffect(() => {
    if (filter) {
      setQuickFilter(filter);
    }
  }, [filter]);

  const loadInventory = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      // Allow ngrok to bypass its browser warning for programmatic requests
      headers["ngrok-skip-browser-warning"] = "true";

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/stock-management/inventory/`,
        { headers },
      );
      if (res.status === 401) {
        throw new Error(
          "Unauthorized: Authentication credentials were not provided.",
        );
      }
      if (!res.ok) throw new Error(`API responded with ${res.status}`);
      const data = await res.json();
      const results = data.results || data;
      const mapped: InventoryItem[] = (results || []).map((it: any) => ({
        id: String(it.id),
        name: it.item_name || it.itemName || it.name || "",
        category: (it.category || "local") as ItemCategory,
        vehicleType: (it.vehicle_type || "two_wheeler") as VehicleType,
        bikeName: it.vehicle_bike_details || it.bikeName || undefined,
        bikeModel: it.model || it.bikeModel || undefined,
        bikeType: it.type || it.bikeType || undefined,
        quantity: parseFloat(it.quantity) || 0,
        minStockLevel:
          parseFloat(it.min_stock_level || it.minStockLevel || 0) || 0,
        price: parseFloat(it.price || 0) || 0,
        mrp: parseFloat(it.mrp || 0) || 0,
        retailPrice: parseFloat(it.retail_pricing || it.retailPrice || 0) || 0,
        wholesalePrice:
          parseFloat(it.wholesale_price || it.wholesalePrice || 0) || 0,
        distributorPrice:
          parseFloat(it.distributor_price || it.distributorPrice || 0) || 0,
        partyId: it.party || undefined,
        partyName: it.party_detail?.party_name || it.partyName,
        partNumber: it.part_number || it.partNumber || undefined,
        barcode: it.barcode || undefined,
        hsnCode: it.hsn_code || it.hsnCode || undefined,
        location: it.storage_location || it.location || undefined,
        warrantyPeriod: it.warranty_period || it.warrantyPeriod || undefined,
        image: (() => {
          if (Array.isArray(it.images) && it.images.length > 0) {
            const primary = it.images.find((img: any) => img.is_primary);
            if (primary) return primary.image;
            return typeof it.images[0] === "string"
              ? it.images[0]
              : it.images[0].image;
          }
          return it.image || undefined;
        })(),
        // Prefer workspace ID from API if present, otherwise fallback to current user
        workspaceId:
          it.workspaceId ||
          it.workspace ||
          it.workspace_id ||
          currentUser?.workspaceId,
        branchId: it.branch || undefined,
        createdAt: it.created || it.createdAt || new Date().toISOString(),
        lastRestocked: it.modified || it.lastRestocked || undefined,
      }));

      console.log(
        "TotalInventoryPanel: currentUser.workspaceId=",
        currentUser?.workspaceId,
      );

      console.log("TotalInventoryPanel: token present=", !!token);

      console.log("TotalInventoryPanel: mapped length=", mapped.length);

      console.log(
        "TotalInventoryPanel: sample mapped item=",
        mapped[0] || null,
      );
      // eslint-disable-next-line no-console
      console.log(
        "TotalInventoryPanel: workspaceIds in mapped=",
        mapped.map((m) => m.workspaceId),
      );

      const filteredByWorkspace = mapped.filter(
        (i) => String(i.workspaceId) === String(currentUser?.workspaceId),
      );

      // Always update storage to ensure deletions are reflected
      try {
        saveToStorage("products", mapped);
        saveToStorage("inventory", mapped);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Failed to persist mapped inventory to storage:", e);
      }

      if (mapped.length > 0) {
        // eslint-disable-next-line no-console
        console.log(
          "TotalInventoryPanel: Using API-mapped items (count=",
          mapped.length,
          ") and persisted to local storage",
        );

        setInventory(mapped);
      } else {
        setInventory(filteredByWorkspace);
      }
      return;
    } catch (err) {
      console.warn(
        "Failed to fetch remote inventory, using local storage",
        err,
      );
      // eslint-disable-next-line no-console
      console.log(
        "TotalInventoryPanel: falling back to local storage. currentUser.workspaceId=",
        currentUser?.workspaceId,
      );
    }

    const allInventory = getFromStorage("products", []);
    setInventory(
      allInventory.filter(
        (i: InventoryItem) =>
          String(i.workspaceId) === String(currentUser?.workspaceId),
      ),
    );
  };

  const loadParties = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/stock-management/parties/suppliers/`,
        { headers },
      );

      if (response.ok) {
        const data = await response.json();
        let results: any[] = [];
        if (Array.isArray(data)) {
          results = data;
        } else if (data.results && Array.isArray(data.results)) {
          results = data.results;
        }

        const mappedParties: Party[] = results.map((party: any) => ({
          id: party.id.toString(),
          name: party.party_name,
          type: "supplier",
          contactPerson: party.contact_person || "",
          phone: party.phone || "",
          email: party.email || "",
          address: party.address || "",
          city: party.city || "",
          paymentTerms: party.payment_terms || "cash",
          openingBalance: parseFloat(party.opening_balance) || 0,
          currentBalance: parseFloat(party.opening_balance) || 0,
          isActive: party.is_active,
          createdAt: party.created || new Date().toISOString(),
          workspaceId: currentUser?.workspaceId,
        }));
        setParties(mappedParties);
      } else {
        // Fallback to local storage if API fails
        const allParties = getFromStorage("parties", []);
        setParties(
          allParties.filter(
            (p: Party) => p.workspaceId === currentUser?.workspaceId,
          ),
        );
      }
    } catch (err) {
      console.error("Error loading parties:", err);
      const allParties = getFromStorage("parties", []);
      setParties(
        allParties.filter(
          (p: Party) => p.workspaceId === currentUser?.workspaceId,
        ),
      );
    }
  };

  const getPartyName = (partyId?: string) => {
    if (!partyId) return "No Party";
    const party = parties.find((p) => p.id === partyId);
    return party?.name || "Unknown Party";
  };

  const handleOpenSidebar = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "local",
        vehicleType: "two_wheeler",
        quantity: "0",
        minStockLevel: "0",
        price: "0",
        mrp: "0",
        partyId: "",
        partNumber: "",
        hsnCode: "",
        location: "",
        warrantyPeriod: "",
        image: "",
        imageFiles: [],
        bikeName: "",
        bikeModel: "",
        bikeType: "",
        retailPrice: "",
        wholesalePrice: "",
        distributorPrice: "",
      });
    }
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      category: "local",
      vehicleType: "two_wheeler",
      quantity: "0",
      minStockLevel: "0",
      price: "0",
      mrp: "0",
      partyId: "",
      partNumber: "",
      hsnCode: "",
      location: "",
      warrantyPeriod: "",
      image: "",
      imageFiles: [],
      multipleImageFiles: [],
      bikeName: "",
      bikeModel: "",
      bikeType: "",
      retailPrice: "",
      wholesalePrice: "",
      distributorPrice: "",
    });
  };

  const handleViewItem = (item: InventoryItem) => {
    setViewingItem(item);
    setViewingSidebar(true);
  };

  const handleCloseViewSidebar = () => {
    setViewingSidebar(false);
    setViewingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      const headers: Record<string, string> = {
        "ngrok-skip-browser-warning": "true",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const formDataPayload = new FormData();
      if (formData.name) formDataPayload.append("item_name", formData.name);
      if (formData.category)
        formDataPayload.append("category", formData.category);
      if (formData.vehicleType)
        formDataPayload.append("vehicle_type", formData.vehicleType);
      if (formData.partyId) formDataPayload.append("party", formData.partyId);
      if (formData.partNumber)
        formDataPayload.append("part_number", formData.partNumber);
      if (formData.hsnCode)
        formDataPayload.append("hsn_code", formData.hsnCode);
      formDataPayload.append("quantity", (formData.quantity === "" ? 0 : formData.quantity || 0).toString());
      formDataPayload.append(
        "min_stock_level",
        (formData.minStockLevel === "" ? 0 : formData.minStockLevel || 0).toString(),
      );
      formDataPayload.append(
        "price",
        (formData.price === "" ? 0 : formData.price || 0).toString(),
      );
      formDataPayload.append(
        "mrp",
        (formData.mrp === "" ? 0 : formData.mrp || 0).toString(),
      );
      if (formData.distributorPrice !== undefined)
        formDataPayload.append(
          "distributor_price",
          (formData.distributorPrice === ""
            ? 0
            : formData.distributorPrice || 0
          ).toString(),
        );
      if (formData.wholesalePrice !== undefined)
        formDataPayload.append(
          "wholesale_price",
          (formData.wholesalePrice === ""
            ? 0
            : formData.wholesalePrice || 0
          ).toString(),
        );
      if (formData.retailPrice !== undefined)
        formDataPayload.append(
          "retail_pricing",
          (formData.retailPrice === ""
            ? 0
            : formData.retailPrice || 0
          ).toString(),
        );
      if (formData.location)
        formDataPayload.append("storage_location", formData.location);
      formDataPayload.append(
        "warranty_period",
        formData.warrantyPeriod || "no_warranty",
      );

      if (formData.bikeName)
        formDataPayload.append("vehicle_bike_details", formData.bikeName);
      if (formData.bikeModel)
        formDataPayload.append("model", formData.bikeModel);
      if (formData.bikeType) formDataPayload.append("type", formData.bikeType);

      const branchId = editingItem?.branchId || currentBranchId;
      if (branchId) formDataPayload.append("branch", branchId.toString());

      formDataPayload.append("is_active", "true");
      formDataPayload.append("is_primary", "true");

      if (formData.imageFiles && formData.imageFiles.length > 0) {
        formData.imageFiles.forEach((file) => {
          formDataPayload.append("images", file);
        });
      }

      // TODO: Multiple images upload - API not available yet
      // When the multiple image upload API becomes available, uncomment and implement:
      // if (formData.multipleImageFiles && formData.multipleImageFiles.length > 0) {
      //   const multipleImageFormData = new FormData();
      //   formData.multipleImageFiles.forEach((file) => {
      //     multipleImageFormData.append("images", file);
      //   });
      //   // Call the multiple image upload API endpoint here
      //   // Example:
      //   // await fetch(`${import.meta.env.VITE_API_BASE_URL}/stock-management/inventory/${itemId}/upload-multiple-images/`, {
      //   //   method: "POST",
      //   //   headers,
      //   //   body: multipleImageFormData,
      //   // });
      // }

      let response;
      if (editingItem) {
        // Appending branch param to ensure context for editing
        const branchParam = editingItem.branchId
          ? `?branch=${editingItem.branchId}`
          : "";
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/stock-management/inventory/${
            editingItem.id
          }/`,
          {
            method: "PATCH",
            headers,
            body: formDataPayload,
          },
        );
      } else {
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/stock-management/inventory/`,
          {
            method: "POST",
            headers,
            body: formDataPayload,
          },
        );
      }

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Server API Error:", responseData);
        let errorMsg = responseData.detail || responseData.message;

        // Extract field-specific errors if no generic message exists
        if (!errorMsg && typeof responseData === "object") {
          const fieldErrors = Object.entries(responseData).map(
            ([field, messages]) => {
              const formattedField = field
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              const formattedMessages = Array.isArray(messages)
                ? messages.join(", ")
                : String(messages);
              return `${formattedField}: ${formattedMessages}`;
            },
          );

          if (fieldErrors.length > 0) {
            errorMsg = fieldErrors.join("\n");
          }
        }

        throw new Error(errorMsg || "Failed to save item");
      }

      const savedId = responseData.id;

      // Update local state or reload
      loadInventory();
      handleCloseSidebar();
      popup.showSuccess(
        editingItem ? "Item updated successfully" : "Item added successfully",
      );
    } catch (err: any) {
      console.error("Error saving item:", err);
      popup.showError("Failed to save item", err.message);
    }
  };

  const handleDelete = (itemId: string) => {
    popup.showConfirm(
      "Delete Item",
      "Are you sure you want to delete this item?",
      async () => {
        const token =
          localStorage.getItem("accessToken") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("token");

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        // Find item to get correct branch ID to ensure API matches the query
        const itemToDelete =
          inventory.find((i) => i.id === itemId) ||
          filteredInventory.find((i) => i.id === itemId);
        const targetBranchId = itemToDelete?.branchId || currentBranchId;

        try {
          const apiUrl = `${
            import.meta.env.VITE_API_BASE_URL
          }/stock-management/inventory/${itemId}/`;
          const res = await fetch(apiUrl, {
            method: "DELETE",
            headers,
          });

          if (
            res.ok ||
            res.status === 204 ||
            res.status === 200 ||
            res.status === 202
          ) {
            // Only update local state if server delete succeeds
            setSelectedItems([]);
            emitItemDeleted(itemId);
            loadInventory();
            popup.showSuccess("Item deleted successfully!");
          } else {
            // Handle error response
            const errorData = await res.json().catch(() => ({}));
            const errorMessage =
              errorData.detail || errorData.message || "Failed to delete item";
            throw new Error(errorMessage);
          }
        } catch (err: any) {
          console.error("Failed to delete inventory item:", err);
          popup.showError("Delete Failed", err.message);
        }
      },
      {
        type: "danger",
        details: [
          "This action cannot be undone",
          "All related data will be removed",
        ],
      },
    );
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      popup.showError("Please select items to delete", "No Selection");
      return;
    }

    popup.showConfirm(
      "Delete Multiple Items",
      `Are you sure you want to delete ${selectedItems.length} item(s)?`,
      () => {
        const allInventory = getFromStorage("products", []);
        const filtered = allInventory.filter(
          (i: InventoryItem) => !selectedItems.includes(i.id),
        );
        saveToStorage("products", filtered);
        setSelectedItems([]);
        loadInventory();
        popup.showSuccess(
          `${selectedItems.length} item(s) deleted successfully!`,
        );
      },
      {
        type: "danger",
        details: [
          "This action cannot be undone",
          "All related data will be permanently removed",
        ],
      },
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === paginatedInventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedInventory.map((i) => i.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleOpenScanner = () => {
    setScannerOpen(true);
    setScanError("");
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);
    stopCamera();
    setScanError("");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScannerActive(true);
        setScanError("");

        setTimeout(() => {
          scanBarcodeFromVideo();
        }, 1000);
      }
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        setScanError(
          "Camera permission denied. Please use manual entry below.",
        );
      } else if (error.name === "NotFoundError") {
        setScanError(
          "No camera found on this device. Please use manual entry below.",
        );
      } else if (error.name === "NotReadableError") {
        setScanError(
          "Camera is already in use. Please use manual entry below.",
        );
      } else {
        setScanError("Unable to access camera. Please use manual entry below.");
      }
      setScannerActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScannerActive(false);
  };

  const scanBarcodeFromVideo = () => {};

  const handleManualBarcodeEntry = (barcode: string) => {
    if (!barcode.trim()) {
      setScanError("Please enter a valid barcode");
      return;
    }

    const allInventory = getFromStorage("inventory", []);
    const foundItem = allInventory.find(
      (item: InventoryItem) =>
        item.workspaceId === currentUser?.workspaceId &&
        item.barcode === barcode.trim(),
    ) as InventoryItem | undefined;

    if (foundItem) {
      setFormData({
        ...foundItem,
        quantity: formData.quantity || 0,
      });
      handleCloseScanner();

      popup.showSuccess(
        `All details have been auto-filled!`,
        `Product Found: ${foundItem.name}`,
      );
    } else {
      setScanError(`No product found with barcode: ${barcode}`);
    }
  };

  const handleExport = () => {
    const csvContent = [
      [
        "Item Name",
        "Part Number",
        "Category",
        "Vehicle Type",
        "Quantity",
        "Price",
        "MRP",
        "Party",
        "HSN Code",
        "Location",
      ],
      ...filteredInventory.map((i) => [
        i.name || "",
        i.partNumber || "",
        i.category ? CATEGORY_LABELS[i.category] : "",
        i.vehicleType ? VEHICLE_TYPE_LABELS[i.vehicleType] : "",
        (i.quantity || 0).toString(),
        (i.price || 0).toString(),
        (i.mrp || 0).toString(),
        i.partyName || getPartyName(i.partyId),
        i.hsnCode || "",
        i.location || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Use filtered items from InventoryFilterPanel, or fallback to all inventory
  const displayInventory =
    filteredInventory.length > 0 ? filteredInventory : inventory;

  // Apply additional quick filters from dashboard on top of smart filters
  const finalFilteredInventory = displayInventory.filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.partNumber || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (item.hsnCode || "").toLowerCase().includes(searchQuery.toLowerCase());

    // Apply quick filter from dashboard
    let matchesQuickFilter = true;
    if (quickFilter) {
      const bills = getFromStorage("bills", []);
      const last30Days = Date.now() - 30 * 24 * 60 * 60 * 1000;

      switch (quickFilter) {
        case "low-stock":
          matchesQuickFilter = item.quantity <= item.minStockLevel;
          break;
        case "top-selling":
          // Calculate if it's a fast mover
          let totalSold = 0;
          bills.forEach((bill: any) => {
            if (new Date(bill.createdAt).getTime() > last30Days) {
              const billItem = bill.items.find((bi: any) => bi.id === item.id);
              if (billItem) totalSold += billItem.quantity;
            }
          });
          matchesQuickFilter = totalSold / 30 >= 2; // Fast velocity
          break;
        case "dead-stock":
          // No sales in last 30 days
          let hasSales = false;
          bills.forEach((bill: any) => {
            if (new Date(bill.createdAt).getTime() > last30Days) {
              const billItem = bill.items.find((bi: any) => bi.id === item.id);
              if (billItem) hasSales = true;
            }
          });
          matchesQuickFilter = !hasSales;
          break;
        case "high-value":
          matchesQuickFilter = item.quantity * item.price > 50000;
          break;
        default:
          matchesQuickFilter = true;
      }
    }

    return matchesSearch && matchesQuickFilter;
  });

  const paginatedInventory = finalFilteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const lowStockCount = inventory.filter(
    (i) => i.quantity <= i.minStockLevel,
  ).length;
  const totalValue = inventory.reduce(
    (sum, i) => sum + i.quantity * i.price,
    0,
  );
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);

  const categoryCounts = inventory.reduce(
    (acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    },
    {} as Record<ItemCategory, number>,
  );

  const vehicleTypeCounts = inventory.reduce(
    (acc, i) => {
      acc[i.vehicleType] = (acc[i.vehicleType] || 0) + 1;
      return acc;
    },
    {} as Record<VehicleType, number>,
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Items</p>
              <p className="text-3xl mb-1">{inventory.length}</p>
              <p className="text-blue-100 text-xs">
                {totalItems} units in stock
              </p>
            </div>
            <div className="w-14 h-14 bg-opacity-20 rounded-lg flex items-center justify-center">
              <Package className="w-7 h-7 " />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm mb-1">Low Stock Alert</p>
              <p className="text-3xl mb-1">{lowStockCount}</p>
              <p className="text-red-100 text-xs">Items need restock</p>
            </div>
            <div className="w-14 h-14 bg-opacity-20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Value</p>
              <p className="text-3xl mb-1">
                Rs{(totalValue / 1000).toFixed(1)}k
              </p>
              <p className="text-green-100 text-xs">Inventory worth</p>
            </div>
            <div className="w-14 h-14  bg-opacity-20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Categories</p>
              <p className="text-3xl mb-1">
                {Object.keys(categoryCounts).length}
              </p>
              <p className="text-purple-100 text-xs">Local & Branded</p>
            </div>
            <div className="w-14 h-14  bg-opacity-20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-7 h-7" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-900 text-xl">Inventory Management</h3>
          <p className="text-gray-500 text-sm mt-1">
            Manage all your auto parts inventory
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => handleOpenSidebar()}
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Smart Filter Panel */}
      <InventoryFilterPanel
        onFilterChange={setFilteredInventory}
        refreshTrigger={refreshTrigger}
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filters Section */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, part number, or HSN code..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Bulk Delete Button */}
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete Selected ({selectedItems.length})</span>
              </button>
            )}

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(e.target.value as ItemCategory | "all")
                }
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="all">All Categories</option>
                <option value="local">Local</option>
                <option value="original">Original</option>
              </select>
            </div>

            {/* Vehicle Type Filter */}
            <div>
              <select
                value={filterVehicleType}
                onChange={(e) =>
                  setFilterVehicleType(e.target.value as VehicleType | "all")
                }
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="all">All Vehicles</option>
                <option value="two_wheeler">2-Wheeler</option>
                <option value="four_wheeler">4-Wheeler</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <div className="text-sm text-gray-600">Quick Filters:</div>
            {(["local", "original"] as ItemCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setFilterCategory(filterCategory === cat ? "all" : cat)
                }
                className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                  filterCategory === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-blue-400"
                }`}
              >
                {CATEGORY_LABELS[cat]} ({categoryCounts[cat] || 0})
              </button>
            ))}
            {(["two_wheeler", "four_wheeler"] as VehicleType[]).map((type) => (
              <button
                key={type}
                onClick={() =>
                  setFilterVehicleType(
                    filterVehicleType === type ? "all" : type,
                  )
                }
                className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                  filterVehicleType === type
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-purple-400"
                }`}
              >
                {VEHICLE_TYPE_LABELS[type]} ({vehicleTypeCounts[type] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === paginatedInventory.length &&
                      paginatedInventory.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Photo
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Item Details
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Category
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Vehicle Type
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Party
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Stock
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Price
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Status
                </th>
                <th className="text-left text-gray-600 text-sm py-4 px-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {finalFilteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12">
                    <Archive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No inventory items found</p>
                    <button
                      onClick={() => handleOpenSidebar()}
                      className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Add your first item
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedInventory.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-blue-50 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-gray-900 mb-1">{item.name}</div>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          {item.partNumber && (
                            <span className="flex items-center">
                              <span className="text-xs text-gray-400 mr-1">
                                PN:
                              </span>
                              {item.partNumber}
                            </span>
                          )}
                          {item.hsnCode && (
                            <span className="flex items-center">
                              <span className="text-xs text-gray-400 mr-1">
                                HSN:
                              </span>
                              {item.hsnCode}
                            </span>
                          )}
                        </div>
                        {item.location && (
                          <div className="text-xs text-gray-400 mt-1">
                            📍 {item.location}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          item.category === "original"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1.5 rounded-full text-sm bg-purple-100 text-purple-700 font-medium">
                        {VEHICLE_TYPE_LABELS[item.vehicleType]}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600 text-sm">
                        {item.partyName || getPartyName(item.partyId)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div
                          className={`text-lg ${
                            item.quantity <= item.minStockLevel
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {item.quantity}
                        </div>
                        <div className="text-xs text-gray-400">
                          Min: {item.minStockLevel}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-gray-900">
                          Rs{(item.price || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          MRP: Rs{(item.mrp || 0).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {item.quantity <= item.minStockLevel ? (
                        <span className="flex items-center space-x-1.5 text-red-600 text-sm bg-red-50 px-3 py-1.5 rounded-full">
                          <AlertCircle className="w-4 h-4" />
                          <span>Low Stock</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1.5 text-green-600 text-sm bg-green-50 px-3 py-1.5 rounded-full">
                          <Package className="w-4 h-4" />
                          <span>In Stock</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewItem(item)}
                          className="p-2 text-green-600 hover:bg-green-100 hover:scale-110 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenSidebar(item)}
                          className="p-2 text-blue-600 hover:bg-blue-100 hover:scale-110 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-100 hover:scale-110 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {finalFilteredInventory.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(finalFilteredInventory.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Summary Footer */}
        {finalFilteredInventory.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total {finalFilteredInventory.length} items ({inventory.length} in
              workspace)
            </div>
            <div className="text-sm text-gray-500">
              Total Value: Rs
              {finalFilteredInventory
                .reduce((sum, i) => sum + i.quantity * i.price, 0)
                .toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Sidebar with Animation */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 inset-0 z-40 transition-opacity duration-300"
            onClick={handleCloseSidebar}
            style={{ animation: "fadeIn 0.3s ease-out" }}
          />

          <div
            className="fixed right-0 top-0 h-full w-full md:w-[550px] bg-white shadow-2xl z-50 overflow-y-auto"
            style={{ animation: "slideInRight 0.3s ease-out" }}
          >
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 z-10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl">
                    {editingItem ? "Edit Inventory Item" : "Add New Item"}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {editingItem
                      ? "Update item details below"
                      : "Fill in the details to add a new item"}
                  </p>
                </div>
                <button
                  onClick={handleCloseSidebar}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                {/* Item Name */}
                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <label className="block text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Engine Oil - Castrol 20W-50"
                    required
                  />
                </div>

                {/* Category & Vehicle Type Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as ItemCategory,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="local">Local</option>
                      <option value="original">Original</option>
                    </select>
                  </div>

                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-gray-700 mb-2">
                      Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleType: e.target.value as VehicleType,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="two_wheeler">2-Wheeler</option>
                      <option value="four_wheeler">4-Wheeler</option>
                    </select>
                  </div>
                </div>

                {/* Party Selection */}
                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <label className="block text-gray-700 mb-2">
                    Supplier/Party
                  </label>
                  <select
                    value={formData.partyId}
                    onChange={(e) =>
                      setFormData({ ...formData, partyId: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="">Select a party</option>
                    {parties.map((party) => (
                      <option key={party.id} value={party.id}>
                        {party.name} ({party.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Part Number & HSN Code Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-gray-700 mb-2">
                      Part Number
                    </label>
                    <input
                      type="text"
                      value={formData.partNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, partNumber: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="e.g., CTL-20W50-1L"
                    />
                  </div>

                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-gray-700 mb-2">HSN Code</label>
                    <input
                      type="text"
                      value={formData.hsnCode}
                      onChange={(e) =>
                        setFormData({ ...formData, hsnCode: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="e.g., 27101990"
                    />
                  </div>
                </div>

                {/* Quantity & Min Stock Level Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-gray-700 mb-2">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: e.target.value === "" ? "" : parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      min="0"
                      step="1"
                      required
                    />
                  </div>

                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-gray-700 mb-2">
                      Min Stock Level <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minStockLevel: e.target.value === "" ? "" : parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                </div>

                {/* Price & MRP Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-gray-700 mb-2">
                      Price (Rs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price === "" ? "" : formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      min="0"
                      step="1"
                      required
                    />
                  </div>

                  <div className="transform transition-all duration-200 hover:translate-x-1">
                    <label className="block text-gray-700 mb-2">
                      MRP (Rs) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.mrp === "" ? "" : formData.mrp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mrp:
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <label className="block text-gray-700 mb-2">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="e.g., Shelf A-12, Warehouse 2"
                  />
                </div>

                {/* Warranty Period */}
                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <label className="block text-gray-700 mb-2">
                    Warranty Period (Optional)
                  </label>
                  <select
                    value={formData.warrantyPeriod || "no_warranty"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        warrantyPeriod: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <option value="no_warranty">No Warranty</option>
                    <option value="1_month">1 Month</option>
                    <option value="2_month">2 Month</option>
                    <option value="3_month">3 Month</option>
                    <option value="4_month">4 Month</option>
                    <option value="5_month">5 Month</option>
                    <option value="6_month">6 Month</option>
                    <option value="9_month">9 Month</option>
                    <option value="12_month">12 Month</option>
                    <option value="24_month">24 Month</option>
                  </select>
                </div>

                {/* Barcode Scanner Field - Removed as per request */}

                {/* Part Image Upload */}
                <div className="transform transition-all duration-200 hover:translate-x-1">
                  <label className="block text-gray-700 mb-2 flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Part Image(s)
                  </label>
                  <div className="flex flex-col space-y-2">
                    {/* Preview Images */}
                    <div className="flex flex-wrap gap-2">
                      {formData.imageFiles &&
                        formData.imageFiles.map((file, index) => (
                          <div key={index} className="relative w-20 h-20">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index}`}
                              className="w-full h-full rounded-lg object-cover border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = [
                                  ...(formData.imageFiles || []),
                                ];
                                newFiles.splice(index, 1);
                                setFormData({
                                  ...formData,
                                  imageFiles: newFiles,
                                });
                              }}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center text-xs"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      {(!formData.imageFiles ||
                        formData.imageFiles.length === 0) &&
                        formData.image && (
                          <img
                            src={formData.image}
                            alt="Existing"
                            className="w-20 h-20 rounded-lg object-cover border border-gray-300"
                          />
                        )}
                    </div>

                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            setFormData({
                              ...formData,
                              imageFiles: Array.from(files),
                            });
                          }
                        }}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Select multiple images (PNG, JPG up to 2MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bike/Vehicle Details Section */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                  <h4 className="text-gray-900 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-purple-600" />
                    Vehicle/Bike Details (Optional)
                  </h4>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Bike/Vehicle Name
                      </label>
                      <input
                        type="text"
                        value={formData.bikeName || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, bikeName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="e.g., Honda Activa, Maruti Swift"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">
                          Model
                        </label>
                        <input
                          type="text"
                          value={formData.bikeModel || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bikeModel: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="e.g., 6G, LXI"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-sm mb-2">
                          Type
                        </label>
                        <input
                          type="text"
                          value={formData.bikeType || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              bikeType: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="e.g., Scooter, Sedan"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Three-Tier Pricing Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                  <h4 className="text-gray-900 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    Three-Tier Pricing (Optional)
                  </h4>
                  <p className="text-xs text-gray-500">
                    Set different prices for retail, wholesale, and distributor
                    customers
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Retail Price (Rs)
                      </label>
                      <input
                        type="number"
                        value={
                          formData.retailPrice === ""
                            ? ""
                            : formData.retailPrice
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            retailPrice:
                              e.target.value === ""
                                ? ""
                                : parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        min="0"
                        step="1"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Walk-in customers
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Wholesale Price (Rs)
                      </label>
                      <input
                        type="number"
                        value={
                          formData.wholesalePrice === ""
                            ? ""
                            : formData.wholesalePrice
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            wholesalePrice:
                              e.target.value === ""
                                ? ""
                                : parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        min="0"
                        step="1"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">Bulk orders</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Distributor Price (Rs)
                      </label>
                      <input
                        type="number"
                        value={
                          formData.distributorPrice === ""
                            ? ""
                            : formData.distributorPrice
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            distributorPrice:
                              e.target.value === ""
                                ? ""
                                : parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        min="0"
                        step="1"
                        placeholder="0"
                      />
                      <p className="text-xs text-gray-400 mt-1">Distributors</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-green-300">
                    <p className="text-xs text-gray-600 mb-1">
                      💡 Pricing Tip:
                    </p>
                    <p className="text-xs text-gray-500">
                      Distributor &lt; Wholesale &lt; Retail &lt; MRP
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6 sticky bottom-0 bg-white pb-4">
                  <button
                    type="button"
                    onClick={handleCloseSidebar}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    {editingItem ? "Update Item" : "Add Item"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* View Item Sidebar */}
      {viewingSidebar && viewingItem && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseViewSidebar}
          />

          <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 z-10 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl">Item Details</h3>
                  <p className="text-green-100 text-sm mt-1">
                    Complete information
                  </p>
                </div>
                <button
                  onClick={handleCloseViewSidebar}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Item Header */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5">
                <h4 className="text-gray-900 text-xl mb-3">
                  {viewingItem.name}
                </h4>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      viewingItem.category === "original"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {CATEGORY_LABELS[viewingItem.category]}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                    {VEHICLE_TYPE_LABELS[viewingItem.vehicleType]}
                  </span>
                </div>
              </div>

              {/* Item Image */}
              {viewingItem.image && (
                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">Part Image</span>
                  </div>
                  <div className="p-4 bg-gray-50">
                    <img
                      src={viewingItem.image}
                      alt={viewingItem.name}
                      className="w-full h-64 object-contain rounded-lg bg-white border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`rounded-xl p-4 ${
                    viewingItem.quantity <= viewingItem.minStockLevel
                      ? "bg-red-50 border-2 border-red-200"
                      : "bg-green-50 border-2 border-green-200"
                  }`}
                >
                  <p
                    className={`text-sm mb-1 ${
                      viewingItem.quantity <= viewingItem.minStockLevel
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    Current Stock
                  </p>
                  <p
                    className={`text-3xl ${
                      viewingItem.quantity <= viewingItem.minStockLevel
                        ? "text-red-900"
                        : "text-green-900"
                    }`}
                  >
                    {viewingItem.quantity}
                  </p>
                </div>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-blue-700 text-sm mb-1">Min Level</p>
                  <p className="text-blue-900 text-3xl">
                    {viewingItem.minStockLevel}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Price</p>
                    <p className="text-gray-900 text-lg">
                      Rs{(viewingItem.price || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-1">MRP</p>
                    <p className="text-gray-900 text-lg">
                      Rs{(viewingItem.mrp || 0).toLocaleString()}
                    </p>
                  </div>
                  {viewingItem.partNumber && (
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Part Number</p>
                      <p className="text-gray-900">{viewingItem.partNumber}</p>
                    </div>
                  )}
                  {viewingItem.hsnCode && (
                    <div>
                      <p className="text-gray-500 text-sm mb-1">HSN Code</p>
                      <p className="text-gray-900">{viewingItem.hsnCode}</p>
                    </div>
                  )}
                  {viewingItem.barcode && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-sm mb-1 flex items-center">
                        <Scan className="w-3 h-3 mr-1" />
                        Barcode
                      </p>
                      <p className="text-gray-900 font-mono">
                        {viewingItem.barcode}
                      </p>
                    </div>
                  )}
                  {viewingItem.warrantyPeriod && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-sm mb-1">
                        Warranty Period
                      </p>
                      <p className="text-gray-900">
                        {WARRANTY_LABELS[
                          viewingItem.warrantyPeriod || "no_warranty"
                        ] || viewingItem.warrantyPeriod}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-gray-500 text-sm mb-1">Supplier/Party</p>
                    <p className="text-gray-900">
                      {getPartyName(viewingItem.partyId)}
                    </p>
                  </div>
                  {viewingItem.location && (
                    <div className="col-span-2">
                      <p className="text-gray-500 text-sm mb-1">
                        Storage Location
                      </p>
                      <p className="text-gray-900">📍 {viewingItem.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bike/Vehicle Details */}
              {(viewingItem.bikeName ||
                viewingItem.bikeModel ||
                viewingItem.bikeType) && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                  <h5 className="text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-purple-600" />
                    Vehicle/Bike Details
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingItem.bikeName && (
                      <div className="col-span-2">
                        <p className="text-gray-500 text-sm mb-1">
                          Bike/Vehicle Name
                        </p>
                        <p className="text-gray-900">{viewingItem.bikeName}</p>
                      </div>
                    )}
                    {viewingItem.bikeModel && (
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Model</p>
                        <p className="text-gray-900">{viewingItem.bikeModel}</p>
                      </div>
                    )}
                    {viewingItem.bikeType && (
                      <div>
                        <p className="text-gray-500 text-sm mb-1">Type</p>
                        <p className="text-gray-900">{viewingItem.bikeType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Three-Tier Pricing */}
              {(viewingItem.retailPrice ||
                viewingItem.wholesalePrice ||
                viewingItem.distributorPrice) && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5">
                  <h5 className="text-gray-900 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    Three-Tier Pricing
                  </h5>
                  <div className="grid grid-cols-3 gap-3">
                    {(viewingItem.retailPrice ?? 0) > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-green-300">
                        <p className="text-gray-500 text-xs mb-1">Retail</p>
                        <p className="text-gray-900">
                          Rs{(viewingItem.retailPrice ?? 0).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {(viewingItem.wholesalePrice ?? 0) > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-green-300">
                        <p className="text-gray-500 text-xs mb-1">Wholesale</p>
                        <p className="text-gray-900">
                          Rs{(viewingItem.wholesalePrice ?? 0).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {(viewingItem.distributorPrice ?? 0) > 0 && (
                      <div className="bg-white rounded-lg p-3 border border-green-300">
                        <p className="text-gray-500 text-xs mb-1">
                          Distributor
                        </p>
                        <p className="text-gray-900">
                          Rs
                          {(viewingItem.distributorPrice ?? 0).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stock Value */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-5">
                <p className="text-orange-700 text-sm mb-1">
                  Total Stock Value
                </p>
                <p className="text-orange-900 text-3xl">
                  Rs
                  {(
                    (viewingItem.quantity || 0) * (viewingItem.price || 0)
                  ).toLocaleString()}
                </p>
                <p className="text-orange-600 text-sm mt-2">
                  {viewingItem.quantity || 0} units × Rs
                  {(viewingItem.price || 0).toLocaleString()}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  handleCloseViewSidebar();
                  handleOpenSidebar(viewingItem);
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                Edit Item
              </button>
            </div>
          </div>
        </>
      )}

      {/* Barcode Scanner Modal */}
      {scannerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={handleCloseScanner}
          />

          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Scan className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl">Barcode Scanner</h3>
                    <p className="text-purple-100 text-sm mt-0.5">
                      Scan or enter barcode to auto-fill
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseScanner}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Camera View */}
              {scannerActive && !scanError && (
                <div
                  className="relative bg-black rounded-lg overflow-hidden"
                  style={{ aspectRatio: "4/3" }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-40 border-4 border-purple-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-500 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-500 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-500 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-500 rounded-br-lg"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white text-sm bg-black bg-opacity-50 inline-block px-4 py-2 rounded-full">
                      Position barcode within the frame
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {scanError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-900 text-sm font-medium mb-1">
                      Camera Access Error
                    </p>
                    <p className="text-red-700 text-sm">{scanError}</p>
                    <p className="text-red-600 text-xs mt-2">
                      Please use manual entry below or check browser
                      permissions.
                    </p>
                  </div>
                </div>
              )}

              {/* Manual Barcode Entry */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <p className="text-gray-500 text-sm">Manual Entry</p>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem(
                      "manualBarcode",
                    ) as HTMLInputElement;
                    handleManualBarcodeEntry(input.value);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      Enter Barcode Manually
                    </label>
                    <input
                      type="text"
                      name="manualBarcode"
                      placeholder="Type or paste barcode here"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center font-mono text-lg"
                      autoFocus
                    />
                  </div>

                  <div className="flex space-x-3">
                    {!scannerActive && !scanError && (
                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <Scan className="w-5 h-5" />
                        <span>Enable Camera</span>
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
                    >
                      <Search className="w-5 h-5" />
                      <span>Search Product</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Help Text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-sm font-medium mb-2">
                  💡 How it works:
                </p>
                <ul className="text-blue-700 text-xs space-y-1 ml-4 list-disc">
                  <li>Enter a barcode that exists in your inventory</li>
                  <li>System will search and auto-fill all product details</li>
                  <li>If camera is enabled, position barcode in the frame</li>
                  <li>New products need to be added manually first</li>
                </ul>
              </div>

              {/* Quick Test Barcodes (if any exist) */}
              {(() => {
                const allInventory = getFromStorage("inventory", []);
                const itemsWithBarcode = allInventory
                  .filter(
                    (item: InventoryItem) =>
                      item.workspaceId === currentUser?.workspaceId &&
                      item.barcode,
                  )
                  .slice(0, 3);

                if (itemsWithBarcode.length > 0) {
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 text-sm font-medium mb-2">
                        Quick Test - Try these barcodes:
                      </p>
                      <div className="space-y-2">
                        {itemsWithBarcode.map((item: InventoryItem) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              handleManualBarcodeEntry(item.barcode!)
                            }
                            className="w-full text-left px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-gray-900 text-sm font-medium">
                                  {item.name}
                                </p>
                                <p className="text-gray-500 text-xs font-mono">
                                  {item.barcode}
                                </p>
                              </div>
                              <Search className="w-4 h-4 text-gray-400" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
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
