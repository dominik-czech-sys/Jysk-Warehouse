import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext"; // Import useLog
import { useShelfRacks } from "./shelfRacks"; // Import useShelfRacks to get rack details
import { useGlobalArticles } from "./globalArticles"; // Import useGlobalArticles
import { useTranslation } from "react-i18next"; // Import useTranslation

export interface Article {
  id: string; // Číslo artiklu (Article Number)
  name: string; // Název
  rackId: string; // ID of the selected ShelfRack (e.g., "A-1")
  shelfNumber: string; // The specific shelf number within the rack (e.g., "1", "2")
  storeId: string; // Derived from ShelfRack (renamed from warehouseId)
  status: string; // Nové pole pro status zboží
  quantity: number; // New field for article quantity
  minQuantity?: number; // Optional minimum quantity for low stock alerts
  // New fields for replenishment system
  hasShopFloorStock?: boolean; // Does this item have stock on the shop floor?
  shopFloorStock?: number; // Current quantity on the shop floor
  replenishmentTrigger?: number; // Threshold to trigger replenishment
}

export const useArticles = () => {
  const { userStoreId, isAdmin, user } = useAuth();
  const { addLogEntry } = useLog();
  const { allShelfRacks } = useShelfRacks(); // Use allShelfRacks here
  const { globalArticles } = useGlobalArticles(); // Use global articles
  const { t } = useTranslation(); // Initialize useTranslation

  const [articles, setArticles] = useState<Article[]>(() => {
    const storedArticles = localStorage.getItem("articles");
    return storedArticles ? JSON.parse(storedArticles) : [];
  });

  // Effect to persist articles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("articles", JSON.stringify(articles));
  }, [articles]);

  // For non-admins, filter articles by their storeId.
  // For admins, combine all store-specific articles with global articles (transformed).
  const combinedArticles = isAdmin
    ? [
        ...articles, // All store-specific articles
        ...globalArticles.map(ga => ({ // Global articles as "N/A" location
          id: ga.id,
          name: ga.id, // Use ID as name for global articles in this context
          status: ga.status,
          rackId: "N/A",
          shelfNumber: "N/A",
          storeId: "GLOBAL", // Special storeId for global articles
          quantity: 0, // Global articles don't have a quantity in this context
          minQuantity: ga.minQuantity,
        }))
      ]
    : articles.filter((article) => article.storeId === userStoreId);

  const getArticleById = (id: string, storeId?: string) => {
    if (isAdmin) {
      // Admins can search global or any store's articles
      if (storeId === "GLOBAL") {
        const globalArticle = globalArticles.find(ga => ga.id === id);
        if (globalArticle) {
          return { ...globalArticle, rackId: "N/A", shelfNumber: "N/A", storeId: "GLOBAL", quantity: 0 };
        }
      }
      return articles.find((article) => article.id === id && (storeId ? article.storeId === storeId : true));
    }
    // Non-admins only search within their store
    return articles.find((article) => article.id === id && article.storeId === userStoreId);
  };

  const addArticle = (newArticle: Article) => {
    setArticles((prev) => [...prev, newArticle]);
    addLogEntry(t("common.articleAdded"), { articleId: newArticle.id, name: newArticle.name, rackId: newArticle.rackId, shelfNumber: newArticle.shelfNumber, storeId: newArticle.storeId, quantity: newArticle.quantity, minQuantity: newArticle.minQuantity }, user?.email);
  };

  const updateArticle = (updatedArticle: Article) => {
    setArticles((prev) =>
      prev.map((article) => (article.id === updatedArticle.id && article.storeId === updatedArticle.storeId ? updatedArticle : article))
    );
    addLogEntry(t("common.articleUpdated"), { articleId: updatedArticle.id, name: updatedArticle.name, rackId: updatedArticle.rackId, shelfNumber: updatedArticle.shelfNumber, storeId: updatedArticle.storeId, quantity: updatedArticle.quantity, minQuantity: updatedArticle.minQuantity }, user?.email);
  };

  const deleteArticle = (id: string, storeId: string) => {
    setArticles((prev) => prev.filter((article) => !(article.id === id && article.storeId === storeId)));
    addLogEntry(t("common.articleDeleted"), { articleId: id, storeId }, user?.email);
  };

  const getArticlesByStoreId = (storeId: string) => {
    return articles.filter(article => article.storeId === storeId);
  };

  return { articles: combinedArticles, allArticles: articles, getArticleById, addArticle, updateArticle, deleteArticle, getArticlesByStoreId };
};