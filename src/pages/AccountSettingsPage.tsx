import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, KeyRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";

const AccountSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">{t("auth.notLoggedIn")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{t("auth.pleaseLoginToAccess")}</p>
            <Link to="/prihlaseni" className="mt-4 inline-block">
              <Button className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">{t("auth.login")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToMainPage")}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("page.accountSettings.title")}</h1>
          <div className="w-full sm:w-auto"></div> {/* Placeholder for alignment */}
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("page.accountSettings.personalInformation")}</CardTitle>
            <CardDescription>{t("page.accountSettings.personalInformationDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>{t("common.name")}:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>{t("auth.username")}:</strong> {user.username}</p>
            <p><strong>{t("auth.email")}:</strong> {user.email}</p>
            <p><strong>{t("page.accountSettings.role")}:</strong> {user.role}</p>
            {user.store_id && <p><strong>{t("page.accountSettings.storeId")}:</strong> {user.store_id}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("page.accountSettings.security")}</CardTitle>
            <CardDescription>{t("page.accountSettings.securityDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsChangePasswordDialogOpen(true)} className="w-full sm:w-auto bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              <KeyRound className="h-4 w-4 mr-2" /> {t("page.accountSettings.changePassword")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordDialog isOpen={isChangePasswordDialogOpen} onClose={() => setIsChangePasswordDialogOpen(false)} />
    </div>
  );
};

export default AccountSettingsPage;