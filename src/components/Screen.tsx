import React from 'react';

interface ScreenProps {
  children: React.ReactNode;
  bg?: string;
  className?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  bg = '#FAF6EA',
  className = '',
}) => {
  return (
    <div
      className="w-full min-h-[100dvh] flex justify-center items-center overflow-x-hidden"
      style={{ backgroundColor: bg }}
    >
      <main
        className={`w-full min-h-[100dvh] sm:max-w-[430px] sm:h-[844px] sm:max-h-[932px] sm:rounded-[40px] sm:shadow-2xl sm:my-auto relative overflow-hidden flex flex-col justify-between select-none ${className}`}
        style={{ backgroundColor: bg }}
      >
        {children}
      </main>
    </div>
  );
};
