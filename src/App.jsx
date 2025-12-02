import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Umbrella, Navigation, Beer, RefreshCw, Calendar, Loader2, Droplets } from 'lucide-react';

// ==========================================
// 1. Mock API & Data Utilities
// ==========================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const LOCATIONS = {
  morning: { name: "信義區", time: "08:00 - 09:00" },
  evening: { name: "內湖陽光抽水站", time: "17:30 - 18:00" }
};

// 模擬即時觀測資料 (Real-time Observation)
// 真實世界對應 API: O-A0003-001 (自動氣象站資料)
const generateCurrentStatus = () => {
  const isRainingNow = Math.random() > 0.5; // 50% 機率現在正在下雨
  return {
    timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
    location: "信義區 (台北站)",
    temp: 24.5,
    isRaining: isRainingNow,
    rainfall: isRainingNow ? (Math.random() * 5).toFixed(1) : "0.0", // mm/hr
    humidity: isRainingNow ? 95 : 70,
  };
};

const generateMockData = (dayOffset) => {
  const baseTemp = 20 + Math.floor(Math.random() * 8);
  const isRainy = Math.random() > 0.4; 
  
  // 只有「今天」才會有即時觀測數據
  const currentData = dayOffset === 0 ? generateCurrentStatus() : null;

  return {
    current: currentData, // New Field
    morning: {
      ...LOCATIONS.morning,
      temp: baseTemp,
      pop: isRainy ? 60 + Math.floor(Math.random() * 30) : 10,
      rainDetails: isRainy ? "1.5mm" : "0mm",
      desc: isRainy ? "短暫陣雨" : "多雲時晴",
      windSpeed: "3 m/s",
    },
    evening: {
      ...LOCATIONS.evening,
      temp: baseTemp - 2,
      pop: isRainy ? 70 + Math.floor(Math.random() * 20) : 20,
      rainDetails: isRainy ? "3.0mm" : "0mm",
      desc: isRainy ? "午後雷陣雨" : "陰天",
      windSpeed: "5 m/s",
    }
  };
};

// ==========================================
// 2. Components
// ==========================================

