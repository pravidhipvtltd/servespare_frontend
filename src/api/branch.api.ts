const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/branch`;

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
   
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Branch response types
export interface Branch {
  id: number;
  name: string;
  branch_name?: string;
  title?: string;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  tenant?: number;
  created?: string;
  modified?: string;
}

export interface BranchesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Branch[];
}

/**
 * Get all branches with optional tenant filter
 * @param tenantId - Optional tenant ID to filter branches
 */
export const getBranches = async (
  tenantId?: string | number
): Promise<BranchesResponse> => {
  try {
    let url = `${API_BASE_URL}/`;

    if (tenantId) {
      url += `?tenant=${encodeURIComponent(tenantId)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch branches: ${response.statusText}`);
    }

    const data: BranchesResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching branches:", error);
    throw error;
  }
};

/**
 * Get active branches for a tenant
 * @param tenantId - Tenant ID to filter branches
 */
export const getActiveBranches = async (
  tenantId?: string | number
): Promise<Branch[]> => {
  try {
    const data = await getBranches(tenantId);
    return data.results.filter((branch) => branch.is_active !== false);
  } catch (error) {
    console.error("Error fetching active branches:", error);
    throw error;
  }
};

/**
 * Get branch by ID
 * @param branchId - Branch ID
 */
export const getBranchById = async (branchId: number): Promise<Branch> => {
  try {
    const url = `${API_BASE_URL}/${branchId}/`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch branch: ${response.statusText}`);
    }

    const data: Branch = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching branch by ID:", error);
    throw error;
  }
};

/**
 * Create a new branch
 * @param branchData - Branch data to create
 */
export const createBranch = async (branchData: {
  name: string;
  tenant: number;
  location?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}): Promise<Branch> => {
  try {
    const url = `${API_BASE_URL}/`;
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(branchData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to create branch: ${response.statusText}. ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data: Branch = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
};

/**
 * Update an existing branch
 * @param branchId - Branch ID to update
 * @param updates - Partial branch data to update
 */
export const updateBranch = async (
  branchId: number,
  updates: Partial<{
    name: string;
    location: string;
    address: string;
    phone: string;
    email: string;
    is_active: boolean;
  }>
): Promise<Branch> => {
  try {
    const url = `${API_BASE_URL}/${branchId}/`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to update branch: ${response.statusText}. ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data: Branch = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
};

/**
 * Delete a branch
 * @param branchId - Branch ID to delete
 */
export const deleteBranch = async (branchId: number): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/${branchId}/`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete branch: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting branch:", error);
    throw error;
  }
};

/**
 * Format branch name from API response
 * Handles various field name conventions
 */
export const formatBranchName = (branch: Branch): string => {
  return (
    branch.name || branch.branch_name || branch.title || `Branch ${branch.id}`
  );
};

/**
 * Get branches with formatted names for dropdown/select components
 * @param tenantId - Optional tenant ID to filter branches
 */
export const getBranchesForSelect = async (
  tenantId?: string | number
): Promise<Array<{ id: number; name: string }>> => {
  try {
    const data = await getBranches(tenantId);
    // Only show branches that are active and match the tenant, and exclude 'main'/'purnima' etc
    return data.results
      .filter(
        (branch) =>
          branch.is_active !== false &&
          (!tenantId || branch.tenant == tenantId) &&
          branch.name &&
          !["main", "purnima", "main branch", "purnima branch"].includes(
            branch.name.trim().toLowerCase()
          )
      )
      .map((branch) => ({
        id: branch.id,
        name: formatBranchName(branch),
      }));
  } catch (error) {
    console.error("Error fetching branches for select:", error);
    // Fallback to localStorage
    const localBranches = JSON.parse(localStorage.getItem("branches") || "[]");
    return localBranches
      .filter(
        (b: any) =>
          b.is_active !== false &&
          (!tenantId || b.tenant == tenantId) &&
          b.name &&
          !["main", "purnima", "main branch", "purnima branch"].includes(
            b.name.trim().toLowerCase()
          )
      )
      .map((b: any) => ({
        id: b.id,
        name: b.name || b.branch || b.title || `Branch ${b.id}`,
      }));
  }
};

/**
 * Get user's current tenant ID from various sources
 */
export const getCurrentTenantId = (): string | number | null => {
  // Try workspaceId from localStorage (set during login)
  const workspaceId = localStorage.getItem("tenant_id");
  if (workspaceId) return workspaceId;

  // Try from user object
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.tenant_id) return user.tenant_id;
      if (user.workspaceId) return user.workspaceId;
    } catch (e) {
      // ignore parse errors
    }
  }

  return null;
};

export default {
  getBranches,
  getActiveBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  formatBranchName,
  getBranchesForSelect,
  getCurrentTenantId,
};
