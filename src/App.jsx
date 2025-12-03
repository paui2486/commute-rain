import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader2, Settings as SettingsIcon } from 'lucide-react';
import LiveStatusCard from './components/LiveStatusCard';
import WeatherCard from './components/WeatherCard';
import DecisionBanner from './components/DecisionBanner';
import BeerCard from './components/BeerCard';
import SkeletonCard from './components/SkeletonCard';
import SettingsModal from './components/SettingsModal';
import { fetchRealWeather } from './services/weatherService';
import { generateMockData, delay } from './services/mockService';
import { getStoredSettings } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(getStoredSettings());
  
  const [daysData, setDaysData] = useState({
    0: null, 1: null, 2: null
  });

  const [loadingStates, setLoadingStates] = useState({
    0: true, 1: true, 2: true
  });

  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoadingStates({ 0: true, 1: true, 2: true });
    setError(null);
    setDaysData({ 0: null, 1: null, 2: null });

    const fetchDay = async (offset) => {
      try {
        let data;
        // 如果有 API Key，嘗試抓取真實資料
        if (settings.apiKey) {
          // Add artificial delay for smoother UX (optional)
          await delay(500 * (offset + 1));
          data = await fetchRealWeather(settings.apiKey, offset, settings.home, settings.work);
        } else {
          // 否則使用 Mock Data
          await delay(600 * (offset + 1));
          data = generateMockData(offset, settings.home, settings.work);
        }

        setDaysData(prev => ({ ...prev, [offset]: data }));
      } catch (err) {
        console.error(`Failed to fetch day ${offset}`, err);
        // Fallback to mock on error or show error state
        // For now, let's fallback to mock data with a flag or just show mock
        const mock = generateMockData(offset, settings.home, settings.work);
        setDaysData(prev => ({ ...prev, [offset]: mock }));
        if (offset === 0) setError("無法連線至氣象局 API，已切換至模擬資料。");
      } finally {
        setLoadingStates(prev => ({ ...prev, [offset]: false }));
      }
    };

    fetchDay(0);
    fetchDay(1);
    fetchDay(2);
  };

  useEffect(() => {
    fetchWeather();
  }, [settings]); // Refetch when settings change

  const handleSettingsSave = (newSettings) => {
    setSettings(newSettings);
    // fetchWeather will be triggered by useEffect
  };

  const currentData = daysData[activeTab];
  const isLoading = loadingStates[activeTab];

  const getTabLabel = (offset) => {
    if (offset === 0) return "今天";
    if (offset === 1) return "明天";
    return "後天";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 font-sans pb-20">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-6 pt-2">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              CommuteRain <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-blue-400">v3.0</span>
            </h1>
          </div>
          <div className="flex gap-2">
             <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-all active:scale-95"
            >
              <SettingsIcon size={20} className="text-slate-400" />
            </button>
            <button
              onClick={fetchWeather}
              disabled={Object.values(loadingStates).some(s => s)}
              className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={20} className={`text-blue-400 ${Object.values(loadingStates).some(s => s) ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-200 px-4 py-2 rounded-lg mb-4 text-xs">
            {error}
          </div>
        )}

        {/* Date Tabs */}
        <div className="grid grid-cols-3 bg-slate-900/80 backdrop-blur-md p-1 rounded-xl mb-6 sticky top-2 z-20 border border-slate-800/50 shadow-xl">
          {[0, 1, 2].map((offset) => {
            const isReady = !loadingStates[offset];
            return (
              <button
                key={offset}
                onClick={() => setActiveTab(offset)}
                className={`
                  relative py-2 text-sm font-medium rounded-lg transition-all duration-300
                  ${activeTab === offset ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}
                `}
              >
                {getTabLabel(offset)}
                {isReady && activeTab !== offset && (
                  <span className="absolute top-2 right-3 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                )}
                {!isReady && (
                   <span className="absolute top-2.5 right-2 opacity-50">
                     <Loader2 size={10} className="animate-spin" />
                   </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <main className="min-h-[400px]">
          {isLoading ? (
            <div className="animate-in fade-in duration-300">
               {/* Skeleton for Live Card (only today) */}
              {activeTab === 0 && <div className="h-32 bg-slate-800/50 rounded-xl mb-6 animate-pulse border border-slate-700/50"></div>}
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div key={activeTab} className="animate-in slide-in-from-bottom-2 duration-500">
              
              {/* [NEW] Live Status - Only show for Today */}
              {activeTab === 0 && currentData?.current && (
                <LiveStatusCard data={currentData.current} />
              )}

              {currentData && (
                <>
                  <DecisionBanner data={currentData} />
                  <WeatherCard type="morning" data={currentData.morning} />
                  <WeatherCard type="evening" data={currentData.evening} />
                  <BeerCard data={currentData} />
                </>
              )}
            </div>
          )}
        </main>

        <footer className="mt-8 text-center border-t border-slate-800/50 pt-6">
          <p className="text-xs text-slate-600 font-mono">
             Source: CWA Open Data API <br/>
             {settings.apiKey ? "Connected to Live Data" : "Running in Simulation Mode"}
          </p>
        </footer>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSettingsSave}
        />

      </div>
    </div>
  );
}
