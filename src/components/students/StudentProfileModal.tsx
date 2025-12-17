import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  School, 
  Calendar,
  Users,
  Mail,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Student } from '@/types/student';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

const tabs = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'parents', label: 'Parents/Guardian', icon: Users },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'academic', label: 'Academic', icon: School },
];

export const StudentProfileModal = ({ student, isOpen, onClose }: StudentProfileModalProps) => {
  const [activeTab, setActiveTab] = useState('personal');

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string | null; icon?: any }) => (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="text-foreground font-medium">{value || 'Not provided'}</p>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 no-print"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-2xl lg:max-h-[90vh] bg-card rounded-2xl shadow-lg z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {student.student_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{student.student_name}</h2>
                    <p className="text-sm text-muted-foreground font-mono">LRN: {student.lrn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 no-print">
                  <Button variant="ghost" size="icon" onClick={handlePrint} aria-label="Print">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 py-3 border-b border-border no-print">
              <div className="flex gap-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'personal' && (
                  <motion.div
                    key="personal"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    <InfoItem label="Full Name" value={student.student_name} icon={User} />
                    <InfoItem label="LRN" value={student.lrn} icon={Mail} />
                    <InfoItem label="Date of Birth" value={student.birth_date} icon={Calendar} />
                    <InfoItem label="Age" value={student.age?.toString() || null} />
                    <InfoItem label="Gender" value={student.gender} />
                    <InfoItem label="Level" value={student.level} icon={School} />
                  </motion.div>
                )}

                {activeTab === 'parents' && (
                  <motion.div
                    key="parents"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Mother's Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="Maiden Name" value={student.mother_maiden_name} />
                        <InfoItem label="Contact Number" value={student.mother_contact} icon={Phone} />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Father's Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="Full Name" value={student.father_name} />
                        <InfoItem label="Contact Number" value={student.father_contact} icon={Phone} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'address' && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Philippines Address
                      </h3>
                      <p className="text-foreground">{student.phil_address || 'Not provided'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        UAE Address
                      </h3>
                      <p className="text-foreground">{student.uae_address || 'Not provided'}</p>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'academic' && (
                  <motion.div
                    key="academic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <InfoItem label="Current Level" value={student.level} icon={School} />
                      <InfoItem label="LRN" value={student.lrn} />
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <School className="h-4 w-4" />
                        Previous School
                      </h3>
                      <p className="text-foreground">{student.previous_school || 'Not provided'}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
