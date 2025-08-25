import React, { useState, useMemo } from "react";
import { useTasks, Task } from "@/data/tasks";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

const TaskManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, isLoading, addTask, updateTask, deleteTask } = useTasks();
  const { hasPermission } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      setIsDeleteOpen(false);
    }
  };

  const handleFormSubmit = async (formData: Partial<Task>) => {
    if (formData.id) {
      await updateTask(formData as Task);
    } else {
      await addTask(formData as any);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="secondary">{t('common.task.statusNew')}</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500 text-white">{t('common.task.statusInProgress')}</Badge>;
      case 'completed': return <Badge className="bg-green-500 text-white">{t('common.task.statusCompleted')}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return t('common.task.priorityLow');
      case 'medium': return t('common.task.priorityMedium');
      case 'high': return t('common.task.priorityHigh');
      default: return priority;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{t("common.task.taskManagement")}</h1>
        {hasPermission("task:create") && (
          <Button onClick={handleAddTask}>
            <PlusCircle className="h-4 w-4 mr-2" /> {t("common.task.addTask")}
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("common.task.taskList")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.task.title")}</TableHead>
                  <TableHead>{t("common.task.status")}</TableHead>
                  <TableHead>{t("common.task.priority")}</TableHead>
                  <TableHead>{t("common.task.dueDate")}</TableHead>
                  <TableHead className="text-right">{t("common.action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center">{t("common.task.loadingTasks")}</TableCell></TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{getPriorityText(task.priority)}</TableCell>
                      <TableCell>{task.due_date ? format(new Date(task.due_date), "d. M. yyyy", { locale: cs }) : '-'}</TableCell>
                      <TableCell className="text-right">
                        {hasPermission("task:update") && (
                          <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)} className="mr-2"><Edit className="h-4 w-4" /></Button>
                        )}
                        {hasPermission("task:delete") && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.task.confirmDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.task.confirmDeleteDescription", { taskTitle: taskToDelete?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskManagementPage;