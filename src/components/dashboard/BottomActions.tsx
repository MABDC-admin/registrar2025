import { motion } from 'framer-motion';
import { Users, LayoutGrid, ClipboardCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LayoutStyle } from '@/contexts/DashboardLayoutContext';

interface BottomActionsProps {
  onNavigate: (tab: string) => void;
  variant?: LayoutStyle;
}

export const BottomActions = ({ onNavigate, variant = 'modern' }: BottomActionsProps) => {
  const isClassic = variant === 'classicBlue';
  
  const actions = [
    {
      icon: Users,
      label: 'Manage Students',
      onClick: () => onNavigate('students'),
      bgClass: isClassic ? 'classic-card' : 'bg-card',
      iconBg: 'bg-info/10',
      iconColor: 'text-info',
    },
    {
      icon: LayoutGrid,
      label: 'Organize Classes',
      onClick: () => onNavigate('subjects'),
      bgClass: isClassic ? 'classic-card' : 'bg-card',
      iconBg: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      icon: ClipboardCheck,
      label: 'Track Attendance',
      onClick: () => onNavigate('grades'),
      bgClass: isClassic ? 'classic-stat-blue text-white' : 'bg-info',
      iconBg: 'bg-white/20',
      iconColor: 'text-white',
      textColor: 'text-white',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6"
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + index * 0.05 }}
          onClick={action.onClick}
          className={cn(
            "p-4 flex items-center gap-3 transition-all hover:shadow-md",
            isClassic ? "rounded-2xl shadow-lg border-0" : "rounded-xl shadow-sm border border-border",
            action.bgClass
          )}
        >
          <div className={cn("p-2 rounded-lg", action.iconBg)}>
            <action.icon className={cn("h-5 w-5", action.iconColor)} />
          </div>
          <span className={cn("text-sm font-medium flex-1 text-left", action.textColor || 'text-foreground')}>
            {action.label}
          </span>
          <ChevronRight className={cn("h-5 w-5", action.textColor || 'text-muted-foreground')} />
        </motion.button>
      ))}
    </motion.div>
  );
};
