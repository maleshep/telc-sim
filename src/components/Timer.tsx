import { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  /** Total seconds for this timer */
  seconds: number;
  /** Called when time hits zero */
  onExpired: () => void;
  /** Pause the countdown */
  paused?: boolean;
}

export function Timer({ seconds, onExpired, paused }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  // Reset when seconds prop changes (new section)
  useEffect(() => { setRemaining(seconds); }, [seconds]);

  useEffect(() => {
    if (paused || remaining <= 0) return;
    const id = setTimeout(() => {
      setRemaining(r => {
        if (r <= 1) {
          onExpiredRef.current();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearTimeout(id);
  }, [paused, remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const urgent = remaining > 0 && remaining < 120;
  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0;

  return (
    <div className="flex items-center gap-2.5">
      <Clock size={16} className={urgent ? 'text-wrong animate-pulse' : 'text-gray-400'} />
      <div className="progress-track !h-2 !w-24">
        <div
          className={`progress-fill transition-all duration-1000 ${
            urgent ? 'bg-wrong' : 'bg-telc'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`font-mono text-sm tabular-nums font-bold ${
          urgent ? 'text-wrong' : 'text-gray-500'
        }`}
      >
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    </div>
  );
}