// [NEW] 即時天氣狀態卡片
const LiveStatusCard = ({ data }) => {
  if (!data) return null;

  const { isRaining, rainfall, temp, location, timestamp, humidity } = data;

  return (
    <div className={`
      relative overflow-hidden p-5 rounded-xl mb-6 border transition-all duration-500
      ${isRaining 
        ? 'bg-blue-950/80 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
        : 'bg-emerald-950/40 border-emerald-500/30'}
    `}>
      {/* Background Effect for Rain */}
      {isRaining && (
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CloudRain size={100} />
        </div>
      )}

      <div className="flex justify-between items-start relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRaining ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isRaining ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className={`text-xs font-bold tracking-wider uppercase ${isRaining ? 'text-blue-400' : 'text-emerald-400'}`}>
              LIVE 觀測
            </span>
            <span className="text-slate-500 text-xs">更新於 {timestamp}</span>
          </div>
          
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {location}
          </h2>
          
          <div className="mt-2 flex items-baseline gap-1">
             <span className="text-3xl font-bold text-white">{temp}°</span>
             <span className="text-sm text-slate-400">體感 {temp+2}°</span>
          </div>
        </div>

        <div className="text-right">
          {isRaining ? (
            <div className="flex flex-col items-end">
              <div className="bg-blue-600 px-3 py-1 rounded-full flex items-center gap-1 mb-2">
                <Droplets size={14} className="text-white" />
                <span className="text-sm font-bold text-white">下雨中</span>
              </div>
              <div className="text-2xl font-mono font-bold text-blue-200">{rainfall} <span className="text-xs">mm/hr</span></div>
            </div>
          ) : (
            <div className="flex flex-col items-end">
               <div className="bg-emerald-600/20 text-emerald-300 border border-emerald-600/50 px-3 py-1 rounded-full flex items-center gap-1 mb-2">
                <Sun size={14} />
                <span className="text-sm font-bold">目前無雨</span>
              </div>
               <div className="text-sm text-emerald-200/70 font-medium mt-1">濕度 {humidity}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 mb-4 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-3">
        <div className="h-4 w-24 bg-slate-700 rounded"></div>
        <div className="h-8 w-40 bg-slate-700 rounded"></div>
      </div>
      <div className="space-y-2 flex flex-col items-end">
        <div className="h-10 w-16 bg-slate-700 rounded"></div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-4 border-t border-slate-700/50 pt-4 mt-4">
      <div className="h-10 bg-slate-700 rounded"></div>
      <div className="h-10 bg-slate-700 rounded"></div>
      <div className="h-10 bg-slate-700 rounded"></div>
    </div>
  </div>
);

const WeatherCard = ({ type, data }) => {
  if (!data) return null; 
  
  const isRainy = data.pop > 30;
  const bgColor = isRainy 
    ? "bg-slate-800 border-l-4 border-blue-500" 
    : "bg-slate-800 border-l-4 border-orange-500";
    
  return (
    <div className={`p-6 rounded-xl shadow-lg mb-4 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4 ${bgColor}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-400 text-sm font-medium flex items-center gap-2">
            {type === 'morning' ? <Sun size={16} /> : <CloudRain size={16} />}
            {type === 'morning' ? "上班路程" : "下班路程"}
          </h3>
          <h2 className="text-2xl font-bold text-white mt-1">{data.name}</h2>
          <div className="flex items-center text-slate-300 text-sm mt-1 font-mono">
            {data.time}
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-white tracking-tighter">{data.temp}°</div>
          <div className={`text-sm font-bold mt-1 ${isRainy ? 'text-blue-300' : 'text-orange-300'}`}>
            {data.desc}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-slate-700 pt-4">
        <div className="flex flex-col items-center">
          <span className="text-slate-400 text-xs mb-1">降雨機率</span>
          <span className={`text-lg font-bold ${data.pop > 30 ? 'text-blue-400' : 'text-slate-200'}`}>
            {data.pop}%
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-slate-400 text-xs mb-1">預估雨量</span>
          <span className="text-slate-200 text-lg font-bold">{data.rainDetails}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-slate-400 text-xs mb-1">風速</span>
          <span className="text-slate-200 text-lg font-bold">{data.windSpeed}</span>
        </div>
      </div>
    </div>
  );
};

const DecisionBanner = ({ data }) => {
  if (!data) return null;
  // 如果現在正在下雨，或通勤時段下雨機率高
  const isRainingNow = data.current?.isRaining;
  const isForecastRainy = data.morning.pop > 30 || data.evening.pop > 30;

  let bannerStyle, icon, title, desc;

  if (isRainingNow) {
    bannerStyle = "bg-blue-900/40 border-blue-600";
    icon = <Droplets size={20} className="text-blue-200" />;
    title = "外面正在下雨！";
    desc = "請直接攜帶雨具出門，建議搭乘捷運或開車。";
  } else if (isForecastRainy) {
    bannerStyle = "bg-blue-900/20 border-blue-800/50";
    icon = <Umbrella size={20} className="text-blue-300" />;
    title = "建議攜帶雨具";
    desc = "目前無雨，但通勤時段降雨機率高。";
  } else {
    bannerStyle = "bg-orange-900/20 border-orange-800/50";
    icon = <Navigation size={20} className="text-orange-300" />;
    title = "適合騎車 / YouBike";
    desc = "目前與預報皆顯示天氣穩定。";
  }

  return (
    <div className={`mt-2 mb-6 p-3 rounded-lg flex items-center gap-3 border transition-colors duration-300 ${bannerStyle}`}>
      <div className="p-2 bg-slate-900/30 rounded-full shrink-0">
        {icon}
      </div>
      <div className="text-sm text-slate-200">
        <span className="font-bold text-white block">{title}</span>
        <span className="text-xs text-slate-300">{desc}</span>
      </div>
    </div>
  );
};

const BeerCard = ({ data }) => {
  // 啤酒邏輯：晚上沒雨 + 溫度適中
  const isGood = data.evening.pop < 30 && data.evening.temp > 22;
  if (!isGood) return null;

  return (
    <div className="mt-2 p-4 bg-gradient-to-r from-amber-900/40 to-yellow-900/20 border border-amber-700/30 rounded-xl relative overflow-hidden animate-in zoom-in-95 duration-700">
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
          <Beer size={20} className="text-amber-400" />
        </div>
        <div>
          <h4 className="font-bold text-amber-200 text-sm">Beer Index: High</h4>
          <p className="text-xs text-amber-300/80">下班(17:30)後無雨，適合去喝一杯。</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. Main Application
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState(0); 
  
  const [daysData, setDaysData] = useState({
    0: null, 1: null, 2: null
  });

  const [loadingStates, setLoadingStates] = useState({
    0: true, 1: true, 2: true
  });

  const fetchWeather = async () => {
    setLoadingStates({ 0: true, 1: true, 2: true });

    // Request 1: 今天 (最優先)
    const fetchToday = async () => {
      await delay(600); 
      const data = generateMockData(0);
      setDaysData(prev => ({ ...prev, 0: data }));
      setLoadingStates(prev => ({ ...prev, 0: false }));
    };

    // Request 2: 明天
    const fetchTomorrow = async () => {
      await delay(1200); 
      const data = generateMockData(1);
      setDaysData(prev => ({ ...prev, 1: data }));
      setLoadingStates(prev => ({ ...prev, 1: false }));
    };

    // Request 3: 後天
    const fetchDayAfter = async () => {
      await delay(2000); 
      const data = generateMockData(2);
      setDaysData(prev => ({ ...prev, 2: data }));
      setLoadingStates(prev => ({ ...prev, 2: false }));
    };

    fetchToday();
    fetchTomorrow();
    fetchDayAfter();
  };

  useEffect(() => {
    fetchWeather();
  }, []);

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
              CommuteRain <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-blue-400">v2.1</span>
            </h1>
          </div>
          <button 
            onClick={fetchWeather}
            disabled={Object.values(loadingStates).some(s => s)}
            className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={`text-blue-400 ${Object.values(loadingStates).some(s => s) ? 'animate-spin' : ''}`} />
          </button>
        </header>

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
              {activeTab === 0 && currentData.current && (
                <LiveStatusCard data={currentData.current} />
              )}

              <DecisionBanner data={currentData} />
              
              <WeatherCard type="morning" data={currentData.morning} />
              <WeatherCard type="evening" data={currentData.evening} />

              <BeerCard data={currentData} />
            </div>
          )}
        </main>

        <footer className="mt-8 text-center border-t border-slate-800/50 pt-6">
          <p className="text-xs text-slate-600 font-mono">
             Source: CWA (O-A0003 & F-D0047) <br/>
             Async Hydration System
          </p>
        </footer>
      </div>
    </div>
  );
}
