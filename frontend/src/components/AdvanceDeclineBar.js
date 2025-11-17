import React from 'react';

const AdvanceDeclineBar = ({ stocks = [] }) => {
  if (stocks.length === 0) {
    return null; // Don't render if there's no data
  }

  const advances = stocks.filter(s => s.change_percent > 0).length;
  const declines = stocks.filter(s => s.change_percent < 0).length;
  const total = advances + declines;

  if (total === 0) {
    return null;
  }

  const advancePercent = (advances / total) * 100;
  const declinePercent = (declines / total) * 100;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-2 text-sm">
        <div className="font-medium text-gray-700">Market Breadth (Advances vs Declines)</div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-success-500"></div>
            <span className="text-gray-600">{advances} Advancing</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-danger-500"></div>
            <span className="text-gray-600">{declines} Declining</span>
          </div>
        </div>
      </div>
      <div className="w-full bg-danger-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-success-500 h-2.5 rounded-l-full"
          style={{ width: `${advancePercent}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AdvanceDeclineBar;