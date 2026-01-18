interface PieceProps {
  color: 'white' | 'black';
  className?: string;
}

export function Pawn({ color, className }: PieceProps) {
  const stroke = color === 'white' ? '#333' : '#000';

  return (
    <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`pawnGrad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color === 'white' ? '#fff' : '#4a4a4a'} />
          <stop offset="100%" stopColor={color === 'white' ? '#d4d4d4' : '#1a1a1a'} />
        </linearGradient>
      </defs>
      <g fill={`url(#pawnGrad-${color})`} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Head */}
        <circle cx="22.5" cy="12" r="5" />
        {/* Neck */}
        <path d="M20 17.5c0 2 2.5 2.5 2.5 5 0 .5-.5 1-1.5 1h3c-1 0-1.5-.5-1.5-1 0-2.5 2.5-3 2.5-5" />
        {/* Body */}
        <path d="M17.5 26h10c0 0 1-1.5 1-4 0-1.5-1-2.5-2-3-1 0-1.5.5-3 .5s-2-.5-3-.5c-1 .5-2 1.5-2 3 0 2.5 1 4 1 4z" />
        {/* Base */}
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s2-4.5 0-7c-1.5-1.5-5.5-2.5-10.5-2.5s-9 1-10.5 2.5c-2 2.5 0 7 0 7v7" />
        {/* Base details */}
        <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none" />
      </g>
    </svg>
  );
}
