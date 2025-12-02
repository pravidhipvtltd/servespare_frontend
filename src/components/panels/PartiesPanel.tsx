import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Eye, Building2, Phone, Mail, MapPin, FileText, TrendingUp, Download, Filter, Package, Users, ShoppingCart } from 'lucide-react';
import { getFromStorage, saveToStorage } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { Party, PartyType, CustomerType, PaymentTerms, PartyTransaction } from '../../types';
import { Pagination } from '../common/Pagination';

const PARTY_TYPE_LABELS: Record<PartyType, string> = {
  customer: 'Customer',
  supplier: 'Supplier',
};

const PARTY_TYPE_COLORS: Record<PartyType, string> = {
  customer: 'bg-pink-100 text-pink-700',
  supplier: 'bg-blue-100 text-blue-700',
};

const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  retail: 'Retail Customer',
  retailer: 'Retailer',
  workshop: 'Workshop',
  distributor: 'Distributor',
  wholesaler: 'Wholesaler',
};

const CUSTOMER_TYPE_COLORS: Record<CustomerType, string> = {
  retail: 'bg-pink-100 text-pink-700',
  retailer: 'bg-blue-100 text-blue-700',
  workshop: 'bg-purple-100 text-purple-700',
  distributor: 'bg-green-100 text-green-700',
  wholesaler: 'bg-orange-100 text-orange-700',
};

const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  cash: 'Cash',
  credit_7: '7 Days Credit',
  credit_15: '15 Days Credit',
  credit_30: '30 Days Credit',
  credit_45: '45 Days Credit',
};

