import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Eye,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  TrendingUp,
  Download,
  Filter,
  Package,
  Users,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { PartyType, CustomerType, PaymentTerms } from "../../types";
import { getBranches } from "../../api/branch.api";
import { Pagination } from "../common/Pagination";
import { ConfirmDialog } from "../ConfirmDialog";
import { apiFetch } from "../../utils/apiClient";
import {
  handlePhoneInput,
  NEPAL_COUNTRY_CODE,
} from "../../utils/phoneValidation";
import { useBranch } from "../../contexts/BranchContext";
interface BackendParty {
  id: string;
  tenantId: string;
  type: PartyType;
  customerType?: CustomerType;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  gstNumber?: string;
  panNumber?: string;
  paymentTerms: PaymentTerms;
  creditLimit: number;
  openingBalance: number;
  currentBalance: number;
  totalPurchases?: number;
  totalSales?: number;
  lastTransactionDate?: string;
  isActive: boolean;
  notes?: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

interface PartyTransaction {
  id: string;
  partyId: string;
  type: "sale" | "purchase" | "payment" | "receipt";
  amount: number;
  balanceAfter: number;
  date: string;
  reference?: string;
  notes?: string;
}

interface District {
  id: string;
  name: string;
}

interface Province {
  id: string;
  name: string;
  districts: District[];
}

const PARTY_TYPE_LABELS: Record<PartyType, string> = {
  customer: "Customer",
  supplier: "Supplier",
};

const PARTY_TYPE_COLORS: Record<PartyType, string> = {
  customer: "bg-pink-100 text-pink-700",
  supplier: "bg-blue-100 text-blue-700",
};

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  retail: "Retail Customer",
  retailer: "Retailer",
  workshop: "Workshop",
  distributor: "Distributor",
  wholesaler: "Wholesaler",
};

const CUSTOMER_TYPE_COLORS: Record<CustomerType, string> = {
  retail: "bg-pink-100 text-pink-700",
  retailer: "bg-blue-100 text-blue-700",
  workshop: "bg-purple-100 text-purple-700",
  distributor: "bg-green-100 text-green-700",
  wholesaler: "bg-orange-100 text-orange-700",
};

