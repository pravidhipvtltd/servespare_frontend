import React, { useState } from "react";
import {
  X,
  Copy,
  CheckCircle,
  Mail,
  Key,
  AlertCircle,
  Download,
} from "lucide-react";

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  adminUsername?: string; // Added username prop
  adminEmail: string;
  businessName: string;
  generatedPassword: string;
  packageType: string;
  onSendEmail: () => Promise<void>;
  emailSending: boolean;
  emailSent: boolean;
  emailMessage?: string; // Optional message from email sending
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  adminName,
  adminUsername, // Add destructured prop
  adminEmail,
  businessName,
  generatedPassword,
  packageType,
  onSendEmail,
  emailSending,
  emailSent,
  emailMessage,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false); // State for copied username

  if (!isOpen) return null;

  const copyToClipboard = async (
    text: string,
    type: "email" | "password" | "username"
  ) => {
    let copySuccess = false;

    // Method 1: Try modern Clipboard API (only if available and in secure context)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        copySuccess = true;
      } catch (err) {
        // Silently fail and try fallback - API might be blocked by permissions policy
        copySuccess = false;
      }
    }

    // Method 2: Fallback to execCommand if Clipboard API failed or not available
    if (!copySuccess) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          copySuccess = true;
        }
      } catch (err) {
        // Silently fail and try final fallback
        copySuccess = false;
      }
    }

    // Method 3: Final fallback - prompt user to copy manually
    if (!copySuccess) {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.readOnly = true;
      textArea.style.position = "absolute";
      textArea.style.left = "50%";
      textArea.style.top = "50%";
      textArea.style.transform = "translate(-50%, -50%)";
      textArea.style.width = "80%";
      textArea.style.maxWidth = "400px";
      textArea.style.padding = "12px";
      textArea.style.fontSize = "14px";
      textArea.style.border = "2px solid #3b82f6";
      textArea.style.borderRadius = "8px";
      textArea.style.zIndex = "10000";
      textArea.style.backgroundColor = "white";

      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      overlay.style.zIndex = "9999";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";

      const container = document.createElement("div");
      container.style.backgroundColor = "white";
      container.style.padding = "24px";
      container.style.borderRadius = "12px";
      container.style.maxWidth = "90%";
      container.style.width = "400px";
      container.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";

      const title = document.createElement("div");
      title.textContent =
        type === "email"
          ? "Copy Email Address"
          : type === "password"
          ? "Copy Password"
          : "Copy Username";
      title.style.fontSize = "18px";
      title.style.fontWeight = "bold";
      title.style.marginBottom = "12px";
      title.style.color = "#1f2937";

      const instruction = document.createElement("div");
      instruction.textContent =
        "Select the text below and press Ctrl+C (or Cmd+C on Mac) to copy:";
      instruction.style.fontSize = "14px";
      instruction.style.marginBottom = "12px";
      instruction.style.color = "#6b7280";

      textArea.style.position = "static";
      textArea.style.transform = "none";
      textArea.style.width = "100%";
      textArea.style.marginBottom = "12px";

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Close";
      closeBtn.style.width = "100%";
      closeBtn.style.padding = "10px";
      closeBtn.style.backgroundColor = "#3b82f6";
      closeBtn.style.color = "white";
      closeBtn.style.border = "none";
      closeBtn.style.borderRadius = "6px";
      closeBtn.style.fontSize = "14px";
      closeBtn.style.fontWeight = "600";
      closeBtn.style.cursor = "pointer";

      closeBtn.onmouseover = () => {
        closeBtn.style.backgroundColor = "#2563eb";
      };
      closeBtn.onmouseout = () => {
        closeBtn.style.backgroundColor = "#3b82f6";
      };

      closeBtn.onclick = () => {
        document.body.removeChild(overlay);
      };

      container.appendChild(title);
      container.appendChild(instruction);
      container.appendChild(textArea);
      container.appendChild(closeBtn);
      overlay.appendChild(container);
      document.body.appendChild(overlay);

      // Auto-select the text
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile devices

      // Try one more time with execCommand in this context
      try {
        document.execCommand("copy");
        copySuccess = true;
      } catch (e) {
        // User will manually copy
      }
    }

    // Set copied state regardless (user feedback)
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else if (type === "password") {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } else if (type === "username") {
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2000);
    }
  };

  const downloadCredentials = () => {
    const content = `
═══════════════════════════════════════════════════
SERVE SPARES - ADMIN CREDENTIALS
═══════════════════════════════════════════════════

Account Created: ${new Date().toLocaleString()}

ADMIN DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:          ${adminName}
Business:      ${businessName}
Package:       ${packageType.toUpperCase()}

LOGIN CREDENTIALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Username:      ${adminUsername || "N/A"}
Email:         ${adminEmail}
Password:      ${generatedPassword}

IMPORTANT NOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  The admin will be required to change this password on first login
🔒 Keep these credentials secure and confidential
📧 These credentials have been sent to the admin's email

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by Serve Spares - Inventory System
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessName.replace(/\s+/g, "_")}_credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Admin Account Created!</h2>
                <p className="text-green-100 text-sm">
                  Credentials generated successfully
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Success Message */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">
                  Account successfully created for {businessName}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  A secure password has been generated. Please share these
                  credentials with the admin securely.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Admin Name</p>
              <p className="font-semibold text-gray-900">{adminName}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">Business Name</p>
              <p className="font-semibold text-gray-900">{businessName}</p>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center space-x-2">
              <Key className="w-5 h-5 text-orange-500" />
              <span>Login Credentials</span>
            </h3>

            {/* Email */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-blue-700 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </label>
                <button
                  onClick={() => copyToClipboard(adminEmail, "email")}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold"
                >
                  {copiedEmail ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-white border border-blue-300 rounded-lg p-3">
                <p className="font-mono font-semibold text-gray-900 break-all">
                  {adminEmail}
                </p>
              </div>
            </div>

            {/* Username */}
            {adminUsername && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-purple-700 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Username</span>
                  </label>
                  <button
                    onClick={() =>
                      copyToClipboard(adminUsername || "", "username")
                    }
                    className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-semibold"
                  >
                    {copiedUsername ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white border border-purple-300 rounded-lg p-3">
                  <p className="font-mono font-semibold text-gray-900 break-all">
                    {adminUsername}
                  </p>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-orange-700 flex items-center space-x-2">
                  <Key className="w-4 h-4" />
                  <span>Temporary Password</span>
                </label>
                <button
                  onClick={() => copyToClipboard(generatedPassword, "password")}
                  className="flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs font-semibold"
                >
                  {copiedPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <div className="bg-white border border-orange-300 rounded-lg p-3">
                <p className="font-mono text-xl font-bold text-gray-900 tracking-wider break-all">
                  {generatedPassword}
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-2">
                  🔒 Security Notice
                </p>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>
                    • Admin will be required to change this password on first
                    login
                  </li>
                  <li>
                    • This is a one-time display - save these credentials
                    securely
                  </li>
                  <li>
                    • Credentials will also be sent to the admin's email address
                  </li>
                  <li>• Keep this information confidential</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            {/* Email Status Message */}
            {emailMessage && emailSent && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-sm text-blue-800 text-center">
                  {emailMessage}
                </p>
              </div>
            )}

            <button
              onClick={onSendEmail}
              disabled={emailSending || emailSent}
              className={`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                emailSent
                  ? "bg-green-100 text-green-700 cursor-not-allowed"
                  : emailSending
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg"
              }`}
            >
              {emailSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Email via Resend...</span>
                </>
              ) : emailSent ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Email Sent Successfully!</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Send Credentials via Email (Resend)</span>
                </>
              )}
            </button>

            <button
              onClick={downloadCredentials}
              className="w-full px-6 py-3 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Credentials (TXT)</span>
            </button>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
