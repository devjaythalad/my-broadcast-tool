'use client';

import { useState } from 'react';
import { Copy, Send, CheckCircle, AlertCircle, Radio, Eye, EyeOff } from 'lucide-react';

interface HistoryItem {
  title: string;
  message: string;
  url: string;
  time: string;
  success: boolean;
}

export default function Home() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [goRoute, setGoRoute] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [environment, setEnvironment] = useState<'test' | 'prod'>('test');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const urls = {
    test: 'https://lvatest.livinginsider.com/v1/notifications/broadcast_all_device',
    prod: 'https://lva.livinginsider.com/v1/notifications/broadcast_all_device'
  };

  const sendBroadcast = async () => {
    if (!apiKey.trim()) {
      alert('กรุณาใส่ x-api-key');
      return;
    }

    setLoading(true);
    setResult(null);

    const payload = { title, message, go_route: goRoute, group: 0 };
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, apiKey, url: urls[environment] }),
      });

      const data = await res.json();
      setResult(data);

      const newItem: HistoryItem = {
        title,
        message,
        url: urls[environment],
        time: new Date().toLocaleTimeString('th-TH'),
        success: data.alert?.type === 'success'
      };
      setHistory(prev => [newItem, ...prev.slice(0, 9)]);
    } catch (error) {
      setResult({ alert: { type: 'error', title: 'Error', description: 'ส่งไม่สำเร็จ' } });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('คัดลอกเรียบร้อย!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-700 mb-2">
            Broadcast Tool
          </h1>
          <p className="text-gray-600">ส่งแจ้งเตือนไปยังผู้ใช้ทั้งหมด</p>
        </div>

        <div className="grid md:grid-cols-1 gap-6">
          {/* Main Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Environment Toggle */}
            <div className="flex items-center justify-center gap-8 mb-8 p-4 bg-gray-50 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="env"
                  checked={environment === 'test'}
                  onChange={() => setEnvironment('test')}
                  className="sr-only"
                />
                <Radio
                  size={20}
                  className={`transition ${environment === 'test' ? 'text-blue-600 fill-blue-600' : 'text-gray-400'}`}
                />
                <span className={`font-medium ${environment === 'test' ? 'text-blue-600' : 'text-gray-500'}`}>
                  Test (lvatest)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="env"
                  checked={environment === 'prod'}
                  onChange={() => setEnvironment('prod')}
                  className="sr-only"
                />
                <Radio
                  size={20}
                  className={`transition ${environment === 'prod' ? 'text-red-600 fill-red-600' : 'text-gray-400'}`}
                />
                <span className={`font-medium ${environment === 'prod' ? 'text-red-600' : 'text-gray-500'}`}>
                  Prod (lva)
                </span>
              </label>
            </div>

            {/* API Key */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                x-api-key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  placeholder="ใส่ API Key ของคุณ"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-4 pr-24 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition text-lg text-gray-900 placeholder:text-gray-400"
                />

                {/* Copy Button */}
                {apiKey && (
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                    title="คัดลอก"
                  >
                    <Copy size={20} />
                  </button>
                )}

                {/* Show/Hide Button */}
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  title={showApiKey ? "ซ่อน" : "แสดง"}
                >
                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="LIVE NOW! “ซื้อบ้านตอนนี้...”"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none transition text-lg text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Message</label>
                <textarea
                  placeholder="เคล็ดลับเลือกบ้าน–คอนโด..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none transition text-lg text-gray-900 placeholder:text-gray-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Go Route</label>
                <input
                  type="text"
                  placeholder="home หรือ URL"
                  value={goRoute}
                  onChange={(e) => setGoRoute(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none transition text-lg text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={sendBroadcast}
              disabled={loading || !title || !message || !apiKey}
              className={`mt-8 w-full py-5 rounded-xl font-bold text-white text-xl transition flex items-center justify-center gap-3 ${
                loading || !title || !message || !apiKey
                  ? 'bg-gray-400 cursor-not-allowed'
                  : environment === 'test'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? (
                <>กำลังส่ง...</>
              ) : (
                <>
                  <Send size={24} />
                  ส่งไป {environment === 'test' ? 'Test' : 'Production'}
                </>
              )}
            </button>

            {/* Result */}
            {result && (
              <div
                className={`mt-6 p-5 rounded-xl flex items-start gap-3 ${
                  result.alert?.type === 'success' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                {result.alert?.type === 'success' ? (
                  <CheckCircle className="text-green-600 mt-0.5" size={22} />
                ) : (
                  <AlertCircle className="text-red-600 mt-0.5" size={22} />
                )}
                <div>
                  <p className="font-bold text-lg">{result.alert?.title}</p>
                  <p className="text-gray-700">{result.alert?.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    URL: <code className="bg-gray-200 px-2 py-1 rounded">{urls[environment]}</code>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">ประวัติการส่ง (10 รายการล่าสุด)</h3>
              <div className="space-y-3">
                {history.map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border-2 ${
                      item.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{item.title}</p>
                        <p className="text-gray-700">{item.message}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.url}</p>
                      </div>
                      <span className="text-xs text-gray-500 ml-4">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
