import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, MailOpen, Trash2, Info, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { cs, enUS, sk } from "date-fns/locale";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export const NotificationList: React.FC = () => {
  const { notifications, markAsRead, deleteNotification, clearAllNotifications, unreadCount } = useNotifications();
  const { t, i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentLocale = useMemo(() => {
    switch (i18n.language) {
      case "en":
        return enUS;
      case "sk":
        return sk;
      case "cs":
      default:
        return cs;
    }
  }, [i18n.language]);

  const getIconForNotificationType = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">{t("common.viewNotifications")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[350px] sm:w-[400px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          {t("common.notifications")}
          <div className="flex space-x-2">
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="h-auto p-1 text-xs">
                <Trash2 className="h-4 w-4 mr-1" /> {t("common.clearAll")}
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px] w-full">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">{t("common.noNewNotifications")}</p>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start space-x-2 py-2 cursor-pointer ${notification.isRead ? "opacity-70" : "font-semibold"}`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.link) {
                    // Programmatically navigate if there's a link
                    // This needs to be handled outside of the dropdown menu item click if it closes the menu
                  }
                }}
              >
                {getIconForNotificationType(notification.type)}
                <div className="flex-grow">
                  <p className="text-sm leading-snug">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(notification.timestamp), "dd.MM.yyyy HH:mm", { locale: currentLocale })}
                  </p>
                  {notification.link && (
                    <Link to={notification.link} className="text-xs text-jyskBlue-dark dark:text-jyskBlue-light hover:underline mt-1 block" onClick={() => setIsDropdownOpen(false)}>
                      {t("common.viewDetails")}
                    </Link>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }} className="h-auto p-1">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};