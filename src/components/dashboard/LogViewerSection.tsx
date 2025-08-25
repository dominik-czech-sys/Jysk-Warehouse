import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollText } from "lucide-react";
import { LogViewer } from "@/components/LogViewer";
import { useTranslation } from "react-i18next";

interface LogViewerSectionProps {
  hasPermission: (permission: string) => boolean;
}

export const LogViewerSection: React.FC<LogViewerSectionProps> = ({ hasPermission }) => {
  const { t } = useTranslation();
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);

  if (!hasPermission("log:view")) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8 w-full animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.logActivity")}</h2>
        <Button onClick={() => setIsLogViewerOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
          <ScrollText className="h-4 w-4 mr-2" /> {t("common.viewLog")}
        </Button>
      </div>
      <LogViewer isOpen={isLogViewerOpen} onClose={() => setIsLogViewerOpen(false)} />
    </div>
  );
};