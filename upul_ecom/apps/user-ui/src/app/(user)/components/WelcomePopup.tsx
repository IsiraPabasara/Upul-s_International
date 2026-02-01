'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface WelcomePopupProps {
  imageSrc: string;
  resetDuration?: number; // in milliseconds, default 15 min
  showDelay?: number; // in milliseconds, default 10 seconds
}

export default function WelcomePopup({ 
  imageSrc, 
  resetDuration = 15 * 60 * 1000, // 15 minutes default
  showDelay = 5 * 1000 // 10 seconds default
}: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if popup has been shown before
    const lastShownTime = localStorage.getItem('welcomePopupTime');
    const now = Date.now();
    
    const shouldShow = !lastShownTime || (now - parseInt(lastShownTime) >= resetDuration);
    
    if (shouldShow) {
      // Show popup after delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('welcomePopupTime', now.toString());
      }, showDelay);
      
      return () => clearTimeout(timer);
    }
  }, [resetDuration, showDelay]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* Image */}
        <img 
          src={imageSrc} 
          alt="Welcome" 
          className="w-64 md:w-96 lg:w-[28rem] h-auto rounded-lg shadow-2xl"
        />

        {/* Close Button - Top Right */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
