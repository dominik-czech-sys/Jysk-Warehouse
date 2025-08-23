import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { defaultArticlesForNewStores } from "@/data/users"; // Import default articles
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface DefaultArticle {
  id: string;
  name: string;
  status: string;
}

export const DefaultArticleManager: React.FC = () => {
  const { hasPermission } = useAuth();
  const { t } = useTranslation(); // Initialize useTranslation
  const [defaultArticles, setDefaultArticles] = useState<DefaultArticle[]>(defaultArticlesForNewStores);
  const [newArticleId, setNewArticleId] = useState("");
  const [newArticleName, setNewArticleName] = useState("");
  const [newArticleStatus, setNewArticleStatus] = useState("");

  const handleAddDefaultArticle = () => {
    if (!hasPermission("default_articles:manage")) {
      toast.error(t("common.noPermissionToManageDefaultArticles"));
      return;
    }
    if (!newArticleId.trim() || !newArticleName.trim() || !newArticleStatus.trim()) {
      toast.error(t("common.fillAllNewArticleFields"));
      return;
    }
    if (defaultArticles.some(a => a.id === newArticleId.trim().toUpperCase())) {
      toast.error(t("common.defaultArticleExists", { articleId: newArticleId.trim().toUpperCase() }));
      return;
    }

    const newDefaultArticle: DefaultArticle = {
      id: newArticleId.trim().toUpperCase(),
      name: newArticleName.trim(),
      status: newArticleStatus.trim(),
    };

    setDefaultArticles(prev => [...prev, newDefaultArticle]);
    // In a real app, you'd persist this change (e.g., to a backend or localStorage for defaultArticlesForNewStores)
    // For now, it's just in component state.
    toast.success(t("common.defaultArticleAddedSuccess", { articleId: newDefaultArticle.id }));
    setNewArticleId("");
    setNewArticleName("");
    setNewArticleStatus("");
  };

  const handleRemoveDefaultArticle = (idToRemove: string) => {
    if (!hasPermission("default_articles:manage")) {
      toast.error(t("common.noPermissionToManageDefaultArticles"));
      return;
    }
    setDefaultArticles(prev => prev.filter(article => article.id !== idToRemove));
    toast.info(t("common.defaultArticleRemovedInfo", { articleId: idToRemove }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light">{t("common.defaultArticleManagement")}</h2>
      <p className="text-muted-foreground">{t("common.defaultArticlesInfo")}</p>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder={t("common.articleIdPlaceholder")}
          value={newArticleId}
          onChange={(e) => setNewArticleId(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder={t("common.articleNamePlaceholder")}
          value={newArticleName}
          onChange={(e) => setNewArticleName(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder={t("common.articleStatusPlaceholder")}
          value={newArticleStatus}
          onChange={(e) => setNewArticleStatus(e.target.value)}
          className="w-24"
        />
        <Button onClick={handleAddDefaultArticle} disabled={!hasPermission("default_articles:manage")}>
          <PlusCircle className="h-4 w-4 mr-2" /> {t("common.add")}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.articleId")}</TableHead>
              <TableHead>{t("common.articleName")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-right">{t("common.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {defaultArticles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t("common.noDefaultArticles")}
                </TableCell>
              </TableRow>
            ) : (
              defaultArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.id}</TableCell>
                  <TableCell>{article.name}</TableCell>
                  <TableCell>{article.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDefaultArticle(article.id)}
                      disabled={!hasPermission("default_articles:manage")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};