import { cn } from '@/lib/utils';
import { DNABase } from '@/lib/dna';

interface DNASequenceProps {
  sequence: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const baseColors: Record<DNABase, string> = {
  A: 'dna-base-A',
  T: 'dna-base-T',
  C: 'dna-base-C',
  G: 'dna-base-G',
};

export function DNASequence({ sequence, className, size = 'md', animate = false }: DNASequenceProps) {
  const sizeClasses = {
    sm: 'text-sm gap-0.5',
    md: 'text-xl gap-1',
    lg: 'text-3xl gap-1.5',
  };

  const baseSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-wrap font-mono font-bold', sizeClasses[size], className)}>
      {sequence.split('').map((base, index) => (
        <span
          key={index}
          className={cn(
            'inline-flex items-center justify-center rounded-md bg-secondary/50 transition-all duration-300',
            baseSizeClasses[size],
            baseColors[base as DNABase] || 'text-muted-foreground',
            animate && 'hover:scale-110 hover:bg-secondary'
          )}
          style={{
            animationDelay: animate ? `${index * 50}ms` : undefined,
          }}
        >
          {base}
        </span>
      ))}
    </div>
  );
}

// DNA Helix visualization component
export function DNAHelix({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-16 h-32', className)}>
      <svg viewBox="0 0 60 120" className="w-full h-full animate-pulse-subtle">
        <defs>
          <linearGradient id="helixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--dna-a))" />
            <stop offset="33%" stopColor="hsl(var(--dna-t))" />
            <stop offset="66%" stopColor="hsl(var(--dna-c))" />
            <stop offset="100%" stopColor="hsl(var(--dna-g))" />
          </linearGradient>
        </defs>
        
        {/* Left strand */}
        <path
          d="M 10 10 Q 50 30, 10 50 Q 50 70, 10 90 Q 50 110, 10 120"
          fill="none"
          stroke="url(#helixGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Right strand */}
        <path
          d="M 50 10 Q 10 30, 50 50 Q 10 70, 50 90 Q 10 110, 50 120"
          fill="none"
          stroke="url(#helixGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
        
        {/* Base pairs */}
        {[20, 40, 60, 80, 100].map((y, i) => (
          <line
            key={i}
            x1="15"
            y1={y}
            x2="45"
            y2={y}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            opacity="0.5"
          />
        ))}
      </svg>
    </div>
  );
}
