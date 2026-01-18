const BASE_URL = `${
  import.meta.env.VITE_API_BASE_URL
}/cash-and-bank/account-ledger`;

export interface LedgerEntry {
  id: number;
  tenant: number;
  branch: number;
  branch_name: string;
  shift: number | null;
  shift_number: string;
  ledger_type: "general" | "sales" | "purchase";
  transaction_type: string;
  debit: string; // API returns as string for precision
  credit: string;
  balance: string;
  description: string;
  reference: string;
  reference_type: string;
  reference_id: string;
  transaction_date: string;
  transaction_date_display: string;
  transaction_time_display: string;
  performed_by: number;
  performed_by_username: string;
  performed_by_full_name: string;
  is_manual_entry: boolean;
  notes: string;
  created: string;
  modified: string;
}

export interface LedgerFilters {
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  shift?: string | number;
  branch?: string | number;
  search?: string;
}

/**
 * Fetches ledger data based on type (general, sales, or purchase)
 */
export const fetchLedger = async (
  type: "general" | "sales" | "purchase",
  filters: LedgerFilters = {}
): Promise<LedgerEntry[]> => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("auth_token");

  // Construct URL with query parameters
  const url = new URL(`${BASE_URL}/${type}/`);

  // Append filters to query string
  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      url.searchParams.append(key, value.toString());
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch ${type} ledger`);
    }

    const data = await response.json();

    // Handle both cases: if API returns an array directly or a paginated object { results: [] }
    const results = Array.isArray(data) ? data : data.results || [];

    return results;
  } catch (error) {
    console.error(`Error in fetchLedger(${type}):`, error);
    throw error;
  }
};