export const PartiesPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'customers'>('suppliers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerType, setSelectedCustomerType] = useState<CustomerType | 'all'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewingSidebar, setViewingSidebar] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [viewingParty, setViewingParty] = useState<Party | null>(null);
  const [transactions, setTransactions] = useState<PartyTransaction[]>([]);
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const [formData, setFormData] = useState<Partial<Party>>({
    name: '',
    type: 'supplier',
    customerType: 'retail',
    contactPerson: '',
    phone: '+977',
    email: '',
    address: '',
    city: '',
    state: '',
    gstNumber: '',
    panNumber: '',
    paymentTerms: 'cash',
    creditLimit: 0,
    openingBalance: 0,
    currentBalance: 0,
    isActive: true,
    logo: '',
  });

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = () => {
    const allParties = getFromStorage('parties', []);
    setParties(allParties.filter((p: Party) => p.workspaceId === currentUser?.workspaceId));
  };

  const loadPartyTransactions = (partyId: string) => {
    const allTransactions = getFromStorage('partyTransactions', []);
    setTransactions(allTransactions.filter((t: PartyTransaction) => t.partyId === partyId));
  };

  const handleOpenSidebar = (party?: Party) => {
    if (party) {
      setEditingParty(party);
      setFormData({
        ...party,
        logo: party.logo || '',
      });
    } else {
      setEditingParty(null);
      setFormData({
        name: '',
        type: 'supplier',
        customerType: 'retail',
        contactPerson: '',
        phone: '+977',
        email: '',
        address: '',
        city: '',
        state: '',
        gstNumber: '',
        panNumber: '',
        paymentTerms: 'cash',
        creditLimit: 0,
        openingBalance: 0,
        currentBalance: 0,
        isActive: true,
        logo: '',
      });
    }
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setEditingParty(null);
    setFormData({
      name: '',
      type: 'supplier',
      customerType: 'retail',
      contactPerson: '',
      phone: '+977',
      email: '',
      address: '',
      city: '',
      state: '',
      gstNumber: '',
      panNumber: '',
      paymentTerms: 'cash',
      creditLimit: 0,
      openingBalance: 0,
      currentBalance: 0,
      isActive: true,
      logo: '',
    });
  };

  const handleViewParty = (party: Party) => {
    setViewingParty(party);
    loadPartyTransactions(party.id);
    setViewingSidebar(true);
  };

  const handleCloseViewSidebar = () => {
    setViewingSidebar(false);
    setViewingParty(null);
    setTransactions([]);
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allParties = getFromStorage('parties', []);

    if (editingParty) {
      const updated = allParties.map((p: Party) =>
        p.id === editingParty.id
          ? { ...p, ...formData }
          : p
      );
      saveToStorage('parties', updated);
    } else {
      const newParty: Party = {
        id: Date.now().toString(),
        ...formData as Party,
        currentBalance: formData.openingBalance || 0,
        workspaceId: currentUser?.workspaceId,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id,
      };
      saveToStorage('parties', [...allParties, newParty]);
    }

    loadParties();
    handleCloseSidebar();
  };

  const handleDelete = (partyId: string) => {
    if (confirm('Are you sure you want to delete this party? This will also affect related inventory items.')) {
      const allParties = getFromStorage('parties', []);
      const filtered = allParties.filter((p: Party) => p.id !== partyId);
      saveToStorage('parties', filtered);
      setSelectedParties([]);
      loadParties();
    }
  };

  const handleBulkDelete = () => {
    if (selectedParties.length === 0) {
      alert('Please select parties to delete');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedParties.length} part${selectedParties.length > 1 ? 'ies' : 'y'}?`)) {
      const allParties = getFromStorage('parties', []);
      const filtered = allParties.filter((p: Party) => !selectedParties.includes(p.id));
      saveToStorage('parties', filtered);
      setSelectedParties([]);
      loadParties();
    }
  };

  const toggleSelectAll = () => {
    if (selectedParties.length === paginatedParties.length) {
      setSelectedParties([]);
    } else {
      setSelectedParties(paginatedParties.map(p => p.id));
    }
  };

  const toggleSelectParty = (id: string) => {
    setSelectedParties(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportReport = () => {
    const csvContent = [
      ['Party Name', 'Type', 'Contact Person', 'Phone', 'Email', 'City', 'GST Number', 'Current Balance', 'Status'],
      ...filteredParties.map(p => [
        p.name,
        PARTY_TYPE_LABELS[p.type],
        p.contactPerson,
        p.phone,
        p.email || '',
        p.city,
        p.gstNumber || '',
        p.currentBalance.toString(),
        p.isActive ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parties-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredParties = parties.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      (p.gstNumber && p.gstNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = activeTab === 'suppliers' ? p.type === 'supplier' : p.type === 'customer' && (selectedCustomerType === 'all' || p.customerType === selectedCustomerType);
    return matchesSearch && matchesType;
  });

  const typeCounts = parties.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {} as Record<PartyType, number>);

  const stats = {
    totalParties: parties.length,
    activeParties: parties.filter(p => p.isActive).length,
    totalPayable: parties.reduce((sum, p) => sum + p.currentBalance, 0),
  };

  // Get inventory items linked to a party
  const getPartyInventory = (partyId: string) => {
    const inventory = getFromStorage('inventory', []);
    return inventory.filter((item: any) => item.partyId === partyId);
  };

  const paginatedParties = filteredParties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Parties</p>
              <p className="text-gray-900 text-2xl mt-1">{stats.totalParties}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Parties</p>
              <p className="text-gray-900 text-2xl mt-1">{stats.activeParties}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Payable</p>
              <p className="text-gray-900 text-2xl mt-1">₹{stats.totalPayable.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900 text-lg">All Parties</h3>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button 
            onClick={() => handleOpenSidebar()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Party</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parties by name, contact, phone or GST number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Type Filter Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              activeTab === 'suppliers'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Suppliers ({typeCounts['supplier'] || 0})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              activeTab === 'customers'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Customers ({typeCounts['customer'] || 0})
          </button>
          {activeTab === 'customers' && (
            <div className="ml-2">
              <button
                onClick={() => setSelectedCustomerType('all')}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCustomerType === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({typeCounts['customer'] || 0})
              </button>
              {(['retail', 'retailer', 'workshop', 'distributor', 'wholesaler'] as CustomerType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedCustomerType(type)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedCustomerType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {CUSTOMER_TYPE_LABELS[type]} ({typeCounts['customer'] || 0})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Parties Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-gray-500 text-sm py-3 px-4">Party Details</th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">Type</th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">Contact</th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">Location</th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">Payment Terms</th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">Balance</th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">Status</th>
                <th className="text-left text-gray-500 text-sm py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedParties.map((party) => (
                <tr key={party.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      {party.logo ? (
                        <img 
                          src={party.logo} 
                          alt={party.name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border border-gray-200">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      <div>
                        <div className="text-gray-900">{party.name}</div>
                        <div className="text-gray-500 text-sm">{party.contactPerson}</div>
                        {party.gstNumber && (
                          <div className="text-gray-400 text-xs mt-1">GST: {party.gstNumber}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${PARTY_TYPE_COLORS[party.type]}`}>
                      {PARTY_TYPE_LABELS[party.type]}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{party.phone}</span>
                      </div>
                      {party.email && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span>{party.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span className="text-sm">{party.city}, {party.state}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {PAYMENT_TERMS_LABELS[party.paymentTerms]}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-sm ${party.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{Math.abs(party.currentBalance).toLocaleString()}
                      {party.currentBalance > 0 ? ' (Dr)' : party.currentBalance < 0 ? ' (Cr)' : ''}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      party.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {party.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewParty(party)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenSidebar(party)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(party.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredParties.length > itemsPerPage && (
          <Pagination
            totalItems={filteredParties.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredParties.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Add/Edit Sidebar */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseSidebar}
          />
          
          <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-lg">
                  {editingParty ? 'Edit Party' : 'Add New Party'}
                </h3>
                <button
                  onClick={handleCloseSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-gray-700 text-sm mb-2">Party Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 text-sm mb-2">Party Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as PartyType })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {Object.entries(PARTY_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Customer Type - Only shown when Party Type is 'customer' */}
                  {formData.type === 'customer' && (
                    <div className="col-span-2">
                      <label className="block text-gray-700 text-sm mb-2">Customer Type *</label>
                      <select
                        value={formData.customerType || 'retail'}
                        onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {Object.entries(CUSTOMER_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-gray-700 text-sm mb-2">Contact Person *</label>
                    <input
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+977 XXXXX XXXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 text-sm mb-2">Address *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 text-sm mb-2">Party Logo</label>
                    <div className="flex items-center space-x-4">
                      {formData.logo ? (
                        <img src={formData.logo} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-gray-300" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-300">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">GST Number</label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={15}
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">PAN Number</label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={10}
                      placeholder="AAAAA0000A"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Payment Terms *</label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value as PaymentTerms })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {Object.entries(PAYMENT_TERMS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Credit Limit (₹)</label>
                    <input
                      type="number"
                      value={formData.creditLimit || 0}
                      onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm mb-2">Opening Balance (₹)</label>
                    <input
                      type="number"
                      value={formData.openingBalance || 0}
                      onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 text-sm">Active Party</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseSidebar}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingParty ? 'Update Party' : 'Create Party'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* View Party Details Sidebar */}
      {viewingSidebar && viewingParty && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseViewSidebar}
          />
          
          <div className="fixed right-0 top-0 h-full w-full md:w-[700px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 text-xl">Party Details</h3>
                <button
                  onClick={handleCloseViewSidebar}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Party Header with Logo */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {viewingParty.logo ? (
                      <img src={viewingParty.logo} alt={viewingParty.name} className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm" />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-sm">
                        {viewingParty.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-gray-900 text-2xl mb-2">{viewingParty.name}</h4>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${PARTY_TYPE_COLORS[viewingParty.type]}`}>
                          {PARTY_TYPE_LABELS[viewingParty.type]}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          viewingParty.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {viewingParty.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information Table */}
              <div className="mb-6">
                <h4 className="text-gray-900 mb-3 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Party Name</td>
                        <td className="py-3 px-4 text-gray-900">{viewingParty.name}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Party Type</td>
                        <td className="py-3 px-4 text-gray-900">{PARTY_TYPE_LABELS[viewingParty.type]}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Contact Person</td>
                        <td className="py-3 px-4 text-gray-900">{viewingParty.contactPerson}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Phone Number</td>
                        <td className="py-3 px-4 text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {viewingParty.phone}
                        </td>
                      </tr>
                      {viewingParty.email && (
                        <tr className="border-b border-gray-200">
                          <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Email</td>
                          <td className="py-3 px-4 text-gray-900 flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {viewingParty.email}
                          </td>
                        </tr>
                      )}
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Address</td>
                        <td className="py-3 px-4 text-gray-900">{viewingParty.address}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">City</td>
                        <td className="py-3 px-4 text-gray-900">{viewingParty.city}</td>
                      </tr>
                      {viewingParty.state && (
                        <tr className="border-b border-gray-200">
                          <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">State</td>
                          <td className="py-3 px-4 text-gray-900">{viewingParty.state}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Status</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            viewingParty.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {viewingParty.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax & Legal Information Table */}
              {(viewingParty.gstNumber || viewingParty.panNumber) && (
                <div className="mb-6">
                  <h4 className="text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Tax & Legal Information
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {viewingParty.gstNumber && (
                          <tr className="border-b border-gray-200">
                            <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">GST Number</td>
                            <td className="py-3 px-4 text-gray-900 font-mono">{viewingParty.gstNumber}</td>
                          </tr>
                        )}
                        {viewingParty.panNumber && (
                          <tr>
                            <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">PAN Number</td>
                            <td className="py-3 px-4 text-gray-900 font-mono">{viewingParty.panNumber}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Financial Information Table */}
              <div className="mb-6">
                <h4 className="text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Financial Information
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Payment Terms</td>
                        <td className="py-3 px-4 text-gray-900">{PAYMENT_TERMS_LABELS[viewingParty.paymentTerms]}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Credit Limit</td>
                        <td className="py-3 px-4 text-gray-900">NPR {viewingParty.creditLimit.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Opening Balance</td>
                        <td className="py-3 px-4 text-blue-600">NPR {viewingParty.openingBalance.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 bg-gray-50 text-gray-600 w-1/3">Current Balance</td>
                        <td className="py-3 px-4">
                          <span className={`${viewingParty.currentBalance > 0 ? 'text-red-600' : viewingParty.currentBalance < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                            NPR {Math.abs(viewingParty.currentBalance).toLocaleString()}
                            {viewingParty.currentBalance > 0 ? ' (Payable)' : viewingParty.currentBalance < 0 ? ' (Receivable)' : ' (Settled)'}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Linked Inventory Items Table */}
              <div className="mb-6">
                <h4 className="text-gray-900 mb-3 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Linked Inventory Items
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {(() => {
                    const items = getPartyInventory(viewingParty.id);
                    return items.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 text-sm">Item Name</th>
                            <th className="text-left py-3 px-4 text-gray-600 text-sm">Part Number</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm">Quantity</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm">Price</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm">Total Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item: any, idx: number) => (
                            <tr key={item.id} className={idx !== items.length - 1 ? 'border-b border-gray-100' : ''}>
                              <td className="py-3 px-4 text-gray-900">{item.name}</td>
                              <td className="py-3 px-4 text-gray-600 text-sm font-mono">{item.partNumber || 'N/A'}</td>
                              <td className="py-3 px-4 text-gray-900 text-right">{item.quantity || 0}</td>
                              <td className="py-3 px-4 text-gray-900 text-right">NPR {(item.price || 0).toLocaleString()}</td>
                              <td className="py-3 px-4 text-gray-900 text-right">NPR {((item.quantity || 0) * (item.price || 0)).toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="bg-blue-50">
                            <td colSpan={4} className="py-3 px-4 text-gray-900 text-right">Total Inventory Value:</td>
                            <td className="py-3 px-4 text-blue-600 text-right">
                              NPR {items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No inventory items linked to this party yet.</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Transaction History Table */}
              <div className="mb-6">
                <h4 className="text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Transaction History
                </h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {transactions.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-600 text-sm">Date</th>
                          <th className="text-left py-3 px-4 text-gray-600 text-sm">Description</th>
                          <th className="text-left py-3 px-4 text-gray-600 text-sm">Type</th>
                          <th className="text-right py-3 px-4 text-gray-600 text-sm">Amount</th>
                          <th className="text-right py-3 px-4 text-gray-600 text-sm">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((txn, idx) => (
                          <tr key={txn.id} className={idx !== transactions.length - 1 ? 'border-b border-gray-100' : ''}>
                            <td className="py-3 px-4 text-gray-600 text-sm">{new Date(txn.date).toLocaleDateString('en-NP')}</td>
                            <td className="py-3 px-4 text-gray-900">{txn.description}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                txn.type === 'payment' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {txn.type === 'payment' ? 'Payment' : 'Purchase'}
                              </span>
                            </td>
                            <td className={`py-3 px-4 text-right ${
                              txn.type === 'payment' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {txn.type === 'payment' ? '-' : '+'}NPR {txn.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-gray-900 text-right">NPR {(txn.balanceAfter || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No transactions recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleCloseViewSidebar();
                    handleOpenSidebar(viewingParty);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Party</span>
                </button>
                <button
                  onClick={handleCloseViewSidebar}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};