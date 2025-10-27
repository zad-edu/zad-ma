
export interface Booking {
  teacherName: string;
  subject: string;
  lesson: string;
  grade: string;
  dayName: string;
  dateStr: string;
  period: number;
  weekNumber: number;
}

export interface BookingData {
  [slotKey: string]: Booking;
}

export interface SlotInfo {
  slotKey: string;
  dayName: string;
  dateStr: string;
  period: number;
}

export interface TeacherStats {
  count: number;
  subjects: Set<string>;
  months: Set<string>;
  lessons: Set<string>;
  dates: { date: string; day: string; period: number }[];
}

export interface SubjectStats {
    teachers: Set<string>;
    totalBookings: number;
    teacherDetails: { [teacher: string]: number };
}
