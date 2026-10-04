import React from 'react';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'black' | 'cream';
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export const PillButton: React.FC<PillButtonProps> = ({
  variant = 'black',
  children,
  className = '',
  isLoading = false,
  disabled,
  ...props
}) => {
  const variantStyles = variant === 'black'
    ? 'bg-[#1A1C22] text-white hover:bg-[#2A2C34]'
    : 'bg-[#FAF6EA] text-[#1A1C22] hover:bg-[#F3EEDC]';

  const spinnerColor = variant === 'black' ? 'border-white/30 border-t-white' : 'border-[#1A1C22]/30 border-t-[#1A1C22]';

  return (
    <button
      disabled={isLoading || disabled}
      className={`btn-press w-full h-[56px] rounded-full font-heading font-black text-[18px] leading-tight flex items-center justify-center transition-all ${variantStyles} ${className} ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
      style={{
        fontFamily: "'Proxima Soft Black', 'Proxima Soft', 'Nunito', system-ui, -apple-system, sans-serif",
        fontWeight: 900,
      }}
      {...props}
    >
      {isLoading ? (
        <div className={`w-[22px] h-[22px] border-2 ${spinnerColor} rounded-full animate-spin`} />
      ) : (
        children
      )}
    </button>
  );
};
