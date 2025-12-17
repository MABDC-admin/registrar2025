import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { 
  X, 
  Printer,
  Camera,
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Student, StudentDocument } from '@/types/student';
import { DocumentSlot } from './DocumentSlot';
import { StudentProfileCard } from './StudentProfileCard';
import { 
  useStudentDocuments, 
  useUploadDocument, 
  useDeleteDocument,
  useUploadStudentPhoto 
} from '@/hooks/useStudentDocuments';
import { toast } from 'sonner';

interface StudentProfileModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentProfileModal = ({ student, isOpen, onClose }: StudentProfileModalProps) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  
  const { data: documents = [] } = useStudentDocuments(student?.id || '');
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const uploadPhoto = useUploadStudentPhoto();

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDocumentUpload = async (slot: number, file: File) => {
    await uploadDocument.mutateAsync({ 
      studentId: student.id, 
      slotNumber: slot, 
      file 
    });
    toast.success('Document uploaded successfully');
  };

  const handleDocumentDelete = async (slot: number, documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    await deleteDocument.mutateAsync({ 
      documentId, 
      studentId: student.id,
      fileUrl: doc?.file_url || null
    });
    toast.success('Document deleted');
  };

  const getDocumentForSlot = (slot: number): StudentDocument | null => {
    return documents.find(d => d.slot_number === slot) || null;
  };

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-4xl max-h-[90vh] bg-card rounded-2xl shadow-lg z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{student.student_name}</h2>
                <p className="text-sm text-muted-foreground">LRN: {student.lrn}</p>
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

            {/* Tabs */}
            <div className="px-6 pt-4 no-print">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <StudentProfileCard student={student} showPhotoUpload={true} />
                  </motion.div>
                )}

                {activeTab === 'documents' && (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Student Documents
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Upload and manage student documents. Drag and drop or click to upload files.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((slot, index) => (
                        <DocumentSlot
                          key={slot}
                          slot={slot}
                          studentId={student.id}
                          document={getDocumentForSlot(slot)}
                          onUpload={handleDocumentUpload}
                          onDelete={handleDocumentDelete}
                          index={index}
                        />
                      ))}
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