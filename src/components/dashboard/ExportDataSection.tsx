import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ExportDataSectionProps {
  hasPermission: (permission: string) => boolean;
}

export const ExportDataSection: React.FC<ExportDataSectionProps> = ({ hasPermission }) => {
  const { t } = useTranslation();

  if (!hasPermission("log:view")) { // Assuming export data permission is tied to log:view for now
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8 w-full animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.exportData")}</h2>
        <Link to="/export-dat" className="w-full sm:w-auto">
          <Button className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
            <Download className="h-4 w-4 mr-2" /> {t("common.exportData")}
          </Button>
        </Link>
      </div>
    </div>
  );
};