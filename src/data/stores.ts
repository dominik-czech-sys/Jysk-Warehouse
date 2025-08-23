import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext";
import { useArticles, Article } from "./articles"; // Import useArticles and Article
import { defaultArticlesForNewStores } from "./users"; // Import default articles
import { useTranslation } from "react-i18next"; // Import useTranslation
import { getAllStores, createStore, updateStore as apiUpdateStore, deleteStore as apiDeleteStore, StoreApiData } from "@/api"; // Import API functions

export interface Store {
  id: string; // Unique ID for the store (e.g., "Sklad 1", "T508", "Kozomín")
  name: string; // Display name of the store
}

export const useStores = () => {
  const { user, isAdmin } = useAuth();
  const { addLogEntry } = useLog();
  const { addArticle } = useArticles(); // Use addArticle from useArticles hook
  const { t } = useTranslation(); // Initialize useTranslation

  const [stores, setStores] = useState<Store[]>([]); // Nyní se načítá z API

  // Načtení obchodů z API při startu a při změnách
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesFromApi = await getAllStores();
        setStores(storesFromApi);
      } catch (error) {
        console.error("Failed to fetch stores from API:", error);
        toast.error(t("common.storesFetchFailed"));
        setStores([]);
      }
    };
    fetchStores();
  }, [t]); // Závislost na t pro překlady chybových zpráv

  const getStoreById = (id: string) => stores.find((store) => store.id === id);

  const addStore = async (newStore: Store, addDefaultArticles: boolean = false) => {
    if (!isAdmin) {
      toast.error(t("common.noPermissionToAddStores"));
      return false;
    }
    if (stores.some(s => s.id === newStore.id)) {
      toast.error(t("common.storeExists", { storeId: newStore.id }));
      addLogEntry(t("common.attemptToAddExistingStore"), { storeId: newStore.id }, user?.username);
      return false;
    }

    try {
      const createdStore = await createStore(newStore);
      if (createdStore) {
        setStores((prev) => [...prev, createdStore]);
        toast.success(t("common.storeAddedSuccess", { storeName: createdStore.name, storeId: createdStore.id }));
        addLogEntry(t("common.storeAdded"), { storeId: createdStore.id, storeName: createdStore.name }, user?.username);

        if (addDefaultArticles) {
          for (const defaultArticle of defaultArticlesForNewStores) {
            const newArticle: Article = {
              ...defaultArticle,
              rackId: "N/A", // Placeholder
              shelfNumber: "N/A", // Placeholder
              storeId: createdStore.id,
              quantity: 1, // Default quantity for default articles
            };
            await addArticle(newArticle); // Použijeme await, aby se artikly přidaly postupně
          }
          toast.info(t("common.defaultArticlesAddedToStore", { storeId: createdStore.id }));
          addLogEntry(t("common.defaultArticlesAddedToStore"), { storeId: createdStore.id, articlesCount: defaultArticlesForNewStores.length }, user?.username);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Add Store Error:", error);
      toast.error(error.message || t("common.storeAddFailed"));
      addLogEntry(t("common.storeAddFailed"), { storeId: newStore.id, storeName: newStore.name, error: error.message }, user?.username);
      return false;
    }
  };

  const updateStore = async (updatedStore: Store) => {
    if (!isAdmin) {
      toast.error(t("common.noPermissionToEditStores"));
      return false;
    }
    try {
      const result = await apiUpdateStore(updatedStore.id, updatedStore);
      if (result) {
        setStores((prev) => prev.map((s) => (s.id === updatedStore.id ? updatedStore : s)));
        toast.success(t("common.storeUpdatedSuccess", { storeName: updatedStore.name, storeId: updatedStore.id }));
        addLogEntry(t("common.storeUpdated"), { storeId: updatedStore.id, storeName: updatedStore.name }, user?.username);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Update Store Error:", error);
      toast.error(error.message || t("common.storeUpdateFailed"));
      addLogEntry(t("common.storeUpdateFailed"), { storeId: updatedStore.id, storeName: updatedStore.name, error: error.message }, user?.username);
      return false;
    }
  };

  const deleteStore = async (id: string) => {
    if (!isAdmin) {
      toast.error(t("common.noPermissionToDeleteStores"));
      return false;
    }
    try {
      const success = await apiDeleteStore(id);
      if (success) {
        setStores((prev) => prev.filter((s) => s.id !== id));
        toast.success(t("common.storeDeletedSuccess", { storeId: id }));
        addLogEntry(t("common.storeDeleted"), { storeId: id }, user?.username);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Delete Store Error:", error);
      toast.error(error.message || t("common.storeDeleteFailed"));
      addLogEntry(t("common.storeDeleteFailed"), { storeId: id, error: error.message }, user?.username);
      return false;
    }
  };

  return { stores, getStoreById, addStore, updateStore, deleteStore };
};