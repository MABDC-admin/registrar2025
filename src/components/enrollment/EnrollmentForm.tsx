import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateStudent } from '@/hooks/useStudents';
import { toast } from 'sonner';

const GRADE_LEVELS = [
  'Kinder 1', 'Kinder 2',
  'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 
  'Level 6', 'Level 7', 'Level 8', 'Level 9', 'Level 10',
  'Level 11', 'Level 12'
];

const SCHOOL_YEARS = [
  '2025-2026', '2024-2025', '2023-2024'
];

const GENDERS = ['Male', 'Female'];

export const EnrollmentForm = () => {
  const [formData, setFormData] = useState({
    student_name: '',
    lrn: '',
    level: '',
    school_year: '2025-2026',
    birth_date: '',
    gender: '',
    mother_maiden_name: '',
    mother_contact: '',
    father_name: '',
    father_contact: '',
    phil_address: '',
    uae_address: '',
    previous_school: '',
  });

  const createStudent = useCreateStudent();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.student_name || !formData.lrn || !formData.level) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createStudent.mutateAsync({
        student_name: formData.student_name,
        lrn: formData.lrn,
        level: formData.level,
        birth_date: formData.birth_date || undefined,
        gender: formData.gender || undefined,
        mother_maiden_name: formData.mother_maiden_name || undefined,
        mother_contact: formData.mother_contact || undefined,
        father_name: formData.father_name || undefined,
        father_contact: formData.father_contact || undefined,
        phil_address: formData.phil_address || undefined,
        uae_address: formData.uae_address || undefined,
        previous_school: formData.previous_school || undefined,
      });
      
      toast.success('Student enrolled successfully!');
      
      // Reset form
      setFormData({
        student_name: '',
        lrn: '',
        level: '',
        school_year: '2025-2026',
        birth_date: '',
        gender: '',
        mother_maiden_name: '',
        mother_contact: '',
        father_name: '',
        father_contact: '',
        phil_address: '',
        uae_address: '',
        previous_school: '',
      });
    } catch (error) {
      toast.error('Failed to enroll student');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card p-6 lg:p-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <UserPlus className="h-6 w-6 text-stat-purple" />
        <h2 className="text-xl font-bold text-foreground">New Student Enrollment</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Student Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-stat-purple">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter student's full name"
                value={formData.student_name}
                onChange={(e) => handleChange('student_name', e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-stat-purple">
                LRN (Learner Reference Number) <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="12-digit LRN"
                value={formData.lrn}
                onChange={(e) => handleChange('lrn', e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-stat-purple">
                Grade Level <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.level} onValueChange={(v) => handleChange('level', v)}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-stat-purple">
                School Year <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.school_year} onValueChange={(v) => handleChange('school_year', v)}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Select school year" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOL_YEARS.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-stat-purple">
                Birth Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleChange('birth_date', e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-stat-purple">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map(gender => (
                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Parent/Guardian Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-stat-purple">
                Mother's Maiden Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter mother's maiden name"
                value={formData.mother_maiden_name}
                onChange={(e) => handleChange('mother_maiden_name', e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-stat-purple">
                Mother's Contact Number <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g., 09123456789"
                value={formData.mother_contact}
                onChange={(e) => handleChange('mother_contact', e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-stat-purple">
                Father's Name <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter father's name"
                value={formData.father_name}
                onChange={(e) => handleChange('father_name', e.target.value)}
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-stat-purple">
                Father's Contact Number <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g., 09123456789"
                value={formData.father_contact}
                onChange={(e) => handleChange('father_contact', e.target.value)}
                className="bg-secondary/50"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-stat-purple">
                Philippine Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Enter complete Philippine address"
                value={formData.phil_address}
                onChange={(e) => handleChange('phil_address', e.target.value)}
                className="bg-secondary/50 min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-stat-purple">
                UAE Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Enter complete UAE address"
                value={formData.uae_address}
                onChange={(e) => handleChange('uae_address', e.target.value)}
                className="bg-secondary/50 min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Academic History */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Academic History
          </h3>
          <div className="space-y-2">
            <Label className="text-stat-purple">
              Previous School <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              placeholder="Enter previous school name"
              value={formData.previous_school}
              onChange={(e) => handleChange('previous_school', e.target.value)}
              className="bg-secondary/50"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={createStudent.isPending}
            className="bg-stat-purple hover:bg-stat-purple/90 text-white px-8"
          >
            {createStudent.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Enroll Student
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
