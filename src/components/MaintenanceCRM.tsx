// Maintenance CRM - Clean, Simple & Fully Functional
import React, { useState, useEffect } from 'react';
import {
  Wrench, Plus, Search, Filter, Calendar, Clock, User, Car, Phone,
  Mail, MapPin, CheckCircle, XCircle, AlertCircle, Edit, Trash2,
  Eye, DollarSign, Package, Users, FileText, Download, Printer,
  RotateCcw, Settings, TrendingUp, Activity, Save, X
} from 'lucide-react';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import { copyToClipboard } from '../utils/printExport';

interface ServiceRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleType: 'two-wheeler' | 'four-wheeler';
  vehicleModel: string;
  vehicleNumber: string;
  serviceType: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  technician?: string;
  estimatedCost: number;
  actualCost?: number;
  partsUsed: {
    partName: string;
    quantity: number;
    price: number;
  }[];
  requestDate: string;
  scheduledDate?: string;
  completedDate?: string;
  notes: string;
}

export const MaintenanceCRM: React.FC = () => {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState<Partial<ServiceRequest>>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleType: 'two-wheeler',
    vehicleModel: '',
    vehicleNumber: '',
    serviceType: 'general-service',
    description: '',
    status: 'pending',
    priority: 'medium',
    technician: '',
    estimatedCost: 0,
    partsUsed: [],
    requestDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    let savedServices = getFromStorage('maintenanceServices', []);
    if (savedServices.length === 0) {
      savedServices = generateSampleServices();
      saveToStorage('maintenanceServices', savedServices);
    }
    setServices(savedServices);
  };

  const generateSampleServices = (): ServiceRequest[] => {
    const customers = [
      { name: 'Rajesh Sharma', phone: '+977-9800000001', email: 'rajesh@example.com' },
      { name: 'Sita Thapa', phone: '+977-9811111111', email: 'sita@example.com' },
      { name: 'Mohan Gurung', phone: '+977-9822222222', email: 'mohan@example.com' },
      { name: 'Anita Rai', phone: '+977-9833333333', email: 'anita@example.com' },
      { name: 'Kumar Tamang', phone: '+977-9844444444', email: 'kumar@example.com' },
    ];

    const serviceTypes = [
      'General Service',
      'Oil Change',
      'Brake Repair',
      'Engine Repair',
      'Tire Replacement',
      'Battery Replacement',
      'AC Service',
      'Transmission Repair',
    ];

    const statuses: ('pending' | 'in-progress' | 'completed' | 'cancelled')[] = [
      'pending', 'in-progress', 'completed', 'cancelled'
    ];

    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

    const technicians = ['Ram Bahadur', 'Shyam Karki', 'Hari Magar', 'Krishna Lama'];

    const sampleServices: ServiceRequest[] = [];

    for (let i = 0; i < 20; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const isTwo = Math.random() > 0.5;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const requestDate = new Date();
      requestDate.setDate(requestDate.getDate() - daysAgo);

      sampleServices.push({
        id: `SRV${1000 + i}`,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        vehicleType: isTwo ? 'two-wheeler' : 'four-wheeler',
        vehicleModel: isTwo ? `Hero ${['Splendor', 'Passion', 'Glamour'][Math.floor(Math.random() * 3)]}` : `Maruti ${['Swift', 'Alto', 'Dzire'][Math.floor(Math.random() * 3)]}`,
        vehicleNumber: `BA ${Math.floor(Math.random() * 99)} PA ${Math.floor(Math.random() * 9999)}`,
        serviceType: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
        description: 'Regular maintenance and inspection needed',
        status,
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        technician: status !== 'pending' ? technicians[Math.floor(Math.random() * technicians.length)] : undefined,
        estimatedCost: Math.floor(Math.random() * 10000) + 1000,
        actualCost: status === 'completed' ? Math.floor(Math.random() * 10000) + 1000 : undefined,
        partsUsed: status === 'completed' ? [
          { partName: 'Engine Oil', quantity: 1, price: 800 },
          { partName: 'Oil Filter', quantity: 1, price: 300 },
        ] : [],
        requestDate: requestDate.toISOString().split('T')[0],
        scheduledDate: status !== 'pending' ? new Date(requestDate.getTime() + 86400000).toISOString().split('T')[0] : undefined,
        completedDate: status === 'completed' ? new Date(requestDate.getTime() + 172800000).toISOString().split('T')[0] : undefined,
        notes: 'Customer requested early completion',
      });
    }

    return sampleServices.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  };

  // Filter services
  const filteredServices = services.filter(service => {
    const searchMatch = 
      service.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.id.toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatch = statusFilter === 'all' || service.status === statusFilter;
    const vehicleMatch = vehicleFilter === 'all' || service.vehicleType === vehicleFilter;
    const priorityMatch = priorityFilter === 'all' || service.priority === priorityFilter;

    return searchMatch && statusMatch && vehicleMatch && priorityMatch;
  });

  // Statistics
  const stats = {
    total: services.length,
    pending: services.filter(s => s.status === 'pending').length,
    inProgress: services.filter(s => s.status === 'in-progress').length,
    completed: services.filter(s => s.status === 'completed').length,
    revenue: services.filter(s => s.status === 'completed').reduce((sum, s) => sum + (s.actualCost || 0), 0),
  };

  // Add/Update service
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedService) {
      // Update existing
      const updated = services.map(s => s.id === selectedService.id ? { ...formData, id: selectedService.id } as ServiceRequest : s);
      setServices(updated);
      saveToStorage('maintenanceServices', updated);
    } else {
      // Add new
      const newService: ServiceRequest = {
        ...formData,
        id: `SRV${1000 + services.length}`,
      } as ServiceRequest;
      const updated = [newService, ...services];
      setServices(updated);
      saveToStorage('maintenanceServices', updated);
    }

    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      vehicleType: 'two-wheeler',
      vehicleModel: '',
      vehicleNumber: '',
      serviceType: 'general-service',
      description: '',
      status: 'pending',
      priority: 'medium',
      technician: '',
      estimatedCost: 0,
      partsUsed: [],
      requestDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setSelectedService(null);
  };

  const handleEdit = (service: ServiceRequest) => {
    setSelectedService(service);
    setFormData(service);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('⚠️ Delete this service request? This cannot be undone.')) {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      saveToStorage('maintenanceServices', updated);
    }
  };

  const handleViewDetails = (service: ServiceRequest) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const updateStatus = (id: string, newStatus: ServiceRequest['status']) => {
    const updated = services.map(s => {
      if (s.id === id) {
        const updates: Partial<ServiceRequest> = { status: newStatus };
        if (newStatus === 'completed' && !s.completedDate) {
          updates.completedDate = new Date().toISOString().split('T')[0];
        }
        return { ...s, ...updates };
      }
      return s;
    });
    setServices(updated);
    saveToStorage('maintenanceServices', updated);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Customer', 'Phone', 'Vehicle Type', 'Vehicle Model', 'Vehicle Number', 'Service Type', 'Status', 'Priority', 'Estimated Cost', 'Actual Cost', 'Request Date'];
    const rows = filteredServices.map(s => [
      s.id,
      s.customerName,
      s.customerPhone,
      s.vehicleType,
      s.vehicleModel,
      s.vehicleNumber,
      s.serviceType,
      s.status,
      s.priority,
      s.estimatedCost,
      s.actualCost || 'N/A',
      s.requestDate,
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance-crm-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold flex items-center">
            <Wrench className="w-7 h-7 mr-3 text-blue-600" />
            Maintenance CRM
            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
              {filteredServices.length} Services
            </span>
          </h2>
          <p className="text-gray-600 mt-1">Manage all vehicle service requests and maintenance</p>
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
              resetForm();
              setShowAddModal(true);
            }}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg font-semibold flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Service Request</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
          <Activity className="w-8 h-8 text-blue-600 mb-2" />
          <div className="text-blue-900 font-bold text-3xl">{stats.total}</div>
          <div className="text-blue-700 text-sm">Total Requests</div>
        </div>

        <div className="bg-white border-2 border-yellow-200 rounded-xl p-6">
          <Clock className="w-8 h-8 text-yellow-600 mb-2" />
          <div className="text-yellow-900 font-bold text-3xl">{stats.pending}</div>
          <div className="text-yellow-700 text-sm">Pending</div>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
          <Settings className="w-8 h-8 text-blue-600 mb-2" />
          <div className="text-blue-900 font-bold text-3xl">{stats.inProgress}</div>
          <div className="text-blue-700 text-sm">In Progress</div>
        </div>

        <div className="bg-white border-2 border-green-200 rounded-xl p-6">
          <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
          <div className="text-green-900 font-bold text-3xl">{stats.completed}</div>
          <div className="text-green-700 text-sm">Completed</div>
        </div>

        <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
          <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
          <div className="text-purple-900 font-bold text-3xl">NPR {stats.revenue.toLocaleString()}</div>
          <div className="text-purple-700 text-sm">Total Revenue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-gray-900 font-bold mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          Filters & Search
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, vehicle..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Vehicles</option>
            <option value="two-wheeler">Two Wheeler</option>
            <option value="four-wheeler">Four Wheeler</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:shadow-lg transition-all">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-gray-900 font-bold">{service.id}</div>
                    <div className="text-gray-500 text-sm">{service.vehicleType === 'two-wheeler' ? '🏍️ Two Wheeler' : '🚗 Four Wheeler'}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(service.priority)}`}>
                  {service.priority.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-700">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-semibold">{service.customerName}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{service.customerPhone}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Car className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="font-semibold">{service.vehicleModel}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{service.vehicleNumber}</span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Service Type:</span>
                <span className="text-gray-900 font-semibold">{service.serviceType}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Request Date:</span>
                <span className="text-gray-900 font-semibold">{new Date(service.requestDate).toLocaleDateString('en-NP')}</span>
              </div>

              {service.technician && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Technician:</span>
                  <span className="text-gray-900 font-semibold">{service.technician}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Estimated Cost:</span>
                <span className="text-green-700 font-bold">NPR {service.estimatedCost.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <span className={`inline-flex px-4 py-2 rounded-lg font-bold text-sm border-2 ${getStatusColor(service.status)}`}>
                  {service.status === 'pending' && '⏳ Pending'}
                  {service.status === 'in-progress' && '🔧 In Progress'}
                  {service.status === 'completed' && '✅ Completed'}
                  {service.status === 'cancelled' && '❌ Cancelled'}
                </span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex space-x-2">
              <button
                onClick={() => handleViewDetails(service)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Details</span>
              </button>
              <button
                onClick={() => handleEdit(service)}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm flex items-center justify-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border-2 border-gray-200">
          <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 font-bold text-xl mb-2">No Service Requests Found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' || vehicleFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first service request to get started'}
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            New Service Request
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <Wrench className="w-6 h-6 mr-2 text-blue-600" />
                {selectedService ? 'Edit Service Request' : 'New Service Request'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div>
                <h4 className="text-gray-900 font-bold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      required
                      placeholder="+977-9800000000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="customer@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <h4 className="text-gray-900 font-bold mb-4 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Vehicle Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as 'two-wheeler' | 'four-wheeler' })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="two-wheeler">🏍️ Two Wheeler</option>
                      <option value="four-wheeler">🚗 Four Wheeler</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Vehicle Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      required
                      placeholder="e.g., Hero Splendor, Maruti Swift"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Vehicle Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                      required
                      placeholder="BA 12 PA 1234"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h4 className="text-gray-900 font-bold mb-4 flex items-center">
                  <Wrench className="w-5 h-5 mr-2 text-blue-600" />
                  Service Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general-service">General Service</option>
                      <option value="oil-change">Oil Change</option>
                      <option value="brake-repair">Brake Repair</option>
                      <option value="engine-repair">Engine Repair</option>
                      <option value="tire-replacement">Tire Replacement</option>
                      <option value="battery-replacement">Battery Replacement</option>
                      <option value="ac-service">AC Service</option>
                      <option value="transmission-repair">Transmission Repair</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">🟢 Low Priority</option>
                      <option value="medium">🟡 Medium Priority</option>
                      <option value="high">🔴 High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ServiceRequest['status'] })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="in-progress">🔧 In Progress</option>
                      <option value="completed">✅ Completed</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Estimated Cost (NPR)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Technician
                    </label>
                    <input
                      type="text"
                      value={formData.technician}
                      onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                      placeholder="Assigned technician name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Describe the service requirements..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      placeholder="Additional notes..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
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
                  <span>{selectedService ? 'Update Service' : 'Create Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900 font-bold text-2xl flex items-center">
                <Wrench className="w-6 h-6 mr-2 text-blue-600" />
                Service Request Details - {selectedService.id}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-6 py-3 rounded-xl font-bold text-lg border-2 ${getStatusColor(selectedService.status)}`}>
                  {selectedService.status === 'pending' && '⏳ Pending'}
                  {selectedService.status === 'in-progress' && '🔧 In Progress'}
                  {selectedService.status === 'completed' && '✅ Completed'}
                  {selectedService.status === 'cancelled' && '❌ Cancelled'}
                </span>
                <span className={`px-4 py-2 rounded-lg font-bold ${getPriorityColor(selectedService.priority)}`}>
                  {selectedService.priority.toUpperCase()} PRIORITY
                </span>
              </div>

              {/* Customer & Vehicle Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <h4 className="text-blue-900 font-bold mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-blue-600 text-sm font-semibold">Name</div>
                      <div className="text-blue-900 font-bold">{selectedService.customerName}</div>
                    </div>
                    <div>
                      <div className="text-blue-600 text-sm font-semibold">Phone</div>
                      <div className="text-blue-900">{selectedService.customerPhone}</div>
                    </div>
                    {selectedService.customerEmail && (
                      <div>
                        <div className="text-blue-600 text-sm font-semibold">Email</div>
                        <div className="text-blue-900">{selectedService.customerEmail}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 bg-green-50 rounded-xl border-2 border-green-200">
                  <h4 className="text-green-900 font-bold mb-3 flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Vehicle Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-green-600 text-sm font-semibold">Type</div>
                      <div className="text-green-900 font-bold">
                        {selectedService.vehicleType === 'two-wheeler' ? '🏍️ Two Wheeler' : '🚗 Four Wheeler'}
                      </div>
                    </div>
                    <div>
                      <div className="text-green-600 text-sm font-semibold">Model</div>
                      <div className="text-green-900">{selectedService.vehicleModel}</div>
                    </div>
                    <div>
                      <div className="text-green-600 text-sm font-semibold">Number</div>
                      <div className="text-green-900 font-bold">{selectedService.vehicleNumber}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="p-5 bg-purple-50 rounded-xl border-2 border-purple-200">
                <h4 className="text-purple-900 font-bold mb-3 flex items-center">
                  <Wrench className="w-5 h-5 mr-2" />
                  Service Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-purple-600 text-sm font-semibold">Service Type</div>
                    <div className="text-purple-900 font-bold">{selectedService.serviceType}</div>
                  </div>
                  <div>
                    <div className="text-purple-600 text-sm font-semibold">Request Date</div>
                    <div className="text-purple-900">{new Date(selectedService.requestDate).toLocaleDateString('en-NP')}</div>
                  </div>
                  {selectedService.scheduledDate && (
                    <div>
                      <div className="text-purple-600 text-sm font-semibold">Scheduled Date</div>
                      <div className="text-purple-900">{new Date(selectedService.scheduledDate).toLocaleDateString('en-NP')}</div>
                    </div>
                  )}
                  {selectedService.completedDate && (
                    <div>
                      <div className="text-purple-600 text-sm font-semibold">Completed Date</div>
                      <div className="text-purple-900">{new Date(selectedService.completedDate).toLocaleDateString('en-NP')}</div>
                    </div>
                  )}
                  {selectedService.technician && (
                    <div>
                      <div className="text-purple-600 text-sm font-semibold">Technician</div>
                      <div className="text-purple-900 font-bold">{selectedService.technician}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-purple-600 text-sm font-semibold">Estimated Cost</div>
                    <div className="text-purple-900 font-bold">NPR {selectedService.estimatedCost.toLocaleString()}</div>
                  </div>
                  {selectedService.actualCost && (
                    <div>
                      <div className="text-purple-600 text-sm font-semibold">Actual Cost</div>
                      <div className="text-purple-900 font-bold">NPR {selectedService.actualCost.toLocaleString()}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedService.description && (
                <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="text-gray-900 font-bold mb-2">Description</h4>
                  <p className="text-gray-700">{selectedService.description}</p>
                </div>
              )}

              {/* Notes */}
              {selectedService.notes && (
                <div className="p-5 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <h4 className="text-yellow-900 font-bold mb-2">Notes</h4>
                  <p className="text-yellow-800">{selectedService.notes}</p>
                </div>
              )}

              {/* Parts Used */}
              {selectedService.partsUsed && selectedService.partsUsed.length > 0 && (
                <div className="p-5 bg-orange-50 rounded-xl border-2 border-orange-200">
                  <h4 className="text-orange-900 font-bold mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Parts Used
                  </h4>
                  <div className="space-y-2">
                    {selectedService.partsUsed.map((part, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="text-orange-900 font-bold">{part.partName}</div>
                          <div className="text-orange-600 text-sm">Quantity: {part.quantity}</div>
                        </div>
                        <div className="text-orange-900 font-bold">NPR {(part.price * part.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Status Update */}
              <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h4 className="text-blue-900 font-bold mb-3">Quick Status Update</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      updateStatus(selectedService.id, 'pending');
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-bold text-sm"
                  >
                    ⏳ Pending
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(selectedService.id, 'in-progress');
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm"
                  >
                    🔧 In Progress
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(selectedService.id, 'completed');
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm"
                  >
                    ✅ Complete
                  </button>
                  <button
                    onClick={() => {
                      updateStatus(selectedService.id, 'cancelled');
                      setShowDetailsModal(false);
                    }}
                    className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEdit(selectedService);
                    setShowDetailsModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold flex items-center justify-center space-x-2"
                >
                  <Edit className="w-5 h-5" />
                  <span>Edit Service</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};