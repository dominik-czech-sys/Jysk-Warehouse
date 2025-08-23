import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext"; // Import useLog
import { useShelfRacks } from "./shelfRacks"; // Import useShelfRacks to get rack details
import { getAllArticles, createArticle, updateArticle as apiUpdateArticle, deleteArticle as apiDeleteArticle, ArticleApiData } from "@/api"; // Import API functions

export interface Article {
  id: string; // Číslo artiklu (Article Number)
  name: string; // Název
  rackId: string; // ID of the selected ShelfRack (e.g., "A-1")
  shelfNumber: string; // The specific shelf number within the rack (e.g., "1", "2")
  storeId: string; // Derived from ShelfRack (renamed from warehouseId)
  status: string; // Nové pole pro status zboží
  quantity: number; // New field for article quantity
}

export const useArticles = () => {
  const { userStoreId, isAdmin, user } = useAuth();
  const { addLogEntry } = useLog();
  const { allShelfRacks } = useShelfRacks(); // Use allShelfRacks here

  const [articles, setArticles] = useState<Article[]>([]); // Nyní se načítá z API

  // Načtení artiklů z API při startu a při změnách
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesFromApi = await getAllArticles();
        setArticles(articlesFromApi);
      } catch (error) {
        console.error("Failed to fetch articles from API:", error);
        // toast.error(t("common.articlesFetchFailed")); // Překladová chyba, pokud existuje
        setArticles([]);
      }
    };
    fetchArticles();
  }, []); // Bez závislostí, aby se načetlo jen jednou při mountu

  const filteredArticles = isAdmin
    ? articles
    : articles.filter((article) => article.storeId === userStoreId);

  const getArticleById = (id: string, storeId?: string) => {
    if (storeId) {
      return articles.find((article) => article.id === id && article.storeId === storeId);
    }
    return filteredArticles.find((article) => article.id === id);
  };

  const addArticle = async (newArticle: Article) => {
    try {
      const createdArticle = await createArticle(newArticle);
      if (createdArticle) {
        setArticles((prev) => [...prev, createdArticle]);
        addLogEntry("Artikl přidán", { articleId: createdArticle.id, name: createdArticle.name, rackId: createdArticle.rackId, shelfNumber: createdArticle.shelfNumber, storeId: createdArticle.storeId, quantity: createdArticle.quantity }, user?.username);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Add Article Error:", error);
      // toast.error(error.message || t("common.articleAddFailed"));
      addLogEntry("Přidání artiklu selhalo", { articleId: newArticle.id, error: error.message }, user?.username);
      return false;
    }
  };

  const updateArticle = async (updatedArticle: Article) => {
    try {
      const result = await apiUpdateArticle(updatedArticle.id, updatedArticle.storeId, updatedArticle);
      if (result) {
        setArticles((prev) =>
          prev.map((article) => (article.id === updatedArticle.id && article.storeId === updatedArticle.storeId ? updatedArticle : article))
        );
        addLogEntry("Artikl aktualizován", { articleId: updatedArticle.id, name: updatedArticle.name, rackId: updatedArticle.rackId, shelfNumber: updatedArticle.shelfNumber, storeId: updatedArticle.storeId, quantity: updatedArticle.quantity }, user?.username);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Update Article Error:", error);
      // toast.error(error.message || t("common.articleUpdateFailed"));
      addLogEntry("Aktualizace artiklu selhala", { articleId: updatedArticle.id, error: error.message }, user?.username);
      return false;
    }
  };

  const deleteArticle = async (id: string, storeId: string) => {
    try {
      const success = await apiDeleteArticle(id, storeId);
      if (success) {
        setArticles((prev) => prev.filter((article) => !(article.id === id && article.storeId === storeId)));
        addLogEntry("Artikl smazán", { articleId: id, storeId }, user?.username);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Delete Article Error:", error);
      // toast.error(error.message || t("common.articleDeleteFailed"));
      addLogEntry("Smazání artiklu selhalo", { articleId: id, storeId, error: error.message }, user?.username);
      return false;
    }
  };

  const getArticlesByStoreId = (storeId: string) => {
    return articles.filter(article => article.storeId === storeId);
  };

  return { articles: filteredArticles, allArticles: articles, getArticleById, addArticle, updateArticle, deleteArticle, getArticlesByStoreId };
};