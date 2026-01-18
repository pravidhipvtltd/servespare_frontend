// CRM System - Clean, Simple & Fully Functional
import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  Activity,
  Settings,
  Save,
  X,
  MessageSquare,
  Briefcase,
  Target,
  Star,
  Building,
  Tag,
  FileText,
  Download,
  Printer,
} from "lucide-react";
import { getFromStorage, saveToStorage } from "../utils/mockData";
import { copyToClipboard } from "../utils/printExport";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  address: string;
  type: "lead" | "customer" | "prospect";
  status: "active" | "inactive" | "blocked";
  source: string;
  assignedTo: string;
  tags: string[];
  createdDate: string;
  lastContact?: string;
  notes: string;
}

interface Deal {
  id: string;
  contactId: string;
  contactName: string;
  title: string;
  value: number;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  probability: number;
  expectedCloseDate: string;
  createdDate: string;
  closedDate?: string;
  products: string[];
  notes: string;
}

interface Activity {
  id: string;
  contactId: string;
  contactName: string;
  type: "call" | "email" | "meeting" | "note" | "task";
  subject: string;
  description: string;
  date: string;
  status: "completed" | "pending" | "cancelled";
}

export const CRMSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "contacts" | "deals" | "activities"
  >("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  // Form states
  const [contactForm, setContactForm] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
    address: "",
    type: "lead",
    status: "active",
    source: "website",
    assignedTo: "",
    tags: [],
    createdDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [dealForm, setDealForm] = useState<Partial<Deal>>({
    contactId: "",
    contactName: "",
    title: "",
    value: 0,
    stage: "lead",
    probability: 10,
    expectedCloseDate: "",
    createdDate: new Date().toISOString().split("T")[0],
    products: [],
    notes: "",
  });

  const [activityForm, setActivityForm] = useState<Partial<Activity>>({
    contactId: "",
    contactName: "",
    type: "call",
    subject: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    status: "pending",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load contacts
    let savedContacts = getFromStorage("crmContacts", []);
    if (savedContacts.length === 0) {
      savedContacts = generateSampleContacts();
      saveToStorage("crmContacts", savedContacts);
    }
    setContacts(savedContacts);

    // Load deals
    let savedDeals = getFromStorage("crmDeals", []);
    if (savedDeals.length === 0) {
      savedDeals = generateSampleDeals(savedContacts);
      saveToStorage("crmDeals", savedDeals);
    }
    setDeals(savedDeals);

    // Load activities
    let savedActivities = getFromStorage("crmActivities", []);
    if (savedActivities.length === 0) {
      savedActivities = generateSampleActivities(savedContacts);
      saveToStorage("crmActivities", savedActivities);
    }
    setActivities(savedActivities);
  };

  const generateSampleContacts = (): Contact[] => {
    const names = [
      {
        name: "Rajesh Kumar",
        company: "Tech Solutions Pvt Ltd",
        designation: "CEO",
      },
      {
        name: "Sita Sharma",
        company: "Green Energy Nepal",
        designation: "Marketing Manager",
      },
      {
        name: "Mohan Thapa",
        company: "Himalayan Motors",
        designation: "Sales Director",
      },
      {
        name: "Anita Rai",
        company: "Digital Nepal",
        designation: "Business Owner",
      },
      {
        name: "Kumar Gurung",
        company: "Mountain Traders",
        designation: "Procurement Head",
      },
      {
        name: "Priya Tamang",
        company: "Valley Enterprises",
        designation: "Managing Director",
      },
      {
        name: "Bikash Magar",
        company: "Nepal Auto Parts",
        designation: "Operations Manager",
      },
      {
        name: "Sunita Lama",
        company: "Swift Logistics",
        designation: "Fleet Manager",
      },
    ];

    const types: ("lead" | "customer" | "prospect")[] = [
      "lead",
      "customer",
      "prospect",
    ];
    const sources = [
      "Website",
      "Referral",
      "Cold Call",
      "Social Media",
      "Trade Show",
      "Partner",
    ];
    const assignedTo = [
      "Ram Bahadur",
      "Shyam Karki",
      "Hari Magar",
      "Krishna Lama",
    ];

    return names.map((person, i) => ({
      id: `CNT${1000 + i}`,
      name: person.name,
      email: `${person.name.toLowerCase().replace(" ", ".")}@${person.company
        .toLowerCase()
        .replace(/\s+/g, "")}.com`,
      phone: `+977-98${Math.floor(10000000 + Math.random() * 90000000)}`,
      company: person.company,
      designation: person.designation,
      address: `Pokhara, Nepal - ${Math.floor(44600 + Math.random() * 100)}`,
      type: types[Math.floor(Math.random() * types.length)],
      status: "active" as const,
      source: sources[Math.floor(Math.random() * sources.length)],
      assignedTo: assignedTo[Math.floor(Math.random() * assignedTo.length)],
      tags: ["VIP", "Potential"].slice(0, Math.floor(Math.random() * 2) + 1),
      createdDate: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      lastContact: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      notes: "Interested in bulk orders. Follow up required.",
    }));
  };

  const generateSampleDeals = (contacts: Contact[]): Deal[] => {
    const stages: (
      | "lead"
      | "qualified"
      | "proposal"
      | "negotiation"
      | "won"
      | "lost"
    )[] = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];

    const products = [
      "Brake Pads",
      "Engine Oil",
      "Air Filters",
      "Spark Plugs",
      "Batteries",
    ];

    return contacts.slice(0, 10).map((contact, i) => {
      const stage = stages[Math.floor(Math.random() * stages.length)];
      const probability =
        stage === "lead"
          ? 10
          : stage === "qualified"
          ? 25
          : stage === "proposal"
          ? 50
          : stage === "negotiation"
          ? 75
          : stage === "won"
          ? 100
          : 0;

      return {
        id: `DEAL${1000 + i}`,
        contactId: contact.id,
        contactName: contact.name,
        title: `${contact.company} - Spare Parts Supply`,
        value: Math.floor(50000 + Math.random() * 500000),
        stage,
        probability,
        expectedCloseDate: new Date(
          Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split("T")[0],
        createdDate: contact.createdDate,
        closedDate:
          stage === "won" || stage === "lost"
            ? new Date().toISOString().split("T")[0]
            : undefined,
        products: products.slice(0, Math.floor(Math.random() * 3) + 1),
        notes: "Regular follow-up needed.",
      };
    });
  };

  const generateSampleActivities = (contacts: Contact[]): Activity[] => {
    const types: ("call" | "email" | "meeting" | "note" | "task")[] = [
      "call",
      "email",
      "meeting",
      "note",
      "task",
    ];
    const subjects = [
      "Initial Contact",
      "Product Discussion",
      "Price Negotiation",
      "Follow-up Call",
      "Meeting Scheduled",
      "Quotation Sent",
      "Contract Review",
    ];

    return contacts.slice(0, 15).map((contact, i) => ({
      id: `ACT${1000 + i}`,
      contactId: contact.id,
      contactName: contact.name,
      type: types[Math.floor(Math.random() * types.length)],
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      description: "Discussed product requirements and pricing.",
      date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status:
        Math.random() > 0.3 ? ("completed" as const) : ("pending" as const),
    }));
  };

  // Filter data
  const filteredContacts = contacts.filter((contact) => {
    const searchMatch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);

    const typeMatch = typeFilter === "all" || contact.type === typeFilter;
    const statusMatch =
      statusFilter === "all" || contact.status === statusFilter;

    return searchMatch && typeMatch && statusMatch;
  });

  const filteredDeals = deals.filter((deal) => {
    const searchMatch =
      deal.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.title.toLowerCase().includes(searchQuery.toLowerCase());

    const stageMatch = stageFilter === "all" || deal.stage === stageFilter;

    return searchMatch && stageMatch;
  });

  const filteredActivities = activities.filter((activity) => {
    const searchMatch =
      activity.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.subject.toLowerCase().includes(searchQuery.toLowerCase());

    return searchMatch;
  });

  // Statistics
  const stats = {
    totalContacts: contacts.length,
    leads: contacts.filter((c) => c.type === "lead").length,
    customers: contacts.filter((c) => c.type === "customer").length,
    totalDeals: deals.length,
    dealsValue: deals.reduce((sum, d) => sum + d.value, 0),
    wonDeals: deals.filter((d) => d.stage === "won").length,
    wonValue: deals
      .filter((d) => d.stage === "won")
      .reduce((sum, d) => sum + d.value, 0),
    activities: activities.filter((a) => a.status === "pending").length,
  };

  // Handle Contact CRUD
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContact) {
      const updated = contacts.map((c) =>
        c.id === selectedContact.id
          ? ({ ...contactForm, id: selectedContact.id } as Contact)
          : c
      );
      setContacts(updated);
      saveToStorage("crmContacts", updated);
    } else {
      const newContact: Contact = {
        ...contactForm,
        id: `CNT${1000 + contacts.length}`,
      } as Contact;
      const updated = [newContact, ...contacts];
      setContacts(updated);
      saveToStorage("crmContacts", updated);
    }
    resetContactForm();
    setShowAddContactModal(false);
  };

  const handleDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeal) {
      const updated = deals.map((d) =>
        d.id === selectedDeal.id
          ? ({ ...dealForm, id: selectedDeal.id } as Deal)
          : d
      );
      setDeals(updated);
      saveToStorage("crmDeals", updated);
    } else {
      const newDeal: Deal = {
        ...dealForm,
        id: `DEAL${1000 + deals.length}`,
      } as Deal;
      const updated = [newDeal, ...deals];
      setDeals(updated);
      saveToStorage("crmDeals", updated);
    }
    resetDealForm();
    setShowAddDealModal(false);
  };

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newActivity: Activity = {
      ...activityForm,
      id: `ACT${1000 + activities.length}`,
    } as Activity;
    const updated = [newActivity, ...activities];
    setActivities(updated);
    saveToStorage("crmActivities", updated);
    resetActivityForm();
    setShowAddActivityModal(false);
  };

  const resetContactForm = () => {
    setContactForm({
      name: "",
      email: "",
      phone: "",
      company: "",
      designation: "",
      address: "",
      type: "lead",
      status: "active",
      source: "website",
      assignedTo: "",
      tags: [],
      createdDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setSelectedContact(null);
  };

  const resetDealForm = () => {
    setDealForm({
      contactId: "",
      contactName: "",
      title: "",
      value: 0,
      stage: "lead",
      probability: 10,
      expectedCloseDate: "",
      createdDate: new Date().toISOString().split("T")[0],
      products: [],
      notes: "",
    });
    setSelectedDeal(null);
  };

  const resetActivityForm = () => {
    setActivityForm({
      contactId: "",
      contactName: "",
      type: "call",
      subject: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    });
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setContactForm(contact);
    setShowAddContactModal(true);
  };

  const handleDeleteContact = (id: string) => {
    if (window.confirm("⚠️ Delete this contact? This cannot be undone.")) {
      const updated = contacts.filter((c) => c.id !== id);
      setContacts(updated);
      saveToStorage("crmContacts", updated);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowDetailsModal(true);
  };

  const exportToCSV = () => {
    let data: any[] = [];
    let headers: string[] = [];
    let filename = "";

    if (activeTab === "contacts") {
      headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Company",
        "Designation",
        "Type",
        "Status",
        "Source",
        "Assigned To",
      ];
      data = filteredContacts.map((c) => [
        c.id,
        c.name,
        c.email,
        c.phone,
        c.company,
        c.designation,
        c.type,
        c.status,
        c.source,
        c.assignedTo,
      ]);
      filename = "crm-contacts";
    } else if (activeTab === "deals") {
      headers = [
        "ID",
        "Contact",
        "Title",
        "Value",
        "Stage",
        "Probability",
        "Expected Close",
        "Created Date",
      ];
      data = filteredDeals.map((d) => [
        d.id,
        d.contactName,
        d.title,
        d.value,
        d.stage,
        d.probability,
        d.expectedCloseDate,
        d.createdDate,
      ]);
      filename = "crm-deals";
    } else {
      headers = ["ID", "Contact", "Type", "Subject", "Date", "Status"];
      data = filteredActivities.map((a) => [
        a.id,
        a.contactName,
        a.type,
        a.subject,
        a.date,
        a.status,
      ]);
      filename = "crm-activities";
    }

    const csv = [headers, ...data]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "lead":
        return "bg-yellow-100 text-yellow-700";
      case "customer":
        return "bg-green-100 text-green-700";
      case "prospect":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "lead":
        return "bg-gray-100 text-gray-700";
      case "qualified":
        return "bg-blue-100 text-blue-700";
      case "proposal":
        return "bg-purple-100 text-purple-700";
      case "negotiation":
        return "bg-orange-100 text-orange-700";
      case "won":
        return "bg-green-100 text-green-700";
      case "lost":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold flex items-center">
            <Users className="w-7 h-7 mr-3 text-blue-600" />
            CRM System
            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              {activeTab === "contacts"
                ? filteredContacts.length
                : activeTab === "deals"
                ? filteredDeals.length
                : filteredActivities.length}{" "}
              Records
            </span>
          </h2>
          <p className="text-gray-600 mt-1">
            Manage contacts, deals, and customer relationships
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              if (activeTab === "contacts") {
                resetContactForm();
                setShowAddContactModal(true);
              } else if (activeTab === "deals") {
                resetDealForm();
                setShowAddDealModal(true);
              } else {
                resetActivityForm();
                setShowAddActivityModal(true);
              }
            }}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>
              {activeTab === "contacts"
                ? "New Contact"
                : activeTab === "deals"
                ? "New Deal"
                : "New Activity"}
            </span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <div className="text-blue-900 font-bold text-3xl">
            {stats.totalContacts}
          </div>
          <div className="text-blue-700 text-sm">Total Contacts</div>
        </div>

        <div className="bg-white border-2 border-yellow-200 rounded-xl p-6">
          <Target className="w-8 h-8 text-yellow-600 mb-2" />
          <div className="text-yellow-900 font-bold text-3xl">
            {stats.leads}
          </div>
          <div className="text-yellow-700 text-sm">Active Leads</div>
        </div>

        <div className="bg-white border-2 border-green-200 rounded-xl p-6">
          <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
          <div className="text-green-900 font-bold text-3xl">
            {stats.wonDeals}
          </div>
          <div className="text-green-700 text-sm">Won Deals</div>
        </div>

        <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
          <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
          <div className="text-purple-900 font-bold text-3xl">
            NPR {stats.wonValue.toLocaleString()}
          </div>
          <div className="text-purple-700 text-sm">Revenue Won</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === "contacts"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab("deals")}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === "deals"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Briefcase className="w-5 h-5 inline mr-2" />
            Deals ({deals.length})
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === "activities"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Activity className="w-5 h-5 inline mr-2" />
            Activities ({activities.length})
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-gray-900 font-bold mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          Filters & Search
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {activeTab === "contacts" && (
            <>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="lead">Leads</option>
                <option value="customer">Customers</option>
                <option value="prospect">Prospects</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </>
          )}

          {activeTab === "deals" && (
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
            >
              <option value="all">All Stages</option>
              <option value="lead">Lead</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          )}
        </div>
      </div>

      {/* Contacts Tab */}
      {activeTab === "contacts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-bold">
                        {contact.name}
                      </div>
                      <div className="text-gray-500 text-sm">{contact.id}</div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(
                      contact.type
                    )}`}
                  >
                    {contact.type.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <Building className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-semibold">{contact.company}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{contact.designation}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Source:</span>
                  <span className="text-gray-900 font-semibold">
                    {contact.source}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Assigned To:</span>
                  <span className="text-gray-900 font-semibold">
                    {contact.assignedTo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Created:</span>
                  <span className="text-gray-900 font-semibold">
                    {new Date(contact.createdDate).toLocaleDateString("en-NP")}
                  </span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex space-x-2">
                <button
                  onClick={() => handleViewContact(contact)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => handleEditContact(contact)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deals Tab */}
      {activeTab === "deals" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-gray-900 font-bold">
                        {deal.title}
                      </div>
                      <div className="text-gray-500 text-sm">{deal.id}</div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStageColor(
                      deal.stage
                    )}`}
                  >
                    {deal.stage.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-semibold">{deal.contactName}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-bold text-green-700">
                      NPR {deal.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Probability:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full transition-all"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-semibold">
                      {deal.probability}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Expected Close:</span>
                  <span className="text-gray-900 font-semibold">
                    {new Date(deal.expectedCloseDate).toLocaleDateString(
                      "en-NP"
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Products:</span>
                  <span className="text-gray-900 font-semibold">
                    {deal.products.length} items
                  </span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedDeal(deal);
                    setDealForm(deal);
                    setShowAddDealModal(true);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Deal</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === "activities" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-700 font-bold">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 text-gray-700 font-bold">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 text-gray-700 font-bold">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 text-gray-700 font-bold">
                    Subject
                  </th>
                  <th className="text-left py-4 px-6 text-gray-700 font-bold">
                    Description
                  </th>
                  <th className="text-center py-4 px-6 text-gray-700 font-bold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-gray-900 font-semibold">
                      {new Date(activity.date).toLocaleDateString("en-NP")}
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {activity.contactName}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {activity.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-semibold">
                      {activity.subject}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {activity.description}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          activity.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : activity.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {activity.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {((activeTab === "contacts" && filteredContacts.length === 0) ||
        (activeTab === "deals" && filteredDeals.length === 0) ||
        (activeTab === "activities" && filteredActivities.length === 0)) && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border-2 border-gray-200">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 font-bold text-xl mb-2">
            No Records Found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? "Try adjusting your search"
              : `Create your first ${activeTab.slice(0, -1)}`}
          </p>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                {selectedContact ? "Edit Contact" : "New Contact"}
              </h3>
              <button
                onClick={() => {
                  setShowAddContactModal(false);
                  resetContactForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value })
                    }
                    required
                    placeholder="+977-9800000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        company: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={contactForm.designation}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        designation: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Type
                  </label>
                  <select
                    value={contactForm.type}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        type: e.target.value as Contact["type"],
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="customer">Customer</option>
                    <option value="prospect">Prospect</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Status
                  </label>
                  <select
                    value={contactForm.status}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        status: e.target.value as Contact["status"],
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Source
                  </label>
                  <select
                    value={contactForm.source}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, source: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="cold-call">Cold Call</option>
                    <option value="social-media">Social Media</option>
                    <option value="trade-show">Trade Show</option>
                    <option value="partner">Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={contactForm.assignedTo}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        assignedTo: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={contactForm.address}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Notes
                  </label>
                  <textarea
                    value={contactForm.notes}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddContactModal(false);
                    resetContactForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg font-bold flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>
                    {selectedContact ? "Update Contact" : "Create Contact"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {showAddDealModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                {selectedDeal ? "Edit Deal" : "New Deal"}
              </h3>
              <button
                onClick={() => {
                  setShowAddDealModal(false);
                  resetDealForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleDealSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Contact <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={dealForm.contactId}
                    onChange={(e) => {
                      const contact = contacts.find(
                        (c) => c.id === e.target.value
                      );
                      setDealForm({
                        ...dealForm,
                        contactId: e.target.value,
                        contactName: contact?.name || "",
                      });
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Contact</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.company}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Deal Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dealForm.title}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, title: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Value (NPR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={dealForm.value}
                    onChange={(e) =>
                      setDealForm({
                        ...dealForm,
                        value: parseFloat(e.target.value),
                      })
                    }
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Stage
                  </label>
                  <select
                    value={dealForm.stage}
                    onChange={(e) => {
                      const newStage = e.target.value as Deal["stage"];
                      const probability =
                        newStage === "lead"
                          ? 10
                          : newStage === "qualified"
                          ? 25
                          : newStage === "proposal"
                          ? 50
                          : newStage === "negotiation"
                          ? 75
                          : newStage === "won"
                          ? 100
                          : 0;
                      setDealForm({
                        ...dealForm,
                        stage: newStage,
                        probability,
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lead">Lead</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Probability (%)
                  </label>
                  <input
                    type="number"
                    value={dealForm.probability}
                    onChange={(e) =>
                      setDealForm({
                        ...dealForm,
                        probability: parseInt(e.target.value),
                      })
                    }
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={dealForm.expectedCloseDate}
                    onChange={(e) =>
                      setDealForm({
                        ...dealForm,
                        expectedCloseDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Notes
                  </label>
                  <textarea
                    value={dealForm.notes}
                    onChange={(e) =>
                      setDealForm({ ...dealForm, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDealModal(false);
                    resetDealForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg font-bold flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{selectedDeal ? "Update Deal" : "Create Deal"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <Activity className="w-6 h-6 mr-2 text-blue-600" />
                New Activity
              </h3>
              <button
                onClick={() => {
                  setShowAddActivityModal(false);
                  resetActivityForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleActivitySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Contact <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={activityForm.contactId}
                    onChange={(e) => {
                      const contact = contacts.find(
                        (c) => c.id === e.target.value
                      );
                      setActivityForm({
                        ...activityForm,
                        contactId: e.target.value,
                        contactName: contact?.name || "",
                      });
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Contact</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Type
                  </label>
                  <select
                    value={activityForm.type}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        type: e.target.value as Activity["type"],
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                    <option value="task">Task</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={activityForm.date}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, date: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Status
                  </label>
                  <select
                    value={activityForm.status}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        status: e.target.value as Activity["status"],
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={activityForm.subject}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        subject: e.target.value,
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={activityForm.description}
                    onChange={(e) =>
                      setActivityForm({
                        ...activityForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddActivityModal(false);
                    resetActivityForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg font-bold flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Create Activity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Details Modal */}
      {showDetailsModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-3xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-600" />
                Contact Details - {selectedContact.id}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span
                  className={`px-6 py-3 rounded-xl font-bold text-lg ${getTypeColor(
                    selectedContact.type
                  )}`}
                >
                  {selectedContact.type.toUpperCase()}
                </span>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">
                  {selectedContact.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <h4 className="text-blue-900 font-bold mb-3">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-blue-600 text-sm font-semibold">
                        Name
                      </div>
                      <div className="text-blue-900 font-bold">
                        {selectedContact.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-600 text-sm font-semibold">
                        Email
                      </div>
                      <div className="text-blue-900">
                        {selectedContact.email}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-600 text-sm font-semibold">
                        Phone
                      </div>
                      <div className="text-blue-900">
                        {selectedContact.phone}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-green-50 rounded-xl border-2 border-green-200">
                  <h4 className="text-green-900 font-bold mb-3">
                    Company Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-green-600 text-sm font-semibold">
                        Company
                      </div>
                      <div className="text-green-900 font-bold">
                        {selectedContact.company}
                      </div>
                    </div>
                    <div>
                      <div className="text-green-600 text-sm font-semibold">
                        Designation
                      </div>
                      <div className="text-green-900">
                        {selectedContact.designation}
                      </div>
                    </div>
                    <div>
                      <div className="text-green-600 text-sm font-semibold">
                        Address
                      </div>
                      <div className="text-green-900">
                        {selectedContact.address}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-purple-50 rounded-xl border-2 border-purple-200">
                <h4 className="text-purple-900 font-bold mb-3">
                  Additional Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-purple-600 text-sm font-semibold">
                      Source
                    </div>
                    <div className="text-purple-900">
                      {selectedContact.source}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-600 text-sm font-semibold">
                      Assigned To
                    </div>
                    <div className="text-purple-900">
                      {selectedContact.assignedTo}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-600 text-sm font-semibold">
                      Created Date
                    </div>
                    <div className="text-purple-900">
                      {new Date(selectedContact.createdDate).toLocaleDateString(
                        "en-NP"
                      )}
                    </div>
                  </div>
                  {selectedContact.lastContact && (
                    <div>
                      <div className="text-purple-600 text-sm font-semibold">
                        Last Contact
                      </div>
                      <div className="text-purple-900">
                        {new Date(
                          selectedContact.lastContact
                        ).toLocaleDateString("en-NP")}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedContact.notes && (
                <div className="p-5 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <h4 className="text-yellow-900 font-bold mb-2">Notes</h4>
                  <p className="text-yellow-800">{selectedContact.notes}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEditContact(selectedContact);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold flex items-center justify-center space-x-2"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Contact</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
