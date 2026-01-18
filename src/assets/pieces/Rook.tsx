interface PieceProps {
  color: 'white' | 'black';
  className?: string;
}

export function Rook({ color, className }: PieceProps) {
  const stroke = color === 'white' ? '#333' : '#000';

  return (
    <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`rookGrad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color === 'white' ? '#fff' : '#4a4a4a'} />
          <stop offset="100%" stopColor={color === 'white' ? '#d4d4d4' : '#1a1a1a'} />
        </linearGradient>
      </defs>
      <g fill={`url(#rookGrad-${color})`} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Battlements */}
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
        {/* Tower body */}
        <path d="M34 14l-3 3H14l-3-3" />
        <path d="M31 17v12.5H14V17" />
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
        <path d="M11 14h23" fill="none" />
      </g>
    </svg>
  );
}
