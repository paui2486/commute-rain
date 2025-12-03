import React, { useState, useEffect } from 'react';
import { Settings, X, Save } from 'lucide-react';
import { getStoredSettings, saveSettings } from '../utils/storage';

const SettingsModal = ({ isOpen, onClose, onSave }) => {
  const [home, setHome] = useState('');
  const [work, setWork] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const settings = getStoredSettings();
      setHome(settings.home);
      setWork(settings.work);
      setApiKey(settings.apiKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveSettings(home, work, apiKey);
    onSave({ home, work, apiKey });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings size={20} className="text-blue-400" /> 設定
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">CWA API Key (氣象署開放資料)</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="請輸入 API Key"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
            />
            <p className="text-xs text-slate-500 mt-2">
              若無 Key，將顯示模擬資料。<br/>
              可至 <a href="https://opendata.cwa.gov.tw/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">氣象署開放資料平台</a> 申請。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">居住地 (早上出發)</label>
              <input
                type="text"
                value={home}
                onChange={(e) => setHome(e.target.value)}
                placeholder="例如：信義區"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">工作地 (晚上回家)</label>
              <input
                type="text"
                value={work}
                onChange={(e) => setWork(e.target.value)}
                placeholder="例如：內湖區"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
          >
            <Save size={18} /> 儲存設定
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
