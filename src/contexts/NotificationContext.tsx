import React, { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export interface AppNotification {
  id: string;
  created_at: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
  is_read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
  isLoading: boolean;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

const fetchNotifications = async (userId: string): Promise<AppNotification[]> => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: notifications = [], isLoading } = useQuery<AppNotification[]>({
    queryKey: ["notifications", user?.id],
    queryFn: () => fetchNotifications(user!.id),
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const clearAllNotificationsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("notifications").delete().eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAsRead: markAsReadMutation.mutate,
        deleteNotification: deleteNotificationMutation.mutate,
        clearAllNotifications: clearAllNotificationsMutation.mutate,
        unreadCount,
        isLoading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};