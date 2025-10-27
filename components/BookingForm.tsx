import React, { useState, useEffect } from 'react';
import { SlotInfo } from '../types';
import { SUBJECTS, GRADES } from '../constants';
import { GoogleGenAI } from '@google/genai';

interface BookingFormProps {
  slotInfo: SlotInfo;
  onConfirm: (bookingDetails: { teacherName: string; subject: string; lesson: string; grade: string; }) => void;
  onCancel: () => void;
  onTeacherNameChange: (name: string) => void;
}

const GeminiIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transition-transform duration-500 group-hover:rotate-180">
        <path d="M4.68 14.735a5.45 5.45 0 0 1 0-7.709l3.246-3.246a5.45 5.45 0 0 1 7.71 0l3.245 3.246a5.45 5.45 0 0 1 0 7.71l-3.246 3.245a5.45 5.45 0 0 1-7.71 0zM12 21.4a9.4 9.4 0 1 0 0-18.8 9.4 9.4 0 0 0 0 18.8z"/>
    </svg>
)

const BookingForm: React.FC<BookingFormProps> = ({ slotInfo, onConfirm, onCancel, onTeacherNameChange }) => {
  const [teacherName, setTeacherName] = useState('');
  const [subject, setSubject] = useState('');
  const [lesson, setLesson] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    // Reset form when slotInfo changes
    setTeacherName('');
    setSubject('');
    setLesson('');
    setSelectedGrade('');
  }, [slotInfo]);

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
  };
  
  const handleTeacherNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeacherName(e.target.value);
    onTeacherNameChange(e.target.value);
  }

  const handleSubmit = () => {
    if (teacherName && subject && lesson && selectedGrade) {
      onConfirm({ teacherName, subject, lesson, grade: selectedGrade });
    } else {
      alert('يرجى ملء جميع البيانات المطلوبة واختيار الصف والشعبة.');
    }
  };

  const suggestLesson = async () => {
    if (!subject || !selectedGrade) {
      alert("يرجى اختيار المادة والصف أولاً للحصول على اقتراح.");
      return;
    }
    setIsSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const gradeLevel = selectedGrade.split(' ')[0]; // e.g., "10"
      const prompt = `أنا معلم وأحتاج إلى اقتراح عنوان درس. المادة هي '${subject}' والصف هو '${gradeLevel}'. اقترح عنوان درس واحد مناسب ومختصر باللغة العربية.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setLesson(response.text.trim().replace(/"/g, ''));
    } catch (error) {
      console.error("Error suggesting lesson:", error);
      alert("عذراً، حدث خطأ أثناء اقتراح الدرس. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="relative rounded-2xl p-6 mb-8 shadow-lg bg-white/95 backdrop-blur-md border border-white/20 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-shimmer"></div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        <span className="inline-block animate-pulse">📝</span>
        الخطوة الثالثة: أدخل بيانات الحجز
        <span className="inline-block animate-pulse">📚</span>
      </h2>

      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 mb-2">اسم المعلم</label>
            <input type="text" id="teacherName" required value={teacherName} onChange={handleTeacherNameInput} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">المادة</label>
            <select id="subject" required value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer">
              <option value="">-- اختر المادة --</option>
              {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="lesson" className="block text-sm font-medium text-gray-700 mb-2">الدرس</label>
            <div className="relative">
                <input type="text" id="lesson" required value={lesson} onChange={e => setLesson(e.target.value)} className="w-full pl-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                <button onClick={suggestLesson} disabled={isSuggesting} className="group absolute left-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-md text-xs hover:from-blue-600 disabled:from-blue-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 transform hover:scale-105">
                    <GeminiIcon />
                    {isSuggesting ? 'جاري...' : 'اقترح'}
                </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🎓 اختيار الصف والشعبة</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(GRADES).map(([gradeLevel, classes]) => (
              <div key={gradeLevel}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{`📘 الصف ${gradeLevel}`}</label>
                <select 
                    value={selectedGrade.startsWith(gradeLevel) ? selectedGrade : ''}
                    onChange={e => handleGradeSelect(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer">
                  <option value="">-- اختر الشعبة --</option>
                  {classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center flex gap-4 justify-center">
          <button type="button" onClick={onCancel} className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105">
            ❌ إلغاء
          </button>
          <button type="button" onClick={handleSubmit} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105">
            💾 تأكيد الحجز
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;