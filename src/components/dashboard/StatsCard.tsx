import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning';
  delay?: number;
}

const variantStyles = {
  default: 'bg-card',
  primary: 'gradient-primary',
  accent: 'gradient-accent',
  success: 'bg-success',
  warning: 'bg-warning',
};

const iconStyles = {
  default: 'bg-secondary text-secondary-foreground',
  primary: 'bg-primary-foreground/20 text-primary-foreground',
  accent: 'bg-accent-foreground/20 text-accent-foreground',
  success: 'bg-success-foreground/20 text-success-foreground',
  warning: 'bg-warning-foreground/20 text-warning-foreground',
};

const textStyles = {
  default: 'text-foreground',
  primary: 'text-primary-foreground',
  accent: 'text-accent-foreground',
  success: 'text-success-foreground',
  warning: 'text-warning-foreground',
};

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  delay = 0 
}: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 shadow-card",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium",
            variant === 'default' ? 'text-muted-foreground' : textStyles[variant] + '/80'
          )}>
            {title}
          </p>
          <p className={cn(
            "mt-2 text-3xl font-bold tracking-tight",
            textStyles[variant]
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "mt-1 text-sm",
              variant === 'default' ? 'text-muted-foreground' : textStyles[variant] + '/70'
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              "mt-2 flex items-center gap-1 text-sm font-medium",
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className={variant === 'default' ? 'text-muted-foreground' : textStyles[variant] + '/60'}>
                vs last month
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "rounded-xl p-3",
          iconStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {/* Decorative element */}
      {variant !== 'default' && (
        <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-foreground/5" />
      )}
    </motion.div>
  );
};
