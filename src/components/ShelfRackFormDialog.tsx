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
import { ShelfRack } from "@/data/shelfRacks";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface ShelfRackFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rack: ShelfRack) => boolean; // Returns boolean indicating success
  rack?: ShelfRack | null; // Optional: if provided, it's for editing
}

export const ShelfRackFormDialog: React.FC<ShelfRackFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  rack,
}) => {
  const { userWarehouseId } = useAuth();
  const [formData, setFormData] = useState<ShelfRack>({
    id: "",
    rowId: "",
    rackId: "",
    location: "",
    floor: "",
    numberOfShelves: 1,
    description: "",
    warehouseId: userWarehouseId || "",
  });

  useEffect(() => {
    if (rack) {
      setFormData(rack);
    } else {
      setFormData({
        id: "",
        rowId: "",
        rackId: "",
        location: "",
        floor: "",
        numberOfShelves: 1,
        description: "",
        warehouseId: userWarehouseId || "",
      });
    }
  }, [rack, isOpen, userWarehouseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({ ...prev, [id]: numValue }));
    } else if (value === "") {
      setFormData((prev) => ({ ...prev, [id]: "" as any })); // Allow empty string temporarily for user input
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rowId || !formData.rackId || !formData.location || !formData.floor || !formData.description || !formData.warehouseId || formData.numberOfShelves <= 0) {
      toast.error("Prosím, vyplňte všechna pole a ujistěte se, že počet polic je kladné číslo.");
      return;
    }
    // Generate ID if adding new rack
    const finalFormData = {
      ...formData,
      id: rack ? formData.id : `${formData.rowId}-${formData.rackId}`.toUpperCase(),
    };

    if (onSubmit(finalFormData)) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{rack ? "Upravit regál" : "Přidat nový regál"}</DialogTitle>
          <DialogDescription>
            {rack ? "Zde můžete upravit údaje regálu." : "Přidejte nový regál do systému."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="rowId" className="sm:text-right">
              ID Řady
            </Label>
            <Input
              id="rowId"
              value={formData.rowId}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!rack} // Cannot change rowId/rackId for existing racks
              placeholder="Např. A"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="rackId" className="sm:text-right">
              ID Regálu
            </Label>
            <Input
              id="rackId"
              value={formData.rackId}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!rack} // Cannot change rowId/rackId for existing racks
              placeholder="Např. 1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="sm:text-right">
              Umístění
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Např. Ulička A"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="floor" className="sm:text-right">
              Patro
            </Label>
            <Input
              id="floor"
              value={formData.floor}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Např. Patro 1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="numberOfShelves" className="sm:text-right">
              Počet polic
            </Label>
            <Input
              id="numberOfShelves"
              type="number"
              value={formData.numberOfShelves}
              onChange={handleNumberChange}
              className="col-span-3"
              min="1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="sm:text-right">
              Popis obsahu
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Např. Malé předměty"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="warehouseId" className="sm:text-right">
              ID Skladu
            </Label>
            <Input
              id="warehouseId"
              value={formData.warehouseId}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!userWarehouseId} // Warehouse ID is read-only if user has one
              placeholder="Např. Sklad 1"
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {rack ? "Uložit změny" : "Přidat regál"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};