import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { 
  ArrowLeft,
  User, 
  Phone, 
  MapPin, 
  School, 
  Calendar,
  Users,
  Mail,
  Printer,
  Camera,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentSlot } from '@/components/students/DocumentSlot';
import { 
  useStudentDocuments, 
  useUploadDocument, 
  useDeleteDocument,
  useUploadStudentPhoto 
} from '@/hooks/useStudentDocuments';
import { useStudents } from '@/hooks/useStudents';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const tabs = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'parents', label: 'Parents/Guardian', icon: Users },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'academic', label: 'Academic', icon: School },
  { id: 'documents', label: 'Documents', icon: FileText },
];

const StudentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const { data: students = [], isLoading } = useStudents();
  const student = students.find(s => s.id === id);
  
  const { data: documents = [] } = useStudentDocuments(student?.id || '');
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const uploadPhoto = useUploadStudentPhoto();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Student not found</p>
        <Button onClick={() => navigate('/')}>Go Back</Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      await uploadPhoto.mutateAsync({ studentId: student.id, file });
      toast.success('Photo updated successfully');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDocumentUpload = async (slotNumber: number, file: File) => {
    if (!student) return;
    
    try {
      await uploadDocument.mutateAsync({
        studentId: student.id,
        slotNumber,
        file,
      });
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  const handleDocumentDelete = async (slotNumber: number, documentId: string) => {
    if (!student) return;
    const doc = documents.find(d => d.id === documentId);
    try {
      await deleteDocument.mutateAsync({
        documentId,
        studentId: student.id,
        fileUrl: doc?.file_url || null,
      });
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const InfoItem = ({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: any }) => (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
      {Icon && (
        <div className="p-2 rounded-lg bg-emerald-500/10">
          <Icon className="h-4 w-4 text-emerald-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="font-medium text-foreground break-words">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600/10 via-lime-400/5 to-transparent border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.close()}
                className="no-print"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              {/* Photo Upload Area */}
              <div className="relative group">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                {student.photo_url ? (
                  <img 
                    src={student.photo_url} 
                    alt={student.student_name}
                    className="h-20 w-20 rounded-2xl object-cover border-4 border-emerald-300 shadow-lg"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-lime-400 flex items-center justify-center border-4 border-emerald-300 shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {student.student_name.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Upload Overlay */}
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center no-print"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
                {/* Status indicator */}
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-stat-green border-2 border-background flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{student.student_name}</h1>
                <p className="text-emerald-600 font-medium">{student.level}</p>
                <p className="text-sm text-muted-foreground font-mono">LRN: {student.lrn}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handlePrint} className="no-print">
              <Printer className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border no-print">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Full Name" value={student.student_name} icon={User} />
              <InfoItem label="LRN (Learner Reference Number)" value={student.lrn} icon={Mail} />
              <InfoItem label="Date of Birth" value={student.birth_date} icon={Calendar} />
              <InfoItem label="Age" value={student.age?.toString()} />
              <InfoItem label="Gender" value={student.gender} />
              <InfoItem label="Level" value={student.level} icon={School} />
            </div>
          )}

          {activeTab === 'parents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Mother's Maiden Name" value={student.mother_maiden_name} icon={Users} />
              <InfoItem label="Mother's Contact" value={student.mother_contact} icon={Phone} />
              <InfoItem label="Father's Name" value={student.father_name} icon={Users} />
              <InfoItem label="Father's Contact" value={student.father_contact} icon={Phone} />
            </div>
          )}

          {activeTab === 'address' && (
            <div className="grid grid-cols-1 gap-4">
              <InfoItem label="Philippines Address" value={student.phil_address} icon={MapPin} />
              <InfoItem label="UAE Address" value={student.uae_address} icon={MapPin} />
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Current Level" value={student.level} icon={School} />
              <InfoItem label="Previous School" value={student.previous_school} icon={School} />
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload and manage student documents. Click on an empty slot to upload.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((slotNumber, index) => {
                  const doc = documents.find(d => d.slot_number === slotNumber) || null;
                  return (
                    <DocumentSlot
                      key={slotNumber}
                      slot={slotNumber}
                      studentId={student.id}
                      document={doc}
                      onUpload={handleDocumentUpload}
                      onDelete={handleDocumentDelete}
                      index={index}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfile;
