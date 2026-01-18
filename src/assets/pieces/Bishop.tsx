interface PieceProps {
  color: 'white' | 'black';
  className?: string;
}

export function Bishop({ color, className }: PieceProps) {
  const stroke = color === 'white' ? '#333' : '#000';

  return (
    <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bishopGrad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color === 'white' ? '#fff' : '#4a4a4a'} />
          <stop offset="100%" stopColor={color === 'white' ? '#d4d4d4' : '#1a1a1a'} />
        </linearGradient>
      </defs>
      <g fill={`url(#bishopGrad-${color})`} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Base */}
        <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
        {/* Lower body */}
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
        {/* Top ball */}
        <circle cx="22.5" cy="8" r="2.5" />
        {/* Slit */}
        <path d="M17.5 26h10M15 30h15" fill="none" />
      </g>
    </svg>
  );
}
