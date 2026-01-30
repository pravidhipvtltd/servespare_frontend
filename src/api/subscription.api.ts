/**
 * Subscription API Service
 * Centralized API calls for subscription management
 */

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/subscription`;

// Get headers with auth token
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

// Subscription response types
export interface SubscriptionPlanDetail {
  id: number;
  plan_name: string;
  plan_price: string;
  no_of_user: string;
  no_of_branch: string;
  no_of_product: string;
  is_active: boolean;
  created: string;
  modified: string;
}

export interface TenantDetail {
  id: number;
  business_name: string;
  email: string;
}

export interface Subscription {
  id: number;
  tenant: number;
  tenant_detail: TenantDetail;
  subscription_plan: number;
  subscription_plan_detail: SubscriptionPlanDetail;
  subscription_date: string;
  finish_date: string;
  is_active: boolean;
  created: string;
  modified: string;
}

export interface SubscriptionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page_size: number;
  total_pages: number;
  current_page: number;
  results: Subscription[];
}

/**
 * Get all subscriptions with pagination
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 20)
 */
export const getSubscriptions = async (
  page: number = 1,
  pageSize: number = 20,
): Promise<SubscriptionsResponse> => {
  try {
    const url = `${API_BASE_URL}/subscriptions/?page=${page}&page_size=${pageSize}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
    }

    const data: SubscriptionsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
};

/**
 * Get all active subscriptions
 */
export const getActiveSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const data = await getSubscriptions(1, 1000); // Get all subscriptions
    return data.results.filter((sub) => sub.is_active === true);
  } catch (error) {
    console.error("Error fetching active subscriptions:", error);
    throw error;
  }
};

/**
 * Get subscription by tenant ID
 * @param tenantId - Tenant ID to filter by
 */
export const getSubscriptionByTenant = async (
  tenantId: number | string,
): Promise<Subscription | null> => {
  try {
    const data = await getSubscriptions(1, 1000);
    const tenantIdNum = Number(tenantId);

    // Find active subscription for this tenant
    const subscription = data.results.find(
      (sub) => sub.is_active === true && sub.tenant === tenantIdNum,
    );

    return subscription || null;
  } catch (error) {
    console.error("Error fetching subscription by tenant:", error);
    throw error;
  }
};

/**
 * Get subscription by email
 * @param email - Tenant email to filter by
 */
export const getSubscriptionByEmail = async (
  email: string,
): Promise<Subscription | null> => {
  try {
    const data = await getSubscriptions(1, 1000);

    // Find active subscription for this email
    const subscription = data.results.find(
      (sub) =>
        sub.is_active === true &&
        sub.tenant_detail?.email?.toLowerCase() === email.toLowerCase(),
    );

    return subscription || null;
  } catch (error) {
    console.error("Error fetching subscription by email:", error);
    throw error;
  }
};

/**
 * Get subscription by ID
 * @param subscriptionId - Subscription ID
 */
export const getSubscriptionById = async (
  subscriptionId: number,
): Promise<Subscription> => {
  try {
    const url = `${API_BASE_URL}/subscriptions/${subscriptionId}/`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch subscription: ${response.statusText}`);
    }

    const data: Subscription = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching subscription by ID:", error);
    throw error;
  }
};

/**
 * Create a new subscription
 * @param subscriptionData - Subscription data to create
 */
export const createSubscription = async (subscriptionData: {
  tenant: number;
  subscription_plan: number;
  subscription_date: string;
  finish_date: string;
}): Promise<Subscription> => {
  try {
    const url = `${API_BASE_URL}/subscriptions/`;
    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to create subscription: ${
          response.statusText
        }. ${JSON.stringify(errorData)}`,
      );
    }

    const data: Subscription = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
};

/**
 * Update an existing subscription
 * @param subscriptionId - Subscription ID to update
 * @param updates - Partial subscription data to update
 */