const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  cash: "Cash",
  credit_7: "7 Days Credit",
  credit_15: "15 Days Credit",
  credit_30: "30 Days Credit",
  credit_45: "45 Days Credit",
};

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/stock-management`;

export const PartiesPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const { selectedBranchId } = useBranch();
  const [parties, setParties] = useState<BackendParty[]>([]);
  const [activeTab, setActiveTab] = useState<"suppliers" | "customers">(
    "suppliers",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerType, setSelectedCustomerType] = useState<
    CustomerType | "all"
  >("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewingSidebar, setViewingSidebar] = useState(false);
  const [editingParty, setEditingParty] = useState<BackendParty | null>(null);
  const [viewingParty, setViewingParty] = useState<BackendParty | null>(null);
  const [transactions, setTransactions] = useState<PartyTransaction[]>([]);
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const itemsPerPage = 20;
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    partyId: string | null;
    partyName: string;
    isBulk: boolean;
  }>({ isOpen: false, partyId: null, partyName: "", isBulk: false });
  const [currentBranchId, setCurrentBranchId] = useState<number>(0);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);

  const [formData, setFormData] = useState<Partial<BackendParty>>({
    name: "",
    type: "supplier",
    customerType: "retail",
    contactPerson: "",
    phone: NEPAL_COUNTRY_CODE,
    email: "",
    address: "",
    city: "",
    state: "",
    gstNumber: "",
    panNumber: "",
    paymentTerms: "cash",
    creditLimit: 0,
    openingBalance: 0,
    currentBalance: 0,
    isActive: true,
    logo: "",
  });

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
          // Silent error
        }
      }
    };
    fetchBranchId();
  }, [currentUser]);

  useEffect(() => {
    const fetchRegions = async () => {
      setIsLoadingRegions(true);
      try {
        const url = `${import.meta.env.VITE_API_BASE_URL}/sales/orders/province_districts/`;
        const response = await apiFetch(url);

        if (response.ok) {
          const data = await response.json();
          setProvinces(data.provinces || []);
        } else {
          console.error("Failed to fetch regions:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch regions:", error);
      } finally {
        setIsLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    loadParties();
  }, [activeTab, selectedBranchId]);

  const loadParties = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint =
        activeTab === "suppliers" ? "parties/suppliers/" : "parties/customers/";
      let url = `${API_BASE_URL}/${endpoint}`;
      if (selectedBranchId) {
        url += `?branch=${selectedBranchId}`;
      }
      const response = await apiFetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let results: any[] = [];

      if (Array.isArray(data)) {
        results = data;
      } else if (data.results && Array.isArray(data.results)) {
        results = data.results;
      } else if (data.id) {
        // Handle single object response
        results = [data];
      } else {
        results = [];
      }

      // Map API response to BackendParty format
      const mappedParties: BackendParty[] = results.map((party: any) => ({
        id: party.id.toString(),
        tenantId: currentUser?.workspaceId || "",
        type: party.party_type as PartyType,
        customerType: mapApiCustomerType(party.customer_type),
        name: party.party_name,
        contactPerson: party.contact_person || "",
        phone: party.phone,
        email: party.email || "",
        address: party.address || "",
        city: party.city || "",
        state: party.state_province || "",
        gstNumber: "",
        panNumber: party.pan_number || "",
        paymentTerms: mapApiPaymentTerms(party.payment_terms),
        creditLimit: parseFloat(party.credit_limit) || 0,
        openingBalance: parseFloat(party.opening_balance) || 0,
        currentBalance: parseFloat(party.opening_balance) || 0,
        totalPurchases: 0,
        totalSales: 0,
        isActive: party.is_active,
        notes: "",
        logo: "",
        createdAt: party.created,
        updatedAt: party.modified,
        createdBy: "",
      }));

      setParties(mappedParties);
    } catch (err: any) {
      setError(err.message || "Failed to load parties");
    } finally {
      setIsLoading(false);
    }
  };

  const mapApiCustomerType = (apiType: string): CustomerType | undefined => {
    if (!apiType) return undefined;
    const mapping: Record<string, CustomerType> = {
      retail_customer: "retail",
      retailer: "retailer",
      workshop: "workshop",
      distributor: "distributor",
      wholesaler: "wholesaler",
    };
    return mapping[apiType] || (apiType as CustomerType);
  };

  const mapToApiCustomerType = (appType: CustomerType): string => {
    const mapping: Record<CustomerType, string> = {
      retail: "retail_customer",
      retailer: "retailer",
      workshop: "workshop",
      distributor: "distributor",
      wholesaler: "wholesaler",
    };
    return mapping[appType] || appType;
  };

  const mapApiPaymentTerms = (apiTerm: string): PaymentTerms => {
    const mapping: Record<string, PaymentTerms> = {
      cash: "cash",
      "7_day_credit": "credit_7",
      "15_day_credit": "credit_15",
      "30_day_credit": "credit_30",
      "45_day_credit": "credit_45",
    };
    return mapping[apiTerm] || "cash";
  };

  const mapToApiPaymentTerms = (appTerm: PaymentTerms): string => {
    const mapping: Record<PaymentTerms, string> = {
      cash: "cash",
      credit_7: "7_day_credit",
      credit_15: "15_day_credit",
      credit_30: "30_day_credit",
      credit_45: "45_day_credit",
    };
    return mapping[appTerm] || "cash";
  };

  const formatApiError = (data: any, status?: number): string => {
    if (!data) return status ? `Request failed (${status})` : "Request failed";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.non_field_errors?.length) return data.non_field_errors.join("\n");
    if (typeof data === "object") {
      const parts = Object.entries(data).map(([key, value]) => {
        const formattedKey =
          key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
        const val = Array.isArray(value) ? value.join(", ") : String(value);
        return `${formattedKey}: ${val}`;
      });
      if (parts.length) return parts.join("\n");
    }
    return status ? `Request failed (${status})` : "Request failed";
  };

  const loadPartyTransactions = async (partyId: string) => {
    try {
      const transactions = JSON.parse(
        localStorage.getItem(`party_transactions_${partyId}`) || "[]",
      );
      setTransactions(transactions as PartyTransaction[]);
    } catch (err: any) {
      setTransactions([]);
    }
  };

  const handleOpenSidebar = (party?: BackendParty) => {
    if (party) {
      setEditingParty(party);
      setFormData({
        ...party,
        logo: party.logo || "",
      });
      // Set district from party data if available
      setSelectedDistrict("");
    } else {
      setEditingParty(null);
      setFormData({
        name: "",
        type: activeTab === "suppliers" ? "supplier" : "customer",
        customerType: "retail",
        contactPerson: "",
        phone: "+977",
        email: "",
        address: "",
        city: "",
        state: "",
        gstNumber: "",
        panNumber: "",
        paymentTerms: "cash",
        creditLimit: 0,
        openingBalance: 0,
        currentBalance: 0,
        isActive: true,
        logo: "",
      });
      setSelectedDistrict("");
    }
    setSidebarOpen(true);
    setViewingSidebar(false);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setViewingSidebar(false);
    setEditingParty(null);
    setViewingParty(null);
    setFormError(null);
  };

  const handleViewParty = async (party: BackendParty) => {
    setViewingParty(party);
    setViewingSidebar(true);
    setSidebarOpen(false);
    await loadPartyTransactions(party.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      if (currentBranchId === 0) {
        throw new Error(
          "No valid branch found. Please ensure a branch is created.",
        );
      }

      const apiData = {
        branch: currentBranchId,
        party_type: formData.type,
        customer_type:
          formData.type === "customer" && formData.customerType
            ? mapToApiCustomerType(formData.customerType)
            : null,
        party_name: formData.name,
        contact_person: formData.contactPerson || "",
        phone: formData.phone,
        email: formData.email || "",
        address: formData.address || "",
        city: formData.city || "",
        state_province: formData.state || "",
        pan_number: formData.panNumber || "",
        payment_terms: mapToApiPaymentTerms(formData.paymentTerms || "cash"),
        credit_limit: formData.creditLimit?.toString() || "0.00",
        opening_balance: formData.openingBalance?.toString() || "0.00",
        is_active: formData.isActive ?? true,
      };

      if (editingParty) {
        // Update existing party
        const response = await apiFetch(
          `${API_BASE_URL}/parties/${editingParty.id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(apiData),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(formatApiError(errorData, response.status));
        }

        handleCloseSidebar();
        loadParties();
      } else {
        // Create new party
        const response = await apiFetch(`${API_BASE_URL}/parties/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(formatApiError(errorData, response.status));
        }

        handleCloseSidebar();
        loadParties();
      }
    } catch (err: any) {
      setFormError(err.message || "Failed to save party");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (partyId: string, partyName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      partyId,
      partyName,
      isBulk: false,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.partyId) return;

    setIsLoading(true);
    setError(null);
    const partyId = deleteConfirmation.partyId;
    setDeleteConfirmation({
      isOpen: false,
      partyId: null,
      partyName: "",
      isBulk: false,
    });

    try {
      const response = await apiFetch(`${API_BASE_URL}/parties/${partyId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete party: ${response.status}`);
      }

      // Immediately update the state to remove the deleted party
      setParties((prevParties) =>
        prevParties.filter((p) => p.id.toString() !== partyId.toString()),
      );
      setSelectedParties(
        selectedParties.filter((id) => id.toString() !== partyId.toString()),
      );
    } catch (err: any) {
      setError(err.message || "Failed to delete party");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedParties.length === 0) {
      setError("No parties selected");
      return;
    }

    setDeleteConfirmation({
      isOpen: true,
      partyId: null,
      partyName: `${selectedParties.length} part${
        selectedParties.length > 1 ? "ies" : "y"
      }`,
      isBulk: true,
    });
  };

  const confirmBulkDelete = async () => {
    setIsLoading(true);
    setError(null);
    setDeleteConfirmation({
      isOpen: false,
      partyId: null,
      partyName: "",
      isBulk: false,
    });

    try {
      // Delete each selected party
      const deletePromises = selectedParties.map((partyId) =>
        apiFetch(`${API_BASE_URL}/parties/${partyId}/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      );

      await Promise.all(deletePromises);

      // Immediately update the state to remove deleted parties
      setParties((prevParties) =>
        prevParties.filter(
          (p) =>
            !selectedParties
              .map((id) => id.toString())
              .includes(p.id.toString()),
        ),
      );
      setSelectedParties([]);
    } catch (err: any) {
      setError(err.message || "Failed to delete parties");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParties = parties.filter((party: BackendParty) => {
    const searchMatch =
      party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const typeMatch =
      activeTab === "suppliers"
        ? party.type === "supplier"
        : party.type === "customer";

    const customerTypeMatch =
      activeTab === "customers" && selectedCustomerType !== "all"
        ? party.customerType === selectedCustomerType
        : true;

    return searchMatch && typeMatch && customerTypeMatch;
  });

  const paginatedParties = filteredParties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredParties.length / itemsPerPage);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-none bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl text-gray-900">Parties Management</h2>
              <p className="text-sm text-gray-600">
                Manage your customers and suppliers
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenSidebar()}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add {activeTab === "suppliers" ? "Supplier" : "Customer"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => {
              setActiveTab("suppliers");
              setCurrentPage(1);
            }}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === "suppliers"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Suppliers ({parties.filter((p) => p.type === "supplier").length})
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab("customers");
              setCurrentPage(1);
            }}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === "customers"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers ({parties.filter((p) => p.type === "customer").length})
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {activeTab === "customers" && (
            <select
              value={selectedCustomerType}
              onChange={(e) =>
                setSelectedCustomerType(e.target.value as CustomerType | "all")
              }
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Customer Types</option>
              <option value="retail">Retail Customer</option>
              <option value="retailer">Retailer</option>
              <option value="workshop">Workshop</option>
              <option value="distributor">Distributor</option>
              <option value="wholesaler">Wholesaler</option>
            </select>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedParties.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <span className="text-blue-700">
              {selectedParties.length} part
              {selectedParties.length > 1 ? "ies" : "y"} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedParties([])}
                className="px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading parties...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedParties.map((party) => (
              <div
                key={party.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-gray-900 font-medium">
                        {party.name}
                      </h3>
                      {!party.isActive && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          PARTY_TYPE_COLORS[party.type]
                        }`}
                      >
                        {PARTY_TYPE_LABELS[party.type]}
                      </span>
                      {party.type === "customer" && party.customerType && (
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            CUSTOMER_TYPE_COLORS[party.customerType]
                          }`}
                        >
                          {CUSTOMER_TYPE_LABELS[party.customerType]}
                        </span>
                      )}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedParties.includes(party.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedParties([...selectedParties, party.id]);
                      } else {
                        setSelectedParties(
                          selectedParties.filter((id) => id !== party.id),
                        );
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-600"
                  />
                </div>

                <div className="space-y-2 mb-3 text-sm">
                  {party.contactPerson && (
                    <div className="text-gray-600">
                      Contact:{" "}
                      <span className="text-gray-900">
                        {party.contactPerson}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span className="text-gray-900">{party.phone}</span>
                  </div>
                  {party.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="text-gray-900">{party.email}</span>
                    </div>
                  )}
                  {party.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span className="text-gray-900">{party.address}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-200 mb-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-600">Balance</div>
                      <div
                        className={`font-medium ${
                          party.currentBalance >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        NPR {Math.abs(party.currentBalance).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600">Credit Limit</div>
                      <div className="text-gray-900">
                        NPR {party.creditLimit.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewParty(party)}
                    className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </button>
                  <button
                    onClick={() => handleOpenSidebar(party)}
                    className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(party.id, party.name)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {filteredParties.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-700 mb-2">No {activeTab} found</h3>
            <p className="text-sm text-gray-600">
              Try adjusting your search or add a new{" "}
              {activeTab === "suppliers" ? "supplier" : "customer"}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Party Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl text-gray-900">
                {editingParty ? "Edit Party" : "Add New Party"}
              </h3>
              <button
                onClick={handleCloseSidebar}
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 whitespace-pre-line">
                  {formError}
                </div>
              )}
              {/* Basic Information */}
              <div>
                <h4 className="text-gray-900 mb-4 flex items-center gap-2 font-medium">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Basic Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Party Type *
                      </label>
                      <select
                        required
                        disabled={!!editingParty}
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as PartyType,
                          })
                        }
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="supplier">Supplier</option>
                        <option value="customer">Customer</option>
                      </select>
                    </div>
                    {formData.type === "customer" && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Customer Type *
                        </label>
                        <select
                          required
                          value={formData.customerType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customerType: e.target.value as CustomerType,
                            })
                          }
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="retail">Retail Customer</option>
                          <option value="retailer">Retailer</option>
                          <option value="workshop">Workshop</option>
                          <option value="distributor">Distributor</option>
                          <option value="wholesaler">Wholesaler</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Party Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter party name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter contact person name"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-gray-900 mb-4 flex items-center gap-2 font-medium">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Contact Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          handlePhoneInput(e.target.value, (phone) =>
                            setFormData({ ...formData, phone }),
                          )
                        }
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+977 98XXXXXXXX"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter 10 digit number after +977
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          Province *
                        </label>
                        <select
                          value={formData.state || ""}
                          onChange={(e) => {
                            setFormData({ ...formData, state: e.target.value });
                            setSelectedDistrict("");
                          }}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isLoadingRegions}
                        >
                          <option value="">Select Province</option>
                          {provinces.map((prov) => (
                            <option key={prov.id} value={prov.name}>
                              {prov.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">
                          District *
                        </label>
                        <select
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!formData.state || isLoadingRegions}
                        >
                          <option value="">Select District</option>
                          {provinces
                            .find((p) => p.name === formData.state)
                            ?.districts.map((dist) => (
                              <option key={dist.id} value={dist.name}>
                                {dist.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        City/Town *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter city or town"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h4 className="text-gray-900 mb-4 flex items-center gap-2 font-medium">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Financial Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        GST Number
                      </label>
                      <input
                        type="text"
                        value={formData.gstNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gstNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="GST number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            panNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="PAN number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Payment Terms
                    </label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentTerms: e.target.value as PaymentTerms,
                        })
                      }
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="credit_7">7 Days Credit</option>
                      <option value="credit_15">15 Days Credit</option>
                      <option value="credit_30">30 Days Credit</option>
                      <option value="credit_45">45 Days Credit</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Credit Limit (NPR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.creditLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            creditLimit: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">
                        Opening Balance (NPR)
                      </label>
                      <input
                        type="number"
                        value={formData.openingBalance}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            openingBalance: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseSidebar}
                  className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Saving..."
                    : editingParty
                      ? "Update Party"
                      : "Create Party"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Party Sidebar */}
      {viewingSidebar && viewingParty && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl text-gray-900">{viewingParty.name}</h3>
              <button
                onClick={handleCloseSidebar}
                className="text-gray-400 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Party Details */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Type</div>
                    <div className="text-gray-900">
                      {PARTY_TYPE_LABELS[viewingParty.type]}
                    </div>
                  </div>
                  {viewingParty.customerType && (
                    <div>
                      <div className="text-gray-600 mb-1">Customer Type</div>
                      <div className="text-gray-900">
                        {CUSTOMER_TYPE_LABELS[viewingParty.customerType]}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-600 mb-1">Phone</div>
                    <div className="text-gray-900">{viewingParty.phone}</div>
                  </div>
                  {viewingParty.email && (
                    <div>
                      <div className="text-gray-600 mb-1">Email</div>
                      <div className="text-gray-900">{viewingParty.email}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-600 mb-1">Current Balance</div>
                    <div
                      className={`font-medium ${
                        viewingParty.currentBalance >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      NPR{" "}
                      {Math.abs(viewingParty.currentBalance).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Credit Limit</div>
                    <div className="text-gray-900">
                      NPR {viewingParty.creditLimit.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="text-gray-900 mb-4 flex items-center gap-2 font-medium">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Transaction History
                </h4>
                {transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-900 capitalize">
                            {txn.type}
                          </span>
                          <span
                            className={`font-medium ${
                              txn.type === "payment" || txn.type === "sale"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            NPR {txn.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(txn.date).toLocaleDateString()} - Balance:
                          NPR {txn.balanceAfter.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    No transactions yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmation.isOpen}
        onConfirm={
          deleteConfirmation.isBulk ? confirmBulkDelete : confirmDelete
        }
        onCancel={() =>
          setDeleteConfirmation({
            isOpen: false,
            partyId: null,
            partyName: "",
            isBulk: false,
          })
        }
        title={
          deleteConfirmation.isBulk ? "Delete Multiple Parties" : "Delete Party"
        }
        message={
          deleteConfirmation.isBulk
            ? `Are you sure you want to delete ${deleteConfirmation.partyName}?`
            : `Are you sure you want to delete "${deleteConfirmation.partyName}"?`
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        details={[
          deleteConfirmation.isBulk
            ? "All selected parties will be permanently removed"
            : "This party will be permanently removed",
          "All associated data will be deleted",
          "This action cannot be undone",
        ]}
      />
    </div>
  );
};
