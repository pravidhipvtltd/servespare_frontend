import React, { useState, useEffect } from 'react';
import {
  Palette, Sun, Moon, Monitor, Check, Download, Upload, RefreshCw,
  Droplet, Zap, Sparkles, Crown, Heart, Star, X, Settings
} from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark' | 'auto';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  fontFamily: string;
  animations: boolean;
  glassmorphism: boolean;
}

const PRESET_THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Serve Spares Pro',
    mode: 'light',
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#111827',
    },
    borderRadius: 'large',
    fontFamily: 'system-ui',
    animations: true,
    glassmorphism: true,
  },
  {
    id: 'dark-mode',
    name: 'Midnight Pro',
    mode: 'dark',
    colors: {
      primary: '#60A5FA',
      secondary: '#A78BFA',
      accent: '#FBBF24',
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F1F5F9',
    },
    borderRadius: 'medium',
    fontFamily: 'system-ui',
    animations: true,
    glassmorphism: true,
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    mode: 'light',
    colors: {
      primary: '#06B6D4',
      secondary: '#0EA5E9',
      accent: '#14B8A6',
      background: '#F0F9FF',
      surface: '#FFFFFF',
      text: '#0C4A6E',
    },
    borderRadius: 'large',
    fontFamily: 'system-ui',
    animations: true,
    glassmorphism: true,
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    mode: 'light',
    colors: {
      primary: '#F97316',
      secondary: '#EC4899',
      accent: '#FBBF24',
      background: '#FFF7ED',
      surface: '#FFFFFF',
      text: '#7C2D12',
    },
    borderRadius: 'large',
    fontFamily: 'system-ui',
    animations: true,
    glassmorphism: true,
  },
  {
    id: 'forest',
    name: 'Forest Green',
    mode: 'light',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#84CC16',
      background: '#F0FDF4',
      surface: '#FFFFFF',
      text: '#064E3B',
    },
    borderRadius: 'medium',
    fontFamily: 'system-ui',
    animations: true,
    glassmorphism: false,
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    mode: 'light',
    colors: {
      primary: '#7C3AED',
      secondary: '#A855F7',
      accent: '#F59E0B',
      background: '#FAF5FF',
      surface: '#FFFFFF',
      text: '#581C87',
    },
    borderRadius: 'large',
    fontFamily: 'system-ui',
    animations: true,
    glassmorphism: true,
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    mode: 'light',
    colors: {
      primary: '#374151',
      secondary: '#6B7280',
      accent: '#111827',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      text: '#1F2937',
    },
    borderRadius: 'small',
    fontFamily: 'system-ui',
    animations: false,
    glassmorphism: false,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    mode: 'dark',
    colors: {
      primary: '#EC4899',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
      background: '#18181B',
      surface: '#27272A',
      text: '#FAFAFA',
    },
    borderRadius: 'small',
    fontFamily: 'system-ui',
    animations: true,
    glassmorphism: true,
  },
];

interface AdvancedThemeCustomizerProps {
  onClose: () => void;
  currentThemeId?: string;
}

