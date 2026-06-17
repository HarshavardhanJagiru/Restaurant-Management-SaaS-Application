import React from 'react';
import { Flame } from 'lucide-react';

const PopularDishes = ({ items }) => {
  // Mock fallback if items aren't resolved yet
  const defaultItems = [
    { name: 'Butter Chicken Signature', count: 48, percentage: 95, color: 'bg-indigo-500' },
    { name: 'Tandoori Paneer Tikka', count: 36, percentage: 72, color: 'bg-purple-500' },
    { name: 'Fresh Mint Mojito', count: 32, percentage: 64, color: 'bg-emerald-500' },
    { name: 'Chilli Chicken Dry', count: 28, percentage: 56, color: 'bg-amber-500' },
    { name: 'Crispy Spring Rolls', count: 18, percentage: 36, color: 'bg-sky-500' },
  ];

  const displayItems = items || defaultItems;

  return (
    <div className="space-y-5">
      {displayItems.map((dish, idx) => (
        <div key={idx} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              {idx === 0 && <Flame className="w-4 h-4 text-amber-500 animate-bounce" />}
              {dish.name}
            </span>
            <span className="text-slate-400 font-bold">{dish.count} orders</span>
          </div>
          {/* Progress bar container */}
          <div className="w-full bg-slate-900/60 rounded-full h-2 border border-darkBorder/50 overflow-hidden">
            <div 
              className={`h-full rounded-full ${dish.color || 'bg-indigo-500'} transition-all duration-1000`} 
              style={{ width: `${dish.percentage}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopularDishes;
