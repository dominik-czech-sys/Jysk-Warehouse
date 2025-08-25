import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface GlobalArticle {
  id: string; // Article Number
  name: string;
  status: string;
  min_quantity?: number;
}

type NewGlobalArticle = Omit<GlobalArticle, 'id'>;

const fetchGlobalArticles = async (): Promise<GlobalArticle[]> => {
  const { data, error } = await supabase.from("global_articles").select("*");
  if (error) throw new Error(error.message);
  return data;
};

const addGlobalArticleToDb = async (newArticle: NewGlobalArticle) => {
  const { data, error } = await supabase.from("global_articles").insert(newArticle).select();
  if (error) throw new Error(error.message);
  return data;
};

const updateGlobalArticleInDb = async (updatedArticle: GlobalArticle) => {
  const { data, error } = await supabase.from("global_articles").update(updatedArticle).eq("id", updatedArticle.id).select();
  if (error) throw new Error(error.message);
  return data;
};

const deleteGlobalArticleFromDb = async (articleId: string) => {
  const { error } = await supabase.from("global_articles").delete().eq("id", articleId);
  if (error) throw new Error(error.message);
  return articleId;
};

export const useGlobalArticles = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: globalArticles, isLoading, error } = useQuery<GlobalArticle[]>({
    queryKey: ["globalArticles"],
    queryFn: fetchGlobalArticles,
  });

  const addGlobalArticleMutation = useMutation({
    mutationFn: addGlobalArticleToDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalArticles"] });
      toast.success(t("common.globalArticleAddedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const updateGlobalArticleMutation = useMutation({
    mutationFn: updateGlobalArticleInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalArticles"] });
      toast.success(t("common.globalArticleUpdatedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteGlobalArticleMutation = useMutation({
    mutationFn: deleteGlobalArticleFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalArticles"] });
      toast.success(t("common.globalArticleDeletedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    globalArticles: globalArticles || [],
    isLoading,
    error,
    addGlobalArticle: addGlobalArticleMutation.mutateAsync,
    updateGlobalArticle: updateGlobalArticleMutation.mutateAsync,
    deleteGlobalArticle: deleteGlobalArticleMutation.mutateAsync,
  };
};