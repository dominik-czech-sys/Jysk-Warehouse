import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/contexts/DashboardContext";
import { useTranslation } from "react-i18next";
import { PlusCircle } from "lucide-react";

interface AddWidgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWidgetDialog: React.FC<AddWidgetDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { availableWidgets, addWidget, widgets } = useDashboard();

  const currentWidgetComponents = widgets.map(w => w.component);
  const widgetsToAdd = availableWidgets.filter(aw => !currentWidgetComponents.includes(aw.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("common.widgets.addWidgetTitle")}</DialogTitle>
          <DialogDescription>{t("common.widgets.addWidgetDescription")}</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {widgetsToAdd.length > 0 ? (
            widgetsToAdd.map(widget => (
              <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{t(widget.name)}</h4>
                  <p className="text-sm text-muted-foreground">{t(widget.description)}</p>
                </div>
                <Button size="sm" onClick={() => { addWidget(widget.id); onClose(); }}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t("common.add")}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">{t("common.widgets.allWidgetsAdded")}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};