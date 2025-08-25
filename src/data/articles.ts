import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface Article {
  id: string; // UUID from DB
  article_number: string;
  name: string;
  rack_id: string;
  shelf_number: string;
  store_id: string;
  status: string;
  quantity: number;
  min_quantity?: number;
  has_shop_floor_stock?: boolean;
  shop_floor_stock?: number;
  replenishment_trigger?: number;
}

// Typ pro vkládání nového artiklu (bez id generovaného databází)
type NewArticle = Omit<Article, 'id'>;

export const articleStatuses = ["active", "promo", "clearance", "discontinued"];

const fetchArticles = async (): Promise<Article[]> => {
  const { data, error } = await supabase.from("articles").select("*");
  if (error) throw new Error(error.message);
  return data;
};

const addArticleToDb = async (newArticle: NewArticle) => {
  const { data, error } = await supabase.from("articles").insert(newArticle).select();
  if (error) throw new Error(error.message);
  return data;
};

const updateArticleInDb = async (updatedArticle: Article) => {
  const { data, error } = await supabase.from("articles").update(updatedArticle).eq("id", updatedArticle.id).select();
  if (error) throw new Error(error.message);
  return data;
};

const deleteArticleFromDb = async (articleId: string) => {
  const { error } = await supabase.from("articles").delete().eq("id", articleId);
  if (error) throw new Error(error.message);
  return articleId;
};

export const useArticles = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ["articles"],
    queryFn: fetchArticles,
  });

  const addArticleMutation = useMutation({
    mutationFn: addArticleToDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(t("common.articleAddedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const updateArticleMutation = useMutation({
    mutationFn: updateArticleInDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(t("common.articleUpdatedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: deleteArticleFromDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(t("common.articleDeletedSuccess"));
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    articles: articles || [],
    isLoading,
    error,
    addArticle: addArticleMutation.mutateAsync,
    updateArticle: updateArticleMutation.mutateAsync,
    deleteArticle: deleteArticleMutation.mutateAsync,
  };
};