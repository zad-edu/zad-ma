
import React from 'react';
import { BookingData, SlotInfo } from '../types';
import { DAY_NAMES } from '../constants';

interface ScheduleTableProps {
  selectedWeek: Date;
  bookings: BookingData;
  onSelectSlot: (slotInfo: SlotInfo) => void;
  selectedSlotKey: string | null;
  teacherPreview: string | null;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ selectedWeek, bookings, onSelectSlot, selectedSlotKey, teacherPreview }) => {
  const renderSlot = (dayIndex: number, period: number) => {
    const currentDate = new Date(selectedWeek);
    currentDate.setDate(selectedWeek.getDate() + dayIndex);

    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
    const slotKey = `${dateKey}-${period}`;
    const booking = bookings[slotKey];
    const isSelected = slotKey === selectedSlotKey;

    let slotClass = 'bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 hover:scale-105 hover:shadow-lg';
    let slotText = 'متاح';
    let clickHandler = () => onSelectSlot({
      slotKey,
      dayName: DAY_NAMES[dayIndex],
      dateStr: `${currentDate.getDate()}/${currentDate.getMonth() + 1}`,
      period,
    });
    let title = 'متاح للحجز';

    if (booking) {
      slotClass = 'bg-gradient-to-br from-red-500 to-red-700 cursor-not-allowed animate-pulse';
      slotText = booking.teacherName;
      clickHandler = () => {};
      title = `${booking.teacherName} - ${booking.subject}`;
    } else if (isSelected) {
      slotClass = 'bg-gradient-to-br from-amber-500 to-orange-600 animate-glow cursor-pointer';
      slotText = teacherPreview || 'جاري الحجز...';
      title = 'أكمل بيانات الحجز في النموذج أدناه';
    }

    return (
      <td className="p-1 md:p-2" key={period}>
        <button
          onClick={clickHandler}
          disabled={!!booking}
          title={title}
          className={`w-full py-2 px-1 md:px-3 rounded-lg text-white font-bold text-xs leading-tight transition-all duration-300 transform ${slotClass}`}
        >
          {slotText}
        </button>
      </td>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 mb-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        <span className="inline-block animate-pulse">🗓️</span>
        الخطوة الثانية: اختر اليوم والحصة
        <span className="inline-block animate-pulse">⏰</span>
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <th className="p-3 text-center font-bold">اليوم</th>
              {Array.from({ length: 8 }, (_, i) => i + 1).map(period => (
                <th key={period} className="p-3 text-center font-bold min-w-[6rem] md:min-w-24">
                  الحصة {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAY_NAMES.map((dayName, dayIndex) => {
              const currentDate = new Date(selectedWeek);
              currentDate.setDate(selectedWeek.getDate() + dayIndex);
              return (
                <tr key={dayIndex} className="border-b border-gray-200">
                  <td className="p-3 text-center font-bold bg-gray-100">
                    <div>{dayName}</div>
                    <div className="text-sm font-normal">{currentDate.getDate()}/{currentDate.getMonth() + 1}</div>
                  </td>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map(period => renderSlot(dayIndex, period))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleTable;
