// Add User Modal - Clean & Simple
import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Building2,
  Shield,
  AlertCircle,
  Check,
} from "lucide-react";
import { User as UserType, Workspace } from "../types";
import { getFromStorage, saveToStorage } from "../utils/mockData";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workspaces: Workspace[];
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  workspaces,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "+977",
    password: "",
    role: "cashier",
    workspaceId: workspaces[0]?.id || "",
    address: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const roles = [
    {
      id: "super_admin",
      name: "Super Admin",
      icon: Shield,
      color: "red",
      description: "Full system access",
    },
    {
      id: "admin",
      name: "Admin",
      icon: Shield,
      color: "purple",
      description: "Manage store operations",
    },
    {
      id: "inventory_manager",
      name: "Inventory Manager",
      icon: Shield,
      color: "orange",
      description: "Manage inventory",
    },
    {
      id: "cashier",
      name: "Cashier",
      icon: Shield,
      color: "green",
      description: "Process sales",
    },
  ];

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Check if email already exists
    const users: UserType[] = getFromStorage("users", []);
    if (
      users.some((u) => u.email.toLowerCase() === formData.email.toLowerCase())
    ) {
      newErrors.email = "Email already exists";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+977[- ]?\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid Nepal phone number (use +977XXXXXXXXXX)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.workspaceId) {
      newErrors.workspaceId = "Please select a branch";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const newUser: UserType = {
      id: `user${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
      role: formData.role as any,
      workspaceId: formData.workspaceId,
      address: formData.address.trim(),
      isActive: formData.isActive,
      createdAt: new Date().toISOString(),
    };

    const users: UserType[] = getFromStorage("users", []);
    saveToStorage("users", [...users, newUser]);

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "+977",
      password: "",
      role: "cashier",
      workspaceId: workspaces[0]?.id || "",
      address: "",
      isActive: true,
    });
    setErrors({});

    onSuccess();
    alert("✅ User created successfully!");
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      email: "",
      phone: "+977",
      password: "",
      role: "cashier",
      workspaceId: workspaces[0]?.id || "",
      address: "",
      isActive: true,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const selectedRole = roles.find((r) => r.id === formData.role);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Add New User</h2>
              <p className="text-blue-100 text-sm">Create a new user account</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-semibold">
                User Account Creation
              </p>
              <p className="text-blue-700 text-sm mt-1">
                Fill in all required fields. User will be able to login with
                their email and password.
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-gray-900 font-bold flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </h3>

            {/* Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="user@example.com"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.startsWith("+977")) {
                      if (value.length <= 14) {
                        setFormData({ ...formData, phone: value });
                      }
                    } else if (value.length <= 10) {
                      setFormData({ ...formData, phone: value });
                    }
                  }}
                  maxLength={14}
                  placeholder="+977"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.phone}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter address"
                  rows={2}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="space-y-4">
            <h3 className="text-gray-900 font-bold flex items-center">
              <Lock className="w-5 h-5 mr-2 text-purple-600" />
              Account Settings
            </h3>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Minimum 6 characters"
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.password}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                User Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.role === role.id
                        ? `bg-${role.color}-50 border-${role.color}-500`
                        : "bg-white border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <role.icon className={`w-5 h-5 text-${role.color}-600`} />
                      {formData.role === role.id && (
                        <Check className={`w-5 h-5 text-${role.color}-600`} />
                      )}
                    </div>
                    <div className="text-gray-900 font-semibold mb-1">
                      {role.name}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {role.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Branch/Workspace */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Assign to Branch <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.workspaceId}
                  onChange={(e) =>
                    setFormData({ ...formData, workspaceId: e.target.value })
                  }
                  className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 appearance-none ${
                    errors.workspaceId
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                >
                  <option value="">Select a branch</option>
                  {workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.workspaceId && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {errors.workspaceId}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="text-gray-900 font-semibold">
                  Account Status
                </div>
                <div className="text-gray-600 text-sm">
                  User can login immediately after creation
                </div>
              </div>
              <button
                onClick={() =>
                  setFormData({ ...formData, isActive: !formData.isActive })
                }
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  formData.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    formData.isActive ? "translate-x-8" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl flex space-x-3 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 font-semibold text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  );
};
