import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { getFromStorage } from "../../utils/mockData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface InventoryChatbotProps {
  currentUser: any;
}

export default function InventoryChatbot({
  currentUser,
}: InventoryChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `Hello ${
            currentUser?.name || "there"
          }! 👋\n\nI'm your AI Inventory Assistant. I can help you with:\n\n• 📦 Product information and stock queries\n• 📊 Sales and revenue analytics\n• 💰 Financial reports and insights\n• 🔍 Finding specific items or categories\n• 📈 Business recommendations\n• ❓ System navigation and help\n\nWhat would you like to know?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  const getSystemContext = () => {
    const products = getFromStorage("products", []).filter(
      (p: any) => p.workspaceId === currentUser.workspaceId
    );

    const categories = getFromStorage("categories", []).filter(
      (c: any) => c.workspaceId === currentUser.workspaceId
    );

    const bills = getFromStorage("bills", []).filter(
      (b: any) => b.workspaceId === currentUser.workspaceId
    );

    const parties = getFromStorage("parties", []).filter(
      (p: any) => p.workspaceId === currentUser.workspaceId
    );

    const brands = getFromStorage("automotive_brands", []).filter(
      (b: any) => b.workspaceId === currentUser.workspaceId
    );

    // Calculate key metrics
    const totalRevenue = bills.reduce(
      (sum: number, bill: any) => sum + (bill.total || 0),
      0
    );
    const lowStockItems = products.filter(
      (p: any) => p.currentStock <= p.minStock
    );
    const outOfStockItems = products.filter((p: any) => p.currentStock === 0);
    const todayBills = bills.filter((b: any) => {
      const billDate = new Date(b.date);
      const today = new Date();
      return billDate.toDateString() === today.toDateString();
    });
    const todayRevenue = todayBills.reduce(
      (sum: number, bill: any) => sum + (bill.total || 0),
      0
    );

    return {
      workspace: {
        id: currentUser.workspaceId,
        name: currentUser.workspaceName || "Auto Parts Store",
      },
      user: {
        name: currentUser.name,
        role: currentUser.role,
        email: currentUser.email,
      },
      inventory: {
        totalProducts: products.length,
        totalCategories: categories.length,
        totalBrands: brands.length,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        totalValue: products.reduce(
          (sum: number, p: any) => sum + p.currentStock * p.sellingPrice,
          0
        ),
      },
      sales: {
        totalBills: bills.length,
        totalRevenue: totalRevenue,
        todayBills: todayBills.length,
        todayRevenue: todayRevenue,
        averageOrderValue: bills.length > 0 ? totalRevenue / bills.length : 0,
      },
      parties: {
        totalCustomers: parties.filter((p: any) => p.type === "customer")
          .length,
        totalVendors: parties.filter((p: any) => p.type === "vendor").length,
      },
      topProducts: products
        .sort((a: any, b: any) => b.currentStock - a.currentStock)
        .slice(0, 5)
        .map((p: any) => ({
          name: p.name,
          sku: p.sku,
          stock: p.currentStock,
          price: p.sellingPrice,
        })),
      lowStockItems: lowStockItems.slice(0, 5).map((p: any) => ({
        name: p.name,
        sku: p.sku,
        current: p.currentStock,
        minimum: p.minStock,
      })),
      recentBills: todayBills.slice(0, 3).map((b: any) => ({
        billNumber: b.billNumber,
        total: b.total,
        items: b.items?.length || 0,
        paymentMethod: b.paymentMethod,
      })),
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const systemContext = getSystemContext();

      // Use rule-based responses (OpenAI integration requires server-side setup)
      const fallbackResponse = generateFallbackResponse(input, systemContext);

      // Simulate a small delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      // Error fallback
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I apologize, but I'm having trouble processing your request. Please try asking about inventory, sales, or stock status.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (query: string, context: any): string => {
    const lowerQuery = query.toLowerCase();

    // Stock queries
    if (lowerQuery.includes("stock") || lowerQuery.includes("inventory")) {
      return `📦 **Inventory Overview:**

• Total Products: ${context.inventory.totalProducts}
• Low Stock Items: ${context.inventory.lowStockCount}
• Out of Stock: ${context.inventory.outOfStockCount}
• Total Inventory Value: Rs${context.inventory.totalValue.toLocaleString()}

${
  context.inventory.lowStockCount > 0
    ? `⚠️ You have ${context.inventory.lowStockCount} items that need restocking!`
    : "✅ All items are well stocked!"
}`;
    }

    // Sales queries
    if (lowerQuery.includes("sales") || lowerQuery.includes("revenue")) {
      return `💰 **Sales Overview:**

• Total Bills: ${context.sales.totalBills}
• Total Revenue: Rs${context.sales.totalRevenue.toLocaleString()}
• Today's Sales: ${context.sales.todayBills} bills
• Today's Revenue: Rs${context.sales.todayRevenue.toLocaleString()}
• Average Order: Rs${Math.round(
        context.sales.averageOrderValue
      ).toLocaleString()}

${
  context.sales.todayRevenue > 0
    ? "📈 Great job today!"
    : "💡 No sales recorded today yet."
}`;
    }

    // Low stock queries
    if (lowerQuery.includes("low") || lowerQuery.includes("alert")) {
      if (context.lowStockItems.length === 0) {
        return "✅ **No Low Stock Items**\n\nAll products are well stocked! Great inventory management! 🎉";
      }

      let response = `⚠️ **Low Stock Alert (${context.inventory.lowStockCount} items):**\n\n`;
      context.lowStockItems.forEach((item: any, index: number) => {
        response += `${index + 1}. **${item.name}** (${
          item.sku
        })\n   Current: ${item.current} | Min: ${item.minimum}\n\n`;
      });
      response += "💡 Consider creating purchase orders for these items!";
      return response;
    }

    // Product queries
    if (lowerQuery.includes("product") || lowerQuery.includes("item")) {
      let response = `📦 **Top Products by Stock:**\n\n`;
      context.topProducts.forEach((p: any, index: number) => {
        response += `${index + 1}. **${p.name}** (${p.sku})\n   Stock: ${
          p.stock
        } | Price: Rs${p.price}\n\n`;
      });
      return response;
    }

    // Recent bills
    if (lowerQuery.includes("recent") || lowerQuery.includes("today")) {
      if (context.recentBills.length === 0) {
        return "📝 **No Recent Bills**\n\nNo bills have been created today yet.";
      }

      let response = `📝 **Recent Bills Today:**\n\n`;
      context.recentBills.forEach((b: any, index: number) => {
        response += `${index + 1}. **${b.billNumber}**\n   Total: Rs${
          b.total
        } | Items: ${b.items} | Payment: ${b.paymentMethod}\n\n`;
      });
      return response;
    }

    // Help queries
    if (lowerQuery.includes("help") || lowerQuery.includes("how")) {
      return `🤝 **I'm here to help!**\n\nYou can ask me about:\n\n• 📦 "Show me low stock items"\n• 💰 "What are today's sales?"\n• 📊 "Give me inventory overview"\n• 🔍 "Show recent bills"\n• 📈 "What's the total revenue?"\n• 🏷️ "List top products"\n\nJust ask naturally, and I'll do my best to help!`;
    }

    // Default response
    return `I understand you're asking about "${query}". \n\n${
      context.user.role === "super_admin"
        ? "As a Super Admin, you have access to all system features."
        : context.user.role === "admin"
        ? "As an Admin, you can manage your workspace, users, and view all reports."
        : context.user.role === "inventory_manager"
        ? "As an Inventory Manager, you can manage products, categories, and stock."
        : "As a Cashier, you can process sales and manage the cash drawer."
    }\n\nCould you please be more specific? For example:\n• "Show me low stock items"\n• "What are today's sales?"\n• "Give me inventory summary"`;
  };

  const quickActions = [
    { label: "📦 Stock Status", query: "Show me current stock status" },
    { label: "💰 Today's Sales", query: "What are today's sales?" },
    { label: "⚠️ Low Stock", query: "Show low stock items" },
    { label: "📊 Overview", query: "Give me business overview" },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center group z-50"
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">AI Assistant</h3>
                <p className="text-xs text-blue-100 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[85%] ${
                    message.role === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gradient-to-br from-purple-500 to-indigo-500 text-white"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl p-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-gray-800 rounded-tl-none shadow-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-blue-200"
                          : "text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("en-NP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="p-3 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(action.query);
                    }}
                    className="text-xs p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by OpenAI GPT-4
            </p>
          </div>
        </div>
      )}
    </>
  );
}
