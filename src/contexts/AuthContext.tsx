import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";

interface AuthContextType {
  currentUser: User | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => void;
  refreshAccessToken: () => Promise<boolean>;
  isLoading: boolean;
  tenantInfo: {
    businessName: string;
    package: string;
    status: string;
  } | null;
  updateTenantInfo: (
    updates: Partial<{ businessName: string; package: string; status: string }>,
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session - prioritize backend tokens
    const accessToken =
      localStorage.getItem("accessToken") || localStorage.getItem("auth_token");
    const userId = localStorage.getItem("user_id");
    const userEmail = localStorage.getItem("user_email");
    const userName = localStorage.getItem("user_name");
    const userRole = localStorage.getItem("user_role") as any;
    const storedUser = localStorage.getItem("user");
    const tenantId = localStorage.getItem("tenant_id");
    const businessName = localStorage.getItem("business_name");
    const tenantPackage = localStorage.getItem("tenant_package");
    const tenantStatus = localStorage.getItem("tenant_status");
    const sessionActive = localStorage.getItem("session_active");

    // Only restore session if explicitly marked as active
    if (accessToken && (userId || storedUser) && sessionActive === "true") {
      // Try to parse stored user from backend
      let parsedUser: any = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (e) {
          console.warn("Failed to parse stored user:", e);
        }
      }

      // Reconstruct user object from localStorage
      const user: User = {
        id: userId || parsedUser?.id || parsedUser?.username || "",
        email: userEmail || parsedUser?.email || "",
        password: "",
        name: userName || parsedUser?.name || parsedUser?.username || "",
        role: userRole || parsedUser?.role || "admin",
        isActive: true,
        workspaceId:
          parsedUser?.workspaceId ||
          parsedUser?.workspace_id ||
          localStorage.getItem("tenant_id") ||
          localStorage.getItem("workspace_id") ||
          undefined,
        createdAt: parsedUser?.created_at || "",
        branch: parsedUser?.branch ?? "",
      };

      setCurrentUser(user);

      if (businessName && tenantPackage && tenantStatus) {
        setTenantInfo({
          businessName,
          package: tenantPackage,
          status: tenantStatus,
        });
      }

      console.log("✅ Session restored from localStorage");

      // Store branch in localStorage for refreshUser
      if (parsedUser?.branch !== undefined) {
        localStorage.setItem("user_branch", String(parsedUser.branch));
      } else {
        localStorage.removeItem("user_branch");
      }
    } else {
      // Clear any stale session data if not active
      if (accessToken && sessionActive !== "true") {
        console.log("🧹 Clearing stale session data");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_name");
        const userBranch = localStorage.getItem("user_branch");
        localStorage.removeItem("user_role");
      }
    }

