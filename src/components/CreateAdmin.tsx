import React, { useState } from 'react';
import { X, UserPlus, Building2 } from 'lucide-react';
import { getFromStorage, saveToStorage } from '../utils/mockData';
import { User, Workspace } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CreateAdminProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAdmin: React.FC<CreateAdminProps> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    workspaceName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate
    const users: User[] = getFromStorage('users', []);
    if (users.some(u => u.email === formData.email)) {
      setError('Email already exists');
      setIsLoading(false);
      return;
    }

    // Create workspace
    const workspaceId = `ws${Date.now()}`;
    const newWorkspace: Workspace = {
      id: workspaceId,
      name: formData.workspaceName,
      adminId: `user${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Create admin user
    const newAdmin: User = {
      id: `user${Date.now()}`,
      email: formData.email,
      password: formData.password,
      role: 'admin',
      name: formData.name,
      workspaceId: workspaceId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id,
    };

    // Save to storage
    const workspaces: Workspace[] = getFromStorage('workspaces', []);
    saveToStorage('workspaces', [...workspaces, newWorkspace]);
    saveToStorage('users', [...users, newAdmin]);

    setIsLoading(false);
    onSuccess();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900 text-xl">Create New Admin</h2>
            <p className="text-gray-600 text-sm">Add a new administrator with workspace</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Admin Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="john@autoparts.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Minimum 6 characters"
              required
              minLength={6}
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-900">Workspace Details</span>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Workspace Name *</label>
              <input
                type="text"
                name="workspaceName"
                value={formData.workspaceName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., East Branch, Downtown Store"
                required
              />
              <p className="text-gray-500 text-sm mt-2">
                A new workspace will be created and assigned to this admin
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Admin & Workspace'}
          </button>
        </div>
      </form>
    </div>
  );
};
