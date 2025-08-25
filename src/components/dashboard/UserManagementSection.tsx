import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const UserManagementSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="mb-6 sm:mb-8 w-full animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.userManagement")}</h2>
        <Link to="/admin/sprava-uzivatelu">
          <Button className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
            <Users className="h-4 w-4 mr-2" /> {t("common.manageUsers")}
          </Button>
        </Link>
      </div>
    </div>
  );
};