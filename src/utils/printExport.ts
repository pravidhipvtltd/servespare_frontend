// Print & Export Utility Functions
import { Bill, InventoryItem, Party, User } from "../types";

// Print Bill/Invoice
export const printBill = (bill: Bill, companyInfo?: any) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("⚠️ Please allow popups to print");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${bill.id}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            max-width: 800px; 
            margin: 0 auto; 
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .company-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #1f2937; 
            margin-bottom: 5px; 
          }
          .invoice-title { 
            font-size: 20px; 
            color: #3b82f6; 
            margin-top: 10px; 
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 30px; 
          }
          .info-box { 
            border: 1px solid #e5e7eb; 
            padding: 15px; 
            border-radius: 8px; 
          }
          .info-label { 
            font-weight: bold; 
            color: #6b7280; 
            font-size: 12px; 
            margin-bottom: 5px; 
          }
          .info-value { 
            color: #1f2937; 
            font-size: 14px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
          }
          th { 
            background-color: #f3f4f6; 
            padding: 12px; 
            text-align: left; 
            font-weight: bold; 
            border: 1px solid #d1d5db; 
          }
          td { 
            padding: 10px; 
            border: 1px solid #d1d5db; 
          }
          .text-right { text-align: right; }
          .total-row { 
            background-color: #dbeafe; 
            font-weight: bold; 
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #6b7280; 
            font-size: 12px; 
            border-top: 2px solid #e5e7eb; 
            padding-top: 20px; 
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${
            companyInfo?.companyName || "Serve Spares"
          }</div>
          <div>${companyInfo?.companyAddress || "Pokhara, Nepal"}</div>
          <div>${companyInfo?.companyPhone || "+977-9800000000"} | ${
    companyInfo?.companyEmail || "info@servespares.com"
  }</div>
          <div class="invoice-title">INVOICE</div>
        </div>

        <div class="info-grid">
          <div class="info-box">
            <div class="info-label">INVOICE NUMBER</div>
            <div class="info-value">#${bill.id}</div>
          </div>
          <div class="info-box">
            <div class="info-label">DATE</div>
            <div class="info-value">${new Date(bill.date).toLocaleDateString(
              "en-NP"
            )}</div>
          </div>
          <div class="info-box">
            <div class="info-label">CUSTOMER</div>
            <div class="info-value">${
              bill.customerName || "Walk-in Customer"
            }</div>
          </div>
          <div class="info-box">
            <div class="info-label">PAYMENT METHOD</div>
            <div class="info-value">${bill.paymentMethod.toUpperCase()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items
              .map(
                (item) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td class="text-right">NPR ${item.price.toLocaleString()}</td>
                <td class="text-right">NPR ${(
                  item.quantity * item.price
                ).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
              <td class="text-right">NPR ${bill.subtotal.toLocaleString()}</td>
            </tr>
            ${
              bill.discount
                ? `
              <tr>
                <td colspan="3" class="text-right"><strong>Discount:</strong></td>
                <td class="text-right">- NPR ${bill.discount.toLocaleString()}</td>
              </tr>
            `
                : ""
            }
            ${
              bill.tax
                ? `
              <tr>
                <td colspan="3" class="text-right"><strong>Tax:</strong></td>
                <td class="text-right">NPR ${bill.tax.toLocaleString()}</td>
              </tr>
            `
                : ""
            }
            <tr class="total-row">
              <td colspan="3" class="text-right"><strong>TOTAL:</strong></td>
              <td class="text-right"><strong>NPR ${bill.total.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          <p><strong>Thank you for your business!</strong></p>
          <p>This is a computer-generated invoice. No signature required.</p>
          ${
            companyInfo?.taxNumber
              ? `<p>Tax ID: ${companyInfo.taxNumber}</p>`
              : ""
          }
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Export data to CSV
export const exportToCSV = (
  data: any[],
  filename: string,
  headers: string[]
) => {
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        return `"${value || ""}"`;
      })
      .join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// Print Inventory Report
export const printInventoryReport = (inventory: InventoryItem[]) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("⚠️ Please allow popups to print");
    return;
  }

  const totalValue = inventory.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const lowStock = inventory.filter(
    (item) => item.quantity <= item.minStockLevel
  );
  const outOfStock = inventory.filter((item) => item.quantity === 0);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Inventory Report - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
          .summary-card { border: 2px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: bold; border: 1px solid #d1d5db; }
          td { padding: 10px; border: 1px solid #d1d5db; }
          .low-stock { background-color: #fef3c7; }
          .out-of-stock { background-color: #fee2e2; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>📦 Inventory Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString("en-NP")}</p>
        
        <div class="summary">
          <div class="summary-card">
            <div>Total Items</div>
            <div class="summary-value" style="color: #3b82f6;">${
              inventory.length
            }</div>
          </div>
          <div class="summary-card">
            <div>Total Value</div>
            <div class="summary-value" style="color: #059669;">NPR ${totalValue.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div>Low Stock</div>
            <div class="summary-value" style="color: #d97706;">${
              lowStock.length
            }</div>
          </div>
          <div class="summary-card">
            <div>Out of Stock</div>
            <div class="summary-value" style="color: #dc2626;">${
              outOfStock.length
            }</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Part Number</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Min Stock</th>
              <th>Price</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            ${inventory
              .map(
                (item) => `
              <tr class="${
                item.quantity === 0
                  ? "out-of-stock"
                  : item.quantity <= item.minStockLevel
                  ? "low-stock"
                  : ""
              }">
                <td>${item.partNumber}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>${item.minStockLevel}</td>
                <td>NPR ${item.price.toLocaleString()}</td>
                <td>NPR ${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Print Parties Report
export const printPartiesReport = (
  parties: Party[],
  type?: "customer" | "supplier"
) => {
  const filteredParties = type
    ? parties.filter((p) => p.type === type)
    : parties;
  const totalBalance = filteredParties.reduce(
    (sum, p) => sum + (p.balance || 0),
    0
  );

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("⚠️ Please allow popups to print");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${
          type ? type.charAt(0).toUpperCase() + type.slice(1) + "s" : "Parties"
        } Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1f2937; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
          .summary { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: bold; border: 1px solid #d1d5db; }
          td { padding: 10px; border: 1px solid #d1d5db; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>👥 ${
          type ? type.charAt(0).toUpperCase() + type.slice(1) + "s" : "Parties"
        } Report</h1>
        <p><strong>Generated:</strong> ${new Date().toLocaleString("en-NP")}</p>
        
        <div class="summary">
          <strong>Total ${
            type
              ? type.charAt(0).toUpperCase() + type.slice(1) + "s"
              : "Parties"
          }:</strong> ${filteredParties.length}<br>
          <strong>Total Balance Due:</strong> NPR ${totalBalance.toLocaleString()}
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Balance Due</th>
            </tr>
          </thead>
          <tbody>
            ${filteredParties
              .map(
                (party) => `
              <tr>
                <td>${party.name}</td>
                <td>${party.type.toUpperCase()}</td>
                <td>${party.email || "N/A"}</td>
                <td>${party.phone || "N/A"}</td>
                <td>NPR ${(party.balance || 0).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

// Copy to clipboard with success message
export const copyToClipboard = async (
  text: string,
  successMessage: string = "✅ Copied to clipboard!"
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

  // Method 3: Final fallback - show custom modal for manual copy
  if (!copySuccess) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const container = document.createElement("div");
    container.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      max-width: 90%;
      width: 500px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `;

    const title = document.createElement("div");
    title.textContent = "Copy to Clipboard";
    title.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 12px;
      color: #1f2937;
    `;

    const instruction = document.createElement("div");
    instruction.textContent =
      "Select the text below and press Ctrl+C (or Cmd+C on Mac) to copy:";
    instruction.style.cssText = `
      font-size: 14px;
      margin-bottom: 12px;
      color: #6b7280;
    `;

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.readOnly = true;
    textArea.style.cssText = `
      width: 100%;
      padding: 12px;
      font-size: 14px;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      margin-bottom: 12px;
      font-family: monospace;
      resize: vertical;
      min-height: 100px;
    `;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.cssText = `
      width: 100%;
      padding: 10px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    `;

    closeBtn.onmouseover = () => {
      closeBtn.style.background = "#2563eb";
    };
    closeBtn.onmouseout = () => {
      closeBtn.style.background = "#3b82f6";
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
    textArea.setSelectionRange(0, 99999);

    // Try one more time with execCommand in this context
    try {
      document.execCommand("copy");
      copySuccess = true;
    } catch (e) {
      // User will manually copy
    }

    return; // Don't show success toast for manual copy
  }

  // Show success toast only if copy was automatic
  if (copySuccess) {
    const toast = document.createElement("div");
    toast.textContent = successMessage;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #059669;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2000);
  }
};
