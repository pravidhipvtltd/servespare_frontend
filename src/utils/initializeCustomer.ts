// Initialize demo customer for testing

export const initializeDemoCustomer = () => {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");

  // Check if demo customer already exists
  const existingDemoIndex = customers.findIndex(
    (c: any) => c.email === "customer@demo.com"
  );

  const demoCustomer = {
    id: "customer_demo_001",
    name: "Demo Customer",
    email: "customer@demo.com",
    phone: "+9779800000000",
    address: "Pokhara, Nepal",
    password: "demo123",
    createdAt: new Date().toISOString(),
  };

  if (existingDemoIndex !== -1) {
    // Update existing demo customer to ensure password is correct
    customers[existingDemoIndex] = demoCustomer;
    localStorage.setItem("customers", JSON.stringify(customers));
    console.log("✅ [Customer Init] Demo customer updated");
  } else {
    // Create new demo customer
    customers.push(demoCustomer);
    localStorage.setItem("customers", JSON.stringify(customers));
    console.log("✅ [Customer Init] Demo customer created");
  }

  // Verify the customer was saved correctly
  const savedCustomers = JSON.parse(localStorage.getItem("customers") || "[]");
  const verifyDemo = savedCustomers.find(
    (c: any) => c.email === "customer@demo.com"
  );

  if (verifyDemo && verifyDemo.password === "demo123") {
    console.log("✅ [Customer Init] Demo customer verified in storage");
    console.log("📧 Demo Customer Login:");
    console.log("   Email: customer@demo.com");
    console.log("   Password: demo123");
  } else {
    console.error("❌ [Customer Init] Demo customer verification failed!");
    console.log("   Stored data:", verifyDemo);
  }
};

// Debug helper functions
if (typeof window !== "undefined") {
  (window as any).viewAllCustomers = () => {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    console.log("👥 All Customers:", customers);
    console.table(
      customers.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        password: c.password,
        phone: c.phone,
      }))
    );
    return customers;
  };

  (window as any).resetDemoCustomer = () => {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const filtered = customers.filter(
      (c: any) => c.email !== "customer@demo.com"
    );
    localStorage.setItem("customers", JSON.stringify(filtered));
    console.log("🗑️ Demo customer removed. Reinitializing...");
    initializeDemoCustomer();
    console.log("✅ Demo customer reset complete!");
  };

  (window as any).clearAllCustomers = () => {
    localStorage.removeItem("customers");
    localStorage.removeItem("customer_user");
    localStorage.removeItem("customer_cart");
    localStorage.removeItem("customer_orders");
    console.log("🗑️ All customer data cleared!");
    initializeDemoCustomer();
  };

  (window as any).testCustomerLogin = (
    email = "customer@demo.com",
    password = "demo123"
  ) => {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const customer = customers.find(
      (c: any) => c.email === email && c.password === password
    );

    if (customer) {
      console.log("✅ Login test PASSED:", customer);
      return true;
    } else {
      console.error("❌ Login test FAILED");
      console.log("   Tried:", { email, password });
      console.log("   Available customers:", customers);
      return false;
    }
  };
}

// Auto-initialize on load
if (typeof window !== "undefined") {
  // Run initialization with a small delay to ensure localStorage is ready
  setTimeout(() => {
    initializeDemoCustomer();

    console.log("💡 Customer Debug Commands:");
    console.log("   window.viewAllCustomers() - View all registered customers");
    console.log("   window.resetDemoCustomer() - Reset demo customer");
    console.log("   window.clearAllCustomers() - Clear all customer data");
    console.log("   window.testCustomerLogin() - Test demo customer login");
  }, 100);
}
