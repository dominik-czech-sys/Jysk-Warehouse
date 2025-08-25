import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/data/stores";
import { StoreManagementSection } from "@/components/dashboard/StoreManagementSection";
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";
import { HelpPostManagementSection } from "@/components/dashboard/HelpPostManagementSection";
import { AdminTutorialsSection } from "@/components/dashboard/AdminTutorialsSection";
import { LogViewerSection } from "@/components/dashboard/LogViewerSection";
import { ExportDataSection } from "@/components/dashboard/ExportDataSection";
import { StatisticsOverview } from "@/components/dashboard/StatisticsOverview";
import { UserDistributionChart } from "@/components/dashboard/UserDistributionChart";
import { ArticleStatusChart } from "@/components/dashboard/ArticleStatusChart";

const SiteDashboard: React.FC = () => {
  const { isAdmin, hasPermission } = useAuth();
  const { stores, addStore, updateStore, deleteStore } = useStores();
  const { t } = useTranslation();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
        <Card className="p-4 sm:p-6 text-center">
          <CardTitle className="text-xl sm:text-2xl font-bold text-red-600">{t("common.accessDenied")}</CardTitle>
          <CardContent className="mt-4">
            <p className="text-gray-700 dark:text-gray-300">{t("common.noPermission")}</p>
            <Link to="/" className="mt-4 inline-block">
              <Button className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">{t("common.backToMainPage")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToMainPage")}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("common.siteDashboard")}</h1>
          <div className="w-full sm:w-auto"></div> {/* Placeholder for alignment */}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">{t("common.overview")}</TabsTrigger>
            <TabsTrigger value="stores">{t("common.storeManagement")}</TabsTrigger>
            <TabsTrigger value="users">{t("common.userManagement")}</TabsTrigger>
            <TabsTrigger value="system">{t("common.system")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="flex flex-col gap-4">
              <StatisticsOverview />
              <div className="grid gap-4 md:grid-cols-2">
                <UserDistributionChart />
                <ArticleStatusChart />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stores" className="mt-4">
            <StoreManagementSection
              stores={stores}
              addStore={addStore}
              updateStore={updateStore}
              deleteStore={deleteStore}
              hasPermission={hasPermission}
            />
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <UserManagementSection />
          </TabsContent>

          <TabsContent value="system" className="mt-4 space-y-6">
            <HelpPostManagementSection hasPermission={hasPermission} />
            <AdminTutorialsSection isAdmin={isAdmin} />
            <LogViewerSection hasPermission={hasPermission} />
            <ExportDataSection hasPermission={hasPermission} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SiteDashboard;