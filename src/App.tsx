import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { MaskConfig } from './components/MaskConfig';
import { PTZControl } from './components/PTZControl';
import { ViolationArchive } from './components/ViolationArchive';
import { 
  LayoutDashboard, 
  Settings, 
  Camera, 
  Archive 
} from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mask' | 'ptz' | 'archive'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                سیستم نظارت هوشمند ترافیک
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                مدیریت دوربین‌های PTZ و ثبت تخلفات
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700">سیستم فعال</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>داشبورد</span>
            </button>
            <button
              onClick={() => setActiveTab('mask')}
              className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                activeTab === 'mask'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>تنظیمات ماسک‌ها</span>
            </button>
            <button
              onClick={() => setActiveTab('ptz')}
              className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                activeTab === 'ptz'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>کنترل PTZ</span>
            </button>
            <button
              onClick={() => setActiveTab('archive')}
              className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                activeTab === 'archive'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Archive className="w-5 h-5" />
              <span>آرشیو تخلفات</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'mask' && <MaskConfig />}
        {activeTab === 'ptz' && <PTZControl />}
        {activeTab === 'archive' && <ViolationArchive />}
      </main>
    </div>
  );
}

export default App;
