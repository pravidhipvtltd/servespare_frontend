import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Eye,
  FileText,
  Download,
  Upload,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Truck,
  ChevronRight,
  File,
  Check,
} from "lucide-react";
import { getFromStorage, saveToStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";
import {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  Party,
  GRN,
  InventoryItem,
} from "../../types";
import { Pagination } from "../common/Pagination";
import { PopupContainer } from "../PopupContainer";
import { useCustomPopup } from "../../hooks/useCustomPopup";

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  draft: "Draft",
  ordered: "Ordered",
  received: "Received",
  billed: "Billed",
};

const STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  ordered: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
  billed: "bg-purple-100 text-purple-700",
};

const STATUS_ICONS: Record<PurchaseOrderStatus, React.ReactNode> = {
  draft: <Edit className="w-4 h-4" />,
  ordered: <Clock className="w-4 h-4" />,
  received: <CheckCircle className="w-4 h-4" />,
  billed: <FileText className="w-4 h-4" />,
};

import { getBranches } from "../../api/branch.api";
import { apiFetch } from "../../utils/apiClient";

export const PurchaseOrdersPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const popup = useCustomPopup();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    PurchaseOrderStatus | "all"
  >("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewingSidebar, setViewingSidebar] = useState(false);
  const [receivingSidebar, setReceivingSidebar] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [currentBranchId, setCurrentBranchId] = useState<number>(0);
  const [selectedInvoiceFile, setSelectedInvoiceFile] = useState<File | null>(
    null,
  );

  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    poNumber: "",
    supplierId: "",
    supplierName: "",
    status: "draft",
    orderDate: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: "",
    items: [],
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    notes: "",
    terms: "",
    grnGenerated: false,
  });

  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    itemName: "",
    partNumber: "",
    description: "",
    orderedQuantity: 1,
    receivedQuantity: 0,
    unitPrice: 0,
    taxPercent: 13,
    discount: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    loadPurchaseOrders();
    loadSuppliers();
    loadInventoryItems();
  }, []);

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

  const loadPurchaseOrders = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");
      if (token) {
        const response = await apiFetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/stock-management/purchase-orders/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const mappedOrders: PurchaseOrder[] = data.results.map(
            (apiPO: any) => ({
              id: apiPO.id.toString(),
              poNumber: apiPO.po_number,
              supplierId: apiPO.supplier.toString(),
              supplierName:
                apiPO.supplier_detail?.party_name || "Unknown Supplier",
              status: apiPO.status.toLowerCase() as PurchaseOrderStatus,
              orderDate: apiPO.order_date,
              expectedDeliveryDate: apiPO.expected_delivery_date || "",
              items: apiPO.items || [],
              subtotal:
                parseFloat(apiPO.total_amount) - parseFloat(apiPO.total_tax),
              taxAmount: parseFloat(apiPO.total_tax),
              discountAmount: 0,
              totalAmount: parseFloat(apiPO.total_amount),
              notes: apiPO.notes || "",
              terms: apiPO.terms_and_condition || "",
              grnGenerated: false,
              createdAt: apiPO.created,
              updatedAt: apiPO.modified,
              invoiceFile: apiPO.purchase_invoice,
              workspaceId: currentUser?.workspaceId, // Maintain workspace context if needed
            }),
          );
          setPurchaseOrders(mappedOrders);
        } else {
          console.error(
            "Failed to fetch purchase orders:",
            response.statusText,
          );
          // Fallback to local storage if API fails
          const allPOs = getFromStorage("purchaseOrders", []);
          setPurchaseOrders(
            allPOs.filter(
              (po: PurchaseOrder) =>
                po.workspaceId === currentUser?.workspaceId,
            ),
          );
        }
      } else {
        const allPOs = getFromStorage("purchaseOrders", []);
        setPurchaseOrders(
          allPOs.filter(
            (po: PurchaseOrder) => po.workspaceId === currentUser?.workspaceId,
          ),
        );
      }
    } catch (error) {
      console.error("Error loading purchase orders:", error);
      const allPOs = getFromStorage("purchaseOrders", []);
      setPurchaseOrders(
        allPOs.filter(
          (po: PurchaseOrder) => po.workspaceId === currentUser?.workspaceId,
        ),
      );
    }
  };

  const loadSuppliers = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");
      if (token) {
        const response = await apiFetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/stock-management/parties/suppliers/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          let results: any[] = [];
          if (Array.isArray(data)) {
            results = data;
          } else if (data.results && Array.isArray(data.results)) {
            results = data.results;
          }

          const mappedSuppliers: Party[] = results.map((party: any) => ({
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
          setSuppliers(mappedSuppliers);
        } else {
          // Fallback to local storage
          const allParties = getFromStorage("parties", []);
          setSuppliers(
            allParties.filter(
              (p: Party) =>
                p.type === "supplier" &&
                p.workspaceId === currentUser?.workspaceId,
            ),
          );
        }
      } else {
        const allParties = getFromStorage("parties", []);
        setSuppliers(
          allParties.filter(
            (p: Party) =>
              p.type === "supplier" &&
              p.workspaceId === currentUser?.workspaceId,
          ),
        );
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
      const allParties = getFromStorage("parties", []);
      setSuppliers(
        allParties.filter(
          (p: Party) =>
            p.type === "supplier" && p.workspaceId === currentUser?.workspaceId,
        ),
      );
    }
  };

  const loadInventoryItems = () => {
    const allItems = getFromStorage("inventory", []);
    setInventoryItems(
      allItems.filter(
        (item: InventoryItem) => item.workspaceId === currentUser?.workspaceId,
      ),
    );
  };

  const generatePONumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `PO-${year}${month}-${random}`;
  };

  const generateGRNNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `GRN-${year}${month}-${random}`;
  };

  const handleOpenSidebar = (po?: PurchaseOrder) => {
    setSelectedInvoiceFile(null);
    if (po) {
      setEditingPO(po);
      setFormData(po);
    } else {
      setEditingPO(null);
      setFormData({
        poNumber: generatePONumber(),
        supplierId: "",
        supplierName: "",
        status: "draft",
        orderDate: new Date().toISOString().split("T")[0],
        expectedDeliveryDate: "",
        items: [],
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        notes: "",
        terms: "Payment within 30 days of delivery",
        grnGenerated: false,
      });
    }
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setEditingPO(null);
    setSelectedInvoiceFile(null);
  };

  const handleViewPO = (po: PurchaseOrder) => {
    setViewingPO(po);
    setViewingSidebar(true);
  };

  const handleCloseViewSidebar = () => {
    setViewingSidebar(false);
    setViewingPO(null);
  };

  const handleReceivePO = (po: PurchaseOrder) => {
    setReceivingPO(po);
    setReceivingSidebar(true);
  };

  const handleCloseReceivingSidebar = () => {
    setReceivingSidebar(false);
    setReceivingPO(null);
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (supplier) {
      setFormData({
        ...formData,
        supplierId: supplier.id,
        supplierName: supplier.name,
      });
    }
  };

  const calculateItemTotal = (item: Partial<PurchaseOrderItem>) => {
    const quantity = item.orderedQuantity || 0;
    const price = item.unitPrice || 0;
    const discount = item.discount || 0;
    const taxPercent = item.taxPercent || 0;

    const subtotal = quantity * price;
    const afterDiscount = subtotal - discount;
    const tax = (afterDiscount * taxPercent) / 100;
    return afterDiscount + tax;
  };

  const handleAddItem = () => {
    if (!newItem.itemName || !newItem.orderedQuantity || !newItem.unitPrice) {
      popup.showError(
        "Please fill in all required item fields (Item Name, Quantity, and Unit Price).",
        "Missing Required Fields",
        "warning",
      );
      return;
    }

    const total = calculateItemTotal(newItem);
    const item: PurchaseOrderItem = {
      ...(newItem as PurchaseOrderItem),
      id: Date.now().toString(),
      totalAmount: total,
    };

    const updatedItems = [...(formData.items || []), item];
    updatePOTotals(updatedItems);

    setNewItem({
      itemName: "",
      partNumber: "",
      description: "",
      orderedQuantity: 1,
      receivedQuantity: 0,
      unitPrice: 0,
      taxPercent: 13,
      discount: 0,
      totalAmount: 0,
    });
  };

  const handleRemoveItem = async (itemId: string) => {
    // Check if we are editing an existing PO and if the item exists on the server
    if (editingPO) {
      const originalItem = editingPO.items.find((i) => i.id === itemId);

      if (originalItem) {
        try {
          const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("auth_token");
          if (token) {
            const response = await apiFetch(
              `${
                import.meta.env.VITE_API_BASE_URL
              }/stock-management/purchase-order-items/${itemId}/`,
              {
                method: "DELETE",
              },
            );

            if (!response.ok) {
              console.error("Failed to delete item from server");
              popup.showError(
                "Failed to delete item from server",
                "Delete Failed",
                "error",
              );
              return;
            }
          }
        } catch (e) {
          console.error("Error deleting item:", e);
          popup.showError(
            "An error occurred while deleting the item.",
            "Delete Failed",
            "error",
          );
          return;
        }
      }
    }

    const updatedItems = (formData.items || []).filter(
      (item) => item.id !== itemId,
    );
    updatePOTotals(updatedItems);
  };

  const updatePOTotals = (items: PurchaseOrderItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = item.orderedQuantity || 0;
      const price = item.unitPrice || 0;
      return sum + quantity * price;
    }, 0);

    const discountAmount = items.reduce(
      (sum, item) => sum + (item.discount || 0),
      0,
    );
    const taxAmount = items.reduce((sum, item) => {
      const quantity = item.orderedQuantity || 0;
      const price = item.unitPrice || 0;
      const discount = item.discount || 0;
      const taxPercent = item.taxPercent || 0;
      const afterDiscount = quantity * price - discount;
      return sum + (afterDiscount * taxPercent) / 100;
    }, 0);

    const totalAmount = subtotal - discountAmount + taxAmount;

    setFormData({
      ...formData,
      items,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId) {
      popup.showError(
        "Please select a supplier before creating the purchase order.",
        "Supplier Required",
        "warning",
      );
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      popup.showError(
        "Please add at least one item to the purchase order.",
        "Items Required",
        "warning",
      );
      return;
    }

    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");

      if (token) {
        const formDataPayload = new FormData();
        formDataPayload.append("po_number", formData.poNumber || "");
        formDataPayload.append(
          "status",
          formData.status || (editingPO ? "draft" : "pending"),
        );
        formDataPayload.append(
          "supplier",
          formData.supplierId?.toString() || "",
        );
        formDataPayload.append("order_date", formData.orderDate || "");

        if (formData.expectedDeliveryDate) {
          formDataPayload.append(
            "expected_delivery_date",
            formData.expectedDeliveryDate,
          );
        }

        if (selectedInvoiceFile) {
          formDataPayload.append("purchase_invoice", selectedInvoiceFile);
        }

        formDataPayload.append("notes", formData.notes || "");
        formDataPayload.append("terms_and_condition", formData.terms || "");
        formDataPayload.append("branch", currentBranchId.toString());

        if (editingPO) {
          formDataPayload.append("is_active", "true");
        }

        const items = (formData.items || []).map((item) => {
          if (editingPO) {
            return {
              item_name: item.itemName,
              part_number: item.partNumber,
              description: item.description,
              ordered_quantity: item.orderedQuantity,
              unit_price: item.unitPrice,
              tax_percent: item.taxPercent,
              discount: item.discount,
            };
          } else {
            return {
              item_name: item.itemName,
              part_number: item.partNumber,
              quantity: item.orderedQuantity || 0,
              unit_price: item.unitPrice || 0,
              tax: item.taxPercent || 13,
            };
          }
        });

        formDataPayload.append(
          "items",
          new Blob([JSON.stringify(items)], { type: "application/json" }),
        );

        const url = editingPO
          ? `${import.meta.env.VITE_API_BASE_URL}/stock-management/purchase-orders/${editingPO.id}/`
          : `${import.meta.env.VITE_API_BASE_URL}/stock-management/purchase-orders/create-with-items/`;

        const response = await apiFetch(url, {
          method: editingPO ? "PUT" : "POST",
          body: formDataPayload,
        });

        if (response.ok) {
          loadPurchaseOrders();
          handleCloseSidebar();
          popup.showSuccess(
            editingPO ? "Purchase Order Updated" : "Purchase Order Created",
            `The purchase order has been successfully ${
              editingPO ? "updated" : "created"
            }.`,
          );
        } else {
          const errorData = await response.json();
          throw new Error(
            errorData.detail ||
              errorData.message ||
              "Failed to save purchase order",
          );
        }
      } else {
        // Fallback to local storage
        const allPOs = getFromStorage("purchaseOrders", []);

        if (editingPO) {
          const updated = allPOs.map((po: PurchaseOrder) =>
            po.id === editingPO.id
              ? { ...po, ...formData, updatedAt: new Date().toISOString() }
              : po,
          );
          saveToStorage("purchaseOrders", updated);
        } else {
          const newPO: PurchaseOrder = {
            ...(formData as PurchaseOrder),
            id: Date.now().toString(),
            workspaceId: currentUser?.workspaceId,
            createdAt: new Date().toISOString(),
            createdBy: currentUser?.id,
            updatedAt: new Date().toISOString(),
          };
          saveToStorage("purchaseOrders", [...allPOs, newPO]);
        }

        loadPurchaseOrders();
        handleCloseSidebar();
        popup.showSuccess(
          editingPO ? "Purchase Order Updated" : "Purchase Order Created",
          "Saved locally (offline mode)",
        );
      }
    } catch (error: any) {
      console.error("Error saving purchase order:", error);
      popup.showError(
        error.message || "An error occurred while saving the purchase order.",
        "Save Failed",
        "error",
      );
    }
  };

  const handleDelete = async (poId: string) => {
    popup.showConfirm(
      "Delete Purchase Order",
      "Are you sure you want to delete this purchase order? This action cannot be undone.",
      async () => {
        try {
          const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("auth_token");

          if (token) {
            const response = await apiFetch(
              `${
                import.meta.env.VITE_API_BASE_URL
              }/stock-management/purchase-orders/${poId}/`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );

            if (response.ok) {
              // Also remove from local storage
              const allPOs = getFromStorage("purchaseOrders", []);
              const filtered = allPOs.filter(
                (po: PurchaseOrder) => po.id !== poId,
              );
              saveToStorage("purchaseOrders", filtered);

              setSelectedOrders([]);
              loadPurchaseOrders();
              popup.showSuccess(
                "Purchase Order Deleted",
                "The purchase order has been successfully deleted.",
              );
            } else {
              const errorData = await response.json().catch(() => ({}));
              popup.showError(
                errorData.detail ||
                  "Failed to delete purchase order from server.",
                "Delete Failed",
                "error",
              );
            }
          } else {
            // Fallback to local storage if no token
            const allPOs = getFromStorage("purchaseOrders", []);
            const filtered = allPOs.filter(
              (po: PurchaseOrder) => po.id !== poId,
            );
            saveToStorage("purchaseOrders", filtered);
            setSelectedOrders([]);
            loadPurchaseOrders();
            popup.showSuccess(
              "Purchase Order Deleted",
              "The purchase order has been successfully deleted.",
            );
          }
        } catch (error) {
          console.error("Error deleting purchase order:", error);
          popup.showError(
            "An error occurred while deleting the purchase order. Please try again.",
            "Delete Failed",
            "error",
          );
        }
      },
      { type: "danger" },
    );
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      popup.showError(
        "Please select at least one purchase order to delete.",
        "No Orders Selected",
        "warning",
      );
      return;
    }

    popup.showConfirm(
      "Delete Multiple Purchase Orders",
      `Are you sure you want to delete ${selectedOrders.length} purchase order(s)? This action cannot be undone.`,
      async () => {
        try {
          const token =
            localStorage.getItem("accessToken") ||
            localStorage.getItem("auth_token");

          if (token) {
            const deletePromises = selectedOrders.map((poId) =>
              apiFetch(
                `${
                  import.meta.env.VITE_API_BASE_URL
                }/stock-management/purchase-orders/${poId}/`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                  },
                },
              ),
            );

            const results = await Promise.allSettled(deletePromises);
            const successCount = results.filter(
              (result) => result.status === "fulfilled" && result.value.ok,
            ).length;
            const failedCount = selectedOrders.length - successCount;

            const allPOs = getFromStorage("purchaseOrders", []);
            const filtered = allPOs.filter(
              (po: PurchaseOrder) => !selectedOrders.includes(po.id),
            );
            saveToStorage("purchaseOrders", filtered);

            setSelectedOrders([]);
            loadPurchaseOrders();

            if (failedCount === 0) {
              popup.showSuccess(
                "Orders Deleted",
                `Successfully deleted ${successCount} purchase order(s).`,
              );
            } else {
              popup.showError(
                `Deleted ${successCount} order(s), but ${failedCount} failed. Please try again.`,
                "Partial Delete",
                "warning",
              );
            }
          } else {
            // Fallback to local storage if no token
            const allPOs = getFromStorage("purchaseOrders", []);
            const filtered = allPOs.filter(
              (po: PurchaseOrder) => !selectedOrders.includes(po.id),
            );
            saveToStorage("purchaseOrders", filtered);
            setSelectedOrders([]);
            loadPurchaseOrders();
            popup.showSuccess(
              "Orders Deleted",
              `Successfully deleted ${selectedOrders.length} purchase order(s).`,
            );
          }
        } catch (error) {
          console.error("Error deleting purchase orders:", error);
          popup.showError(
            "An error occurred while deleting purchase orders. Please try again.",
            "Delete Failed",
            "error",
          );
        }
      },
      { type: "danger" },
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((po) => po.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedInvoiceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          invoiceFile: reader.result as string,
          invoiceFileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    } else {
      popup.showError(
        "Only PDF files are allowed. Please upload a valid PDF document.",
        "Invalid File Type",
        "warning",
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedInvoiceFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          invoiceFile: reader.result as string,
          invoiceFileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    } else {
      popup.showError(
        "Only PDF files are allowed. Please upload a valid PDF document.",
        "Invalid File Type",
        "warning",
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleReceiveItem = (itemId: string, received: boolean) => {
    if (!receivingPO) return;

    const updatedItems = receivingPO.items.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          receivedQuantity: received ? item.orderedQuantity : 0,
        };
      }
      return item;
    });

    setReceivingPO({
      ...receivingPO,
      items: updatedItems,
    });
  };

  const handleCompleteReceiving = () => {
    if (!receivingPO) return;

    const allReceived = receivingPO.items.every(
      (item) => item.receivedQuantity === item.orderedQuantity,
    );

    // Generate GRN
    const grn: GRN = {
      id: Date.now().toString(),
      grnNumber: generateGRNNumber(),
      purchaseOrderId: receivingPO.id,
      poNumber: receivingPO.poNumber,
      supplierId: receivingPO.supplierId,
      supplierName: receivingPO.supplierName,
      receivedDate: new Date().toISOString(),
      receivedBy: currentUser?.name || "Unknown",
      items: receivingPO.items,
      notes: "",
      workspaceId: currentUser?.workspaceId,
      createdAt: new Date().toISOString(),
    };

    // Save GRN
    const allGRNs = getFromStorage("grns", []);
    saveToStorage("grns", [...allGRNs, grn]);

    // Update PO status
    const allPOs = getFromStorage("purchaseOrders", []);
    const updatedPOs = allPOs.map((po: PurchaseOrder) => {
      if (po.id === receivingPO.id) {
        return {
          ...po,
          items: receivingPO.items,
          status: allReceived ? "received" : "ordered",
          receivedDate: new Date().toISOString(),
          grnGenerated: true,
          grnNumber: grn.grnNumber,
          updatedAt: new Date().toISOString(),
        };
      }
      return po;
    });
    saveToStorage("purchaseOrders", updatedPOs);

    // Update inventory quantities
    receivingPO.items.forEach((item) => {
      if (item.receivedQuantity > 0 && item.inventoryItemId) {
        const allInventory = getFromStorage("inventory", []);
        const updatedInventory = allInventory.map((invItem: InventoryItem) => {
          if (invItem.id === item.inventoryItemId) {
            return {
              ...invItem,
              quantity: invItem.quantity + item.receivedQuantity,
              lastRestocked: new Date().toISOString(),
            };
          }
          return invItem;
        });
        saveToStorage("inventory", updatedInventory);
      }
    });

    loadPurchaseOrders();
    loadInventoryItems();
    handleCloseReceivingSidebar();
    popup.showSuccess(
      "GRN Generated Successfully!",
      `GRN ${grn.grnNumber} has been generated and inventory has been updated.`,
    );
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || po.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredPOs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const statusCounts = purchaseOrders.reduce(
    (acc, po) => {
      acc[po.status] = (acc[po.status] || 0) + 1;
      return acc;
    },
    {} as Record<PurchaseOrderStatus, number>,
  );

  const stats = {
    totalPOs: purchaseOrders.length,
    totalValue: purchaseOrders.reduce(
      (sum, po) => sum + (po.totalAmount || 0),
      0,
    ),
    pendingPOs: purchaseOrders.filter((po) => po.status === "ordered").length,
    receivedPOs: purchaseOrders.filter((po) => po.status === "received").length,
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total POs</p>
              <p className="text-gray-900 text-2xl mt-1">{stats.totalPOs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-gray-900 text-2xl mt-1">
                NPR {stats.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-gray-900 text-2xl mt-1">{stats.pendingPOs}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Received</p>
              <p className="text-gray-900 text-2xl mt-1">{stats.receivedPOs}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900 text-lg">Purchase Orders</h3>
        <button
          onClick={() => handleOpenSidebar()}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Search Bar */}
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by PO number or supplier name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bulk Delete Button */}
          {selectedOrders.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Selected ({selectedOrders.length})</span>
            </button>
          )}
        </div>

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
            All ({purchaseOrders.length})
          </button>
          {(
            ["draft", "ordered", "received", "billed"] as PurchaseOrderStatus[]
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

        {/* PO Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  <input
                    type="checkbox"
                    checked={
                      selectedOrders.length === paginatedOrders.length &&
                      paginatedOrders.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  PO Number
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Supplier
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Order Date
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Expected Delivery
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Items
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Total Amount
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
              {paginatedOrders.map((po) => (
                <tr
                  key={po.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(po.id)}
                      onChange={() => toggleSelectOrder(po.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-900">{po.poNumber}</div>
                    {po.grnGenerated && (
                      <div className="text-xs text-green-600 mt-1">
                        GRN: {po.grnNumber}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-900">{po.supplierName}</td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {new Date(po.orderDate).toLocaleDateString("en-NP")}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {new Date(po.expectedDeliveryDate).toLocaleDateString(
                      "en-NP",
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {po.items?.length || 0} items
                  </td>
                  <td className="py-4 px-4 text-gray-900">
                    NPR {(po.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm flex items-center space-x-1 w-fit ${
                        STATUS_COLORS[po.status]
                      }`}
                    >
                      {STATUS_ICONS[po.status]}
                      <span>{STATUS_LABELS[po.status]}</span>
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewPO(po)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(po.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPOs.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredPOs.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Add/Edit PO Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseSidebar}
          />

          <div className="fixed right-0 top-0 h-full w-full md:w-[800px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-lg">
                  {editingPO ? "Edit Purchase Order" : "Create Purchase Order"}
                </h3>
                <button
                  onClick={handleCloseSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        PO Number
                      </label>
                      <input
                        type="text"
                        value={formData.poNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, poNumber: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value as PurchaseOrderStatus,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm mb-2">
                        Supplier *
                      </label>
                      <select
                        value={formData.supplierId}
                        onChange={(e) => handleSupplierChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Order Date *
                      </label>
                      <input
                        type="date"
                        value={formData.orderDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            orderDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Expected Delivery *
                      </label>
                      <input
                        type="date"
                        value={formData.expectedDeliveryDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expectedDeliveryDate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Add Items Section */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-green-600" />
                    Add Items
                  </h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm mb-2">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={newItem.itemName}
                        onChange={(e) =>
                          setNewItem({ ...newItem, itemName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter item name"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Part Number
                      </label>
                      <input
                        type="text"
                        value={newItem.partNumber}
                        onChange={(e) =>
                          setNewItem({ ...newItem, partNumber: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={newItem.orderedQuantity}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            orderedQuantity: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Unit Price (NPR) *
                      </label>
                      <input
                        type="number"
                        value={newItem.unitPrice}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Tax %
                      </label>
                      <input
                        type="number"
                        value={newItem.taxPercent}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            taxPercent: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 text-sm mb-2">
                        Discount (NPR)
                      </label>
                      <input
                        type="number"
                        value={newItem.discount}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            discount: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm mb-2">
                        Description
                      </label>
                      <textarea
                        value={newItem.description}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>

                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add Item to PO
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                {formData.items && formData.items.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-gray-900">
                        Order Items ({formData.items.length})
                      </h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left text-gray-600 text-sm py-2 px-4">
                              Item
                            </th>
                            <th className="text-right text-gray-600 text-sm py-2 px-4">
                              Qty
                            </th>
                            <th className="text-right text-gray-600 text-sm py-2 px-4">
                              Price
                            </th>
                            <th className="text-right text-gray-600 text-sm py-2 px-4">
                              Tax
                            </th>
                            <th className="text-right text-gray-600 text-sm py-2 px-4">
                              Total
                            </th>
                            <th className="text-right text-gray-600 text-sm py-2 px-4">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-100"
                            >
                              <td className="py-3 px-4">
                                <div className="text-gray-900">
                                  {item.itemName}
                                </div>
                                {item.partNumber && (
                                  <div className="text-xs text-gray-500">
                                    PN: {item.partNumber}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-900">
                                {item.orderedQuantity}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-900">
                                NPR {item.unitPrice.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-600">
                                {item.taxPercent}%
                              </td>
                              <td className="py-3 px-4 text-right text-gray-900">
                                NPR {item.totalAmount.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr className="border-t-2 border-gray-300">
                            <td
                              colSpan={4}
                              className="py-3 px-4 text-right text-gray-700"
                            >
                              Subtotal:
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              NPR {formData.subtotal?.toLocaleString()}
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td
                              colSpan={4}
                              className="py-2 px-4 text-right text-gray-700"
                            >
                              Tax:
                            </td>
                            <td className="py-2 px-4 text-right text-gray-900">
                              NPR {formData.taxAmount?.toLocaleString()}
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td
                              colSpan={4}
                              className="py-2 px-4 text-right text-gray-700"
                            >
                              Discount:
                            </td>
                            <td className="py-2 px-4 text-right text-red-600">
                              - NPR {formData.discountAmount?.toLocaleString()}
                            </td>
                            <td></td>
                          </tr>
                          <tr className="border-t border-gray-300">
                            <td
                              colSpan={4}
                              className="py-3 px-4 text-right text-gray-900"
                            >
                              Total Amount:
                            </td>
                            <td className="py-3 px-4 text-right text-blue-600">
                              NPR {formData.totalAmount?.toLocaleString()}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Invoice Upload */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="text-gray-900 mb-4 flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-purple-600" />
                    Purchase Invoice (Optional)
                  </h4>

                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {formData.invoiceFile ? (
                      <div className="space-y-4">
                        <File className="w-12 h-12 text-green-600 mx-auto" />
                        <div>
                          <p className="text-gray-900">
                            {formData.invoiceFileName}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Invoice uploaded successfully
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              invoiceFile: undefined,
                              invoiceFileName: undefined,
                            })
                          }
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-gray-700">
                            Drag and drop PDF invoice here
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            or click to browse
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="invoice-upload"
                        />
                        <label
                          htmlFor="invoice-upload"
                          className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
                        >
                          Choose PDF File
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes and Terms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Any additional notes..."
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">
                      Terms & Conditions
                    </label>
                    <textarea
                      value={formData.terms}
                      onChange={(e) =>
                        setFormData({ ...formData, terms: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Payment and delivery terms..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseSidebar}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingPO
                      ? "Update Purchase Order"
                      : "Create Purchase Order"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* View PO Details Sidebar */}
      {viewingSidebar && viewingPO && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleCloseViewSidebar}
          />

          <div className="relative h-full w-full md:w-[800px] bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-xl">
                  Purchase Order Details
                </h3>
                <button
                  onClick={handleCloseViewSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* PO Header */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-gray-900 text-2xl mb-2">
                      {viewingPO.poNumber}
                    </h4>
                    <p className="text-gray-600">
                      Supplier: {viewingPO.supplierName}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm flex items-center space-x-2 ${
                      STATUS_COLORS[viewingPO.status]
                    }`}
                  >
                    {STATUS_ICONS[viewingPO.status]}
                    <span>{STATUS_LABELS[viewingPO.status]}</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-gray-500 text-sm">Order Date</p>
                    <p className="text-gray-900">
                      {new Date(viewingPO.orderDate).toLocaleDateString(
                        "en-NP",
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Expected Delivery</p>
                    <p className="text-gray-900">
                      {new Date(
                        viewingPO.expectedDeliveryDate,
                      ).toLocaleDateString("en-NP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Amount</p>
                    <p className="text-blue-600">
                      NPR {viewingPO.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                {viewingPO.grnGenerated && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-green-800 text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      GRN Generated: {viewingPO.grnNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h4 className="text-gray-900 mb-3">Order Items</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left text-gray-600 text-sm py-3 px-4">
                          Item
                        </th>
                        <th className="text-right text-gray-600 text-sm py-3 px-4">
                          Ordered
                        </th>
                        <th className="text-right text-gray-600 text-sm py-3 px-4">
                          Received
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
                      {viewingPO.items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 px-4">
                            <div className="text-gray-900">{item.itemName}</div>
                            {item.partNumber && (
                              <div className="text-xs text-gray-500">
                                PN: {item.partNumber}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            {item.orderedQuantity}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={
                                item.receivedQuantity === item.orderedQuantity
                                  ? "text-green-600"
                                  : "text-orange-600"
                              }
                            >
                              {item.receivedQuantity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            NPR {(item.unitPrice || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900">
                            NPR {(item.totalAmount || 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr className="border-t-2 border-gray-300">
                        <td
                          colSpan={4}
                          className="py-3 px-4 text-right text-gray-700"
                        >
                          Subtotal:
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          NPR {(viewingPO.subtotal || 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={4}
                          className="py-2 px-4 text-right text-gray-700"
                        >
                          Tax:
                        </td>
                        <td className="py-2 px-4 text-right text-gray-900">
                          NPR {(viewingPO.taxAmount || 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={4}
                          className="py-2 px-4 text-right text-gray-700"
                        >
                          Discount:
                        </td>
                        <td className="py-2 px-4 text-right text-red-600">
                          - NPR{" "}
                          {(viewingPO.discountAmount || 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-300">
                        <td
                          colSpan={4}
                          className="py-3 px-4 text-right text-gray-900"
                        >
                          Total:
                        </td>
                        <td className="py-3 px-4 text-right text-blue-600">
                          NPR {(viewingPO.totalAmount || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Invoice */}
              {viewingPO.invoiceFile && (
                <div className="mb-6">
                  <h4 className="text-gray-900 mb-3">Purchase Invoice</h4>
                  <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <File className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="text-gray-900">
                          {viewingPO.invoiceFileName}
                        </p>
                        <p className="text-sm text-gray-500">PDF Document</p>
                      </div>
                    </div>
                    <a
                      href={viewingPO.invoiceFile}
                      download={viewingPO.invoiceFileName}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Notes and Terms */}
              {(viewingPO.notes || viewingPO.terms) && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {viewingPO.notes && (
                    <div>
                      <h4 className="text-gray-900 mb-2">Notes</h4>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">
                          {viewingPO.notes}
                        </p>
                      </div>
                    </div>
                  )}
                  {viewingPO.terms && (
                    <div>
                      <h4 className="text-gray-900 mb-2">Terms & Conditions</h4>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-600 text-sm">
                          {viewingPO.terms}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                {viewingPO.status === "ordered" && (
                  <button
                    onClick={() => {
                      handleCloseViewSidebar();
                      handleReceivePO(viewingPO);
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Receive Goods</span>
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
        </div>
      )}

      {/* Receiving Sidebar */}
      {receivingSidebar && receivingPO && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseReceivingSidebar}
          />

          <div className="fixed right-0 top-0 h-full w-full md:w-[700px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-xl">
                  Receive Goods - {receivingPO.poNumber}
                </h3>
                <button
                  onClick={handleCloseReceivingSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-900">
                      Tick the checkbox for each item you've received
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      This will update your inventory and generate a GRN (Goods
                      Received Note)
                    </p>
                  </div>
                </div>
              </div>

              {/* Receiving Checklist */}
              <div className="space-y-3 mb-6">
                {receivingPO.items.map((item) => {
                  const isReceived =
                    item.receivedQuantity === item.orderedQuantity;
                  return (
                    <div
                      key={item.id}
                      className={`border-2 rounded-lg p-4 transition-all ${
                        isReceived
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <button
                            onClick={() =>
                              handleReceiveItem(item.id, !isReceived)
                            }
                            className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                              isReceived
                                ? "border-green-600 bg-green-600 scale-110"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            {isReceived && (
                              <Check className="w-4 h-4 text-white animate-scale-in" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4
                              className={`text-gray-900 ${
                                isReceived ? "line-through" : ""
                              }`}
                            >
                              {item.itemName}
                            </h4>
                            {item.partNumber && (
                              <p className="text-sm text-gray-500">
                                Part: {item.partNumber}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-600">
                                Qty:{" "}
                                <span className="text-gray-900">
                                  {item.orderedQuantity}
                                </span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Price:{" "}
                                <span className="text-gray-900">
                                  NPR {item.unitPrice.toLocaleString()}
                                </span>
                              </span>
                              <span className="text-sm text-gray-600">
                                Total:{" "}
                                <span className="text-gray-900">
                                  NPR {item.totalAmount.toLocaleString()}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        {isReceived && (
                          <CheckCircle className="w-6 h-6 text-green-600 animate-scale-in" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Total Items:</span>
                  <span className="text-gray-900">
                    {receivingPO.items.length}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Received Items:</span>
                  <span className="text-green-600">
                    {
                      receivingPO.items.filter(
                        (i) => i.receivedQuantity === i.orderedQuantity,
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                  <span className="text-gray-700">Total Value:</span>
                  <span className="text-blue-600">
                    NPR {receivingPO.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCloseReceivingSidebar}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteReceiving}
                  disabled={
                    receivingPO.items.filter((i) => i.receivedQuantity > 0)
                      .length === 0
                  }
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Complete Receiving & Generate GRN</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
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