export const updateSubscription = async (
  subscriptionId: number,
  updates: Partial<{
    subscription_plan: number;
    finish_date: string;
    is_active: boolean;
  }>,
): Promise<Subscription> => {
  try {
    const url = `${API_BASE_URL}/subscriptions/${subscriptionId}/`;
    const response = await fetch(url, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to update subscription: ${
          response.statusText
        }. ${JSON.stringify(errorData)}`,
      );
    }

    const data: Subscription = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw error;
  }
};

/**
 * Delete a subscription
 * @param
 */
export const deleteSubscription = async (
  subscriptionId: number,
): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/subscriptions/${subscriptionId}/`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete subscription: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting subscription:", error);
    throw error;
  }
};

/**
 * Get all subscription plans
 */
export const getSubscriptionPlans = async (): Promise<
  SubscriptionPlanDetail[]
> => {
  try {
    const url = `${
      import.meta.env.VITE_API_BASE_URL
    }/subscription/subscription-plans/`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch subscription plans: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    throw error;
  }
};

/**
 * Renew subscription (extend finish date)
 * @param subscriptionId - Subscription ID
 * @param months - Number of months to extend
 */
export const renewSubscription = async (
  subscriptionId: number,
  months: number,
): Promise<Subscription> => {
  try {
    // Get current subscription
    const currentSub = await getSubscriptionById(subscriptionId);

    // Calculate new finish date
    const currentFinish = new Date(currentSub.finish_date);
    const newFinish = new Date(currentFinish);
    newFinish.setMonth(newFinish.getMonth() + months);

    // Update subscription
    return await updateSubscription(subscriptionId, {
      finish_date: newFinish.toISOString().split("T")[0],
      is_active: true,
    });
  } catch (error) {
    console.error("Error renewing subscription:", error);
    throw error;
  }
};

/**
 * Upgrade/Downgrade subscription plan
 * @param subscriptionId - Subscription ID
 * @param newPlanId - New plan ID
 */
export const changeSubscriptionPlan = async (
  subscriptionId: number,
  newPlanId: number,
): Promise<Subscription> => {
  try {
    return await updateSubscription(subscriptionId, {
      subscription_plan: newPlanId,
    });
  } catch (error) {
    console.error("Error changing subscription plan:", error);
    throw error;
  }
};

/**
 * Get user's current subscription (with multiple fallback strategies)
 * @param workspaceId - User's workspace/tenant ID
 * @param email - User's email (fallback)
 */
export const getCurrentUserSubscription = async (
  workspaceId?: string | number,
  email?: string,
): Promise<Subscription | null> => {
  try {
    const data = await getSubscriptions(1, 1000);
    const activeSubs = data.results.filter((s) => s.is_active === true);

    if (!activeSubs.length) {
      return null;
    }

    // Strategy 1: Match by tenant ID
    if (workspaceId != null) {
      const wsNum = parseInt(String(workspaceId), 10);
      if (!isNaN(wsNum)) {
        const match = activeSubs.find((s) => s.tenant === wsNum);
        if (match) return match;
      }
      // Try string match
      const matchStr = activeSubs.find(
        (s) => String(s.tenant) === String(workspaceId),
      );
      if (matchStr) return matchStr;
    }

    // Strategy 2: Match by email
    if (email) {
      const matchEmail = activeSubs.find(
        (s) => s.tenant_detail?.email?.toLowerCase() === email.toLowerCase(),
      );
      if (matchEmail) return matchEmail;
    }

    // Strategy 3: Return latest active subscription
    const sorted = [...activeSubs].sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
    );
    return sorted[0];
  } catch (error) {
    console.error("Error fetching current user subscription:", error);
    throw error;
  }
};

/**
 * Create a new tenant/admin account
 * @param tenantData - Tenant data to create
 */
export interface CreateTenantPayload {
  business_name: string;
  email: string;
  phone: string;
  package: number;
  status?: "pending" | "active" | "inactive";
  is_active?: boolean;
}

export interface TenantResponse {
  id: number;
  business_name: string;
  email: string;
  phone: string;
  package: number;
  package_detail: SubscriptionPlanDetail;
  status: string;
  is_active: boolean;
  user_count: number | string;
  created: string;
  modified: string;
  admin_name?: string;
}

export interface TenantsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TenantResponse[];
}

/**
 * Get all tenants/admin accounts with pagination
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 20)
 */
export const getTenants = async (
  page: number = 1,
  pageSize: number = 20,
): Promise<TenantsResponse> => {
  try {
    const url = `${
      import.meta.env.VITE_API_BASE_URL
    }/tenant/?page=${page}&page_size=${pageSize}`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tenants: ${response.statusText}`);
    }

    const data: TenantsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tenants:", error);
    throw error;
  }
};

/**
 * Get all active tenants
 */
export const getActiveTenants = async (): Promise<TenantResponse[]> => {
  try {
    const data = await getTenants(1, 1000);
    return data.results.filter((tenant) => tenant.is_active === true);
  } catch (error) {
    console.error("Error fetching active tenants:", error);
    throw error;
  }
};

/**
 * Get tenant by ID
 * @param tenantId - Tenant ID
 */
export const getTenantById = async (
  tenantId: string | number,
): Promise<TenantResponse> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/tenant/${tenantId}/`;
    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant: ${response.statusText}`);
    }

    const data: TenantResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tenant by ID:", error);
    throw error;
  }
};

export const createTenant = async (
  tenantData: CreateTenantPayload,
): Promise<TenantResponse> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/tenant/`;
    const payload = {
      business_name: tenantData.business_name,
      email: tenantData.email,
      phone: tenantData.phone,
      package: tenantData.package,
      status: tenantData.status || "pending",
      is_active:
        tenantData.is_active !== undefined ? tenantData.is_active : true,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to create tenant: ${response.statusText}. ${JSON.stringify(
          errorData,
        )}`,
      );
    }

    const data: TenantResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating tenant:", error);
    throw error;
  }
};

/**
 * Delete a tenant/admin account user
 * @param adminId - Admin/User ID to delete
 */
export const deleteTenant = async (adminId: string | number): Promise<void> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/users/${adminId}/`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to delete tenant: ${response.statusText}. ${JSON.stringify(
          errorData,
        )}`,
      );
    }
  } catch (error) {
    console.error("Error deleting tenant:", error);
    throw error;
  }
};

export default {
  getSubscriptions,
  getActiveSubscriptions,
  getSubscriptionByTenant,
  getSubscriptionByEmail,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscriptionPlans,
  renewSubscription,
  changeSubscriptionPlan,
  getCurrentUserSubscription,
  getTenants,
  getActiveTenants,
  getTenantById,
  createTenant,
  deleteTenant,
};
