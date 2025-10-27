
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-12 relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-1"></div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 relative z-10 animate-pulse">
        <span className="inline-block animate-bounce">📚</span> 
        نظام حجز مركز مصادر التعلم
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 relative z-10 opacity-90">
        بمدرسة أبو عبيدة للتعليم الأساسي (10 - 12)
      </h2>
      <p className="text-lg md:text-xl relative z-10 animate-fade-in opacity-0">
        <span className="inline-block animate-pulse">📖</span>
        احجز موعدك بسهولة ويسر
        <span className="inline-block animate-pulse">📚</span>
      </p>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-20 w-3 h-3 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-2 h-2 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-white/15 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </header>
  );
};

export default Header;
