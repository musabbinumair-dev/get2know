import React from 'react';

interface ScreenProps {
  children: React.ReactNode;
  bg?: string;
  className?: string;
  fullWidth?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  bg = '#FAF6EA',
  className = '',
  fullWidth = false,
}) => {
  return (
    <div
      className="w-full h-full min-h-[100dvh] flex-1 flex justify-center overflow-x-hidden"
      style={{ backgroundColor: bg }}
    >
      <main
        className={`w-full h-full min-h-[100dvh] flex-1 ${fullWidth ? 'w-full' : 'md:max-w-[430px]'} relative overflow-hidden flex flex-col justify-between select-none ${className}`}
        style={{ backgroundColor: bg }}
      >
        {children}
      </main>
    </div>
  );
};
