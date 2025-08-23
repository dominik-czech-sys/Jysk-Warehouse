import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { getAllShelfRacks, createShelfRack, updateShelfRack as apiUpdateShelfRack, deleteShelfRack as apiDeleteShelfRack, ShelfRackApiData } from "@/api"; // Import API functions

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

export const useShelfRacks = () => {
  const { userStoreId, isAdmin, user } = useAuth();
  const { addLogEntry } = useLog();
  const { t } = useTranslation(); // Initialize useTranslation

  const [shelfRacks, setShelfRacks] = useState<ShelfRack[]>([]); // Nyní se načítá z API

  // Načtení regálů z API při startu a při změnách
  useEffect(() => {
    const fetchShelfRacks = async () => {
      try {
        const racksFromApi = await getAllShelfRacks();
        setShelfRacks(racksFromApi);
      } catch (error) {
        console.error("Failed to fetch shelf racks from API:", error);
        toast.error(t("common.racksFetchFailed"));
        setShelfRacks([]);
      }
    };
    fetchShelfRacks();
  }, [t]); // Závislost na t pro překlady chybových zpráv

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
    try {
      const createdRack = await createShelfRack(newRack);
      if (createdRack) {
        setShelfRacks((prev) => [...prev, createdRack]);
        toast.success(t("common.rackAddedSuccess", { rackId: createdRack.id }));
        addLogEntry(t("common.rackAdded"), { rackId: createdRack.id, storeId: createdRack.storeId, shelves: createdRack.shelves.map(s => s.description) }, user?.username);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Add Rack Error:", error);
      toast.error(error.message || t("common.rackAddFailed"));
      addLogEntry(t("common.rackAddFailed"), { rackId: newRack.id, storeId: newRack.storeId, error: error.message }, user?.username);
      return false;
    }
  };

  const updateShelfRack = async (updatedRack: ShelfRack) => {
    try {
      const result = await apiUpdateShelfRack(updatedRack.id, updatedRack);
      if (result) {
        setShelfRacks((prev) =>
          prev.map((r) => (r.id === updatedRack.id && r.storeId === updatedRack.storeId ? updatedRack : r))
        );
        toast.success(t("common.rackUpdatedSuccess", { rackId: updatedRack.id }));
        addLogEntry(t("common.rackUpdated"), { rackId: updatedRack.id, storeId: updatedRack.storeId, shelves: updatedRack.shelves.map(s => s.description) }, user?.username);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Update Rack Error:", error);
      toast.error(error.message || t("common.rackUpdateFailed"));
      addLogEntry(t("common.rackUpdateFailed"), { rackId: updatedRack.id, storeId: updatedRack.storeId, error: error.message }, user?.username);
      return false;
    }
  };

  const deleteShelfRack = async (id: string, storeId: string) => {
    try {
      const success = await apiDeleteShelfRack(id); // API endpoint nemusí potřebovat storeId v URL, ale v body
      if (success) {
        setShelfRacks((prev) => prev.filter((r) => !(r.id === id && r.storeId === storeId)));
        toast.success(t("common.rackDeletedSuccess", { rackId: id }));
        addLogEntry(t("common.rackDeleted"), { rackId: id, storeId }, user?.username);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Delete Rack Error:", error);
      toast.error(error.message || t("common.rackDeleteFailed"));
      addLogEntry(t("common.rackDeleteFailed"), { rackId: id, storeId, error: error.message }, user?.username);
      return false;
    }
  };

  const getShelfRacksByStoreId = (storeId: string) => {
    return shelfRacks.filter(rack => rack.storeId === storeId);
  };

  return { shelfRacks: filteredShelfRacks, allShelfRacks: shelfRacks, getShelfRackById, addShelfRack, updateShelfRack, deleteShelfRack, getShelfRacksByStoreId };
};