
import React from 'react';
import { Booking, BookingData } from '../types';

interface BookingSummaryProps {
  bookings: BookingData;
  selectedWeekNumber: number | null;
  onCancelBooking: (slotKey: string) => void;
  onShowPastStatistics: () => void;
  onShowFutureBookings: () => void;
  onShowAllBookings: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ bookings, selectedWeekNumber, onCancelBooking, onShowPastStatistics, onShowFutureBookings, onShowAllBookings }) => {
  // FIX: Cast the result of Object.entries to the correct tuple type to inform TypeScript about the shape of the data.
  const weekBookings = selectedWeekNumber
    ? (Object.entries(bookings) as [string, Booking][]).filter(([, booking]) => booking.weekNumber === selectedWeekNumber)
    : [];

  return (
    <div className="relative rounded-2xl p-6 shadow-lg bg-gradient-to-br from-amber-200 via-yellow-300 to-orange-300 overflow-hidden">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-rotate z-0 pointer-events-none"></div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 relative z-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">📋 ملخص الحجوزات</h2>
        <div className="flex gap-3 flex-wrap justify-center">
          <button onClick={onShowPastStatistics} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-transform transform hover:scale-105 shadow-md">📊 إحصائيات</button>
          <button onClick={onShowFutureBookings} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold transition-transform transform hover:scale-105 shadow-md">📅 حجوزات قادمة</button>
          <button onClick={onShowAllBookings} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-transform transform hover:scale-105 shadow-md">📋 كل الحجوزات</button>
        </div>
      </div>
      <div className="relative z-10">
        {selectedWeekNumber ? (
          weekBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white/70 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="p-3 text-center font-bold">المعلم</th>
                    <th className="p-3 text-center font-bold hidden md:table-cell">المادة</th>
                    <th className="p-3 text-center font-bold hidden lg:table-cell">الدرس</th>
                    <th className="p-3 text-center font-bold hidden md:table-cell">الصف</th>
                    <th className="p-3 text-center font-bold">اليوم والتاريخ</th>
                    <th className="p-3 text-center font-bold">الحصة</th>
                    <th className="p-3 text-center font-bold">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {weekBookings.map(([slotKey, booking]) => (
                    <tr key={slotKey} className="border-b border-gray-200 hover:bg-gray-50/50">
                      <td className="p-3 text-center">👨‍🏫 {booking.teacherName}</td>
                      <td className="p-3 text-center hidden md:table-cell">📚 {booking.subject}</td>
                      <td className="p-3 text-center hidden lg:table-cell">📖 {booking.lesson}</td>
                      <td className="p-3 text-center hidden md:table-cell">🎓 {booking.grade}</td>
                      <td className="p-3 text-center">{booking.dayName} {booking.dateStr}</td>
                      <td className="p-3 text-center">⏰ {booking.period}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => onCancelBooking(slotKey)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-all">❌ إلغاء</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-700 font-semibold">لا توجد حجوزات لهذا الأسبوع</p>
          )
        ) : (
          <p className="text-center text-gray-700 font-semibold">اختر أسبوعاً لعرض الحجوزات</p>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;