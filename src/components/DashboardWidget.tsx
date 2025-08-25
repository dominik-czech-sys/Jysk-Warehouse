import React, { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useTranslation } from "react-i18next";

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  onRemove?: (id: string) => void;
  className?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  id,
  title,
  children,
  onRemove,
  className,
}) => {
  const { t } = useTranslation();
  const { removeWidget } = useDashboard();

  const handleRemove = () => {
    if (onRemove) {
      onRemove(id);
    } else {
      removeWidget(id);
    }
  };

  return (
    <Card className={`relative h-full flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{t(title)}</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1 h-auto"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        {children}
      </CardContent>
    </Card>
  );
};