import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Task } from "@/data/tasks";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  username: string;
}

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<Task>) => void;
  task?: Task | null;
}

export const TaskFormDialog: React.FC<TaskFormDialogProps> = ({ isOpen, onClose, onSubmit, task }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [usersInStore, setUsersInStore] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.store_id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username")
          .eq("store_id", user.store_id);
        if (error) {
          toast.error(t("common.task.errorFetchingUsers"));
        } else {
          setUsersInStore(data);
        }
      }
    };
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, user?.store_id, t]);

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        title: "",
        description: "",
        status: "new",
        priority: "medium",
        due_date: undefined,
        assigned_to_user_id: undefined,
        store_id: user?.store_id,
        created_by_user_id: user?.id,
      });
    }
  }, [task, isOpen, user]);

  const handleChange = (id: keyof Task, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error(t("common.task.titleRequired"));
      return;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? t("common.task.editTask") : t("common.task.addTask")}</DialogTitle>
          <DialogDescription>{task ? t("common.task.editTaskDescription") : t("common.task.addTaskDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">{t("common.task.title")}</Label>
            <Input id="title" value={formData.title || ""} onChange={(e) => handleChange("title", e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">{t("common.task.description")}</Label>
            <Textarea id="description" value={formData.description || ""} onChange={(e) => handleChange("description", e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">{t("common.task.status")}</Label>
            <Select onValueChange={(value) => handleChange("status", value)} value={formData.status}>
              <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">{t("common.task.statusNew")}</SelectItem>
                <SelectItem value="in_progress">{t("common.task.statusInProgress")}</SelectItem>
                <SelectItem value="completed">{t("common.task.statusCompleted")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">{t("common.task.priority")}</Label>
            <Select onValueChange={(value) => handleChange("priority", value)} value={formData.priority}>
              <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("common.task.priorityLow")}</SelectItem>
                <SelectItem value="medium">{t("common.task.priorityMedium")}</SelectItem>
                <SelectItem value="high">{t("common.task.priorityHigh")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assigned_to_user_id" className="text-right">{t("common.task.assignedTo")}</Label>
            <Select onValueChange={(value) => handleChange("assigned_to_user_id", value)} value={formData.assigned_to_user_id}>
              <SelectTrigger className="col-span-3"><SelectValue placeholder={t("common.task.selectUser")} /></SelectTrigger>
              <SelectContent>
                {usersInStore.map(u => <SelectItem key={u.id} value={u.id}>{u.username}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t("common.task.dueDate")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className="col-span-3 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? format(new Date(formData.due_date), "PPP", { locale: cs }) : <span>{t("common.task.pickDate")}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.due_date ? new Date(formData.due_date) : undefined} onSelect={(date) => handleChange("due_date", date?.toISOString())} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="submit">{task ? t("common.saveChanges") : t("common.task.addTask")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};