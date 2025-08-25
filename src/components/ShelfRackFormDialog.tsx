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
import { ShelfRack, Shelf } from "@/data/shelfRacks";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Plus, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShelfRackFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rack: Partial<ShelfRack>) => boolean;
  rack?: ShelfRack | null;
}

export const ShelfRackFormDialog: React.FC<ShelfRackFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rack,
}) => {
  const { userStoreId } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<Partial<ShelfRack>>({
    rack_identifier: "",
    row_id: "",
    rack_id: "",
    shelves: [{ shelfNumber: "1", description: "" }],
    store_id: userStoreId || "",
  });

  useEffect(() => {
    if (rack) {
      setFormData(rack);
    } else {
      setFormData({
        rack_identifier: "",
        row_id: "",
        rack_id: "",
        shelves: [{ shelfNumber: "1", description: "" }],
        store_id: userStoreId || "",
      });
    }
  }, [rack, isOpen, userStoreId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleShelfDescriptionChange = (index: number, value: string) => {
    const updatedShelves = formData.shelves?.map((s, i) =>
      i === index ? { ...s, description: value } : s
    );
    setFormData((prev) => ({ ...prev, shelves: updatedShelves }));
  };

  const handleAddShelf = () => {
    const newShelfNumber = ((formData.shelves?.length || 0) + 1).toString();
    setFormData((prev) => ({
      ...prev,
      shelves: [...(prev.shelves || []), { shelfNumber: newShelfNumber, description: "" }],
    }));
  };

  const handleRemoveShelf = (index: number) => {
    const updatedShelves = formData.shelves?.filter((_, i) => i !== index);
    const renumberedShelves = updatedShelves?.map((s, i) => ({
      ...s,
      shelfNumber: (i + 1).toString(),
    }));
    setFormData((prev) => ({ ...prev, shelves: renumberedShelves }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.row_id || !formData.rack_id || !formData.store_id || !formData.shelves || formData.shelves.length === 0 || formData.shelves.some(s => !s.description.trim())) {
      toast.error(t("common.fillAllRackFields"));
      return;
    }
    const finalFormData = {
      ...formData,
      rack_identifier: `${formData.row_id}-${formData.rack_id}`.toUpperCase(),
    };

    if (onSubmit(finalFormData)) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rack ? t("common.editRack") : t("common.addRack")}</DialogTitle>
          <DialogDescription>
            {rack ? t("common.editRackDescription") : t("common.addRackDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="row_id" className="sm:text-right">
              {t("common.rowId")}
            </Label>
            <Input
              id="row_id"
              value={formData.row_id}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!rack}
              placeholder="Např. A"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="rack_id" className="sm:text-right">
              {t("common.rackId")}
            </Label>
            <Input
              id="rack_id"
              value={formData.rack_id}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!rack}
              placeholder="Např. 1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="store_id" className="sm:text-right">
              {t("common.storeId")}
            </Label>
            <Input
              id="store_id"
              value={formData.store_id}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!userStoreId}
              placeholder="Např. Sklad 1"
            />
          </div>

          <div className="col-span-full">
            <Label className="text-base font-semibold mb-2 block">{t("common.shelvesAndDescription")}</Label>
            {formData.shelves?.map((shelf, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                <Label className="w-full sm:w-16 sm:text-right">{t("common.shelf")} {shelf.shelfNumber}:</Label>
                <Input
                  value={shelf.description}
                  onChange={(e) => handleShelfDescriptionChange(index, e.target.value)}
                  placeholder={t("common.descriptionForShelf", { shelfNumber: shelf.shelfNumber })}
                  className="flex-grow"
                />
                {formData.shelves && formData.shelves.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveShelf(index)}
                    className="mt-2 sm:mt-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddShelf} className="w-full mt-2">
              <Plus className="h-4 w-4 mr-2" /> {t("common.addShelf")}
            </Button>
          </div>

          <DialogFooter className="col-span-full mt-4">
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {rack ? t("common.saveChanges") : t("common.addRack")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};