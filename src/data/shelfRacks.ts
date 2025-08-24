import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

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

const initialShelfRacks: ShelfRack[] = [
  {
    id: "A-1",
    rowId: "A",
    rackId: "1",
    shelves: [
      { shelfNumber: "1", description: "Pillows" },
      { shelfNumber: "2", description: "Duvets" },
      { shelfNumber: "3", description: "Blankets" },
    ],
    storeId: "T508",
  },
  {
    id: "B-2",
    rowId: "B",
    rackId: "2",
    shelves: [
      { shelfNumber: "1", description: "Towels" },
      { shelfNumber: "2", description: "Curtains" },
    ],
    storeId: "T508",
  },
  {
    id: "C-3",
    rowId: "C",
    rackId: "3",
    shelves: [
      { shelfNumber: "1", description: "Small Furniture" },
      { shelfNumber: "2", description: "Decorations" },
    ],
    storeId: "Kozomín",
  },
];

export const useShelfRacks = () => {
  const { userStoreId, isAdmin, user } = useAuth();
  const { addLogEntry } = useLog();
  const { t } = useTranslation();

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

  const addShelfRack = async (newRack: ShelfRack) => {
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

  const updateShelfRack = async (updatedRack: ShelfRack) => {
    setShelfRacks((prev) =>
      prev.map((r) => (r.id === updatedRack.id && r.storeId === updatedRack.storeId ? updatedRack : r))
    );
    toast.success(t("common.rackUpdatedSuccess", { rackId: updatedRack.id }));
    addLogEntry(t("common.rackUpdated"), { rackId: updatedRack.id, storeId: updatedRack.storeId, shelves: updatedRack.shelves.map(s => s.description) }, user?.username);
    return true;
  };

  const deleteShelfRack = async (id: string, storeId: string) => {
    setShelfRacks((prev) => prev.filter((r) => !(r.id === id && r.storeId === storeId)));
    toast.success(t("common.rackDeletedSuccess", { rackId: id }));
    addLogEntry(t("common.rackDeleted"), { rackId: id, storeId }, user?.username);
    return true;
  };

  const getShelfRacksByStoreId = (storeId: string) => {
    return shelfRacks.filter(rack => rack.storeId === storeId);
  };

  return { shelfRacks: filteredShelfRacks, allShelfRacks: shelfRacks, getShelfRackById, addShelfRack, updateShelfRack, deleteShelfRack, getShelfRacksByStoreId };
};