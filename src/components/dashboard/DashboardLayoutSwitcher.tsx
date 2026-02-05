import { LayoutGrid, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDashboardLayout, LayoutStyle } from '@/contexts/DashboardLayoutContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const layouts: { id: LayoutStyle; name: string; description: string; preview: React.ReactNode }[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Current clean design',
    preview: (
      <div className="w-full h-12 rounded-md bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center gap-1 p-1">
        <div className="w-2 h-2 rounded bg-primary/60" />
        <div className="w-2 h-2 rounded bg-success/60" />
        <div className="w-2 h-2 rounded bg-warning/60" />
        <div className="w-2 h-2 rounded bg-info/60" />
      </div>
    ),
  },
  {
    id: 'classicBlue',
    name: 'Classic Blue',
    description: 'Glassmorphism style',
    preview: (
      <div className="w-full h-12 rounded-md bg-gradient-to-br from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center gap-1 p-1">
        <div className="w-2 h-2 rounded bg-white/80 shadow-sm" />
        <div className="w-2 h-2 rounded bg-white/80 shadow-sm" />
        <div className="w-2 h-2 rounded bg-white/80 shadow-sm" />
        <div className="w-2 h-2 rounded bg-white/80 shadow-sm" />
      </div>
    ),
  },
];

export const DashboardLayoutSwitcher = () => {
  const { layoutStyle, setLayoutStyle } = useDashboardLayout();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full hover:bg-muted"
          title="Switch Dashboard Layout"
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            {layoutStyle === 'modern' ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4 text-blue-500" />
            )}
          </motion.div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider">
            Dashboard Style
          </p>
          {layouts.map((layout) => (
            <motion.button
              key={layout.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLayoutStyle(layout.id)}
              className={cn(
                "w-full p-2 rounded-lg flex items-start gap-3 transition-all text-left",
                layoutStyle === layout.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted border border-transparent"
              )}
            >
              <div className="w-16 shrink-0">
                {layout.preview}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{layout.name}</span>
                  {layoutStyle === layout.id && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {layout.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
