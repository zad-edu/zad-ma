
import { MONTH_NAMES } from '../constants';

const getAcademicYearStart = (today: Date): Date => {
    const currentYear = today.getFullYear();
    const academicYear = today.getMonth() >= 8 ? currentYear : currentYear - 1;
    const septemberFirst = new Date(academicYear, 8, 1);
    const firstSunday = new Date(septemberFirst);
    const dayOfWeek = septemberFirst.getDay();
    if (dayOfWeek !== 0) {
        firstSunday.setDate(septemberFirst.getDate() + (7 - dayOfWeek));
    }
    return firstSunday;
};

export const getDateOfWeek = (weekNumber: number, today: Date = new Date()): Date => {
    const firstSunday = getAcademicYearStart(today);
    const weekStart = new Date(firstSunday);
    weekStart.setDate(firstSunday.getDate() + ((weekNumber - 1) * 7));
    return weekStart;
};

export const getCurrentWeekNumber = (today: Date = new Date()): number => {
    const firstSunday = getAcademicYearStart(today);
    const weeksDiff = Math.floor((today.getTime() - firstSunday.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return weeksDiff + 1;
};

export const canBookInWeek = (weekNumber: number, today: Date = new Date()): boolean => {
    const currentDay = today.getDay(); // 0 = Sunday, 4 = Thursday
    const currentWeekStart = getDateOfWeek(getCurrentWeekNumber(today), today);
    const selectedWeekStart = getDateOfWeek(weekNumber, today);

    const weeksDiff = Math.round((selectedWeekStart.getTime() - currentWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

    if (weeksDiff < 0) return false; // Past week
    if (weeksDiff === 0) return true; // Current week
    if (weeksDiff === 1) return currentDay >= 4; // Next week, bookable from Thursday
    return false; // Far future weeks
};

export const generateWeeks = (today: Date = new Date()) => {
    const currentYear = today.getFullYear();
    const academicYear = today.getMonth() >= 8 ? currentYear : currentYear - 1;
    
    const firstSunday = getAcademicYearStart(today);

    const mayLast = new Date(academicYear + 1, 4, 31);
    const lastThursday = new Date(mayLast);
    const mayDayOfWeek = mayLast.getDay();
    if (mayDayOfWeek < 4) {
        lastThursday.setDate(mayLast.getDate() - (mayDayOfWeek + 3));
    } else if (mayDayOfWeek > 4) {
        lastThursday.setDate(mayLast.getDate() - (mayDayOfWeek - 4));
    }

    const totalWeeks = Math.ceil((lastThursday.getTime() - firstSunday.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    const weeks = [];
    for (let i = 0; i <= totalWeeks; i++) {
        const weekNumber = i + 1;
        const weekStart = new Date(firstSunday);
        weekStart.setDate(firstSunday.getDate() + i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 4);

        if (weekEnd > lastThursday) break;

        weeks.push({
            weekNumber,
            weekStart,
            weekEnd,
            label: `الأسبوع ${weekNumber} - ${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]} إلى ${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekStart.getFullYear()}`
        });
    }
    return weeks;
};
