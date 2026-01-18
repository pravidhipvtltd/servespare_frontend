import React, { useState, useEffect } from "react";
import { getFromStorage } from "../../utils/mockData";
import { useAuth } from "../../contexts/AuthContext";

export const SalesLedgerPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    const bills = getFromStorage("bills", []).filter(
      (b: any) => b.workspaceId === currentUser?.workspaceId
    );
    setLedger(bills);
  }, []);

  const totalSales = ledger.reduce((sum, l) => sum + l.total, 0);
  const totalPaid = ledger
    .filter((l) => l.paymentStatus === "paid")
    .reduce((sum, l) => sum + l.total, 0);
  const totalPending = ledger
    .filter((l) => l.paymentStatus === "pending")
    .reduce((sum, l) => sum + l.total, 0);

  return (
    <div className="space-y-6">
      <h3 className="text-gray-900 text-lg">Sales Ledger</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-gray-500 text-sm mb-1">Total Sales</div>
          <div className="text-gray-900 text-2xl">
            Rs{totalSales.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-gray-500 text-sm mb-1">Paid</div>
          <div className="text-green-600 text-2xl">
            Rs{totalPaid.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-gray-500 text-sm mb-1">Pending</div>
          <div className="text-red-600 text-2xl">
            Rs{totalPending.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Date
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Bill Number
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Customer
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Amount
                </th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4 text-gray-900">
                    {entry.billNumber}
                  </td>
                  <td className="py-4 px-4 text-gray-900">
                    {entry.customerName}
                  </td>
                  <td className="py-4 px-4 text-gray-900">
                    Rs{entry.total.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        entry.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {entry.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
