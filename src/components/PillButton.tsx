import React from 'react';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'black' | 'cream';
  children: React.ReactNode;
  className?: string;
}

export const PillButton: React.FC<PillButtonProps> = ({
  variant = 'black',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = variant === 'black'
    ? 'bg-[#1A1C22] text-white hover:bg-[#2A2C34]'
    : 'bg-[#FAF6EA] text-[#1A1C22] hover:bg-[#F3EEDC]';

  return (
    <button
      className={`btn-press w-full h-[56px] rounded-full font-heading font-black text-[18px] leading-tight flex items-center justify-center transition-all ${variantStyles} ${className}`}
      style={{
        fontFamily: "'Proxima Soft Black', 'Proxima Soft', 'Nunito', system-ui, -apple-system, sans-serif",
        fontWeight: 900,
      }}
      {...props}
    >
      {children}
    </button>
  );
};
