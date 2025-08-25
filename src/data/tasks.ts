import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'new' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to_user_id?: string;
  created_by_user_id?: string;
  store_id?: string;
  created_at: string;
  updated_at: string;
}

type NewTask = Omit<Task, 'id' | 'created_at' | 'updated_at'>;

const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) throw new Error(error.message);
  return data;
};

const addTaskToDb = async (newTask: NewTask) => {
  const { data, error } = await supabase.from("tasks").insert(newTask).select().single();
  if (error) throw new Error(error.message);

  if (data && data.assigned_to_user_id) {
    await supabase.from("notifications").insert({
      user_id: data.assigned_to_user_id,
      type: 'info',
      message: `Byl vám přiřazen nový úkol: ${data.title}`,
      link: '/ukoly'
    });
  }
  return data;
};

const updateTaskInDb = async (updatedTask: Partial<Task> & { id: string }) => {
  const { data: originalTask } = await supabase.from("tasks").select("assigned_to_user_id").eq("id", updatedTask.id).single();
  
  const { data, error } = await supabase.from("tasks").update(updatedTask).eq("id", updatedTask.id).select().single();
  if (error) throw new Error(error.message);

  if (data && data.assigned_to_user_id && data.assigned_to_user_id !== originalTask?.assigned_to_user_id) {
     await supabase.from("notifications").insert({
      user_id: data.assigned_to_user_id,
      type: 'info',
      message: `Byl vám přiřazen úkol: ${data.title}`,
      link: '/ukoly'
    });
  }
  return data;
};

const deleteTaskFromDb = async (taskId: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(error.message);
  return taskId;
};

export const useTasks = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  const addTaskMutation = useMutation({
    mutationFn: addTaskToDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(t("common.task.addSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTaskInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(t("common.task.updateSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTaskFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(t("common.task.deleteSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    tasks: tasks || [],
    isLoading,
    error,
    addTask: addTaskMutation.mutateAsync,
    updateTask: updateTaskMutation.mutateAsync,
    deleteTask: deleteTaskMutation.mutateAsync,
  };
};