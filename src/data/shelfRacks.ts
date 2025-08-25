import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface Shelf {
  shelfNumber: string;
  description: string;
}

export interface ShelfRack {
  id: string; // UUID
  rack_identifier: string;
  row_id: string;
  rack_id: string;
  shelves: Shelf[];
  store_id: string;
}

type NewShelfRack = Omit<ShelfRack, 'id'>;

const fetchShelfRacks = async (): Promise<ShelfRack[]> => {
  const { data, error } = await supabase.from("shelf_racks").select("*");
  if (error) throw new Error(error.message);
  return data;
};

const addShelfRackToDb = async (newRack: NewShelfRack) => {
  const { data, error } = await supabase.from("shelf_racks").insert(newRack).select();
  if (error) throw new Error(error.message);
  return data;
};

const updateShelfRackInDb = async (updatedRack: ShelfRack) => {
  const { data, error } = await supabase.from("shelf_racks").update(updatedRack).eq("id", updatedRack.id).select();
  if (error) throw new Error(error.message);
  return data;
};

const deleteShelfRackFromDb = async (rackId: string) => {
  const { error } = await supabase.from("shelf_racks").delete().eq("id", rackId);
  if (error) throw new Error(error.message);
  return rackId;
};

export const useShelfRacks = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: shelfRacks, isLoading, error } = useQuery<ShelfRack[]>({
    queryKey: ["shelfRacks"],
    queryFn: fetchShelfRacks,
  });

  const addShelfRackMutation = useMutation({
    mutationFn: addShelfRackToDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shelfRacks"] });
      toast.success(t("common.rackAddedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const updateShelfRackMutation = useMutation({
    mutationFn: updateShelfRackInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shelfRacks"] });
      toast.success(t("common.rackUpdatedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteShelfRackMutation = useMutation({
    mutationFn: deleteShelfRackFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shelfRacks"] });
      toast.success(t("common.rackDeletedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    shelfRacks: shelfRacks || [],
    isLoading,
    error,
    addShelfRack: addShelfRackMutation.mutateAsync,
    updateShelfRack: updateShelfRackMutation.mutateAsync,
    deleteShelfRack: deleteShelfRackMutation.mutateAsync,
  };
};