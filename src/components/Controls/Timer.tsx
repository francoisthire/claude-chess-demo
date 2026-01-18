import styles from './Timer.module.css';

interface TimerProps {
  time: number; // en secondes
  isActive: boolean;
  isTimeout: boolean;
  color: 'white' | 'black';
  playerName?: string;
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function Timer({ time, isActive, isTimeout, color, playerName }: TimerProps) {
  const isLowTime = time > 0 && time < 30;
  const isCriticalTime = time > 0 && time < 10;

  const timerClasses = [
    styles.timer,
    styles[color],
    isActive && styles.active,
    isTimeout && styles.timeout,
    isLowTime && styles.lowTime,
    isCriticalTime && styles.critical,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={timerClasses}>
      {playerName && <div className={styles.playerName}>{playerName}</div>}
      <div className={styles.time}>{formatTime(time)}</div>
    </div>
  );
}
