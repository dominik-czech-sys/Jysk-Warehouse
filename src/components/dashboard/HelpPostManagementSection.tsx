import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LifeBuoy } from "lucide-react";
import { useTranslation } from "react-i18next";

interface HelpPostManagementSectionProps {
  hasPermission: (permission: string) => boolean;
}

export const HelpPostManagementSection: React.FC<HelpPostManagementSectionProps> = ({
  hasPermission,
}) => {
  const { t } = useTranslation();

  if (!hasPermission("help_posts:manage")) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8 w-full animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.helpPostManagement")}</h2>
        <Link to="/admin/help-posts" className="w-full sm:w-auto">
          <Button className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
            <LifeBuoy className="h-4 w-4 mr-2" /> {t("common.manageHelpPosts")}
          </Button>
        </Link>
      </div>
    </div>
  );
};