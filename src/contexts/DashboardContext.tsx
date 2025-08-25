import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";

export interface DashboardWidgetConfig {
  id: string;
  component: string; // Identifier for the widget component (e.g., "LowStockAlertsWidget", "ArticleOverviewWidget")
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  // Add any other widget-specific configuration here
}

interface DashboardContextType {
  widgets: DashboardWidgetConfig[];
  addWidget: (componentName: string, initialLayout?: Partial<DashboardWidgetConfig['layout']>) => void;
  removeWidget: (id: string) => void;
  updateWidgetLayout: (id: string, newLayout: DashboardWidgetConfig['layout']) => void;
  availableWidgets: { id: string; name: string; description: string }[];
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

const defaultWidgets: DashboardWidgetConfig[] = [
  { id: "low-stock-1", component: "LowStockAlertsWidget", layout: { x: 0, y: 0, w: 1, h: 1 } },
  { id: "article-overview-1", component: "ArticleOverviewWidget", layout: { x: 1, y: 0, w: 1, h: 1 } },
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
    { id: "LowStockAlertsWidget", name: "Upozornění na nízký stav zásob", description: "Zobrazuje artikly s nízkým stavem zásob." },
    { id: "ArticleOverviewWidget", name: "Přehled artiklů", description: "Zobrazuje celkový počet artiklů." },
    // Add more available widgets here
  ];

  const addWidget = (componentName: string, initialLayout?: Partial<DashboardWidgetConfig['layout']>) => {
    const newWidget: DashboardWidgetConfig = {
      id: `${componentName}-${Date.now()}`, // Unique ID
      component: componentName,
      layout: { x: 0, y: 0, w: 1, h: 1, ...initialLayout }, // Default or provided layout
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

  const removeWidget = (id: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== id));
  };

  const updateWidgetLayout = (id: string, newLayout: DashboardWidgetConfig['layout']) => {
    setWidgets((prev) =>
      prev.map((widget) => (widget.id === id ? { ...widget, layout: newLayout } : widget))
    );
  };

  return (
    <DashboardContext.Provider
      value={{
        widgets,
        addWidget,
        removeWidget,
        updateWidgetLayout,
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