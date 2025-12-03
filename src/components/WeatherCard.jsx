import React from 'react';
import { CloudRain, Sun } from 'lucide-react';

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

export default WeatherCard;
