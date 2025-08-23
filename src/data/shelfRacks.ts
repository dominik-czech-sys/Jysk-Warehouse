import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext";
import { toast } from "sonner";

export interface ShelfRack {
  id: string; // Unique ID for the rack (e.g., "RowA-Rack1")
  rowId: string; // e.g., "A"
  rackId: string; // e.g., "1"
  location: string; // e.g., "Ulička A"
  floor: string; // e.g., "Patro 1"
  numberOfShelves: number; // e.g., 5 (meaning shelves 1 to 5)
  description: string; // e.g., "Small items", "Electronics", "Furniture"
  warehouseId: string; // ID of the warehouse this rack belongs to
}

// Initial dummy data for Shelf Racks
const initialShelfRacks: ShelfRack[] = [
  {
    id: "A-1",
    rowId: "A",
    rackId: "1",
    location: "Ulička A",
    floor: "Patro 1",
    numberOfShelves: 5,
    description: "Malé předměty",
    warehouseId: "Sklad 1",
  },
  {
    id: "A-2",
    rowId: "A",
    rackId: "2",
    location: "Ulička A",
    floor: "Patro 1",
    numberOfShelves: 3,
    description: "Elektronika",
    warehouseId: "Sklad 1",
  },
  {
    id: "B-1",
    rowId: "B",
    rackId: "1",
    location: "Ulička B",
    floor: "Patro 2",
    numberOfShelves: 10,
    description: "Nábytek",
    warehouseId: "Sklad 2",
  },
];

export const useShelfRacks = () => {
  const { userWarehouseId, isAdmin, user } = useAuth();
  const { addLogEntry } = useLog();
  const [shelfRacks, setShelfRacks] = useState<ShelfRack[]>(() => {
    const storedRacks = localStorage.getItem("shelfRacks");
    return storedRacks ? JSON.parse(storedRacks) : initialShelfRacks;
  });

  useEffect(() => {
    localStorage.setItem("shelfRacks", JSON.stringify(shelfRacks));
  }, [shelfRacks]);

  const filteredShelfRacks = isAdmin
    ? shelfRacks
    : shelfRacks.filter((rack) => rack.warehouseId === userWarehouseId);

  const getShelfRackById = (id: string) => filteredShelfRacks.find((rack) => rack.id === id);

  const addShelfRack = (newRack: ShelfRack) => {
    if (shelfRacks.some(r => r.id === newRack.id)) {
      toast.error(`Regál s ID ${newRack.id} již existuje.`);
      addLogEntry("Pokus o přidání existujícího regálu", { rackId: newRack.id }, user?.username);
      return false;
    }
    setShelfRacks((prev) => [...prev, newRack]);
    toast.success(`Regál ${newRack.id} byl přidán.`);
    addLogEntry("Regál přidán", { rackId: newRack.id, warehouseId: newRack.warehouseId }, user?.username);
    return true;
  };

  const updateShelfRack = (updatedRack: ShelfRack) => {
    setShelfRacks((prev) =>
      prev.map((r) => (r.id === updatedRack.id ? updatedRack : r))
    );
    toast.success(`Regál ${updatedRack.id} byl aktualizován.`);
    addLogEntry("Regál aktualizován", { rackId: updatedRack.id, warehouseId: updatedRack.warehouseId }, user?.username);
  };

  const deleteShelfRack = (id: string) => {
    setShelfRacks((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Regál ${id} byl smazán.`);
    addLogEntry("Regál smazán", { rackId: id }, user?.username);
  };

  return { shelfRacks: filteredShelfRacks, getShelfRackById, addShelfRack, updateShelfRack, deleteShelfRack };
};