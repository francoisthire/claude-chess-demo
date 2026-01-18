interface PieceProps {
  color: 'white' | 'black';
  className?: string;
}

export function Knight({ color, className }: PieceProps) {
  const stroke = color === 'white' ? '#333' : '#000';

  return (
    <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`knightGrad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color === 'white' ? '#fff' : '#4a4a4a'} />
          <stop offset="100%" stopColor={color === 'white' ? '#d4d4d4' : '#1a1a1a'} />
        </linearGradient>
      </defs>
      <g fill={`url(#knightGrad-${color})`} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Horse head and body */}
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
        <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" />
        {/* Eye */}
        <circle cx="19" cy="16.5" r="1" fill={stroke} stroke="none" />
        {/* Nostril */}
        <path d="M13 19c-1 1.5 0 3.5 1 3" fill="none" />
      </g>
    </svg>
  );
}
