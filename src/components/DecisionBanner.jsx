import React from 'react';
import { Droplets, Umbrella, Navigation } from 'lucide-react';

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

export default DecisionBanner;
