import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext";
import { useShelfRacks } from "./shelfRacks"; // Import useShelfRacks to get rack details

export interface Article {
  id: string; // Číslo artiklu (Article Number)
  name: string; // Název
  rackId: string; // ID of the selected ShelfRack (e.g., "A-1")
  shelfNumber: string; // The specific shelf number within the rack (e.g., "1", "2")
  storeId: string; // Derived from ShelfRack (renamed from warehouseId)
  status: string; // Nové pole pro status zboží
  quantity: number; // New field for article quantity
}

const initialArticles: Article[] = [
  { id: "100001", name: "Židle JYSK", rackId: "A-1", shelfNumber: "1", storeId: "T508", status: "21", quantity: 10 },
  { id: "100002", name: "Stůl JYSK", rackId: "A-1", shelfNumber: "2", storeId: "T508", status: "21", quantity: 5 },
  { id: "100003", name: "Skříň JYSK", rackId: "B-2", shelfNumber: "1", storeId: "T508", status: "11", quantity: 3 },
  { id: "200001", name: "Postel JYSK", rackId: "C-3", shelfNumber: "1", storeId: "Kozomín", status: "21", quantity: 7 },
  { id: "200002", name: "Matrace JYSK", rackId: "C-3", shelfNumber: "2", storeId: "Kozomín", status: "41", quantity: 12 },
];

export const useArticles = () => {
  const { userStoreId, isAdmin, user } = useAuth();
  const { addLogEntry } = useLog();
  const { allShelfRacks } = useShelfRacks();

  const [articles, setArticles] = useState<Article[]>(() => {
    const storedArticles = localStorage.getItem("articles");
    return storedArticles ? JSON.parse(storedArticles) : initialArticles;
  });

  useEffect(() => {
    localStorage.setItem("articles", JSON.stringify(articles));
  }, [articles]);

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
    if (articles.some(article => article.id === newArticle.id && article.storeId === newArticle.storeId)) {
      // toast.error(t("common.articleExistsInStore", { articleId: newArticle.id }));
      addLogEntry("Pokus o přidání existujícího artiklu", { articleId: newArticle.id, storeId: newArticle.storeId }, user?.username);
      return false;
    }
    setArticles((prev) => [...prev, newArticle]);
    addLogEntry("Artikl přidán", { articleId: newArticle.id, name: newArticle.name, rackId: newArticle.rackId, shelfNumber: newArticle.shelfNumber, storeId: newArticle.storeId, quantity: newArticle.quantity }, user?.username);
    return true;
  };

  const updateArticle = async (updatedArticle: Article) => {
    setArticles((prev) =>
      prev.map((article) => (article.id === updatedArticle.id && article.storeId === updatedArticle.storeId ? updatedArticle : article))
    );
    addLogEntry("Artikl aktualizován", { articleId: updatedArticle.id, name: updatedArticle.name, rackId: updatedArticle.rackId, shelfNumber: updatedArticle.shelfNumber, storeId: updatedArticle.storeId, quantity: updatedArticle.quantity }, user?.username);
    return true;
  };

  const deleteArticle = async (id: string, storeId: string) => {
    setArticles((prev) => prev.filter((article) => !(article.id === id && article.storeId === storeId)));
    addLogEntry("Artikl smazán", { articleId: id, storeId }, user?.username);
    return true;
  };

  const getArticlesByStoreId = (storeId: string) => {
    return articles.filter(article => article.storeId === storeId);
  };

  return { articles: filteredArticles, allArticles: articles, getArticleById, addArticle, updateArticle, deleteArticle, getArticlesByStoreId };
};