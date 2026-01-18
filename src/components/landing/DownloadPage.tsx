import React from 'react';
import { Download, Monitor, Smartphone, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLandingLanguage } from '../../contexts/LandingLanguageContext';

export const DownloadPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLandingLanguage();

  const downloads = [
    {
      platform: 'Windows',
      icon: '🪟',
      size: '~120 MB',
      requirements: 'Windows 10 or later',
      downloadUrl: '/downloads/serve-spares-setup.exe',
    },
    {
      platform: 'macOS',
      icon: '🍎',
      size: '~130 MB',
      requirements: 'macOS 10.15 or later',
      downloadUrl: '/downloads/serve-spares.dmg',
    },
    {
      platform: 'Linux',
      icon: '🐧',
      size: '~125 MB',
      requirements: 'Ubuntu 20.04+ / Debian 10+',
      downloadUrl: '/downloads/serve-spares.AppImage',
    },
  ];

  const features = [
    'Work completely offline',
    'Auto-sync when online',
    'Faster performance',
    'Native notifications',
    'System tray integration',
    'Automatic updates',
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 pt-24">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border-2 border-indigo-200">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Registration Required</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            You must register online before downloading the desktop app. This ensures your account is properly set up and ready to sync.
          </p>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After registration, you can download the desktop app for Windows, macOS, or Linux and work completely offline!
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Please use the navigation menu above to go to Login or Register
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full mb-6 shadow-lg">
            <Monitor className="w-5 h-5" />
            <span className="font-semibold">Desktop Application</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Download Serve Spares
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Work offline, sync when online. The desktop app gives you full control even without an internet connection.
          </p>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Logged in as: {currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Ready to download</span>
            </div>
          </div>
        </div>

        {/* Download Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {downloads.map((download) => (
            <div
              key={download.platform}
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-indigo-500 hover:shadow-2xl transition-all group"
            >
              <div className="text-5xl mb-4">{download.icon}</div>
              
              <h3 className="text-2xl font-bold mb-2 text-gray-900">{download.platform}</h3>
              
              <div className="space-y-2 mb-6 text-sm text-gray-600">
                <div>Size: <span className="font-semibold">{download.size}</span></div>
                <div>{download.requirements}</div>
              </div>

              <a
                href={download.downloadUrl}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all font-semibold hover:shadow-lg hover:scale-105"
              >
                <Download className="w-5 h-5" />
                <span>Download</span>
              </a>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg mb-16">
          <h3 className="text-3xl font-bold mb-6 text-gray-900">Desktop App Features</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center text-gray-900">Installation Instructions</h3>
          
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-lg">
                  1
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-gray-900 text-lg">Download the installer</h4>
                  <p className="text-gray-600 text-sm">
                    Click the download button for your operating system above.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-lg">
                  2
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-gray-900 text-lg">Run the installer</h4>
                  <p className="text-gray-600 text-sm">
                    Open the downloaded file and follow the installation wizard.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-lg">
                  3
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-gray-900 text-lg">Login with your credentials</h4>
                  <p className="text-gray-600 text-sm">
                    Use the same email and password you registered with online.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200 shadow-md hover:shadow-lg transition-all">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-lg">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold mb-2 text-green-900 text-lg">Start working offline!</h4>
                  <p className="text-green-700 text-sm">
                    Your data will automatically sync when you connect to the internet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Need help with installation?</p>
          <button className="text-indigo-600 hover:text-indigo-700 underline font-semibold">
            View Installation Guide
          </button>
          <span className="mx-3 text-gray-400">|</span>
          <button className="text-indigo-600 hover:text-indigo-700 underline font-semibold">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};