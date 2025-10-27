import { Booking, BookingData, SubjectStats, TeacherStats } from '../types';
import { MONTH_NAMES } from '../constants';

const parseBookingDate = (dateStr: string, period: number): Date => {
    const [day, month] = dateStr.split('/').map(Number);
    const year = new Date().getFullYear();
    const date = new Date(year, month - 1, day);
    date.setHours(period + 7, 0, 0, 0);
    return date;
};

export const calculatePastStats = (bookings: BookingData) => {
    const now = new Date();
    const pastBookings = (Object.values(bookings) as Booking[]).filter(b => {
        const bookingDate = parseBookingDate(b.dateStr, b.period);
        return bookingDate <= now;
    });

    const teacherStats: { [name: string]: TeacherStats } = {};
    const subjectStats: { [name: string]: SubjectStats } = {};

    pastBookings.forEach(b => {
        if (!teacherStats[b.teacherName]) {
            teacherStats[b.teacherName] = { count: 0, subjects: new Set(), months: new Set(), lessons: new Set(), dates: [] };
        }
        teacherStats[b.teacherName].count++;
        teacherStats[b.teacherName].subjects.add(b.subject);
        const month = parseInt(b.dateStr.split('/')[1]) - 1;
        teacherStats[b.teacherName].months.add(MONTH_NAMES[month]);
        teacherStats[b.teacherName].lessons.add(b.lesson);
        teacherStats[b.teacherName].dates.push({ date: b.dateStr, day: b.dayName, period: b.period });
        teacherStats[b.teacherName].dates.sort((a,b) => parseBookingDate(b.date, b.period).getTime() - parseBookingDate(a.date, a.period).getTime());

        if (!subjectStats[b.subject]) {
            subjectStats[b.subject] = { teachers: new Set(), totalBookings: 0, teacherDetails: {} };
        }
        subjectStats[b.subject].totalBookings++;
        subjectStats[b.subject].teachers.add(b.teacherName);
        subjectStats[b.subject].teacherDetails[b.teacherName] = (subjectStats[b.subject].teacherDetails[b.teacherName] || 0) + 1;
    });

    return { teacherStats, subjectStats, totalBookings: pastBookings.length };
};

export const getFutureBookings = (bookings: BookingData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(today.getMonth() + 1);

    return (Object.entries(bookings) as [string, Booking][])
        .filter(([, booking]) => {
            const bookingDate = parseBookingDate(booking.dateStr, booking.period);
            return bookingDate >= today && bookingDate <= oneMonthLater;
        })
        .sort(([, a], [, b]) => parseBookingDate(a.dateStr, a.period).getTime() - parseBookingDate(b.dateStr, b.period).getTime());
};

export const getAllBookingsSorted = (bookings: BookingData) => {
    return (Object.entries(bookings) as [string, Booking][])
      .sort(([, a], [, b]) => parseBookingDate(b.dateStr, b.period).getTime() - parseBookingDate(a.dateStr, a.period).getTime());
};

export const isPast = (booking: Booking): boolean => {
    return parseBookingDate(booking.dateStr, booking.period) < new Date();
}
