import React, { useState, useEffect, useMemo } from 'react';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import WeekSelector from './components/WeekSelector';
import ScheduleTable from './components/ScheduleTable';
import BookingForm from './components/BookingForm';
import BookingSummary from './components/BookingSummary';
import Notification from './components/Notification';
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';
import StatisticsModalContent from './components/StatisticsModalContent';

// Types
import { Booking, BookingData, SlotInfo } from './types';

// Services
import { saveBookings as saveBookingsToFirestore, onBookingsChange } from './services/storageService';
import { isFirebaseConfigured } from './services/firebase';

// Utils
import { getCurrentWeekNumber, getDateOfWeek, canBookInWeek, generateWeeks } from './utils/dateUtils';
import { calculatePastStats, getFutureBookings, getAllBookingsSorted, isPast } from './utils/statisticsUtils';

const LOCAL_STORAGE_KEY = 'school-bookings-local';

function App() {
  const [bookings, setBookings] = useState<BookingData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [runningMode, setRunningMode] = useState<'cloud' | 'local'>('local');
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number | null>(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<SlotInfo | null>(null);
  const [teacherPreview, setTeacherPreview] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    const initializeData = (loadedBookings: BookingData) => {
        setBookings(loadedBookings);
        if (selectedWeekNumber === null) {
            const today = new Date();
            const currentWeek = getCurrentWeekNumber(today);
            if (canBookInWeek(currentWeek, today)) {
                setSelectedWeekNumber(currentWeek);
            } else if (canBookInWeek(currentWeek + 1, today)) {
                setSelectedWeekNumber(currentWeek + 1);
            } else {
                const weeks = generateWeeks(today);
                const firstBookable = weeks.find(w => canBookInWeek(w.weekNumber, today));
                if (firstBookable) {
                    setSelectedWeekNumber(firstBookable.weekNumber);
                }
            }
        }
        setIsLoading(false);
    };

    if (isFirebaseConfigured) {
        setRunningMode('cloud');
        const unsubscribe = onBookingsChange(initializeData);
        return () => unsubscribe();
    } else {
        console.warn("Firebase not configured. Running in local storage mode.");
        setRunningMode('local');
        try {
            const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
            initializeData(localData ? JSON.parse(localData) : {});
        } catch (e) {
            console.error("Failed to load from local storage", e);
            initializeData({});
        }
    }
  }, [selectedWeekNumber]); // Dependency ensures initial week is set correctly.

  const selectedWeekDate = useMemo(() => {
    return selectedWeekNumber ? getDateOfWeek(selectedWeekNumber) : new Date();
  }, [selectedWeekNumber]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleSelectWeek = (weekNumber: number) => {
    setSelectedWeekNumber(weekNumber);
    setSelectedSlotInfo(null);
    setTeacherPreview(null);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlotInfo(slotInfo);
    setTeacherPreview(null);
  };

  const handleTeacherNameChange = (name: string) => {
    setTeacherPreview(name);
  };

  const handleCancelForm = () => {
    setSelectedSlotInfo(null);
    setTeacherPreview(null);
  };

  const handleUpdateBookings = async (updatedBookings: BookingData) => {
    setIsSaving(true);
    try {
      if (runningMode === 'cloud') {
        await saveBookingsToFirestore(updatedBookings);
        // Firestore listener will update state automatically
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedBookings));
        setBookings(updatedBookings); // Manual update for local mode
      }
      return true; // Success
    } catch (error) {
      console.error("Failed to save booking:", error);
      return false; // Failure
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmBooking = async (details: { teacherName: string; subject: string; lesson: string; grade: string; }) => {
    if (!selectedSlotInfo || !selectedWeekNumber) return;

    const newBooking: Booking = {
      ...details,
      dayName: selectedSlotInfo.dayName,
      dateStr: selectedSlotInfo.dateStr,
      period: selectedSlotInfo.period,
      weekNumber: selectedWeekNumber,
    };

    const updatedBookings = { ...bookings, [selectedSlotInfo.slotKey]: newBooking };
    const success = await handleUpdateBookings(updatedBookings);

    if (success) {
      setSelectedSlotInfo(null);
      setTeacherPreview(null);
      showNotification('تم الحجز بنجاح!', 'success');
    } else {
      showNotification('فشل في تأكيد الحجز. يرجى المحاولة مرة أخرى.', 'error');
    }
  };

  const handleCancelBooking = async (slotKey: string) => {
    const password = prompt("لإلغاء الحجز، يرجى إدخال كلمة المرور (2410):");
    if (password !== '2410') {
      if (password !== null) showNotification('كلمة المرور غير صحيحة.', 'error');
      return;
    }

    const { [slotKey]: _, ...remainingBookings } = bookings;
    const success = await handleUpdateBookings(remainingBookings);

    if (success) {
      showNotification('تم إلغاء الحجز بنجاح.', 'success');
    } else {
      showNotification('فشل في إلغاء الحجز. يرجى المحاولة مرة أخرى.', 'error');
    }
  };
  
    const renderBookingListForModal = (bookingsToList: [string, Booking][], canCancel: boolean) => {
        if (bookingsToList.length === 0) {
            return <p className="text-center text-gray-600 p-8">لا توجد حجوزات لعرضها.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">المعلم</th>
                            <th scope="col" className="px-6 py-3">المادة</th>
                             <th scope="col" className="px-6 py-3 hidden md:table-cell">الصف</th>
                            <th scope="col" className="px-6 py-3">اليوم والتاريخ</th>
                            <th scope="col" className="px-6 py-3">الحصة</th>
                            {canCancel && <th scope="col" className="px-6 py-3">إجراء</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {bookingsToList.map(([slotKey, booking]) => (
                            <tr key={slotKey} className={`bg-white border-b hover:bg-gray-50 ${isPast(booking) ? 'opacity-60' : ''}`}>
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{booking.teacherName}</td>
                                <td className="px-6 py-4">{booking.subject}</td>
                                <td className="px-6 py-4 hidden md:table-cell">{booking.grade}</td>
                                <td className="px-6 py-4">{booking.dayName} {booking.dateStr}</td>
                                <td className="px-6 py-4">{booking.period}</td>
                                {canCancel && (
                                    <td className="px-6 py-4">
                                        {!isPast(booking) ? (
                                            <button
                                                onClick={() => {
                                                    setIsModalOpen(false);
                                                    handleCancelBooking(slotKey);
                                                }}
                                                className="font-medium text-red-600 hover:underline"
                                            >
                                                إلغاء
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">منتهي</span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const handleShowPastStatistics = () => {
        const { teacherStats, subjectStats, totalBookings } = calculatePastStats(bookings);
        setModalTitle('📊 إحصائيات الحجوزات السابقة');
        setModalContent(<StatisticsModalContent teacherStats={teacherStats} subjectStats={subjectStats} totalBookings={totalBookings} />);
        setIsModalOpen(true);
    };

    const handleShowFutureBookings = () => {
        const futureBookings = getFutureBookings(bookings);
        setModalTitle('📅 الحجوزات القادمة (الشهر القادم)');
        setModalContent(renderBookingListForModal(futureBookings, true));
        setIsModalOpen(true);
    };

    const handleShowAllBookings = () => {
        const allBookings = getAllBookingsSorted(bookings);
        setModalTitle('📋 جميع الحجوزات (الأحدث أولاً)');
        setModalContent(renderBookingListForModal(allBookings, true));
        setIsModalOpen(true);
    };

  return (
    <div className="bg-gray-50 min-h-screen font-cairo text-gray-800">
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
      
      {runningMode === 'local' && (
        <div className="bg-amber-100 border-b-4 border-amber-500 text-amber-800 p-3 text-center sticky top-0 z-50 shadow-md" role="alert">
          <p className="font-bold">وضع التخزين المحلي</p>
          <p className="text-sm">المزامنة السحابية غير مفعلة. يرجى إعداد متغيرات Firebase لتفعيلها.</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-600 to-green-700">
        <Header />
      </div>
      <main className="container mx-auto px-2 md:px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-8">
            <WeekSelector onSelectWeek={handleSelectWeek} selectedWeekNumber={selectedWeekNumber} />
            {selectedWeekNumber && (
              <ScheduleTable
                selectedWeek={selectedWeekDate}
                bookings={bookings}
                onSelectSlot={handleSelectSlot}
                selectedSlotKey={selectedSlotInfo?.slotKey || null}
                teacherPreview={teacherPreview}
              />
            )}
            {selectedSlotInfo && (
              <BookingForm
                slotInfo={selectedSlotInfo}
                onConfirm={handleConfirmBooking}
                onCancel={handleCancelForm}
                onTeacherNameChange={handleTeacherNameChange}
              />
            )}
            <BookingSummary
              bookings={bookings}
              selectedWeekNumber={selectedWeekNumber}
              onCancelBooking={handleCancelBooking}
              onShowPastStatistics={handleShowPastStatistics}
              onShowFutureBookings={handleShowFutureBookings}
              onShowAllBookings={handleShowAllBookings}
            />
          </div>
        )}
      </main>
      <Footer />
      <Modal title={modalTitle} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </Modal>
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[101]">
          <div className="bg-white p-6 rounded-lg flex items-center gap-4 text-gray-800 shadow-xl">
            <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-semibold">جاري الحفظ...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
