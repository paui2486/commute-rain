import React from 'react';
import { CloudRain, Droplets, Sun } from 'lucide-react';

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

export default LiveStatusCard;
