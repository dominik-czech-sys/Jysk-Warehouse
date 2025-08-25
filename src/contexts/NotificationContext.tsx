import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useTranslation } from "react-i18next";

export interface AppNotification {
  id: string;
  timestamp: number;
  type: "info" | "warning" | "error" | "success";
  message: string;
  isRead: boolean;
  link?: string; // Optional link for the notification
}

interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (type: AppNotification['type'], message: string, link?: string) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const storedNotifications = localStorage.getItem("appNotifications");
      if (storedNotifications) {
        return JSON.parse(storedNotifications);
      }
    } catch (error) {
      console.error("Failed to parse notifications from localStorage", error);
      localStorage.removeItem("appNotifications");
    }
    return [];
  });
  const { t } = useTranslation();

  useEffect(() => {
    try {
      localStorage.setItem("appNotifications", JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to save notifications to localStorage", error);
    }
  }, [notifications]);

  const addNotification = (type: AppNotification['type'], message: string, link?: string) => {
    const newNotification: AppNotification = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      type,
      message: t(message), // Translate the message
      isRead: false,
      link,
    };
    setNotifications((prev) => [newNotification, ...prev]); // Add new notifications to the top
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        deleteNotification,
        clearAllNotifications,
        unreadCount,
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