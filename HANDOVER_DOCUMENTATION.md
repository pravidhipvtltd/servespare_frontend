# Handover Documentation

## Project Overview

This project is an **Inventory Management Software** built with React, TypeScript, and Vite. It features a comprehensive dashboard for Admins, Inventory Managers, and Cashiers, with real-time analytics, branch management, and billing systems.

## Key Components

- **AdminDashboardWorldClass**: The main entry point for administrators, providing access to all modules.
- **InventoryManagerDashboardNew**: A specialized dashboard for inventory managers to track stock levels, upcoming deliveries, and low-stock alerts.
- **CashierDashboardNew**: A streamlined interface for processing sales and managing cash registers.
- **BillCreationPanel**: The primary interface for creating invoices and managing transactions.

## Recent Changes & Fixes

- **Logout Persistence**: Improved logout logic in `AuthContext` to ensure all session data is cleared and the user is correctly redirected.
- **Decimal Rounding**: Corrected total stock value display in the Inventory Manager dashboard to show one decimal place (e.g., 30.5K) for better precision.
- **Permission Flickering**: Optimized `PermissionContext` to prevent unnecessary re-renders and UI flickering when checking user roles.
- **Form Auto-Scroll**: Implemented `scrollIntoView` functionality in Brands and Categories panels to automatically focus on forms when adding or editing items.
- **Branch Filtering (In Progress)**: Currently implementing branch-specific data filtering across all administrative panels to enable multi-branch management.

## Technical Stack

- **Frontend**: React 18+, TypeScript, Tailwind CSS, Lucide Icons.
- **State Management**: React Context API (Auth, Permission, Sync, Language, Branch).
- **Storage**: Global state synchronized with `localStorage` and balanced with a REST API backend.
- **Deployment**: Configured for Vercel.

## Next Steps

- Complete the integration of `selectedBranchId` across all remaining administrative panels.
- Enhance the API error handling for real-time synchronization.
- Implement more robust backup/restore functionality for local data.
