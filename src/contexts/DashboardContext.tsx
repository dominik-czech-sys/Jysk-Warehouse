import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";

export interface DashboardWidgetConfig {
  id: string;
  component: string; // Identifier for the widget component (e.g., "LowStockAlertsWidget", "ArticleOverviewWidget")
  // Layout property can be added here for grid-based systems
}

interface DashboardContextType {
  widgets: DashboardWidgetConfig[];
  addWidget: (componentName: string) => void;
  removeWidget: (id: string) => void;
  availableWidgets: { id: string; name: string; description: string }[];
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

const defaultWidgets: DashboardWidgetConfig[] = [
  { id: `my-tasks-${Date.now()}`, component: "MyTasksWidget" },
  { id: `announcements-${Date.now()}`, component: "AnnouncementsWidget" },
  { id: `low-stock-${Date.now()}`, component: "LowStockAlertsWidget" },
  { id: `article-overview-${Date.now()}`, component: "ArticleOverviewWidget" },
  { id: `warehouse-search-${Date.now()}`, component: "WarehouseSearchWidget" },
  { id: `warehouse-location-${Date.now()}`, component: "WarehouseLocationDisplayWidget" },
];

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    try {
      const storedWidgets = localStorage.getItem("dashboardWidgets");
      if (storedWidgets) {
        return JSON.parse(storedWidgets);
      }
    } catch (error) {
      console.error("Failed to parse dashboard widgets from localStorage", error);
      localStorage.removeItem("dashboardWidgets");
    }
    return defaultWidgets;
  });

  useEffect(() => {
    try {
      localStorage.setItem("dashboardWidgets", JSON.stringify(widgets));
    } catch (error) {
      console.error("Failed to save dashboard widgets to localStorage", error);
    }
  }, [widgets]);

  const availableWidgets = [
    { id: "MyTasksWidget", name: "common.widgets.myTasks", description: "common.widgets.myTasksDescription" },
    { id: "AnnouncementsWidget", name: "common.widgets.latestAnnouncements", description: "common.widgets.latestAnnouncementsDescription" },
    { id: "LowStockAlertsWidget", name: "common.widgets.lowStockAlerts", description: "common.widgets.lowStockAlertsDescription" },
    { id: "ArticleOverviewWidget", name: "common.widgets.articleOverview", description: "common.widgets.articleOverviewDescription" },
    { id: "WarehouseSearchWidget", name: "common.widgets.searchArticleLocation", description: "common.widgets.searchArticleLocationDescription" },
    { id: "WarehouseLocationDisplayWidget", name: "common.widgets.articleLocation", description: "common.widgets.articleLocationDescription" },
  ];

  const addWidget = (componentName: string) => {
    const newWidget: DashboardWidgetConfig = {
      id: `${componentName}-${Date.now()}`,
      component: componentName,
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== id));
  };

  return (
    <DashboardContext.Provider
      value={{
        widgets,
        addWidget,
        removeWidget,
        availableWidgets,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};