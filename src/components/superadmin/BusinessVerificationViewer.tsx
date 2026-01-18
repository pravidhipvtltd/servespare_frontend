import React, { useState, useEffect } from "react";
import {
  Building2,
  FileText,
  User,
  Check,
  X,
  Download,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface BusinessVerificationData {
  businessName: string;
  panVatNumber: string;
  panVatCertificate: string;
  ownerCitizenship: string;
  privacyPolicyAccepted: boolean;
  submittedAt: string;
}

interface VerificationRequest {
  adminEmail: string;
  adminName: string;
  adminId: string;
  verification: BusinessVerificationData;
  status: "pending" | "approved" | "rejected";
}

export const BusinessVerificationViewer: React.FC = () => {
  const [verificationRequests, setVerificationRequests] = useState<
    VerificationRequest[]
  >([]);
  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    loadVerificationRequests();
  }, []);

  const loadVerificationRequests = () => {
    // Get all admin accounts
    const adminAccounts = JSON.parse(
      localStorage.getItem("admin_accounts") || "[]"
    );
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const requests: VerificationRequest[] = [];

    // Check each admin for verification data
    adminAccounts.forEach((admin: any) => {
      const user = users.find((u: any) => u.email === admin.email);

      // In production, verification data would be stored per admin
      // For demo, we're using a global storage key
      const verificationData = localStorage.getItem("business_verification");

      if (verificationData && user) {
        const verification = JSON.parse(verificationData);
        requests.push({
          adminEmail: admin.email,
          adminName: user.name || admin.businessName,
          adminId: admin.id,
          verification,
          status: admin.verificationStatus || "pending",
        });
      }
    });

    setVerificationRequests(requests);
  };

  const handleApprove = (request: VerificationRequest) => {
    // Update admin account status
    const adminAccounts = JSON.parse(
      localStorage.getItem("admin_accounts") || "[]"
    );
    const updatedAccounts = adminAccounts.map((admin: any) => {
      if (admin.id === request.adminId) {
        return { ...admin, verificationStatus: "approved" };
      }
      return admin;
    });
    localStorage.setItem("admin_accounts", JSON.stringify(updatedAccounts));

    toast.success(`Verification approved for ${request.adminEmail}`);
    loadVerificationRequests();
    setSelectedRequest(null);
  };

  const handleReject = (request: VerificationRequest) => {
    // Update admin account status
    const adminAccounts = JSON.parse(
      localStorage.getItem("admin_accounts") || "[]"
    );
    const updatedAccounts = adminAccounts.map((admin: any) => {
      if (admin.id === request.adminId) {
        return { ...admin, verificationStatus: "rejected" };
      }
      return admin;
    });
    localStorage.setItem("admin_accounts", JSON.stringify(updatedAccounts));

    toast.success(`Verification rejected for ${request.adminEmail}`);
    loadVerificationRequests();
    setSelectedRequest(null);
  };

  const viewImage = (imageUrl: string, title: string) => {
    setSelectedImage({ url: imageUrl, title });
    setShowImageModal(true);
  };

  const downloadDocument = (imageUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Document downloaded");
  };

  if (verificationRequests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Verification Requests
        </h3>
        <p className="text-gray-600">
          Business verification requests will appear here when admins submit
          their documents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Requests List */}
      <div className="grid grid-cols-1 gap-4">
        {verificationRequests.map((request, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    request.status === "approved"
                      ? "bg-green-100"
                      : request.status === "rejected"
                      ? "bg-red-100"
                      : "bg-orange-100"
                  }`}
                >
                  <Building2
                    className={`w-6 h-6 ${
                      request.status === "approved"
                        ? "text-green-600"
                        : request.status === "rejected"
                        ? "text-red-600"
                        : "text-orange-600"
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {request.verification.businessName}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      Admin: {request.adminName} ({request.adminEmail})
                    </p>
                    <p>PAN/VAT: {request.verification.panVatNumber}</p>
                    <p>
                      Submitted:{" "}
                      {new Date(
                        request.verification.submittedAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {request.status === "pending" && (
                  <>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Review</span>
                    </button>
                  </>
                )}
                {request.status === "approved" && (
                  <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Approved</span>
                  </div>
                )}
                {request.status === "rejected" && (
                  <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold flex items-center space-x-2">
                    <X className="w-4 h-4" />
                    <span>Rejected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedRequest.verification.businessName}
                </h2>
                <p className="text-gray-600">Business Verification Review</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Business Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Business Details
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Name:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedRequest.verification.businessName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PAN/VAT Number:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedRequest.verification.panVatNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin Email:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedRequest.adminEmail}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted Date:</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(
                        selectedRequest.verification.submittedAt
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Submitted Documents
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* PAN/VAT Certificate */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">
                        PAN/VAT Certificate
                      </h4>
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <img
                      src={selectedRequest.verification.panVatCertificate}
                      alt="PAN/VAT Certificate"
                      className="w-full h-48 object-cover rounded-lg mb-3 cursor-pointer hover:opacity-90"
                      onClick={() =>
                        viewImage(
                          selectedRequest.verification.panVatCertificate,
                          "PAN/VAT Certificate"
                        )
                      }
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          viewImage(
                            selectedRequest.verification.panVatCertificate,
                            "PAN/VAT Certificate"
                          )
                        }
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() =>
                          downloadDocument(
                            selectedRequest.verification.panVatCertificate,
                            "pan_vat_certificate.jpg"
                          )
                        }
                        className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Owner Citizenship */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">
                        Owner Citizenship
                      </h4>
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <img
                      src={selectedRequest.verification.ownerCitizenship}
                      alt="Owner Citizenship"
                      className="w-full h-48 object-cover rounded-lg mb-3 cursor-pointer hover:opacity-90"
                      onClick={() =>
                        viewImage(
                          selectedRequest.verification.ownerCitizenship,
                          "Owner Citizenship"
                        )
                      }
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          viewImage(
                            selectedRequest.verification.ownerCitizenship,
                            "Owner Citizenship"
                          )
                        }
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() =>
                          downloadDocument(
                            selectedRequest.verification.ownerCitizenship,
                            "owner_citizenship.jpg"
                          )
                        }
                        className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Policy Consent */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 font-semibold">
                    Privacy Policy & Terms of Service Accepted
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedRequest.status === "pending" && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => handleReject(selectedRequest)}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-5 h-5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Approve Verification</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="max-w-6xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {selectedImage.title}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
