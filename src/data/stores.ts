import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext";
import { useArticles, Article } from "./articles"; // Import useArticles and Article
import { defaultArticlesForNewStores } from "./users"; // Import default articles

export interface Store {
  id: string; // Unique ID for the store (e.g., "Sklad 1", "T508", "Kozomín")
  name: string; // Display name of the store
}

const initialStores: Store[] = [
  { id: "Sklad 1", name: "JYSK Sklad 1" },
  { id: "Sklad 2", name: "JYSK Sklad 2" },
  { id: "T508", name: "JYSK T508" },
  { id: "Kozomín", name: "JYSK Kozomín" },
];

export const useStores = () => {
  const { user, isAdmin } = useAuth();
  const { addLogEntry } = useLog();
  const { addArticle } = useArticles(); // Use addArticle from useArticles hook

  const [stores, setStores] = useState<Store[]>(() => {
    const storedStores = localStorage.getItem("stores");
    return storedStores ? JSON.parse(storedStores) : initialStores;
  });

  useEffect(() => {
    localStorage.setItem("stores", JSON.stringify(stores));
  }, [stores]);

  const getStoreById = (id: string) => stores.find((store) => store.id === id);

  const addStore = (newStore: Store, addDefaultArticles: boolean = false) => {
    if (!isAdmin) {
      toast.error("Nemáte oprávnění přidávat obchody.");
      return false;
    }
    if (stores.some(s => s.id === newStore.id)) {
      toast.error(`Obchod s ID ${newStore.id} již existuje.`);
      addLogEntry("Pokus o přidání existujícího obchodu", { storeId: newStore.id }, user?.username);
      return false;
    }
    setStores((prev) => [...prev, newStore]);
    toast.success(`Obchod ${newStore.name} (${newStore.id}) byl přidán.`);
    addLogEntry("Obchod přidán", { storeId: newStore.id, storeName: newStore.name }, user?.username);

    if (addDefaultArticles) {
      defaultArticlesForNewStores.forEach(defaultArticle => {
        // Assign to a dummy rack/shelf for the new store, as real racks won't exist yet
        const newArticle: Article = {
          ...defaultArticle,
          rackId: "N/A", // Placeholder
          shelfNumber: "N/A", // Placeholder
          location: "N/A", // Placeholder
          floor: "N/A", // Placeholder
          storeId: newStore.id,
          quantity: 1, // Default quantity for default articles
        };
        addArticle(newArticle); // Add to the global articles list
      });
      toast.info(`Výchozí články byly přidány do obchodu ${newStore.id}.`);
      addLogEntry("Výchozí články přidány do obchodu", { storeId: newStore.id, articlesCount: defaultArticlesForNewStores.length }, user?.username);
    }
    return true;
  };

  const updateStore = (updatedStore: Store) => {
    if (!isAdmin) {
      toast.error("Nemáte oprávnění upravovat obchody.");
      return false;
    }
    setStores((prev) =>
      prev.map((s) => (s.id === updatedStore.id ? updatedStore : s))
    );
    toast.success(`Obchod ${updatedStore.name} (${updatedStore.id}) byl aktualizován.`);
    addLogEntry("Obchod aktualizován", { storeId: updatedStore.id, storeName: updatedStore.name }, user?.username);
    return true;
  };

  const deleteStore = (id: string) => {
    if (!isAdmin) {
      toast.error("Nemáte oprávnění mazat obchody.");
      return false;
    }
    setStores((prev) => prev.filter((s) => s.id !== id));
    toast.success(`Obchod ${id} byl smazán.`);
    addLogEntry("Obchod smazán", { storeId: id }, user?.username);
    // TODO: Also delete all articles and racks associated with this store
    return true;
  };

  return { stores, getStoreById, addStore, updateStore, deleteStore };
};