import React, { useState, useEffect } from 'react';
import { 
  Keyboard, Command, Plus, X, Check, AlertCircle, Search, 
  Download, Upload, RefreshCw, Zap, Settings, Star
} from 'lucide-react';

interface Shortcut {
  id: string;
  name: string;
  description: string;
  category: string;
  keys: string[];
  action: string;
  customizable: boolean;
  enabled: boolean;
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  // Navigation
  { id: 'cmd-k', name: 'Command Palette', description: 'Open quick search and navigation', category: 'Navigation', keys: ['Cmd', 'K'], action: 'open-command-palette', customizable: true, enabled: true },
  { id: 'cmd-h', name: 'Toggle Sidebar', description: 'Show/hide navigation sidebar', category: 'Navigation', keys: ['Cmd', 'H'], action: 'toggle-sidebar', customizable: true, enabled: true },
  { id: 'cmd-b', name: 'Toggle Breadcrumbs', description: 'Show/hide breadcrumb navigation', category: 'Navigation', keys: ['Cmd', 'B'], action: 'toggle-breadcrumbs', customizable: true, enabled: true },
  
  // Actions
  { id: 'cmd-n', name: 'New Bill', description: 'Create a new bill', category: 'Actions', keys: ['Cmd', 'N'], action: 'new-bill', customizable: true, enabled: true },
  { id: 'cmd-i', name: 'Add Inventory', description: 'Add new inventory item', category: 'Actions', keys: ['Cmd', 'I'], action: 'add-inventory', customizable: true, enabled: true },
  { id: 'cmd-p', name: 'Add Party', description: 'Add new customer/supplier', category: 'Actions', keys: ['Cmd', 'P'], action: 'add-party', customizable: true, enabled: true },
  { id: 'cmd-o', name: 'Create Order', description: 'Create purchase order', category: 'Actions', keys: ['Cmd', 'O'], action: 'create-order', customizable: true, enabled: true },
  
  // Search & Filter
  { id: 'cmd-f', name: 'Search', description: 'Search in current panel', category: 'Search', keys: ['Cmd', 'F'], action: 'search', customizable: false, enabled: true },
  { id: 'cmd-shift-f', name: 'Global Search', description: 'Search across all data', category: 'Search', keys: ['Cmd', 'Shift', 'F'], action: 'global-search', customizable: true, enabled: true },
  { id: 'cmd-e', name: 'Filter', description: 'Open filter options', category: 'Search', keys: ['Cmd', 'E'], action: 'filter', customizable: true, enabled: true },
  
  // View
  { id: 'cmd-1', name: 'Dashboard', description: 'Go to dashboard', category: 'View', keys: ['Cmd', '1'], action: 'view-dashboard', customizable: true, enabled: true },
  { id: 'cmd-2', name: 'Inventory', description: 'Go to inventory', category: 'View', keys: ['Cmd', '2'], action: 'view-inventory', customizable: true, enabled: true },
  { id: 'cmd-3', name: 'Bills', description: 'Go to bills', category: 'View', keys: ['Cmd', '3'], action: 'view-bills', customizable: true, enabled: true },
  { id: 'cmd-4', name: 'Reports', description: 'Go to reports', category: 'View', keys: ['Cmd', '4'], action: 'view-reports', customizable: true, enabled: true },
  
  // Data Management
  { id: 'cmd-s', name: 'Save', description: 'Save current changes', category: 'Data', keys: ['Cmd', 'S'], action: 'save', customizable: false, enabled: true },
  { id: 'cmd-z', name: 'Undo', description: 'Undo last action', category: 'Data', keys: ['Cmd', 'Z'], action: 'undo', customizable: false, enabled: true },
  { id: 'cmd-shift-z', name: 'Redo', description: 'Redo last action', category: 'Data', keys: ['Cmd', 'Shift', 'Z'], action: 'redo', customizable: false, enabled: true },
  { id: 'cmd-d', name: 'Export', description: 'Export current data', category: 'Data', keys: ['Cmd', 'D'], action: 'export', customizable: true, enabled: true },
  
  // System
  { id: 'cmd-comma', name: 'Settings', description: 'Open settings', category: 'System', keys: ['Cmd', ','], action: 'settings', customizable: false, enabled: true },
  { id: 'cmd-shift-p', name: 'Theme', description: 'Change theme', category: 'System', keys: ['Cmd', 'Shift', 'P'], action: 'theme', customizable: true, enabled: true },
  { id: 'cmd-r', name: 'Refresh', description: 'Refresh current view', category: 'System', keys: ['Cmd', 'R'], action: 'refresh', customizable: true, enabled: true },
  
  // Help
  { id: 'cmd-slash', name: 'Keyboard Shortcuts', description: 'View all shortcuts', category: 'Help', keys: ['Cmd', '/'], action: 'show-shortcuts', customizable: false, enabled: true },
  { id: 'shift-question', name: 'Help', description: 'Show help documentation', category: 'Help', keys: ['Shift', '?'], action: 'help', customizable: true, enabled: true },
];

