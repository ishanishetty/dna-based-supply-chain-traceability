import { cn } from '@/lib/utils';
import { getRiskLevel, RiskLevel } from '@/lib/dna';

interface HealthIndicatorProps {
  health: number;
  showRisk?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HealthIndicator({ health, showRisk = true, size = 'md', className }: HealthIndicatorProps) {
  const risk = getRiskLevel(health);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const getHealthColor = (health: number) => {
    if (health > 70) return 'bg-health-high';
    if (health >= 40) return 'bg-health-medium';
    return 'bg-health-low';
  };

  const getGlowClass = (health: number) => {
    if (health > 70) return 'glow-success';
    if (health >= 40) return 'glow-warning';
    return 'glow-danger';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Health Score</span>
        <span className={cn(
          'text-lg font-bold font-mono',
          health > 70 ? 'text-health-high' : health >= 40 ? 'text-health-medium' : 'text-health-low'
        )}>
          {health}%
        </span>
      </div>
      
      <div className={cn('w-full bg-secondary rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            getHealthColor(health),
            getGlowClass(health)
          )}
          style={{ width: `${health}%` }}
        />
      </div>

      {showRisk && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Risk Level:</span>
          <RiskBadge risk={risk} />
        </div>
      )}
    </div>
  );
}

interface RiskBadgeProps {
  risk: RiskLevel;
  className?: string;
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const riskClasses: Record<RiskLevel, string> = {
    LOW: 'risk-low',
    MEDIUM: 'risk-medium',
    HIGH: 'risk-high',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
      riskClasses[risk],
      className
    )}>
      {risk}
    </span>
  );
}
