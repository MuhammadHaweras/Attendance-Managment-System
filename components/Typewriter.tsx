import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  showCursor?: boolean;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 150, className = '', showCursor = true }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText(''); // Reset on text change
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className={className}>
      <span>{displayedText}</span>
      {showCursor && <span className="blinking-cursor"></span>}
    </div>
  );
};

export default Typewriter;
