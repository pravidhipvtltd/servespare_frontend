import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minimize2, Maximize2, Send, Bot, User, Headphones, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot' | 'agent';
  message: string;
  timestamp: string;
}

interface RegistrationData {
  name?: string;
  email?: string;
  phone?: string;
  shopName?: string;
  password?: string;
  role?: string;
}

type RegistrationStep = 'none' | 'name' | 'email' | 'phone' | 'shopName' | 'password' | 'role' | 'complete';

interface ConversationLog {
  id: string;
  timestamp: string;
  userMessage: string;
  botResponse: string;
  context: string;
  learned: boolean;
}

// System knowledge base with core information about Serve Spares
const systemKnowledge = `
You are an AI assistant for Serve Spares - an advanced auto parts inventory management system for two-wheelers and four-wheelers.

SYSTEM FEATURES:
- Inventory Management: Real-time stock tracking, low stock alerts, barcode scanning
- Billing & Invoicing: POS system with eSewa/FonePay integration for Nepal
- Multi-User System: 5 role types (Super Admin, Admin, Inventory Manager, Cashier, Finance)
- Reports: Sales, inventory, financial reports with Excel/PDF export
- Multi-Branch Support: Manage multiple store locations
- 8 Language Support: English, Nepali, Hindi, Spanish, French, German, Chinese, Japanese
- Parties System: Combined customer and vendor management
- Payment Methods: Cash, eSewa, FonePay, Bank Transfer
- Currency: NPR (Nepali Rupees)

PRICING PLANS:
- Basic: NPR 2,500/month (3 users, 1,000 products)
- Professional: NPR 5,000/month (10 users, 10,000 products, 5 branches)
- Enterprise: NPR 10,000/month (Unlimited users, products, branches)
- All plans: 14-day FREE trial, no credit card required

USER ROLES (from highest to lowest access):
1. Super Admin - Full system control, can manage everything
2. Admin - Manage inventory, users, reports (cannot modify Super Admin)
3. Inventory Manager - Stock management, suppliers
4. Cashier/Reception - Sales, billing, customer service
5. Finance - Financial reports, payments, accounting

ACCOUNT CREATION RESTRICTIONS:
- AI can ONLY create accounts with maximum role of "Admin"
- AI CANNOT create Super Admin accounts
- AI CANNOT modify Super Admin credentials or settings
- All AI-created accounts require Super Admin approval before login
- Accounts are created in "pending verification" status

IMPORTANT GUIDELINES:
- Be helpful, friendly, and professional
- Answer questions about features, pricing, and setup
- Guide users through registration when requested
- Always mention 14-day free trial
- Provide accurate information about the Nepal market (NPR, +977, eSewa/FonePay)
- If unsure, offer to transfer to human agent
- Learn from conversations to improve responses

When helping users register:
1. Collect: Name, Email, Phone, Shop Name, Password
2. Ask what role they need (Admin, Manager, Cashier, or Finance)
3. Explain that Super Admin will verify their account
4. Create account in pending status
5. Provide next steps for approval
`;

