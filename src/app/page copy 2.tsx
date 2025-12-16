'use client';

import { useState } from 'react';
import { Radio, Mail, Bell, Sparkles, Zap, Send } from 'lucide-react';
import BroadcastTool from './components/BroadcastTool';
import FcmNotification from './components/FcmNotification';
import BulkSendMail from './components/BulkSendMail';

type TabType = 'broadcast' | 'email' | 'fcm';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('broadcast');

  const tabs = [
    { id: 'broadcast' as TabType, label: 'Broadcast Tool', icon: Radio, color: 'from-purple-500 to-pink-500' },
    { id: 'email' as TabType, label: 'Bulk Send Mail', icon: Mail, color: 'from-emerald-500 to-teal-500' },
    { id: 'fcm' as TabType, label: 'FCM Notification', icon: Bell, color: 'from-blue-500 to-indigo-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/30 via-transparent to-blue-800/30 animate-pulse" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-bounce" />
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-ping" />
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-black/40 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              Admin Broadcast Center
            </h1>
            <p className="mt-4 text-xl text-gray-300 flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-yellow-400" />
              ส่งข้อความ · อีเมล · แจ้งเตือน · ได้ในคลิกเดียว
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-6 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 ${
                    isActive
                      ? 'text-white shadow-2xl ring-4 ring-white/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${tab.color})` : 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {/* Glow Effect */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl -z-10 animate-pulse" />
                  )}

                  <div className="flex items-center gap-4">
                    <Icon className={`w-8 h-8 transition-all ${isActive ? 'drop-shadow-glow' : ''}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-white rounded-full shadow-lg" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
          {/* แสดง Component ตาม Tab */}
          {activeTab === 'broadcast' && <BroadcastTool />}
          {activeTab === 'email' && <BulkSendMail />}
          {activeTab === 'fcm' && <FcmNotification />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-gray-400 text-sm">
        <p>LivingInsider Admin Center • Powered by JAYTHALAD</p>
      </footer>
    </div>
  );
}