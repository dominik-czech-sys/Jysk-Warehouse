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
import { Article } from "@/data/articles";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useShelfRacks } from "@/data/shelfRacks";

interface ArticleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (article: Article) => void;
  article?: Article | null;
}

export const ArticleFormDialog: React.FC<ArticleFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  article,
}) => {
  const { userWarehouseId } = useAuth();
  const { shelfRacks } = useShelfRacks();

  const [formData, setFormData] = useState<Article>({
    id: "",
    name: "",
    rackId: "",
    shelfNumber: "",
    location: "",
    floor: "",
    warehouseId: userWarehouseId || "",
    status: "",
  });
  const [selectedRackId, setSelectedRackId] = useState<string>("");
  const [selectedShelfNumber, setSelectedShelfNumber] = useState<string>("");

  useEffect(() => {
    if (article) {
      setFormData(article);
      setSelectedRackId(article.rackId);
      setSelectedShelfNumber(article.shelfNumber);
    } else {
      setFormData({
        id: "",
        name: "",
        rackId: "",
        shelfNumber: "",
        location: "",
        floor: "",
        warehouseId: userWarehouseId || "",
        status: "",
      });
      setSelectedRackId("");
      setSelectedShelfNumber("");
    }
  }, [article, isOpen, userWarehouseId, shelfRacks]);

  useEffect(() => {
    const currentRack = shelfRacks.find(rack => rack.id === selectedRackId);
    if (currentRack) {
      const selectedShelf = currentRack.shelves.find(s => s.shelfNumber === selectedShelfNumber);
      setFormData(prev => ({
        ...prev,
        rackId: currentRack.id,
        shelfNumber: selectedShelfNumber,
        location: currentRack.location,
        floor: currentRack.floor,
        warehouseId: currentRack.warehouseId,
      }));
    } else if (!article) { // Clear if no rack selected and not editing an existing article
      setFormData(prev => ({
        ...prev,
        rackId: "",
        shelfNumber: "",
        location: "",
        floor: "",
        warehouseId: userWarehouseId || "",
      }));
    }
  }, [selectedRackId, selectedShelfNumber, shelfRacks, userWarehouseId, article]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRackSelect = (value: string) => {
    setSelectedRackId(value);
    setSelectedShelfNumber(""); // Reset shelf number when rack changes
  };

  const handleShelfNumberSelect = (value: string) => {
    setSelectedShelfNumber(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !selectedRackId || !selectedShelfNumber || !formData.status) {
      toast.error("Prosím, vyplňte všechna povinná pole (ID článku, Název, Regál, Číslo police, Status).");
      return;
    }
    onSubmit(formData);
    onClose();
  };

  const availableShelves = selectedRackId
    ? shelfRacks.find(r => r.id === selectedRackId)?.shelves || []
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{article ? "Upravit článek" : "Přidat nový článek"}</DialogTitle>
          <DialogDescription>
            {article ? "Zde můžete provést změny v článku." : "Přidejte nový článek do skladového inventáře."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="sm:text-right">
              ID článku
            </Label>
            <Input
              id="id"
              value={formData.id}
              onChange={handleChange}
              className="col-span-3"
              readOnly={!!article}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="sm:text-right">
              Název
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>

          {/* Shelf Rack Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="rackId" className="sm:text-right">
              Regál (Řada-Regál)
            </Label>
            <Select onValueChange={handleRackSelect} value={selectedRackId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Vyberte regál" />
              </SelectTrigger>
              <SelectContent>
                {shelfRacks.filter(rack => !userWarehouseId || rack.warehouseId === userWarehouseId).map((rack) => (
                  <SelectItem key={rack.id} value={rack.id}>
                    {rack.rowId}-{rack.rackId} ({rack.description}) - {rack.warehouseId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shelf Number Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="shelfNumber" className="sm:text-right">
              Číslo police
            </Label>
            <Select onValueChange={handleShelfNumberSelect} value={selectedShelfNumber} disabled={!selectedRackId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Vyberte číslo police" />
              </SelectTrigger>
              <SelectContent>
                {availableShelves.map((shelf) => (
                  <SelectItem key={shelf.shelfNumber} value={shelf.shelfNumber}>
                    Police {shelf.shelfNumber} ({shelf.description})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display derived fields as read-only */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="sm:text-right">
              Umístění
            </Label>
            <Input id="location" value={formData.location} readOnly className="col-span-3 bg-gray-100 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="floor" className="sm:text-right">
              Patro
            </Label>
            <Input id="floor" value={formData.floor} readOnly className="col-span-3 bg-gray-100 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="warehouseId" className="sm:text-right">
              ID Skladu
            </Label>
            <Input id="warehouseId" value={formData.warehouseId} readOnly className="col-span-3 bg-gray-100 dark:bg-gray-700" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="sm:text-right">
              Status zboží
            </Label>
            <Input
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Např. 21"
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground">
              {article ? "Uložit změny" : "Přidat článek"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};