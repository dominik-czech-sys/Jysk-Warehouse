import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutGrid, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useStores } from "@/data/stores";
import { useDashboard } from "@/contexts/DashboardContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserManagementSection } from "@/components/dashboard/UserManagementSection";
import { StoreManagementSection } from "@/components/dashboard/StoreManagementSection";
import { HelpPostManagementSection } from "@/components/dashboard/HelpPostManagementSection";
import { AdminTutorialsSection } from "@/components/dashboard/AdminTutorialsSection";
import { LogViewerSection } from "@/components/dashboard/LogViewerSection";
import { ExportDataSection } from "@/components/dashboard/ExportDataSection";
import { ArticleOverviewWidget } from "@/components/widgets/ArticleOverviewWidget";
import { LowStockAlertsWidget } from "@/components/widgets/LowStockAlertsWidget";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

// Map widget component names to actual components
const widgetComponents: { [key: string]: React.FC<{ id: string }> } = {
  ArticleOverviewWidget: ArticleOverviewWidget,
  LowStockAlertsWidget: LowStockAlertsWidget,
};

const SiteDashboard: React.FC = () => {
  const { isAdmin, hasPermission, user: currentUser } = useAuth();
  const { stores, addStore, updateStore, deleteStore } = useStores();
  const { t } = useTranslation();
  const { widgets, addWidget, availableWidgets } = useDashboard();

  // Function to translate role names
  const translateRole = (role: typeof currentUser.role | "unknown") => {
    switch (role) {
      case "admin": return t("common.admin");
      case "vedouci_skladu": return t("common.warehouseManager");
      case "store_manager": return t("common.storeManager");
      case "deputy_store_manager": return t("common.deputyStoreManager");
      case "ar_assistant_of_sale": return t("common.arAssistantOfSale");
      case "skladnik": return t("common.warehouseWorker");
      default: return t("common.unknown");
    }
  };

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
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToMainPage")}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{t("common.siteDashboard")} ({isAdmin ? t("common.admin") : translateRole(currentUser?.role || "unknown")})</h1>
          <div className="w-full sm:w-auto"></div> {/* Placeholder for alignment */}
        </div>

        {/* Dashboard Widgets Section */}
        <div className="mb-6 sm:mb-8 w-full animate-slide-in-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("common.dashboardOverview")}</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <LayoutGrid className="h-4 w-4 mr-2" /> {t("common.manageWidgets")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableWidgets.map((widget) => (
                  <DropdownMenuItem key={widget.id} onClick={() => addWidget(widget.id)}>
                    <Plus className="h-4 w-4 mr-2" /> {t(widget.name)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map((widgetConfig) => {
              const WidgetComponent = widgetComponents[widgetConfig.component];
              if (!WidgetComponent) return null;
              return (
                <div key={widgetConfig.id} className="h-full">
                  <WidgetComponent id={widgetConfig.id} />
                </div>
              );
            })}
          </div>
          {widgets.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">{t("common.noWidgetsAdded")}</p>
          )}
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Modular Sections */}
        <StoreManagementSection
          stores={stores}
          addStore={addStore}
          updateStore={updateStore}
          deleteStore={deleteStore}
          hasPermission={hasPermission}
        />

        <Separator className="my-6 sm:my-8" />

        <UserManagementSection />

        <Separator className="my-6 sm:my-8" />

        <HelpPostManagementSection hasPermission={hasPermission} />

        <Separator className="my-6 sm:my-8" />

        <AdminTutorialsSection isAdmin={isAdmin} />

        <Separator className="my-6 sm:my-8" />

        <LogViewerSection hasPermission={hasPermission} />

        <Separator className="my-6 sm:my-8" />

        <ExportDataSection hasPermission={hasPermission} />

      </div>
    </div>
  );
};

export default SiteDashboard;