interface KeyboardShortcutManagerProps {
  onClose: () => void;
  onShortcutTrigger?: (action: string) => void;
}

export const KeyboardShortcutManager: React.FC<KeyboardShortcutManagerProps> = ({
  onClose,
  onShortcutTrigger,
}) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(DEFAULT_SHORTCUTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [recordingKeys, setRecordingKeys] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const categories = ['all', ...Array.from(new Set(shortcuts.map(s => s.category)))];

  useEffect(() => {
    const saved = localStorage.getItem('keyboard_shortcuts');
    if (saved) {
      try {
        setShortcuts(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load shortcuts:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const keys: string[] = [];
      if (e.ctrlKey || e.metaKey) keys.push('Cmd');
      if (e.shiftKey) keys.push('Shift');
      if (e.altKey) keys.push('Alt');
      
      const key = e.key.toUpperCase();
      if (key !== 'CONTROL' && key !== 'SHIFT' && key !== 'ALT' && key !== 'META') {
        keys.push(key);
      }

      if (keys.length > 0 && keys[keys.length - 1] !== 'Cmd' && keys[keys.length - 1] !== 'Shift' && keys[keys.length - 1] !== 'Alt') {
        setRecordingKeys(keys);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording]);

  const saveShortcuts = (updated: Shortcut[]) => {
    localStorage.setItem('keyboard_shortcuts', JSON.stringify(updated));
    setShortcuts(updated);
  };

  const startRecording = (shortcutId: string) => {
    setEditingShortcut(shortcutId);
    setIsRecording(true);
    setRecordingKeys([]);
  };

  const saveRecording = () => {
    if (!editingShortcut || recordingKeys.length === 0) return;

    const updated = shortcuts.map(s =>
      s.id === editingShortcut ? { ...s, keys: recordingKeys } : s
    );
    saveShortcuts(updated);
    
    setIsRecording(false);
    setEditingShortcut(null);
    setRecordingKeys([]);
  };

  const cancelRecording = () => {
    setIsRecording(false);
    setEditingShortcut(null);
    setRecordingKeys([]);
  };

  const toggleShortcut = (shortcutId: string) => {
    const updated = shortcuts.map(s =>
      s.id === shortcutId ? { ...s, enabled: !s.enabled } : s
    );
    saveShortcuts(updated);
  };

  const resetToDefaults = () => {
    if (confirm('Reset all shortcuts to defaults? This cannot be undone.')) {
      saveShortcuts(DEFAULT_SHORTCUTS);
    }
  };

  const exportShortcuts = () => {
    const dataStr = JSON.stringify(shortcuts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'keyboard-shortcuts.json');
    linkElement.click();
  };

  const importShortcuts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        saveShortcuts(imported);
      } catch (error) {
        alert('Invalid shortcuts file');
      }
    };
    reader.readAsText(file);
  };

  const filteredShortcuts = shortcuts.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.keys.join('+').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderKeys = (keys: string[]) => {
    return (
      <div className="flex items-center space-x-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-semibold text-gray-700 shadow-sm">
              {key}
            </kbd>
            {index < keys.length - 1 && <span className="text-gray-400">+</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Keyboard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
                <p className="text-sm text-white/80">Customize your workflow shortcuts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-gray-200 p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredShortcuts.length} shortcut{filteredShortcuts.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportShortcuts}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <label className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm">
                <Upload className="w-4 h-4" />
                <span>Import</span>
                <input type="file" accept=".json" onChange={importShortcuts} className="hidden" />
              </label>
              
              <button
                onClick={resetToDefaults}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isRecording && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center animate-pulse">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">Recording Shortcut</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Press your desired key combination now...
                  </p>
                  {recordingKeys.length > 0 && (
                    <div className="mb-4">
                      {renderKeys(recordingKeys)}
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveRecording}
                      disabled={recordingKeys.length === 0}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={cancelRecording}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {filteredShortcuts.map(shortcut => (
              <div
                key={shortcut.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  shortcut.enabled
                    ? 'border-gray-200 hover:border-purple-300 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{shortcut.name}</h4>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                        {shortcut.category}
                      </span>
                      {!shortcut.customizable && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{shortcut.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-4">
                    {renderKeys(shortcut.keys)}
                    
                    {shortcut.customizable && (
                      <button
                        onClick={() => startRecording(shortcut.id)}
                        disabled={isRecording}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Customize"
                      >
                        <Settings className="w-4 h-4 text-purple-600" />
                      </button>
                    )}
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shortcut.enabled}
                        onChange={() => toggleShortcut(shortcut.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No shortcuts found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>Cmd = Ctrl on Windows/Linux</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
