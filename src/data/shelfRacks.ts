import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next"; // Import useTranslation

export interface Shelf {
  shelfNumber: string; // e.g., "1", "2", "3"
  description: string; // e.g., "Pillows", "Decorations"
}

export interface ShelfRack {
  id: string; // Unique ID for the rack (e.g., "A-1")
  rowId: string; // e.g., "A"
  rackId: string; // e.g., "1"
  shelves: Shelf[]; // Array of individual shelves with descriptions
  storeId: string; // ID of the store this rack belongs to
}

// Initial dummy data for Shelf Racks
const initialShelfRacks: ShelfRack[] = [
  {
    id: "A-1",
    rowId: "A",
    rackId: "1",
    shelves: [
      { shelfNumber: "1", description: "Homeware" },
      { shelfNumber: "2", description: "Decorations" },
      { shelfNumber: "3", description: "Pillows" },
      { shelfNumber: "4", description: "Textiles" },
      { shelfNumber: "5", description: "Small Furniture" },
    ],
    storeId: "Sklad 1",
  },
  {
    id: "A-2",
    rowId: "A",
    rackId: "2",
    shelves: [
      { shelfNumber: "1", description: "Electronics" },
      { shelfNumber: "2", description: "Kitchenware" },
      { shelfNumber: "3", description: "Books" },
    ],
    storeId: "Sklad 1",
  },
  {
    id: "B-1",
    rowId: "B",
    rackId: "1",
    shelves: [
      { shelfNumber: "1", description: "Large Furniture" },
      { shelfNumber: "2", description: "Mattresses" },
      { shelfNumber: "3", description: "Outdoor Furniture" },
      { shelfNumber: "4", description: "Garden Decor" },
      { shelfNumber: "5", description: "Storage Boxes" },
      { shelfNumber: "6", description: "Lamps" },
      { shelfNumber: "7", description: "Mirrors" },
      { shelfNumber: "8", description: "Rugs" },
      { shelfNumber: "9", description: "Curtains" },
      { shelfNumber: "10", description: "Bedding" },
    ],
    storeId: "Sklad 2",
  },
  {
    id: "K-1",
    rowId: "K",
    rackId: "1",
    shelves: [
      { shelfNumber: "1", description: "Koberce" },
      { shelfNumber: "2", description: "Zrcadla" },
    ],
    storeId: "Kozomín",
  },
  {
    id: "T-1",
    rowId: "T",
    rackId: "1",
    shelves: [
      { shelfNumber: "1", description: "Stoly" },
      { shelfNumber: "2", description: "Židle" },
    ],
    storeId: "T508",
  },
];

export const useShelfRacks = () => {
  const { userStoreId, isAdmin, user } = useAuth();
  const { addLogEntry } = useLog();
  const { t } = useTranslation(); // Initialize useTranslation

  const [shelfRacks, setShelfRacks] = useState<ShelfRack[]>(() => {
    const storedRacks = localStorage.getItem("shelfRacks");
    return storedRacks ? JSON.parse(storedRacks) : initialShelfRacks;
  });

  useEffect(() => {
    localStorage.setItem("shelfRacks", JSON.stringify(shelfRacks));
  }, [shelfRacks]);

  const filteredShelfRacks = isAdmin
    ? shelfRacks
    : shelfRacks.filter((rack) => rack.storeId === userStoreId);

  const getShelfRackById = (id: string, storeId?: string) => {
    if (storeId) {
      return shelfRacks.find((rack) => rack.id === id && rack.storeId === storeId);
    }
    return filteredShelfRacks.find((rack) => rack.id === id);
  };

  const addShelfRack = (newRack: ShelfRack) => {
    if (shelfRacks.some(r => r.id === newRack.id && r.storeId === newRack.storeId)) {
      toast.error(t("common.rackExists", { rackId: newRack.id }));
      addLogEntry(t("common.attemptToAddExistingRack"), { rackId: newRack.id, storeId: newRack.storeId }, user?.username);
      return false;
    }
    setShelfRacks((prev) => [...prev, newRack]);
    toast.success(t("common.rackAddedSuccess", { rackId: newRack.id }));
    addLogEntry(t("common.rackAdded"), { rackId: newRack.id, storeId: newRack.storeId, shelves: newRack.shelves.map(s => s.description) }, user?.username);
    return true;
  };

  const updateShelfRack = (updatedRack: ShelfRack) => {
    setShelfRacks((prev) =>
      prev.map((r) => (r.id === updatedRack.id && r.storeId === updatedRack.storeId ? updatedRack : r))
    );
    toast.success(t("common.rackUpdatedSuccess", { rackId: updatedRack.id }));
    addLogEntry(t("common.rackUpdated"), { rackId: updatedRack.id, storeId: updatedRack.storeId, shelves: updatedRack.shelves.map(s => s.description) }, user?.username);
  };

  const deleteShelfRack = (id: string, storeId: string) => {
    setShelfRacks((prev) => prev.filter((r) => !(r.id === id && r.storeId === storeId)));
    toast.success(t("common.rackDeletedSuccess", { rackId: id }));
    addLogEntry(t("common.rackDeleted"), { rackId: id, storeId }, user?.username);
  };

  const getShelfRacksByStoreId = (storeId: string) => {
    return shelfRacks.filter(rack => rack.storeId === storeId);
  };

  return { shelfRacks: filteredShelfRacks, allShelfRacks: shelfRacks, getShelfRackById, addShelfRack, updateShelfRack, deleteShelfRack, getShelfRacksByStoreId };
};