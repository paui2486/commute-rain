import React from 'react';
import { Beer } from 'lucide-react';

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

export default BeerCard;