export const AIChatBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      message: "Hello! 👋 I'm your Serve Spares AI assistant powered by ChatGPT. I can help you with:\n\n📦 Inventory Management\n💰 Pricing & Plans\n👥 User Roles & Login\n📊 Reports & Analytics\n✨ Create Account (Admin approval required)\n\nWhat would you like to know?",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [transferToAgent, setTransferToAgent] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>('none');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWidgetRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatWidgetRef.current && !chatWidgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Store conversation for learning
  const storeConversation = (userMsg: string, botMsg: string, context: string) => {
    const conversationLog: ConversationLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userMessage: userMsg,
      botResponse: botMsg,
      context: context,
      learned: true
    };

    const existingLogs = JSON.parse(localStorage.getItem('chatbot_learning_logs') || '[]');
    existingLogs.push(conversationLog);
    
    // Keep only last 500 conversations for learning
    if (existingLogs.length > 500) {
      existingLogs.shift();
    }
    
    localStorage.setItem('chatbot_learning_logs', JSON.stringify(existingLogs));
  };

  // Get learned context from previous conversations
  const getLearnedContext = (): string => {
    const logs = JSON.parse(localStorage.getItem('chatbot_learning_logs') || '[]');
    if (logs.length === 0) return '';

    // Get recent relevant conversations
    const recentLogs = logs.slice(-20);
    const contextSummary = recentLogs.map((log: ConversationLog) => 
      `User asked: "${log.userMessage}" - Responded: "${log.botResponse.substring(0, 100)}..."`
    ).join('\n');

    return `\n\nLEARNED FROM PREVIOUS CONVERSATIONS:\n${contextSummary}`;
  };

  // Call ChatGPT API
  const callChatGPT = async (userMessage: string, conversationHistory: ChatMessage[]): Promise<string> => {
    try {
      // Safe access to environment variables with fallback
      const OPENAI_API_KEY = typeof import.meta !== 'undefined' && import.meta.env 
        ? import.meta.env.VITE_OPENAI_API_KEY 
        : null;

      if (!OPENAI_API_KEY) {
        console.warn('OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.');
        return "I'm currently unable to connect to my AI brain. 🤖\n\n⚠️ **Setup Required**: The OpenAI API key hasn't been configured yet.\n\n📋 **Quick Setup**:\n1. Create a `.env` file in your project root\n2. Add: `VITE_OPENAI_API_KEY=sk-your-key-here`\n3. Get your key from: https://platform.openai.com/api-keys\n4. Restart your server\n\n💬 In the meantime, I can still help you with:\n• Basic questions about features\n• Account registration\n• Transfer to human agent\n\nWhat would you like to know?";
      }

      // Build conversation context
      const conversationContext = conversationHistory
        .slice(-6) // Last 6 messages for context
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message
        }));

      const learnedContext = getLearnedContext();

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemKnowledge + learnedContext
            },
            ...conversationContext,
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ChatGPT API Error:', errorData);
        
        if (response.status === 401) {
          return "⚠️ **API Authentication Failed**\n\nThe OpenAI API key appears to be invalid or expired.\n\n✅ **Fix**:\n1. Check your `.env` file\n2. Verify key starts with `sk-`\n3. Get a new key from: https://platform.openai.com/api-keys\n4. Restart your server\n\nClick 'Transfer to Human Agent' for immediate help!";
        }
        
        if (response.status === 429) {
          return "⚠️ **Rate Limit Reached**\n\nToo many requests to OpenAI API. Please wait a moment and try again.\n\nOr click 'Transfer to Human Agent' for immediate assistance!";
        }
        
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Store conversation for learning
      storeConversation(userMessage, aiResponse, 'chatgpt_conversation');

      return aiResponse;
    } catch (error) {
      console.error('ChatGPT API Error:', error);
      return "I'm having trouble processing that right now. 😔\n\n💡 **What you can do**:\n• Click 'Transfer to Human Agent' below\n• Check your internet connection\n• Try asking a simpler question\n• Check browser console (F12) for details\n\nI can still help with basic questions about Serve Spares features, pricing, and account registration!";
    }
  };

  // Detect if user wants to create account
  const detectRegistrationIntent = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return (
      lowerMessage.includes('register') || 
      lowerMessage.includes('sign up') || 
      lowerMessage.includes('signup') || 
      lowerMessage.includes('create account') ||
      lowerMessage.includes('new account') ||
      lowerMessage.includes('join') ||
      lowerMessage.includes('get started')
    );
  };

  const handleRegistrationFlow = async (userMessage: string): Promise<string> => {
    const trimmedMessage = userMessage.trim();

    switch (registrationStep) {
      case 'name':
        setRegistrationData({ ...registrationData, name: trimmedMessage });
        setRegistrationStep('email');
        return `Nice to meet you, ${trimmedMessage}! 😊\n\n📧 What's your email address?`;

      case 'email':
        // Basic email validation
        if (!trimmedMessage.includes('@') || !trimmedMessage.includes('.')) {
          return "Hmm, that doesn't look like a valid email address. 🤔\n\nPlease provide a valid email (e.g., yourname@example.com):";
        }
        
        // Check if email already exists
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const pendingUsers = JSON.parse(localStorage.getItem('pending_user_verifications') || '[]');
        
        if (existingUsers.some((u: any) => u.email === trimmedMessage) || 
            pendingUsers.some((u: any) => u.email === trimmedMessage)) {
          setRegistrationStep('none');
          setRegistrationData({});
          return `⚠️ This email is already registered or pending verification.\n\nPlease try logging in, or use a different email address. If you forgot your password, contact support.`;
        }
        
        setRegistrationData({ ...registrationData, email: trimmedMessage });
        setRegistrationStep('phone');
        return `Great! 📧 Email: ${trimmedMessage}\n\n📱 What's your phone number? (Include country code, e.g., +977 9812345678)`;

      case 'phone':
        setRegistrationData({ ...registrationData, phone: trimmedMessage });
        setRegistrationStep('shopName');
        return `Perfect! 📱 Phone: ${trimmedMessage}\n\n🏪 What's your shop/business name?`;

      case 'shopName':
        setRegistrationData({ ...registrationData, shopName: trimmedMessage });
        setRegistrationStep('password');
        return `Excellent! 🏪 Shop: ${trimmedMessage}\n\n🔐 Create a secure password (minimum 6 characters):`;

      case 'password':
        if (trimmedMessage.length < 6) {
          return "Password is too short! Please create a password with at least 6 characters for security. 🔒";
        }
        setRegistrationData({ ...registrationData, password: trimmedMessage });
        setRegistrationStep('role');
        return `🔐 Password set securely!\n\n👥 What role do you need?\n\n1️⃣ Admin - Manage inventory, users, reports\n2️⃣ Inventory Manager - Stock management\n3️⃣ Cashier - Sales and billing\n4️⃣ Finance - Financial reports\n\n⚠️ Note: Super Admin accounts can only be created by existing Super Admins.\n\nPlease type the role name you need:`;

      case 'role':
        const roleLower = trimmedMessage.toLowerCase();
        let selectedRole = 'Admin'; // Default to Admin
        
        // Map user input to valid roles (excluding Super Admin)
        if (roleLower.includes('admin') && !roleLower.includes('super')) {
          selectedRole = 'Admin';
        } else if (roleLower.includes('manager') || roleLower.includes('inventory')) {
          selectedRole = 'Inventory Manager';
        } else if (roleLower.includes('cashier') || roleLower.includes('reception')) {
          selectedRole = 'Cashier';
        } else if (roleLower.includes('finance') || roleLower.includes('accounting')) {
          selectedRole = 'Finance';
        } else if (roleLower.includes('super')) {
          return `⚠️ Sorry, I cannot create Super Admin accounts. This is a security restriction.\n\nSuper Admin accounts can only be created by existing Super Admins through the admin panel.\n\nPlease choose from:\n- Admin\n- Inventory Manager\n- Cashier\n- Finance`;
        }
        
        setRegistrationData({ ...registrationData, role: selectedRole });
        setRegistrationStep('complete');
        
        // Create pending verification request
        const newUserRequest = {
          id: Date.now().toString(),
          name: registrationData.name,
          email: registrationData.email,
          phone: registrationData.phone,
          shopName: registrationData.shopName,
          password: registrationData.password,
          role: selectedRole,
          status: 'pending_verification',
          requestedAt: new Date().toISOString(),
          createdBy: 'AI_ChatBot',
          verificationNote: `Account requested via AI ChatBot. User requested ${selectedRole} role.`
        };

        // Save to pending verifications
        const pendingVerifications = JSON.parse(localStorage.getItem('pending_user_verifications') || '[]');
        pendingVerifications.push(newUserRequest);
        localStorage.setItem('pending_user_verifications', JSON.stringify(pendingVerifications));

        // Store in learning logs
        storeConversation(
          'Account Registration Request',
          `Created pending verification for ${registrationData.email} with role ${selectedRole}`,
          'account_creation'
        );

        // Reset registration flow
        setTimeout(() => {
          setRegistrationStep('none');
          setRegistrationData({});
        }, 2000);

        return `✅ Registration Request Submitted!\n\n👤 Name: ${registrationData.name}\n📧 Email: ${registrationData.email}\n📱 Phone: ${registrationData.phone}\n🏪 Shop: ${registrationData.shopName}\n👔 Role: ${selectedRole}\n\n⏳ PENDING VERIFICATION\n\n🔒 Security Note: For your protection, all new accounts require Super Admin approval before you can log in.\n\n📋 Next Steps:\n1️⃣ Super Admin will review your request\n2️⃣ You'll receive confirmation via email\n3️⃣ Once approved, you can log in\n\n⏱️ Typical approval time: 1-24 hours\n\n✉️ Check your email (${registrationData.email}) for updates!\n\nThank you for choosing Serve Spares! 🎊`;

      default:
        return await callChatGPT(userMessage, messages);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newUserMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(async () => {
      let botResponseMessage: string;

      // Handle registration flow
      if (registrationStep !== 'none' && registrationStep !== 'complete') {
        botResponseMessage = await handleRegistrationFlow(currentInput);
      } 
      // Detect registration intent
      else if (registrationStep === 'none' && detectRegistrationIntent(currentInput)) {
        setRegistrationStep('name');
        botResponseMessage = "Great! I'll help you create a Serve Spares account. 🎉\n\n⚠️ Important: All new accounts require Super Admin verification before you can log in. This ensures security.\n\nLet's get started!\n\n👤 What's your full name?";
      }
      // Handle agent transfer
      else if (transferToAgent) {
        botResponseMessage = "Thanks for waiting! I've reviewed your conversation. How can I help you further?";
      }
      // Use ChatGPT for intelligent responses
      else {
        botResponseMessage = await callChatGPT(currentInput, messages);
      }

      const botResponse: ChatMessage = {
        id: messages.length + 2,
        sender: transferToAgent ? 'agent' : 'bot',
        message: botResponseMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleTransferToAgent = () => {
    setTransferToAgent(true);
    const agentMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'agent',
      message: "Hi! I'm Sarah from Serve Spares support team. 👋 I've taken over from the AI assistant. I'm here to help you with any questions or issues. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, agentMessage]);
  };

  return (
    <>
      {/* Fixed Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center cursor-pointer group hover:shadow-indigo-500/50 transition-all"
          >
            <MessageCircle className="text-white" size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            
            {/* Tooltip */}
            <div className="absolute right-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ChatGPT-Powered AI • Click to chat!
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWidgetRef}
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '60px' : '480px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-indigo-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-lg relative">
                  {transferToAgent ? (
                    <Headphones className="text-indigo-600" size={18} />
                  ) : (
                    <Bot className="text-indigo-600" size={18} />
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
                    GPT
                  </div>
                </div>
                <div className="text-white">
                  <h3 className="font-bold text-sm flex items-center gap-1">
                    {transferToAgent ? 'Support Agent' : 'AI Assistant'}
                    {!transferToAgent && (
                      <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">ChatGPT</span>
                    )}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-xs">Online • Learning AI</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-all"
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-all"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-[300px] overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-2`}
                    >
                      {msg.sender !== 'user' && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.sender === 'agent' ? 'bg-green-500' : 'bg-indigo-600'
                        }`}>
                          {msg.sender === 'agent' ? (
                            <Headphones className="text-white" size={12} />
                          ) : (
                            <Bot className="text-white" size={12} />
                          )}
                        </div>
                      )}
                      <div className={`max-w-[75%] ${msg.sender === 'user' ? 'order-first' : ''}`}>
                        <div className={`${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                            : msg.sender === 'agent'
                            ? 'bg-green-50 text-gray-800 border border-green-200'
                            : 'bg-white text-gray-800 border border-gray-200'
                        } p-2.5 rounded-xl shadow-sm`}>
                          <p className="text-xs whitespace-pre-line leading-relaxed">{msg.message}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 px-1">{msg.timestamp}</p>
                      </div>
                      {msg.sender === 'user' && (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="text-gray-600" size={12} />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start items-start space-x-2">
                      <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <Bot className="text-white" size={12} />
                      </div>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Security Notice for Registration */}
                {registrationStep !== 'none' && registrationStep !== 'complete' && (
                  <div className="px-3 pb-2 bg-amber-50 border-t border-amber-200">
                    <div className="flex items-start gap-2 py-2">
                      <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        <strong>Security:</strong> New accounts require Super Admin verification before login.
                      </p>
                    </div>
                  </div>
                )}

                {/* Transfer to Agent Button */}
                {!transferToAgent && messages.length > 2 && (
                  <div className="px-3 pb-2 bg-white">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleTransferToAgent}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Headphones size={14} />
                      <span>Transfer to Human Agent</span>
                    </motion.button>
                  </div>
                )}

                {/* Input */}
                <div className="p-3 bg-white border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-full hover:shadow-lg transition-all"
                    >
                      <Send size={16} />
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 text-center">
                    Powered by ChatGPT • Self-Learning AI
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};