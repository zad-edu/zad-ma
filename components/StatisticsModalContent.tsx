import React from 'react';
import { SubjectStats, TeacherStats } from '../types';

interface StatisticsModalContentProps {
  teacherStats: { [name: string]: TeacherStats };
  subjectStats: { [name: string]: SubjectStats };
  totalBookings: number;
}

const getSubjectIcon = (subject: string) => {
    const icons: { [key: string]: string } = { "تربية إسلامية": "📿", "لغة عربية": "📝", "لغة إنجليزية": "🇬🇧", "رياضيات": "🔢", "فيزياء": "⚛️", "كيمياء": "🧪", "أحياء": "🧬", "علوم بيئية": "🌱", "جغرافيا": "🌍", "تاريخ": "📜", "هذا وطني": "🇴🇲", "السياحة والسفر": "✈️", "حاسب آلي": "💻", "تربية فنية": "🎨", "موسيقى": "🎵", "تربية رياضية": "⚽", "توجيه مهني": "🎯", "شؤن الطلبة": "👥" };
    return icons[subject] || '📚';
};


const StatisticsModalContent: React.FC<StatisticsModalContentProps> = ({ teacherStats, subjectStats, totalBookings }) => {
    const sortedTeachers = Object.entries(teacherStats).sort(([, a], [, b]) => b.count - a.count);
    const sortedSubjects = Object.entries(subjectStats).sort(([, a], [, b]) => b.totalBookings - a.totalBookings);
    
    if (totalBookings === 0) {
        return (
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg text-center">
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-2xl font-bold text-blue-800 mb-4">لا توجد إحصائيات بعد</h3>
                <p className="text-blue-600 text-lg">ابدأ بإضافة حجوزات لتظهر الإحصائيات هنا!</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 text-gray-800">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                <h4 className="text-lg font-bold text-green-800 mb-3 text-center">📈 الإحصائيات العامة</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white p-3 rounded-lg shadow"><div className="text-2xl font-bold text-blue-600">{sortedTeachers.length}</div><div className="text-sm text-gray-600">معلم نشط</div></div>
                    <div className="bg-white p-3 rounded-lg shadow"><div className="text-2xl font-bold text-green-600">{totalBookings}</div><div className="text-sm text-gray-600">إجمالي الحجوزات</div></div>
                    <div className="bg-white p-3 rounded-lg shadow"><div className="text-2xl font-bold text-purple-600">{sortedSubjects.length}</div><div className="text-sm text-gray-600">مادة مختلفة</div></div>
                     <div className="bg-white p-3 rounded-lg shadow"><div className="text-2xl font-bold text-orange-600">{new Set(Object.values(teacherStats).flatMap(s => Array.from(s.months))).size}</div><div className="text-sm text-gray-600">شهر نشط</div></div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-blue-800 mb-2 text-center">📊 إحصائيات المعلمين</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {sortedTeachers.map(([name, stats], index) => {
                         const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👨‍🏫';
                         return (
                            <div key={name} className="bg-white p-4 rounded-lg shadow-md border-r-4 border-blue-500">
                                <div className="flex items-center justify-between mb-3"><h4 className="font-bold text-gray-800">{medal} {name}</h4><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">{stats.count} حجز</span></div>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p><span className="font-semibold">📚 المواد:</span> {Array.from(stats.subjects).join(', ')}</p>
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                        <p className="font-semibold text-gray-700 mb-1">آخر الحجوزات:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {stats.dates.slice(0, 3).map((d, i) => <span key={i} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{d.day} {d.date} - ح{d.period}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                         )
                    })}
                </div>
            </div>

             <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-purple-800 mb-4 text-center">📚 إحصائيات المواد الدراسية</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    {sortedSubjects.map(([subject, stats]) => (
                        <div key={subject} className="bg-white p-4 rounded-lg shadow-md border-r-4 border-purple-500">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-gray-800 flex items-center gap-2"><span className="text-2xl">{getSubjectIcon(subject)}</span>{subject}</h4>
                                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">{stats.totalBookings} حجز</span>
                            </div>
                            <div className="text-sm text-gray-600"><p className="font-semibold text-gray-700 mb-2">أبرز المعلمين:</p>
                                {Object.entries(stats.teacherDetails).sort(([, a], [, b]) => b - a).slice(0, 3).map(([teacher, count]) => (
                                    <div key={teacher} className="flex items-center justify-between bg-gray-50 px-3 py-1 rounded-lg mb-1"><span>{teacher}</span><span className="font-bold">{count}</span></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StatisticsModalContent;
