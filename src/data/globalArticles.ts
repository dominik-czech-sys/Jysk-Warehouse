import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLog } from "@/contexts/LogContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface GlobalArticle {
  id: string; // Article Number
  name: string; // Name
  status: string; // Status of the article
  minQuantity?: number; // Optional minimum quantity for low stock alerts
}

// Initial global articles data
const initialGlobalArticles: GlobalArticle[] = [
  { id: "DEFAULT-001", name: "Výchozí artikl A", status: "21", minQuantity: 5 },
  { id: "DEFAULT-002", name: "Výchozí artikl B", status: "11", minQuantity: 10 },
  { id: "DEFAULT-003", name: "Výchozí artikl C", status: "41", minQuantity: 2 },
];

export const useGlobalArticles = () => {
  const { user } = useAuth();
  const { addLogEntry } = useLog();
  const { t } = useTranslation();

  const [globalArticles, setGlobalArticles] = useState<GlobalArticle[]>(() => {
    const storedGlobalArticles = localStorage.getItem("globalArticles");
    if (storedGlobalArticles) {
      return JSON.parse(storedGlobalArticles);
    }
    return initialGlobalArticles;
  });

  useEffect(() => {
    localStorage.setItem("globalArticles", JSON.stringify(globalArticles));
  }, [globalArticles]);

  const getGlobalArticleById = (id: string) => {
    return globalArticles.find((article) => article.id === id);
  };

  const addGlobalArticle = (newArticle: GlobalArticle) => {
    if (globalArticles.some(article => article.id === newArticle.id)) {
      toast.error(t("common.globalArticleExists", { articleId: newArticle.id }));
      addLogEntry(t("common.attemptToAddExistingGlobalArticle"), { articleId: newArticle.id }, user?.email);
      return false;
    }
    setGlobalArticles((prev) => [...prev, newArticle]);
    toast.success(t("common.globalArticleAddedSuccess", { articleId: newArticle.id }));
    addLogEntry(t("common.globalArticleAdded"), { articleId: newArticle.id, name: newArticle.name, status: newArticle.status, minQuantity: newArticle.minQuantity }, user?.email);
    return true;
  };

  const updateGlobalArticle = (updatedArticle: GlobalArticle) => {
    setGlobalArticles((prev) =>
      prev.map((article) => (article.id === updatedArticle.id ? updatedArticle : article))
    );
    toast.success(t("common.globalArticleUpdatedSuccess", { articleId: updatedArticle.id }));
    addLogEntry(t("common.globalArticleUpdated"), { articleId: updatedArticle.id, name: updatedArticle.name, status: updatedArticle.status, minQuantity: updatedArticle.minQuantity }, user?.email);
  };

  const deleteGlobalArticle = (id: string) => {
    setGlobalArticles((prev) => prev.filter((article) => article.id !== id));
    toast.success(t("common.globalArticleDeletedSuccess", { articleId: id }));
    addLogEntry(t("common.globalArticleDeleted"), { articleId: id }, user?.email);
  };

  return { globalArticles, getGlobalArticleById, addGlobalArticle, updateGlobalArticle, deleteGlobalArticle };
};