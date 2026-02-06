import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AdmitStudentIcon3D, AddTeacherIcon3D, ScheduleIcon3D, EnterGradeIcon3D } from '@/components/icons/ThreeDIcons';
import { AppleAdmitIcon, AppleTeacherIcon, AppleScheduleIcon, AppleGradesIcon } from '@/components/icons/AppleStyleIcons';
import { LayoutStyle } from '@/contexts/DashboardLayoutContext';

interface QuickActionsProps {
  onNavigate: (tab: string) => void;
  variant?: LayoutStyle;
}

export const QuickActions = ({ onNavigate, variant = 'modern' }: QuickActionsProps) => {
  const isClassic = variant === 'classicBlue';
  const isApple = variant === 'apple';
  
  const actions = [
    {
      icon: isApple ? AppleAdmitIcon : AdmitStudentIcon3D,
      label: 'Admit Student',
      onClick: () => onNavigate('enrollment'),
      bgClass: isApple ? 'apple-card' : isClassic ? 'classic-card' : 'bg-card hover:bg-muted',
      iconBg: isApple ? 'bg-[#007AFF]/10' : 'bg-info/10',
      iconColor: isApple ? 'text-[#007AFF]' : 'text-info',
    },
    {
      icon: isApple ? AppleTeacherIcon : AddTeacherIcon3D,
      label: 'Add Teacher',
      onClick: () => onNavigate('teachers'),
      bgClass: isApple ? 'apple-card' : isClassic ? 'classic-card' : 'bg-card hover:bg-muted',
      iconBg: isApple ? 'bg-[#34C759]/10' : 'bg-success/10',
      iconColor: isApple ? 'text-[#34C759]' : 'text-success',
    },
    {
      icon: isApple ? AppleScheduleIcon : ScheduleIcon3D,
      label: 'Schedule',
      onClick: () => onNavigate('academic-years'),
      bgClass: isApple ? 'apple-card' : isClassic ? 'classic-card' : 'bg-card hover:bg-muted',
      iconBg: isApple ? 'bg-[#FF9500]/10' : 'bg-warning/10',
      iconColor: isApple ? 'text-[#FF9500]' : 'text-warning',
    },
    {
      icon: isApple ? AppleGradesIcon : EnterGradeIcon3D,
      label: 'Enter Grades',
      onClick: () => onNavigate('grades'),
      bgClass: isApple ? 'apple-card' : isClassic ? 'classic-card' : 'bg-card hover:bg-muted',
      iconBg: isApple ? 'bg-[#AF52DE]/10' : 'bg-stat-purple/10',
      iconColor: isApple ? 'text-[#AF52DE]' : 'text-stat-purple',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2 + index * 0.05,
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          whileHover={isApple ? {
            scale: 1.02,
            y: -4,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
          } : {
            rotateX: -15,
            y: -8,
            scale: 1.02,
            boxShadow: isClassic 
              ? "0 25px 30px -5px rgb(0 0 0 / 0.15), 0 10px 15px -6px rgb(0 0 0 / 0.15)"
              : "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
          }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          style={isApple ? {} : {
            transformOrigin: "top",
            perspective: "1000px"
          }}
          className={cn(
            "p-4 flex flex-col items-center gap-2 transition-all",
            isApple ? "rounded-[16px] border-0" : isClassic ? "rounded-2xl border-0" : "rounded-xl border border-border",
            action.bgClass
          )}
        >
          <div className={cn(
            "p-2 h-12 w-12 flex items-center justify-center",
            isApple ? "rounded-xl" : "rounded-full",
            action.iconBg
          )}>
            <action.icon className={cn(
              "h-full w-full",
              isApple ? action.iconColor : "drop-shadow-sm"
            )} />
          </div>
          <span className={cn(
            "font-medium text-foreground",
            isApple ? "text-[13px] font-medium" : "text-sm"
          )}>{action.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};