    setIsLoading(false);
  }, []);

  // Refresh user data from localStorage
  const refreshUser = () => {
    const userId = localStorage.getItem("user_id");
    const userEmail = localStorage.getItem("user_email");
    const userBranch = localStorage.getItem("user_branch");
    const userRole = localStorage.getItem("user_role") as any;
    const workspaceId =
      localStorage.getItem("tenant_id") || localStorage.getItem("workspace_id");
    const businessName = localStorage.getItem("business_name");
    const tenantPackage = localStorage.getItem("tenant_package");
    const tenantStatus = localStorage.getItem("tenant_status");

    if (userId && userEmail) {
      const user: User = {
        id: userId,
        email: userEmail,
        password: "",
        name: userName || "",
        role: userRole,
        isActive: true,
        workspaceId: workspaceId || undefined,
        createdAt: "",
        branch: userBranch ?? "",
      };
      setCurrentUser(user);

      if (businessName && tenantPackage && tenantStatus) {
        setTenantInfo({
          businessName,
          package: tenantPackage,
          status: tenantStatus,
        });
      }
    }
  };

  const login = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> => {
    console.log("🔐 Attempting login:", username);

    // Get tokens and user data from localStorage (set by AdminLoginForm)
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (!accessToken || !storedUser) {
      return {
        success: false,
        message: "Login failed. Please try again.",
      };
    }
    //example
    try {
      // Parse user data from backend response
      const parsedUser = JSON.parse(storedUser);

      // Extract user role from backend response
      const userRole = parsedUser?.role || parsedUser?.user_type || "admin";

      console.log("🔍 [AuthContext] User role from storage:", userRole);

      // Check if user is a customer and deny access
      if (userRole === "customer") {
        console.log("❌ [AuthContext] Customer role detected, denying access");
        // Clear all stored data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_name");
        localStorage.removeItem("user_role");

        return {
          success: false,
          message: "Username or password do not match.",
        };
      }

      // Map backend role to our UserRole type
      let mappedRole:
        | "super_admin"
        | "admin"
        | "inventory_manager"
        | "cashier" = "admin";
      if (
        userRole === "super_admin" ||
        userRole === "superadmin" ||
        userRole === "super-admin"
      ) {
        mappedRole = "super_admin";
      } else if (
        userRole === "inventory_manager" ||
        userRole === "inventory-manager"
      ) {
        mappedRole = "inventory_manager";
      } else if (userRole === "cashier") {
        mappedRole = "cashier";
      } else {
        mappedRole = "admin";
      }

      // Create User object
      const user: User = {
        id: parsedUser?.id || parsedUser?.username || "",
        email: parsedUser?.email || username,
        password: "",
        name: parsedUser?.name || parsedUser?.username || "",
        role: mappedRole,
        isActive: true,
        workspaceId:
          parsedUser?.workspaceId ||
          parsedUser?.workspace_id ||
          parsedUser?.tenant_id ||
          localStorage.getItem("tenant_id") ||
          undefined,
        createdAt: parsedUser?.created_at || new Date().toISOString(),
        branch: parsedUser?.branch ?? "",
      };

      // Set current user
      setCurrentUser(user);

      // Store session data
      localStorage.setItem("auth_token", accessToken);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("user_email", user.email);
      localStorage.setItem("user_name", user.name);
      localStorage.setItem("user_role", user.role);
      localStorage.setItem("session_active", "true");

      // Save branch id for shift usage and consistency
      if (
        user.branch !== undefined &&
        user.branch !== null &&
        user.branch !== ""
      ) {
        localStorage.setItem("branch_id", String(user.branch));
        localStorage.setItem("user_branch", String(user.branch));
      } else {
        localStorage.removeItem("branch_id");
        localStorage.removeItem("user_branch");
      }

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Set tenant info (if available from backend)
      if (parsedUser?.business_name || parsedUser?.organization) {
        const tenantInfo = {
          businessName:
            parsedUser.business_name ||
            parsedUser.organization ||
            "My Business",
          package: "professional",
          status: "active",
        };
        setTenantInfo(tenantInfo);
        localStorage.setItem("business_name", tenantInfo.businessName);
        localStorage.setItem("tenant_package", tenantInfo.package);
        localStorage.setItem("tenant_status", tenantInfo.status);
      }

      console.log("✅ Backend login successful!");
      console.log("   User:", user.name);
      console.log("   Role:", user.role);
      console.log("   Access Token:", accessToken ? "Received" : "Missing");
      console.log("   Refresh Token:", refreshToken ? "Received" : "Missing");

      return { success: true };
    } catch (error: any) {
      console.error("❌ Failed to process login:", error);
      return {
        success: false,
        message: "Failed to process login. Please try again.",
      };
    }
  };

  const logout = async () => {
    console.log("👋 Logging out...");
    const role = currentUser?.role || localStorage.getItem("user_role");

    try {
      // Call backend logout API
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (token && refreshToken) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
      // We continue with local logout even if API fails
    }

    setCurrentUser(null);
    setTenantInfo(null);

    // Clear all auth-related localStorage
    const authKeys = [
      "auth_token",
      "accessToken",
      "refreshToken",
      "user",
      "user_id",
      "user_email",
      "user_name",
      "user_role",
      "tenant_id",
      "business_name",
      "tenant_package",
      "tenant_status",
      "session_active",
      "branch_id",
      "user_branch",
      "package_active",
      "selected_package",
      "customer_user",
    ];

    authKeys.forEach((key) => localStorage.removeItem(key));

    console.log("✅ Logged out successfully");
    if (role === "customer") {
      navigate("/customer");
    } else {
      navigate("/");
    }
  };

  const updateTenantInfo = (
    updates: Partial<{ businessName: string; package: string; status: string }>,
  ) => {
    setTenantInfo((prev: any) => ({
      ...prev,
      ...updates,
    }));
  };

  // Function to refresh the access token using the refresh token
  const refreshAccessToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.error("❌ No refresh token available");
      return false;
    }

    try {
      console.log("🔄 Refreshing access token...");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/token/refresh/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access || data.accessToken;

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("auth_token", newAccessToken);
          console.log("✅ Access token refreshed successfully");
          return true;
        } else {
          console.error("❌ No access token in refresh response");
          return false;
        }
      } else {
        console.error("❌ Token refresh failed:", response.status);
        // If refresh fails, likely refresh token is also expired
        // Force logout
        logout();
        return false;
      }
    } catch (error) {
      console.error("❌ Error refreshing token:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        refreshUser,
        refreshAccessToken,
        isLoading,
        tenantInfo,
        updateTenantInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
