import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/data/tasks";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Calendar, User } from "lucide-react";

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">{t('common.task.priorityHigh')}</Badge>;
      case 'medium': return <Badge variant="secondary">{t('common.task.priorityMedium')}</Badge>;
      case 'low': return <Badge>{t('common.task.priorityLow')}</Badge>;
      default: return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-2 cursor-grab active:cursor-grabbing">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base">{task.title}</CardTitle>
            {getPriorityBadge(task.priority)}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-sm text-muted-foreground space-y-2">
          {task.description && <p className="line-clamp-2">{task.description}</p>}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{task.due_date ? format(new Date(task.due_date), "d. M. yyyy", { locale: cs }) : t('common.task.noDueDate')}</span>
          </div>
          {/* In a real app, you'd fetch the user's name from their ID */}
          {task.assigned_to_user_id && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{task.assigned_to_user_id.substring(0, 8)}...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};