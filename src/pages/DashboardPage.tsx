import React from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/contexts/DashboardContext";
import { ArticleOverviewWidget } from "@/components/widgets/ArticleOverviewWidget";
import { LowStockAlertsWidget } from "@/components/widgets/LowStockAlertsWidget";
import { WarehouseSearchWidget } from "@/components/widgets/WarehouseSearchWidget";
import { WarehouseLocationDisplayWidget } from "@/components/widgets/WarehouseLocationDisplayWidget";
import { Navigate } from "react-router-dom";

// Map widget component names to actual components
const widgetComponents: { [key: string]: React.FC<{ id: string }> } = {
  ArticleOverviewWidget,
  LowStockAlertsWidget,
  WarehouseSearchWidget,
  WarehouseLocationDisplayWidget,
};

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const { widgets } = useDashboard();

  // Admins should see the site dashboard, not the user dashboard
  if (isAdmin) {
    return <Navigate to="/admin/site-dashboard" replace />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">{t("common.dashboard")}</h1>
      </div>
      <p className="text-muted-foreground">
        {t("common.welcomeMessage", { username: user?.first_name || user?.email })}
      </p>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {widgets.map((widgetConfig) => {
          const WidgetComponent = widgetComponents[widgetConfig.component];
          if (!WidgetComponent) return null;
          return <WidgetComponent key={widgetConfig.id} id={widgetConfig.id} />;
        })}
      </div>
    </div>
  );
};

export default DashboardPage;