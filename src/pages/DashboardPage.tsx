import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/contexts/DashboardContext";
import { ArticleOverviewWidget } from "@/components/widgets/ArticleOverviewWidget";
import { LowStockAlertsWidget } from "@/components/widgets/LowStockAlertsWidget";
import { WarehouseSearchWidget } from "@/components/widgets/WarehouseSearchWidget";
import { WarehouseLocationDisplayWidget } from "@/components/widgets/WarehouseLocationDisplayWidget";
import { MyTasksWidget } from "@/components/widgets/MyTasksWidget";
import { AnnouncementsWidget } from "@/components/widgets/AnnouncementsWidget";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddWidgetDialog } from "@/components/AddWidgetDialog";

const widgetComponents: { [key: string]: React.FC<{ id: string }> } = {
  ArticleOverviewWidget,
  LowStockAlertsWidget,
  WarehouseSearchWidget,
  WarehouseLocationDisplayWidget,
  MyTasksWidget,
  AnnouncementsWidget,
};

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const { widgets } = useDashboard();
  const [isAddWidgetDialogOpen, setIsAddWidgetDialogOpen] = useState(false);

  if (isAdmin) {
    return <Navigate to="/admin/site-dashboard" replace />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl">{t("page.dashboard.title")}</h1>
            <p className="text-sm text-muted-foreground">
                {t("page.dashboard.welcomeMessage", { username: user?.first_name || user?.email })}
            </p>
        </div>
        <Button onClick={() => setIsAddWidgetDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            {t("page.dashboard.addWidget")}
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 xl:grid-cols-4">
        {widgets.map((widgetConfig) => {
          const WidgetComponent = widgetComponents[widgetConfig.component];
          if (!WidgetComponent) return null;
          return <WidgetComponent key={widgetConfig.id} id={widgetConfig.id} />;
        })}
      </div>

      <AddWidgetDialog isOpen={isAddWidgetDialogOpen} onClose={() => setIsAddWidgetDialogOpen(false)} />
    </div>
  );
};

export default DashboardPage;