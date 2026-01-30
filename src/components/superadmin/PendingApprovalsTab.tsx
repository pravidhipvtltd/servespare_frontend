import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Building,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

interface PendingRegistration {
  id: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  businessInfo: {
    name: string;
    type: string;
    panVatNumber: string;
    address: string;
    phone: string;
    email: string;
  };
  ownerInfo: {
    name: string;
    citizenshipNumber: string;
  };
  documents: {
    panVatCertificate: string;
    registrationCertificate: string;
    ownerPhoto: string;
    citizenshipPhoto: string;
  };
  credentials: {
    email: string;
    password: string;
  };
}

interface TenantCounts {
  pending: number;
  approved: number;
  rejected: number;
}

interface PendingApprovalsTabProps {
  onUpdate?: () => void;
}

export const PendingApprovalsTab: React.FC<PendingApprovalsTabProps> = ({
  onUpdate,
}) => {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] =
    useState<PendingRegistration | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState<TenantCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadRegistrations();
    fetchStats();

    // Auto-refresh every 3 seconds to check for new registrations
    const interval = setInterval(() => {
      loadRegistrations();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tenant/counts/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
           
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error(
          "Error fetching stats:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const loadRegistrations = () => {
    const data = JSON.parse(
      localStorage.getItem("pending_registrations") || "[]"
    );
    console.log("🔄 Loading registrations from localStorage:", data.length);
    console.log("📋 Registrations:", data);
    setRegistrations(data);
    if (onUpdate) onUpdate();
  };

  const handleApprove = (registration: PendingRegistration) => {
    if (
      !confirm(
        `Approve registration for "${registration.businessInfo.name}"?\n\nThis will create an admin account and allow them to login.`
      )
    ) {
      return;
    }

    // Create user account
    const newUserId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Handle both old and new registration formats
    // Old format: had ownerInfo.email, new format: uses businessInfo.email
    const loginEmail =
      registration.credentials.email || registration.businessInfo.email;
    const phone = registration.businessInfo.phone || "";

    const newUser = {
      id: newUserId,
      name: registration.ownerInfo.name,
      email: loginEmail,
      password: registration.credentials.password,
      role: "admin" as const,
      businessName: registration.businessInfo.name,
      isActive: true,
      createdAt: new Date().toISOString(),
      branch: "",
      phone: phone,
      businessInfo: registration.businessInfo,
      ownerInfo: registration.ownerInfo,
    };

    // Add to users
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    existingUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(existingUsers));

    console.log("✅ User account created:", newUser);
    console.log("📧 Login Email:", loginEmail);
    console.log("🔑 Password:", registration.credentials.password);
    console.log("👥 Total users now:", existingUsers.length);

    // Create admin account entry
    const adminAccountId = `admin_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newAdminAccount = {
      id: adminAccountId,
      userId: newUserId,
      email: loginEmail,
      businessName: registration.businessInfo.name,
      contactPerson: registration.ownerInfo.name,
      phone: phone,
      package: "pending", // They need to select package on first login
      status: "active",
      subscriptionStatus: "pending",
      paymentStatus: "pending",
      createdAt: new Date().toISOString(),
      lastLogin: null,
      trialEndDate: null,
      businessInfo: registration.businessInfo,
      ownerInfo: registration.ownerInfo,
      approvedBy: "superadmin",
      approvedAt: new Date().toISOString(),
    };

    // Add to admin accounts
    const existingAdminAccounts = JSON.parse(
      localStorage.getItem("admin_accounts") || "[]"
    );
    existingAdminAccounts.push(newAdminAccount);
    localStorage.setItem(
      "admin_accounts",
      JSON.stringify(existingAdminAccounts)
    );

    console.log("✅ Admin account created:", newAdminAccount);
    console.log("📊 Total admin accounts now:", existingAdminAccounts.length);

    // Update registration status
    const allRegistrations = JSON.parse(
      localStorage.getItem("pending_registrations") || "[]"
    );
    const updated = allRegistrations.map((r: PendingRegistration) =>
      r.id === registration.id
        ? { ...r, status: "approved", approvedAt: new Date().toISOString() }
        : r
    );
    localStorage.setItem("pending_registrations", JSON.stringify(updated));

    // Reload
    loadRegistrations();
    setShowDetails(false);
    setSelectedRegistration(null);

    alert(
      `✅ Registration approved!\n\nAdmin account created and activated.\n\nLogin credentials:\nEmail: ${loginEmail}\nPassword: (as set during registration)\n\nThe admin will need to:\n1. Complete business verification\n2. Select a package\n3. Complete payment\n\nThe account is now visible in Admin Accounts Management.`
    );
  };

  const handleReject = (registration: PendingRegistration) => {
    const reason = prompt("Enter rejection reason (optional):");

    if (reason === null) return; // Cancelled

    // Update registration status
    const allRegistrations = JSON.parse(
      localStorage.getItem("pending_registrations") || "[]"
    );
    const updated = allRegistrations.map((r: PendingRegistration) =>
      r.id === registration.id
        ? {
            ...r,
            status: "rejected",
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason,
          }
        : r
    );
    localStorage.setItem("pending_registrations", JSON.stringify(updated));

    // Reload
    loadRegistrations();
    setShowDetails(false);
    setSelectedRegistration(null);

    alert("❌ Registration rejected.");
  };

  const pendingOnly = registrations.filter((r) => r.status === "pending");
  const approvedOnly = registrations.filter((r) => r.status === "approved");
  const rejectedOnly = registrations.filter((r) => r.status === "rejected");

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pending Approvals
        </h2>
        <p className="text-gray-600">
          Review and approve business registrations
        </p>

        {/* Debug: Clear Old Data Button */}
        {(pendingOnly.length > 0 ||
          approvedOnly.length > 0 ||
          rejectedOnly.length > 0) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Testing Mode:</strong> If you're experiencing login issues
              with old test registrations, you can clear all registration data
              and start fresh.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (
                    confirm(
                      "⚠️ Clear ALL registration data?\n\nThis will delete all pending, approved, and rejected registrations.\n\nApproved users will remain in the system but registration records will be cleared."
                    )
                  ) {
                    localStorage.removeItem("pending_registrations");
                    loadRegistrations();
                    alert(
                      "✅ All registration data cleared! You can now submit fresh test registrations."
                    );
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                🗑️ Clear Registration Data
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      "⚠️ Clear ALL test users?\n\nThis will delete all admin users (except default superadmin).\n\nUse this to remove old test accounts created with incorrect credentials."
                    )
                  ) {
                    const users = JSON.parse(
                      localStorage.getItem("users") || "[]"
                    );
                    // Keep only superadmin
                    const superadminOnly = users.filter(
                      (u: any) => u.role === "superadmin"
                    );
                    localStorage.setItem(
                      "users",
                      JSON.stringify(superadminOnly)
                    );
                    alert(
                      "✅ All test admin users cleared! Superadmin account preserved.\n\nYou can now approve fresh registrations."
                    );
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                🗑️ Clear Test Users
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-900">
                {stats.pending}
              </p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-900">
                {stats.approved}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-900">
                {stats.rejected}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Pending Registrations List */}
      {pendingOnly.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Pending Registrations
          </h3>
          <p className="text-gray-500">All registrations have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingOnly.map((registration) => (
            <div
              key={registration.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {registration.businessInfo.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {registration.businessInfo.type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Owner</p>
                      <p className="text-gray-900">
                        {registration.ownerInfo.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        PAN/VAT
                      </p>
                      <p className="text-gray-900">
                        {registration.businessInfo.panVatNumber}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Submitted:{" "}
                    {new Date(registration.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedRegistration(registration);
                      setShowDetails(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleApprove(registration)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(registration)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedRegistration && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Registration Details</h2>
              <p className="text-indigo-100">
                {selectedRegistration.businessInfo.name}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Business Info */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3">
                  <Building className="w-5 h-5 text-indigo-600" />
                  Business Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Business Name
                    </p>
                    <p className="text-gray-900">
                      {selectedRegistration.businessInfo.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Type</p>
                    <p className="text-gray-900">
                      {selectedRegistration.businessInfo.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      PAN/VAT Number
                    </p>
                    <p className="text-gray-900">
                      {selectedRegistration.businessInfo.panVatNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">
                      {selectedRegistration.businessInfo.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-900">
                      {selectedRegistration.businessInfo.phone}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-gray-900">
                      {selectedRegistration.businessInfo.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3">
                  <User className="w-5 h-5 text-indigo-600" />
                  Owner Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Full Name
                    </p>
                    <p className="text-gray-900">
                      {selectedRegistration.ownerInfo.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Citizenship Number
                    </p>
                    <p className="text-gray-900">
                      {selectedRegistration.ownerInfo.citizenshipNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold mb-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Uploaded Documents
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <DocumentPreview
                    title="PAN/VAT Certificate"
                    imageData={selectedRegistration.documents.panVatCertificate}
                  />
                  <DocumentPreview
                    title="Registration Certificate"
                    imageData={
                      selectedRegistration.documents.registrationCertificate
                    }
                  />
                  <DocumentPreview
                    title="Owner Photo"
                    imageData={selectedRegistration.documents.ownerPhoto}
                  />
                  <DocumentPreview
                    title="Citizenship Photo"
                    imageData={selectedRegistration.documents.citizenshipPhoto}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleReject(selectedRegistration)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedRegistration)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DocumentPreview: React.FC<{ title: string; imageData: string }> = ({
  title,
  imageData,
}) => (
  <div className="border-2 border-gray-200 rounded-lg p-3">
    <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
    {imageData ? (
      <a href={imageData} target="_blank" rel="noopener noreferrer">
        <img
          src={imageData}
          alt={title}
          className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        />
      </a>
    ) : (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-gray-300" />
      </div>
    )}
  </div>
);