export const AdvancedThemeCustomizer: React.FC<AdvancedThemeCustomizerProps> = ({
  onClose,
  currentThemeId = 'default',
}) => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(
    PRESET_THEMES.find(t => t.id === currentThemeId) || PRESET_THEMES[0]
  );
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('custom_theme');
    if (saved) {
      try {
        setCustomTheme(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load custom theme:', error);
      }
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    // Apply theme to document
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);

    // Save to localStorage
    localStorage.setItem('current_theme', theme.id);
    localStorage.setItem('theme_mode', theme.mode);
    
    setSelectedTheme(theme);
  };

  const saveCustomTheme = () => {
    if (customTheme) {
      localStorage.setItem('custom_theme', JSON.stringify(customTheme));
      applyTheme(customTheme);
    }
  };

  const exportTheme = () => {
    const theme = customTheme || selectedTheme;
    const dataStr = JSON.stringify(theme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `theme-${theme.name.toLowerCase().replace(/\s/g, '-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setCustomTheme(imported);
        setIsCustomizing(true);
      } catch (error) {
        alert('Invalid theme file');
      }
    };
    reader.readAsText(file);
  };

  const resetToDefault = () => {
    const defaultTheme = PRESET_THEMES[0];
    applyTheme(defaultTheme);
    setCustomTheme(null);
    setIsCustomizing(false);
    localStorage.removeItem('custom_theme');
  };

  const startCustomizing = () => {
    setCustomTheme({ ...selectedTheme, id: 'custom', name: 'Custom Theme' });
    setIsCustomizing(true);
  };

  const updateCustomColor = (key: keyof Theme['colors'], value: string) => {
    if (!customTheme) return;
    setCustomTheme({
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [key]: value,
      },
    });
  };

  const themeIcons = {
    default: Crown,
    'dark-mode': Moon,
    ocean: Droplet,
    sunset: Sun,
    forest: Zap,
    royal: Sparkles,
    monochrome: Monitor,
    cyberpunk: Star,
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Theme Customizer</h2>
                <p className="text-sm text-white/80">Personalize your workspace</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Preset Themes */}
          {!isCustomizing && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Preset Themes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PRESET_THEMES.map((theme) => {
                    const Icon = themeIcons[theme.id as keyof typeof themeIcons] || Palette;
                    const isActive = selectedTheme.id === theme.id;
                    
                    return (
                      <button
                        key={theme.id}
                        onClick={() => applyTheme(theme)}
                        className={`relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                          isActive 
                            ? 'border-purple-600 shadow-lg shadow-purple-500/30' 
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        style={{ backgroundColor: theme.colors.surface }}
                      >
                        {/* Color Preview */}
                        <div className="flex items-center space-x-2 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg shadow-sm"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <div
                            className="w-8 h-8 rounded-lg shadow-sm"
                            style={{ backgroundColor: theme.colors.secondary }}
                          />
                          <div
                            className="w-8 h-8 rounded-lg shadow-sm"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>

                        {/* Theme Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" style={{ color: theme.colors.text }} />
                            <h4 className="font-semibold" style={{ color: theme.colors.text }}>
                              {theme.name}
                            </h4>
                          </div>
                          {isActive && (
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Mode Badge */}
                        <div className="mt-3">
                          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
                            theme.mode === 'dark' 
                              ? 'bg-gray-800 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {theme.mode === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                            <span className="capitalize">{theme.mode}</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Theme Option */}
              {customTheme && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-6 h-6 text-purple-600" />
                      <h3 className="text-lg font-bold text-gray-900">Your Custom Theme</h3>
                    </div>
                    <button
                      onClick={() => {
                        applyTheme(customTheme);
                        setIsCustomizing(true);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Edit Custom Theme
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {Object.values(customTheme.colors).slice(0, 6).map((color, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 rounded-lg shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={startCustomizing}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all"
                >
                  <Settings className="w-5 h-5" />
                  <span>Create Custom Theme</span>
                </button>
                
                <label className="flex items-center space-x-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-xl hover:border-purple-600 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5" />
                  <span>Import</span>
                  <input type="file" accept=".json" onChange={importTheme} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Custom Theme Editor */}
          {isCustomizing && customTheme && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Customize Theme</h3>
                <button
                  onClick={() => setIsCustomizing(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Back to Presets
                </button>
              </div>

              {/* Theme Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Theme Name
                </label>
                <input
                  type="text"
                  value={customTheme.name}
                  onChange={(e) => setCustomTheme({ ...customTheme, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Color Customization */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  Colors
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(customTheme.colors).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-600 mb-2 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateCustomColor(key as keyof Theme['colors'], e.target.value)}
                          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateCustomColor(key as keyof Theme['colors'], e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Display Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'auto'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCustomTheme({ ...customTheme, mode: mode as Theme['mode'] })}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        customTheme.mode === mode
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      {mode === 'light' && <Sun className="w-5 h-5" />}
                      {mode === 'dark' && <Moon className="w-5 h-5" />}
                      {mode === 'auto' && <Monitor className="w-5 h-5" />}
                      <span className="capitalize">{mode}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Border Radius
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['none', 'small', 'medium', 'large', 'full'].map((radius) => (
                    <button
                      key={radius}
                      onClick={() => setCustomTheme({ ...customTheme, borderRadius: radius as Theme['borderRadius'] })}
                      className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                        customTheme.borderRadius === radius
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      {radius}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="font-semibold text-gray-900">Enable Animations</span>
                  <input
                    type="checkbox"
                    checked={customTheme.animations}
                    onChange={(e) => setCustomTheme({ ...customTheme, animations: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="font-semibold text-gray-900">Glassmorphism Effects</span>
                  <input
                    type="checkbox"
                    checked={customTheme.glassmorphism}
                    onChange={(e) => setCustomTheme({ ...customTheme, glassmorphism: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>

              {/* Preview */}
              <div className="border-2 border-gray-200 rounded-2xl p-6" style={{ backgroundColor: customTheme.colors.background }}>
                <h4 className="text-sm font-semibold mb-4" style={{ color: customTheme.colors.text }}>
                  Theme Preview
                </h4>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl shadow-sm" style={{ backgroundColor: customTheme.colors.surface }}>
                    <p className="text-sm" style={{ color: customTheme.colors.text }}>Surface color with text</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: customTheme.colors.primary }}>
                      Primary
                    </button>
                    <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: customTheme.colors.secondary }}>
                      Secondary
                    </button>
                    <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: customTheme.colors.accent }}>
                      Accent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isCustomizing && (
                <>
                  <button
                    onClick={exportTheme}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  
                  <button
                    onClick={resetToDefault}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {isCustomizing && (
                <button
                  onClick={() => {
                    saveCustomTheme();
                    onClose();
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors shadow-lg"
                >
                  Apply Theme
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
