import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext";
import { useArticles, Article } from "./articles"; // Import useArticles and Article
import { defaultArticlesForNewStores } from "./users"; // Import default articles
import { useTranslation } from "react-i18next"; // Import useTranslation

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
  const { t } = useTranslation(); // Initialize useTranslation

  const [stores, setStores] = useState<Store[]>(() => {
    const storedStores = localStorage.getItem("stores");
    return storedStores ? JSON.parse(storedStores) : initialStores;
  });

  useEffect(() => {
    localStorage.setItem("stores", JSON.stringify(stores));
    console.log("Stores updated in localStorage:", stores); // Debugging log
  }, [stores]);

  const getStoreById = (id: string) => stores.find((store) => store.id === id);

  const addStore = (newStore: Store, addDefaultArticles: boolean = false) => {
    if (!isAdmin) {
      toast.error(t("common.noPermissionToAddStores"));
      return false;
    }
    if (stores.some(s => s.id === newStore.id)) {
      toast.error(t("common.storeExists", { storeId: newStore.id }));
      addLogEntry(t("common.attemptToAddExistingStore"), { storeId: newStore.id }, user?.username);
      return false;
    }
    setStores((prev) => {
      const updatedStores = [...prev, newStore];
      console.log("Adding store, new state:", updatedStores); // Debugging log
      return updatedStores;
    });
    toast.success(t("common.storeAddedSuccess", { storeName: newStore.name, storeId: newStore.id }));
    addLogEntry(t("common.storeAdded"), { storeId: newStore.id, storeName: newStore.name }, user?.username);

    if (addDefaultArticles) {
      defaultArticlesForNewStores.forEach(defaultArticle => {
        const newArticle: Article = {
          ...defaultArticle,
          rackId: "N/A", // Placeholder
          shelfNumber: "N/A", // Placeholder
          storeId: newStore.id,
          quantity: 1, // Default quantity for default articles
        };
        addArticle(newArticle);
      });
      toast.info(t("common.defaultArticlesAddedToStore", { storeId: newStore.id }));
      addLogEntry(t("common.defaultArticlesAddedToStore"), { storeId: newStore.id, articlesCount: defaultArticlesForNewStores.length }, user?.username);
    }
    return true;
  };

  const updateStore = (updatedStore: Store) => {
    if (!isAdmin) {
      toast.error(t("common.noPermissionToEditStores"));
      return false;
    }
    setStores((prev) => {
      const updatedStores = prev.map((s) => (s.id === updatedStore.id ? updatedStore : s));
      console.log("Updating store, new state:", updatedStores); // Debugging log
      return updatedStores;
    });
    toast.success(t("common.storeUpdatedSuccess", { storeName: updatedStore.name, storeId: updatedStore.id }));
    addLogEntry(t("common.storeUpdated"), { storeId: updatedStore.id, storeName: updatedStore.name }, user?.username);
    return true;
  };

  const deleteStore = (id: string) => {
    if (!isAdmin) {
      toast.error(t("common.noPermissionToDeleteStores"));
      return false;
    }
    setStores((prev) => {
      const updatedStores = prev.filter((s) => s.id !== id);
      console.log("Deleting store, new state:", updatedStores); // Debugging log
      return updatedStores;
    });
    toast.success(t("common.storeDeletedSuccess", { storeId: id }));
    addLogEntry("Obchod smazán", { storeId: id }, user?.username);
    // TODO: Also delete all articles and racks associated with this store
    return true;
  };

  return { stores, getStoreById, addStore, updateStore, deleteStore };
};