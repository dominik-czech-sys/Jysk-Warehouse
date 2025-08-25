import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { AdminFAQDialog } from "@/components/AdminFAQDialog";
import { useTranslation } from "react-i18next";

interface AdminTutorialsSectionProps {
  isAdmin: boolean;
}

export const AdminTutorialsSection: React.FC<AdminTutorialsSectionProps> = ({ isAdmin }) => {
  const { t } = useTranslation();
  const [isAdminFAQDialogOpen, setIsAdminFAQDialogOpen] = useState(false);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="mb-6 sm:mb-8 w-full animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.adminFaq.adminTutorialsTitle")}</h2>
        <Button onClick={() => setIsAdminFAQDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
          <BookOpen className="h-4 w-4 mr-2" /> {t("common.adminFaq.viewTutorials")}
        </Button>
      </div>
      <AdminFAQDialog isOpen={isAdminFAQDialogOpen} onClose={() => setIsAdminFAQDialogOpen(false)} />
    </div>
  );
};