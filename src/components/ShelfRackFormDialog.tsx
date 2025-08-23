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
  const { userStoreId } = useAuth();
  const [formData, setFormData] = useState<ShelfRack>({
    id: "",
    rowId: "",
    rackId: "",
    location: "", // Will be derived/set by store layout, not directly input here
    floor: "",    // Will be derived/set by store layout, not directly input here
    shelves: [{ shelfNumber: "1", description: "" }], // Initialize with one shelf
    storeId: userStoreId || "",
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
        shelves: [{ shelfNumber: "1", description: "" }],
        storeId: userStoreId || "",
      });
    }
  }, [rack, isOpen, userStoreId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleShelfDescriptionChange = (index: number, value: string) => {
    const updatedShelves = formData.shelves.map((s, i) =>
      i === index ? { ...s, description: value } : s
    );
    setFormData((prev) => ({ ...prev, shelves: updatedShelves }));
  };

  const handleAddShelf = () => {
    const newShelfNumber = (formData.shelves.length + 1).toString();
    setFormData((prev) => ({
      ...prev,
      shelves: [...prev.shelves, { shelfNumber: newShelfNumber, description: "" }],
    }));
  };

  const handleRemoveShelf = (index: number) => {
    const updatedShelves = formData.shelves.filter((_, i) => i !== index);
    // Re-number shelves after removal
    const renumberedShelves = updatedShelves.map((s, i) => ({
      ...s,
      shelfNumber: (i + 1).toString(),
    }));
    setFormData((prev) => ({ ...prev, shelves: renumberedShelves }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rowId || !formData.rackId || !formData.storeId || formData.shelves.length === 0 || formData.shelves.some(s => !s.description.trim())) {
      toast.error("Prosím, vyplňte všechna pole, včetně popisu pro každou polici.");
      return;
    }
    // Generate ID if adding new rack
    const finalFormData = {
      ...formData,
      id: rack ? formData.id : `${formData.rowId}-${formData.rackId}`.toUpperCase(),
      // For now, location and floor are hardcoded or left empty as they are not input directly
      // In a real app, these would be derived from a store's layout configuration
      location: formData.location || "Neznámé umístění",
      floor: formData.floor || "Neznámé patro",
    };

    if (onSubmit(finalFormData)) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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
          {/* Removed Location and Floor inputs as per user request */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="storeId" className="sm:text-right">
              ID Skladu
            </Label>
            <Input
              id="storeId"
              value={formData.storeId}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!userStoreId} // Store ID is read-only if user has one
              placeholder="Např. Sklad 1"
            />
          </div>

          {/* Shelves Management */}
          <div className="col-span-full">
            <Label className="text-base font-semibold mb-2 block">Police a jejich popis</Label>
            {formData.shelves.map((shelf, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Label className="w-16 text-right">Police {shelf.shelfNumber}:</Label>
                <Input
                  value={shelf.description}
                  onChange={(e) => handleShelfDescriptionChange(index, e.target.value)}
                  placeholder={`Popis pro polici ${shelf.shelfNumber}`}
                  className="flex-grow"
                />
                {formData.shelves.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveShelf(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddShelf} className="w-full mt-2">
              <Plus className="h-4 w-4 mr-2" /> Přidat polici
            </Button>
          </div>

          <DialogFooter className="col-span-full mt-4">
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {rack ? "Uložit změny" : "Přidat regál"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};