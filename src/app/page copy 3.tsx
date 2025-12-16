'use client';

import { useState } from 'react';
import { Radio, Mail, Bell } from 'lucide-react';
import BroadcastTool from './components/BroadcastTool';
import FcmNotification from './components/FcmNotification';
import BulkSendMail from './components/BulkSendMail';

type TabType = 'broadcast' | 'email' | 'fcm';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('broadcast');

  const tabs = [
    { id: 'broadcast' as TabType, label: 'Broadcast Tool', icon: Radio },
    { id: 'email' as TabType, label: 'Bulk Send Mail', icon: Mail },
    { id: 'fcm' as TabType, label: 'FCM Notification', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Broadcast
            </h1>

            {/* Tabs */}
            <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon size={19} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {activeTab === 'broadcast' && <BroadcastTool />}
          {activeTab === 'email' && <BulkSendMail />}
          {activeTab === 'fcm' && <FcmNotification />}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-500">
        LivingInsider • Admin Center
      </footer>
    </div>
  );
}