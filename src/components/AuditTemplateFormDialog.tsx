import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2 } from "lucide-react";
import { AuditTemplate, AuditTemplateItem } from "@/data/audits";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AuditTemplateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: Partial<AuditTemplate>) => void;
  template?: AuditTemplate | null;
}

export const AuditTemplateFormDialog: React.FC<AuditTemplateFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  template,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<Partial<AuditTemplateItem>[]>([]);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description || "");
      setItems(template.audit_template_items || []);
    } else {
      setName("");
      setDescription("");
      setItems([{ question: "", item_type: "yes_no", item_order: 1 }]);
    }
  }, [template, isOpen]);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].question = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { question: "", item_type: "yes_no", item_order: items.length + 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Re-order items
    setItems(newItems.map((item, i) => ({ ...item, item_order: i + 1 })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("common.audit.templateNameRequired"));
      return;
    }
    if (items.some(item => !item.question?.trim())) {
      toast.error(t("common.audit.allQuestionsRequired"));
      return;
    }

    const finalTemplate: Partial<AuditTemplate> = {
      id: template?.id,
      name,
      description,
      created_by: template?.created_by || user?.id,
      audit_template_items: items as AuditTemplateItem[],
    };
    onSubmit(finalTemplate);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{template ? t("common.audit.editTemplate") : t("common.audit.addTemplate")}</DialogTitle>
          <DialogDescription>{template ? t("common.audit.editTemplateDescription") : t("common.audit.addTemplateDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-grow flex flex-col gap-4 overflow-hidden">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">{t("common.audit.templateName")}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">{t("common.description")}</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          
          <Label className="font-semibold">{t("common.audit.checklistItems")}</Label>
          <ScrollArea className="flex-grow border rounded-md p-4">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Label className="font-mono text-sm">{index + 1}.</Label>
                  <Input
                    placeholder={t("common.audit.questionPlaceholder")}
                    value={item.question || ""}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    className="flex-grow"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} disabled={items.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button type="button" variant="outline" onClick={handleAddItem} className="mt-2">
            <PlusCircle className="h-4 w-4 mr-2" /> {t("common.audit.addQuestion")}
          </Button>

          <DialogFooter className="mt-auto pt-4">
            <Button type="submit">{template ? t("common.saveChanges") : t("common.audit.createTemplate")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};