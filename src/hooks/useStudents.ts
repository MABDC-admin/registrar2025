import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Student, StudentFormData } from '@/types/student';
import { toast } from 'sonner';

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: async (): Promise<Student[]> => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('student_name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (student: StudentFormData) => {
      const { data, error } = await supabase
        .from('students')
        .insert([student])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student added successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to add student: ' + error.message);
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...student }: StudentFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('students')
        .update(student)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update student: ' + error.message);
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete student: ' + error.message);
    },
  });
};

export const useBulkCreateStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (students: StudentFormData[]) => {
      const { data, error } = await supabase
        .from('students')
        .insert(students)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`${data.length} students imported successfully`);
    },
    onError: (error: Error) => {
      toast.error('Failed to import students: ' + error.message);
    },
  });
};
