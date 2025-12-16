'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Copy, Send, CheckCircle, AlertCircle, Upload, Bell, Users, 
  Loader2, Sparkles, PauseCircle, XCircle 
} from 'lucide-react';

export default function FcmNotification() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userIds, setUserIds] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [type, setType] = useState('20');
  const [webPhoto, setWebPhoto] = useState('');
  const [url, setUrl] = useState('');
  const [setValue, setSetValue] = useState('');
  const [environment, setEnvironment] = useState<'test' | 'prod'>('test');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // เพิ่มแค่ 3 ตัวนี้
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<any>(null);
  const [polling, setPolling] = useState(false);

  const baseUrl = environment === 'test' 
    ? 'https://lvatest.livinginsider.com' 
    : 'https://lva.livinginsider.com';

  const userCount = useMemo(() => {
    if (!userIds.trim()) return 0;
    const ids = userIds
      .split(',')
      .flatMap(part => part.split('\n'))
      .map(id => id.trim())
      .filter(id => id && !isNaN(Number(id)));
    return ids.length;
  }, [userIds]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const cleanText = text
        .replace(/\r\n/g, ',')
        .replace(/\n/g, ',')
        .replace(/\s+/g, '')
        .replace(/,+/g, ',');
      setUserIds(cleanText.replace(/^,|,$/g, ''));
    };
    reader.readAsText(file);
  };

  // Polling สถานะ task
  useEffect(() => {
    if (!taskId || !polling) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${baseUrl}/v1/notifications/task/${taskId}`);
        if (!res.ok) return;
        const data = await res.json();
        setTaskStatus(data.data);

        if (['completed', 'cancelled', 'failed'].includes(data.data.status)) {
          setPolling(false);
          setLoading(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, polling, baseUrl]);

  const sendNotification = async () => {
    if (!apiKey.trim()) return alert('กรุณาใส่ x-api-key');
    if (!title.trim()) return alert('กรุณาใส่ Title');
    if (!message.trim()) return alert('กรุณาใส่ Message');
    if (userCount === 0) return alert('กรุณาใส่ User ID ที่ถูกต้อง');

    // ✅ เพิ่ม Confirm Dialog สุดเข้ม!
  const confirmText = environment === 'prod' 
    ? `⚠️ PRODUCTION MODE ⚠️\n\n` 
    : `TEST MODE\n\n`;

  if (!confirm(
    `${confirmText}` +
    `คุณกำลังจะส่งแจ้งเตือนไปยัง ${userCount.toLocaleString()} คน\n\n` +
    `Title: ${title.trim()}\n` +
    `Message: ${message.trim()}\n\n` +
    `แน่ใจหรือไม่ว่าจะส่งจริง ๆ?`
  )) {
    return; // ถ้ากด Cancel → หยุดเลย
  }

    setLoading(true);
    setResult(null);
    setTaskId(null);
    setTaskStatus(null);

    const userIdList = userIds
      .split('\n')
      .flatMap(line => line.split(','))
      .map(id => id.trim())
      .filter(id => id && !isNaN(Number(id)))
      .map(Number);

    try {
      const payload = {
        user_ids: userIdList,
        title: title.trim(),
        message: message.trim(),
        type: Number(type) || 20,
        web_photo: webPhoto.trim(),
        url: url.trim(),
        set: setValue.trim(),
      };

      const res = await fetch(`${baseUrl}/v1/notifications/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.data?.taskId) {
        setTaskId(data.data.taskId);
        setPolling(true);
        setResult({
          alert: {
            type: 'success',
            title: 'เริ่มส่งแล้ว!',
            description: `Task ID: ${data.data.taskId}\nกำลังดำเนินการในพื้นหลัง...`
          }
        });
      } else {
        setResult(data);
        setLoading(false);
      }
    } catch (error) {
      setResult({
        alert: { type: 'error', title: 'ส่งไม่สำเร็จ', description: 'เชื่อมต่อ backend ไม่ได้' }
      });
      setLoading(false);
    }
  };

  const cancelTask = async () => {
    if (!taskId) return;
    if (!confirm('หยุดการส่งแจ้งเตือนทันทีหรือไม่?')) return;

    try {
      await fetch(`${baseUrl}/v1/notifications/task/${taskId}/cancel`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey },
      });
      alert('คำสั่งหยุดถูกส่งแล้ว');
      setPolling(false);
    } catch (err) {
      alert('หยุดไม่สำเร็จ');
    }
  };

  const savedPercent = taskStatus?.totalUsers > 0 
    ? Math.round((taskStatus.savedNotifications || 0) / taskStatus.totalUsers * 100) 
    : 0;
  const fcmPercent = taskStatus?.totalUsers > 0 
    ? Math.round(((taskStatus.fcmSuccess || 0) / taskStatus.totalUsers) * 100) 
    : 0;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Bell className="w-12 h-12 text-indigo-600" />
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FCM Notification
              </h1>
              <Sparkles className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-lg text-gray-700 font-medium">ส่ง Push Notification ไปยังผู้ใช้ที่เลือก</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* Environment Toggle */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
              <div className="flex justify-center items-center gap-10">
                <button
                  onClick={() => setEnvironment('test')}
                  className={`relative px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg ${
                    environment === 'test'
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'bg-white text-gray-600 border-2 border-gray-300'
                  }`}
                >
                  TEST
                  {environment === 'test' && (
                    <span className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full animate-pulse font-bold">
                      ACTIVE
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (environment === 'prod') return;
                    if (confirm('คุณกำลังจะสลับไป PRODUCTION\n\nแน่ใจหรือไม่?')) {
                      setEnvironment('prod');
                    }
                  }}
                  className={`relative px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg ${
                    environment === 'prod'
                      ? 'bg-red-600 text-white ring-4 ring-red-200'
                      : 'bg-white text-gray-600 border-2 border-gray-300'
                  }`}
                >
                  PRODUCTION
                  {environment === 'prod' && (
                    <span className="absolute -top-3 -right-3 bg-red-700 text-white text-xs px-3 py-1.5 rounded-full animate-pulse font-bold">
                      LIVE
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">

              {/* ทุกอย่างเหมือนเดิมเป๊ะ ๆ */}
              {/* API Key */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">x-api-key</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="วาง API Key ของคุณที่นี่"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-6 py-5 text-lg font-mono bg-gray-50 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-gray-900 placeholder:text-gray-500"
                  />
                  {apiKey && (
                    <button
                      onClick={() => navigator.clipboard.writeText(apiKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl hover:bg-indigo-100 transition"
                    >
                      <Copy className="w-6 h-6 text-indigo-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">Title</label>
                <input
                  type="text"
                  placeholder="เช่น: มีคนสนใจโครงการของคุณ!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-6 py-5 text-lg rounded-2xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-lg font-bold text-gray-800 mb-3">Message</label>
                <textarea
                  placeholder="เช่น: คลิกเพื่อดูรายละเอียดเลย"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-6 py-5 text-lg rounded-2xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all resize-none text-gray-900 placeholder:text-gray-500"
                />
              </div>

              {/* ข้อมูลเพิ่มเติม */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6">ข้อมูลเพิ่มเติม (แจ้งเตือนแบบมีรูป + ลิงก์)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">Type</label>
                    <input type="number" placeholder="20" value={type} onChange={(e) => setType(e.target.value)} className="w-full px-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-base font-bold text-gray-700 mb-2">Set</label>
                    <input type="text" placeholder="เช่น O3SSb_3" value={setValue} onChange={(e) => setSetValue(e.target.value)} className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 text-gray-900 placeholder:text-gray-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-bold text-gray-700 mb-2">Web Photo URL</label>
                    <input type="text" placeholder="https://test.livinginsider.com/upload/..." value={webPhoto} onChange={(e) => setWebPhoto(e.target.value)} className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-100 text-gray-900 placeholder:text-gray-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-bold text-gray-700 mb-2">URL (ลิงก์เมื่อกดแจ้งเตือน)</label>
                    <input type="text" placeholder="https://test.livinginsider.com/promotion.php?..." value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-100 text-gray-900 placeholder:text-gray-500" />
                  </div>
                </div>
              </div>

              {/* User IDs */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-lg font-bold text-gray-800">
                    User IDs <span className="text-base font-normal text-gray-500">(คั่นด้วย comma หรือขึ้นบรรทัดใหม่)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-indigo-600" />
                    <span className="text-3xl font-bold text-indigo-600">{userCount.toLocaleString()}</span>
                    <span className="text-xl text-gray-700">คน</span>
                  </div>
                </div>
                <textarea
                  placeholder="223, 442, 334, 111, 999, 12345"
                  value={userIds}
                  onChange={(e) => setUserIds(e.target.value)}
                  rows={5}
                  className="w-full px-6 py-5 font-mono text-base bg-gray-50 rounded-2xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all resize-none text-gray-900 placeholder:text-gray-600"
                />
                {/* <div className="mt-4">
                  <label className="inline-flex items-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl cursor-pointer transition-all shadow-lg">
                    <Upload className="w-6 h-6" />
                    <span>อัปโหลดไฟล์ .txt</span>
                    <input type="file" accept=".txt,text/plain" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div> */}
              </div>

              {/* Send Button */}
              <button
                onClick={sendNotification}
                disabled={loading || !title || !message || userCount === 0 || !apiKey}
                className={`w-full py-6 rounded-2xl font-black text-2xl transition-all flex items-center justify-center gap-4 shadow-2xl transform hover:scale-105 active:scale-95 ${
                  loading || !title || !message || userCount === 0 || !apiKey
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : environment === 'test'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <span>กำลังส่งให้ {userCount.toLocaleString()} คน...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-10 h-10" />
                    <span>ส่ง Notification ทันที!</span>
                  </>
                )}
              </button>

              {/* Result เดิม */}
              {result && !taskId && (
                <div className={`p-8 rounded-2xl border-4 ${result.alert?.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                  <div className="flex items-start gap-5">
                    {result.alert?.type === 'success' ? (
                      <CheckCircle className="w-16 h-16 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-16 h-16 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{result.alert?.title || 'ผลลัพธ์'}</h3>
                      <p className="text-lg mt-2 text-gray-700 whitespace-pre-wrap">
                        {result.alert?.description || JSON.stringify(result.data || result, null, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Modal สวยกำลังดี (ตามที่คุณชอบ) */}
        {taskId && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-3xl p-10 max-w-3xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-5xl font-black text-indigo-600">กำลังส่งแจ้งเตือน</h2>
                <button onClick={() => { setTaskId(null); setPolling(false); }} className="text-gray-400 hover:text-red-600 transition">
                  <XCircle className="w-12 h-12" />
                </button>
              </div>

              {taskStatus ? (
                <>
                  <div className="text-center mb-10">
                    <p className="text-2xl text-gray-600 mb-4">Task ID: <span className="font-mono text-indigo-700 text-3xl">{taskStatus.taskId}</span></p>
                    <p className={`text-6xl font-black ${
                      taskStatus.status === 'running' ? 'text-orange-600' :
                      taskStatus.status === 'completed' ? 'text-green-600' :
                      taskStatus.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {taskStatus.status === 'running' && 'กำลังทำงาน...'}
                      {taskStatus.status === 'completed' && 'ส่งเสร็จแล้ว!'}
                      {taskStatus.status === 'cancelled' && 'ถูกยกเลิก'}
                      {taskStatus.status === 'failed' && 'เกิดข้อผิดพลาด'}
                    </p>
                  </div>

                  <div className="space-y-10 mt-12">
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-2xl font-bold text-gray-800">บันทึกฐานข้อมูล</span>
                        <span className="text-4xl font-black text-blue-600">
                          {taskStatus.savedNotifications?.toLocaleString() || 0} / {taskStatus.totalUsers.toLocaleString()} ({savedPercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-16 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-blue-800 h-full flex items-center justify-end pr-8 text-white font-black text-3xl transition-all duration-1000"
                          style={{ width: `${savedPercent}%` }}
                        >
                          {savedPercent > 10 && `${savedPercent}%`}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-2xl font-bold text-gray-800">ส่ง FCM</span>
                        <div className="text-right">
                          <p className="text-3xl font-black text-green-600">{taskStatus.fcmSuccess?.toLocaleString() || 0} สำเร็จ</p>
                          {taskStatus.fcmFailed > 0 && <p className="text-2xl font-bold text-red-600">{taskStatus.fcmFailed.toLocaleString()} ล้มเหลว</p>}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-16 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-600 to-emerald-700 h-full flex items-center justify-end pr-8 text-white font-black text-3xl transition-all duration-1000"
                          style={{ width: `${fcmPercent}%` }}
                        >
                          {fcmPercent > 10 && `${fcmPercent}%`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {taskStatus.status === 'running' && (
                    <button
                      onClick={cancelTask}
                      className="mt-16 w-full py-8 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-5xl rounded-3xl shadow-2xl flex items-center justify-center gap-8 transition-all transform hover:scale-105"
                    >
                      <PauseCircle className="w-20 h-20" />
                      <span>หยุดการส่งทันที</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <Loader2 className="w-32 h-32 text-indigo-600 animate-spin mx-auto mb-8" />
                  <p className="text-4xl font-bold text-gray-700">กำลังเริ่มต้น Task...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}