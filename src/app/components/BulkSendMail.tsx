'use client';

import { useState, useMemo } from 'react';
import { Copy, Send, CheckCircle, AlertCircle, Mail, Users, Loader2, Sparkles, Terminal } from 'lucide-react';

export default function BulkSendMail() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [emails, setEmails] = useState('');
  const [fromEmail, setFromEmail] = useState('welcome@livinginsider.com');
  const [replyTo, setReplyTo] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [environment, setEnvironment] = useState<'test' | 'prod'>('test');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const baseUrl = environment === 'test' 
    ? 'https://lvatest.livinginsider.com' 
    : 'https://lva.livinginsider.com';

  const emailCount = useMemo(() => {
    if (!emails.trim()) return 0;
    const list = emails
      .split(/[\s,]+/)  // แยกด้วย space, comma, newline ได้หมด
      .map(e => e.trim())
      .filter(e => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    return list.length;
  }, [emails]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('th-TH');
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev, logMessage]);
  };

  const sendEmail = async () => {
    if (!apiKey.trim()) return alert('กรุณาใส่ x-api-key');
    if (!subject.trim()) return alert('กรุณาใส่ Subject');
    if (!message.trim()) return alert('กรุณาใส่ Message');
    if (emailCount === 0) return alert('กรุณาใส่อีเมลที่ถูกต้อง');

    const confirmText = environment === 'prod' 
      ? `⚠️ PRODUCTION MODE ⚠️\n\n` 
      : `TEST MODE\n\n`;

    if (!confirm(
      `${confirmText}` +
      `คุณกำลังจะส่งอีเมลไปยัง ${emailCount.toLocaleString()} คน\n\n` +
      `Subject: ${subject.trim()}\n` +
      `Message Preview:\n${message.trim().substring(0, 100)}${message.trim().length > 100 ? '...' : ''}\n\n` +
      `⚠️ แน่ใจหรือไม่ว่าจะส่งจริง ๆ?`
    )) {
      return;
    }

    setLoading(true);
    setResult(null);
    setDebugLogs([]);

    const emailList = emails
      .split(/[\s,]+/)  // แยกด้วย space, comma, newline
      .map(e => e.trim())
      .filter(e => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    addLog(`📧 กำลังส่งอีเมลไปยัง ${emailList.length} คน`);

    try {
      const payload: any = {
        to: emailList,
        title: String(subject.trim()),
        message: String(message.trim()),
      };

      const trimmedFrom = fromEmail.trim();
      if (trimmedFrom) {
        payload.from = trimmedFrom;
      }
      
      const trimmedReplyTo = replyTo.trim();
      if (trimmedReplyTo) {
        payload.reply_to = trimmedReplyTo;
      }

      // แสดง Request
      addLog(`📤 กำลังส่งไปยัง ${emailList.length} อีเมล`);
      addLog('');
      addLog('📋 REQUEST:');
      addLog(JSON.stringify(payload, null, 2));
      addLog('');

      const url = `${baseUrl}/v1/email/send`;
      addLog(`🌐 URL: ${url}`);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
        },
        body: JSON.stringify(payload),
      });

      addLog(`📊 HTTP Status: ${res.status} ${res.statusText}`);

      const data = await res.json();
      
      // แสดง Response แบบเต็ม
      addLog('');
      addLog('📥 RESPONSE:');
      addLog(JSON.stringify(data, null, 2));
      addLog('');
      
      // แสดงสรุปสั้น ๆ
      if (data.success) {
        addLog(`✅ ${data.message || 'สำเร็จ'}`);
        if (data.jobId) addLog(`📋 Job ID: ${data.jobId}`);
        if (data.recipients) addLog(`👥 ผู้รับ: ${data.recipients} คน`);
        if (data.estimatedTime) addLog(`⏱️ เวลา: ${data.estimatedTime}`);
      } else {
        addLog(`❌ มีข้อผิดพลาด`);
      }

      if (!res.ok) {
        let errorDesc = data.alert?.description || data.message || data.error || 'เกิดข้อผิดพลาดจาก Backend';
        
        if (data.validated) {
          const validationErrors = Object.entries(data.validated)
            .map(([field, errors]: [string, any]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          errorDesc += '\n\n❌ Validation Errors:\n' + validationErrors;
        }
        
        setResult({
          alert: { 
            type: 'error', 
            title: data.alert?.title || `HTTP ${res.status} Error`,
            description: errorDesc
          },
          data: data
        });
      } else {
        // ไม่ต้อง addLog ซ้ำเพราะแสดงไปแล้วด้านบน
        
        // สร้าง success message ที่สวยงามและครบถ้วน
        let successDesc = data.message || 'ส่งอีเมลสำเร็จ';
        if (data.jobId) {
          successDesc += `\n\n📋 Job ID: ${data.jobId}`;
        }
        if (data.recipients) {
          successDesc += `\n👥 ผู้รับ: ${data.recipients} คน`;
        }
        if (data.estimatedTime) {
          successDesc += `\n⏱️ เวลาโดยประมาณ: ${data.estimatedTime}`;
        }
        
        setResult({
          alert: { 
            type: 'success', 
            title: '✅ ส่งสำเร็จ!',
            description: successDesc
          },
          data: data
        });
      }
      
    } catch (error: any) {
      const errorMsg = `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้\n\n${error.message || error}`;
      addLog(`❌ Catch Error: ${errorMsg}`);
      console.error('❌ Catch Error:', error);
      setResult({
        alert: { 
          type: 'error', 
          title: 'Connection Error', 
          description: errorMsg
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Mail className="w-12 h-12 text-green-600" />
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Bulk Send Mail
            </h1>
            <Sparkles className="w-10 h-10 text-yellow-500" />
          </div>
          <p className="text-lg text-gray-600">ส่งอีเมลไปยังหลายคนพร้อมกัน (พร้อม Debug Logs)</p>
        </div>

        <div className="space-y-6">
          
          {/* Form Section */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
              <div className="flex justify-center items-center gap-8">
                <button
                  onClick={() => setEnvironment('test')}
                  className={`relative px-6 py-3 rounded-xl font-bold text-base transition-all duration-300 ${
                    environment === 'test'
                      ? 'bg-blue-600 text-white shadow-xl ring-4 ring-blue-200'
                      : 'bg-white text-gray-600 shadow-md border border-gray-300'
                  }`}
                >
                  TEST
                  {environment === 'test' && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-semibold">
                      ACTIVE
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (environment === 'prod') return;
                    if (confirm('⚠️ คุณกำลังจะสลับไป PRODUCTION ⚠️\n\nแน่ใจหรือไม่?')) {
                      setEnvironment('prod');
                    }
                  }}
                  className={`relative px-6 py-3 rounded-xl font-bold text-base transition-all duration-300 ${
                    environment === 'prod'
                      ? 'bg-red-600 text-white shadow-xl ring-4 ring-red-200'
                      : 'bg-white text-gray-600 shadow-md border border-gray-300'
                  }`}
                >
                  PRODUCTION
                  {environment === 'prod' && (
                    <span className="absolute -top-2 -right-2 bg-red-700 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-semibold">
                      LIVE
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 max-h-[600px] overflow-y-auto">
              {/* API Key */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">x-api-key</label>
                <input
                  type="password"
                  placeholder="วาง API Key ที่นี่"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-mono bg-gray-50 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100 text-gray-900"
                />
              </div>

              {/* From & Reply-To */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">From</label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-300 focus:border-gray-500 focus:outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Reply-To (Optional)</label>
                  <input
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-300 focus:border-gray-500 focus:outline-none text-gray-900"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Subject</label>
                <input
                  type="text"
                  placeholder="เช่น : โปรโมชั่นพิเศษ!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 text-gray-900"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Message (HTML)</label>
                <textarea
                  placeholder="<h1>สวัสดี</h1>"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 font-mono text-xs bg-gray-50 rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none resize-none text-gray-800"
                />
              </div>

              {/* Email List */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-bold text-gray-800">Email Addresses</label>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-xl font-bold text-green-600">{emailCount}</span>
                  </div>
                </div>
                <textarea
                  placeholder="user1@gmail.com, user2@gmail.com"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 font-mono text-xs bg-gray-50 rounded-xl border-2 border-gray-300 focus:border-green-500 focus:outline-none resize-none text-gray-800"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={sendEmail}
                disabled={loading || !subject || !message || emailCount === 0 || !apiKey}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all ${
                  loading || !subject || !message || emailCount === 0 || !apiKey
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>กำลังส่ง...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span>ส่งอีเมลทันที!</span>
                  </>
                )}
              </button>

              {/* Result */}
              {result && (
                <div className={`p-4 rounded-xl border-2 ${result.alert?.type === 'success' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
                  <div className="flex items-start gap-3">
                    {result.alert?.type === 'success' ? (
                      <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{result.alert?.title || 'ผลลัพธ์'}</h3>
                      <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">
                        {result.alert?.description || 'ไม่มีข้อความ'}
                      </p>
                      
                      {/* ปุ่มส่งใหม่ */}
                      {result.alert?.type === 'success' && (
                        <button
                          onClick={() => {
                            setResult(null);
                            setDebugLogs([]);
                          }}
                          className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all"
                        >
                          🔄 ส่งอีเมลใหม่อีกครั้ง
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Debug Logs Section - ด้านล่าง */}
          <div className="bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center gap-3">
              <Terminal className="w-6 h-6 text-green-400" />
              <h2 className="text-lg font-bold text-white">Debug Logs</h2>
              <button
                onClick={() => setDebugLogs([])}
                className="ml-auto px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
              >
                Clear
              </button>
            </div>
            <div className="p-4 font-mono text-xs text-green-400 h-[400px] overflow-y-auto space-y-1">
              {debugLogs.length === 0 ? (
                <div className="text-gray-400 text-center py-10">
                  กด "ส่งอีเมลทันที!" เพื่อดู logs
                </div>
              ) : (
                debugLogs.map((log, i) => (
                  <div key={i} className="hover:bg-gray-800 px-2 py-1 rounded">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}