import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Package, ShoppingCart, Plus, Minus, Trash2, Check,
  Zap, Sparkles, Tag, Calculator, User, Users, Banknote,
  CreditCard, Smartphone, Building2, X, Clock, Gift
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../../utils/mockData';
import { useAuth } from '../../../contexts/AuthContext';
import { SmartBillingSystem } from '../../SmartBillingSystem';

interface POSSystemProps {
  shift: any;
  onSaleComplete: () => void;
}

export const POSSystem: React.FC<POSSystemProps> = ({ shift, onSaleComplete }) => {
  const { currentUser } = useAuth();
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    const allInventory = getFromStorage('inventory', []);
    setInventory(allInventory.filter((i: any) => i.workspaceId === currentUser?.workspaceId));
  };

  const handleBillComplete = (bill: any) => {
    // Update inventory
    const updatedInventory = inventory.map(item => {
      const billItem = bill.items.find((bi: any) => bi.itemId === item.id);
      if (billItem) {
        return { ...item, quantity: item.quantity - billItem.quantity };
      }
      return item;
    });

    // Update shift stats
    if (shift) {
      const shifts = getFromStorage('cashier_shifts', []);
      const updatedShifts = shifts.map((s: any) => {
        if (s.id === shift.id) {
          return {
            ...s,
            totalSales: s.totalSales + bill.total,
            totalTransactions: s.totalTransactions + 1,
          };
        }
        return s;
      });
      saveToStorage('cashier_shifts', updatedShifts);
    }

    // Save bill
    const allBills = getFromStorage('bills', []);
    allBills.push(bill);
    saveToStorage('bills', allBills);

    // Update inventory
    const allInventory = getFromStorage('inventory', []);
    const finalInventory = allInventory.map((item: any) => {
      const updated = updatedInventory.find(u => u.id === item.id);
      return updated || item;
    });
    saveToStorage('inventory', finalInventory);

    setInventory(updatedInventory);
    onSaleComplete();
    
    // Print receipt
    printReceipt(bill);
  };

  const printReceipt = (bill: any) => {
    const printWindow = window.open('', '', 'height=600,width=400');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${bill.billNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; background: #000; color: #0f0; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #0f0; padding-bottom: 10px; }
            .glow { text-shadow: 0 0 10px #0f0, 0 0 20px #0f0; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 2px solid #0f0; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 1.2em; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 class="glow">⚡ SERVE SPARES ⚡</h2>
            <p>Bill: ${bill.billNumber}</p>
            <p>${new Date(bill.date).toLocaleString()}</p>
          </div>
          <p>Customer: ${bill.customerName}</p>
          <p>Payment: ${bill.paymentMethod.toUpperCase()}</p>
          <hr style="border-color: #0f0;">
          ${bill.items.map((item: any) => `
            <div class="item">
              <span>${item.itemName} x${item.quantity}</span>
              <span>NPR ${item.total.toLocaleString()}</span>
            </div>
          `).join('')}
          <div class="total">
            <div class="item"><span>Subtotal:</span><span>NPR ${bill.subtotal.toLocaleString()}</span></div>
            ${bill.discount > 0 ? `<div class="item"><span>Discount:</span><span>-NPR ${bill.discount.toLocaleString()}</span></div>` : ''}
            <div class="item"><span>Tax:</span><span>NPR ${bill.tax.toLocaleString()}</span></div>
            <div class="item glow" style="font-size: 1.5em;"><span>TOTAL:</span><span>NPR ${bill.total.toLocaleString()}</span></div>
          </div>
          <div class="footer">
            <p class="glow">★ Thank you for your business! ★</p>
            <p>Powered by Serve Spares</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="h-full">
      <SmartBillingSystem
        inventory={inventory}
        onBillComplete={handleBillComplete}
        currentShift={shift}
      />
    </div>
  );
};
