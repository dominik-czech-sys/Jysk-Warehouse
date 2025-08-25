import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface Store {
  id: string;
  name: string;
}

// Funkce pro načtení obchodů
const fetchStores = async (): Promise<Store[]> => {
  const { data, error } = await supabase.from("stores").select("*");
  if (error) throw new Error(error.message);
  return data;
};

// Funkce pro přidání obchodu
const addStoreToDb = async (newStore: Omit<Store, ''>) => {
  const { data, error } = await supabase.from("stores").insert(newStore).select();
  if (error) throw new Error(error.message);
  return data;
};

// Funkce pro úpravu obchodu
const updateStoreInDb = async (updatedStore: Store) => {
  const { data, error } = await supabase.from("stores").update(updatedStore).eq("id", updatedStore.id).select();
  if (error) throw new Error(error.message);
  return data;
};

// Funkce pro smazání obchodu
const deleteStoreFromDb = async (storeId: string) => {
  const { error } = await supabase.from("stores").delete().eq("id", storeId);
  if (error) throw new Error(error.message);
  return storeId;
};

export const useStores = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: stores, isLoading, error } = useQuery<Store[]>({
    queryKey: ["stores"],
    queryFn: fetchStores,
  });

  const addStoreMutation = useMutation({
    mutationFn: addStoreToDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success(t("common.storeAddedSuccess"));
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: updateStoreInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success(t("common.storeUpdatedSuccess"));
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: deleteStoreFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success(t("common.storeDeletedSuccess"));
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return {
    stores: stores || [],
    isLoading,
    error,
    addStore: addStoreMutation.mutateAsync,
    updateStore: updateStoreMutation.mutateAsync,
    deleteStore: deleteStoreMutation.mutateAsync,
  };
};