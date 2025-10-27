import React, { useState, useEffect, useMemo } from 'react';
import { generateWeeks, getCurrentWeekNumber, canBookInWeek } from '../utils/dateUtils';

interface WeekSelectorProps {
  onSelectWeek: (weekNumber: number) => void;
  selectedWeekNumber: number | null;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ onSelectWeek, selectedWeekNumber }) => {
  const today = useMemo(() => new Date(), []);
  
  const weeks = useMemo(() => generateWeeks(today), [today]);

  useEffect(() => {
    // If no week is selected, select the current week by default if it's bookable
    if (selectedWeekNumber === null) {
      const currentWeek = getCurrentWeekNumber(today);
      const currentWeekData = weeks.find(w => w.weekNumber === currentWeek);
      if (currentWeekData && canBookInWeek(currentWeekData.weekNumber, today)) {
        onSelectWeek(currentWeek);
      }
    }
  }, [onSelectWeek, selectedWeekNumber, today, weeks]);

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const weekNumber = parseInt(e.target.value, 10);
    if (!isNaN(weekNumber)) {
      onSelectWeek(weekNumber);
    }
  };
  
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 mb-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        <span className="inline-block animate-pulse">📅</span>
        الخطوة الأولى: اختر الأسبوع
        <span className="inline-block animate-pulse">🗓️</span>
      </h2>
      <select
        value={selectedWeekNumber || ''}
        onChange={handleWeekChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer text-center"
      >
        <option value="" disabled>-- الرجاء اختيار الأسبوع --</option>
        {weeks.map(week => (
          <option
            key={week.weekNumber}
            value={week.weekNumber}
            disabled={!canBookInWeek(week.weekNumber, today)}
            className={!canBookInWeek(week.weekNumber, today) ? "text-gray-400" : ""}
          >
            {week.label} {!canBookInWeek(week.weekNumber, today) ? ' (غير متاح للحجز)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};

export default WeekSelector;
