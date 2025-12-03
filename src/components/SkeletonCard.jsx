import React from 'react';

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

export default SkeletonCard;
