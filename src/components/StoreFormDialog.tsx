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
import { Store } from "@/data/stores";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface StoreFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (store: Store, addDefaultArticles: boolean) => Promise<boolean>; // Změněno na Promise<boolean>
  store?: Store | null;
}

export const StoreFormDialog: React.FC<StoreFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  store,
}) => {
  const [formData, setFormData] = useState<Store>({
    id: "",
    name: "",
  });
  const [addDefaultArticles, setAddDefaultArticles] = useState(true);
  const { t } = useTranslation(); // Initialize useTranslation

  useEffect(() => {
    if (store) {
      setFormData(store);
      setAddDefaultArticles(false); // Don't add default articles when editing
    } else {
      setFormData({
        id: "",
        name: "",
      });
      setAddDefaultArticles(true);
    }
  }, [store, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => { // Změněno na async
    e.preventDefault();
    if (!formData.id.trim() || !formData.name.trim()) {
      toast.error(t("common.fillStoreDetails"));
      return;
    }
    if (await onSubmit(formData, addDefaultArticles)) { // Použito await
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{store ? t("common.editStore") : t("common.addStore")}</DialogTitle>
          <DialogDescription>
            {store ? t("common.editStoreDescription") : t("common.addStoreDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="sm:text-right">
              {t("common.storeIdLabel")}
            </Label>
            <Input
              id="id"
              value={formData.id}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!store} // ID is read-only when editing
              placeholder="Např. T508"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="sm:text-right">
              {t("common.storeNameLabel")}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Např. JYSK T508"
            />
          </div>
          {!store && ( // Only show for new stores
            <div className="flex items-center space-x-2 col-span-full sm:col-start-2 sm:col-span-3">
              <Checkbox
                id="addDefaultArticles"
                checked={addDefaultArticles}
                onCheckedChange={(checked) => setAddDefaultArticles(!!checked)}
              />
              <Label htmlFor="addDefaultArticles" className="text-sm font-medium leading-none">
                {t("common.addDefaultArticles")}
              </Label>
            </div>
          )}
          <DialogFooter className="col-span-full mt-4">
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {store ? t("common.saveChanges") : t("common.addStore")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};