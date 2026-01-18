interface PieceProps {
  color: 'white' | 'black';
  className?: string;
}

export function King({ color, className }: PieceProps) {
  const stroke = color === 'white' ? '#333' : '#000';

  return (
    <svg viewBox="0 0 45 45" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`kingGrad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color === 'white' ? '#fff' : '#4a4a4a'} />
          <stop offset="100%" stopColor={color === 'white' ? '#d4d4d4' : '#1a1a1a'} />
        </linearGradient>
      </defs>
      <g fill={`url(#kingGrad-${color})`} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Cross on top */}
        <path d="M22.5 11.63V6M20 8h5" strokeWidth="1.5" fill="none" />
        {/* Crown */}
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
        {/* Left wing */}
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z" />
        {/* Base details */}
        <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none" />
      </g>
    </svg>
  );
}
