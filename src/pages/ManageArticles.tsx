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
import { useArticles, Article } from "@/data/articles";
import { Link } from "react-router-dom";
import { PlusCircle, Edit, Trash2, Scan, Boxes, ArrowLeft } from "lucide-react";
import { ArticleFormDialog } from "@/components/ArticleFormDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useGlobalArticles, GlobalArticle } from "@/data/globalArticles"; // Import global articles hook

const ManageArticles = () => {
  const { articles, addArticle, updateArticle, deleteArticle } = useArticles();
  const { globalArticles, addGlobalArticle, updateGlobalArticle, deleteGlobalArticle } = useGlobalArticles();
  const { isAdmin, userStoreId, hasPermission } = useAuth();
  const { t } = useTranslation();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | GlobalArticle | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDeleteId, setArticleToDeleteId] = useState<string | null>(null);
  const [articleToDeleteStoreId, setArticleToDeleteStoreId] = useState<string | null>(null); // Can be "GLOBAL"

  const currentArticles = isAdmin ? globalArticles : articles;

  const handleAddArticle = (newArticle: Article | GlobalArticle) => {
    if (isAdmin) {
      if (!hasPermission("default_articles:manage")) {
        toast.error(t("common.noPermissionToAddArticles"));
        return;
      }
      addGlobalArticle(newArticle as GlobalArticle);
    } else {
      if (!hasPermission("article:create")) {
        toast.error(t("common.noPermissionToAddArticles"));
        return;
      }
      const finalArticle = { ...(newArticle as Article), storeId: userStoreId || (newArticle as Article).storeId };
      if (articles.some(article => article.id === finalArticle.id && article.storeId === finalArticle.storeId)) {
        toast.error(t("common.articleExistsInStore", { articleId: finalArticle.id }));
        return;
      }
      addArticle(finalArticle);
      toast.success(t("common.articleAddedSuccess", { articleId: finalArticle.id }));
    }
  };

  const handleEditArticle = (updatedArticle: Article | GlobalArticle) => {
    if (isAdmin) {
      if (!hasPermission("default_articles:manage")) {
        toast.error(t("common.noPermissionToEditArticles"));
        return;
      }
      updateGlobalArticle(updatedArticle as GlobalArticle);
    } else {
      if (!hasPermission("article:update")) {
        toast.error(t("common.noPermissionToEditArticles"));
        return;
      }
      const finalArticle = { ...(updatedArticle as Article), storeId: userStoreId || (updatedArticle as Article).storeId };
      updateArticle(finalArticle);
      toast.success(t("common.articleUpdatedSuccess", { articleId: finalArticle.id }));
    }
  };

  const handleDeleteArticle = (id: string, storeId: string) => {
    if (isAdmin) {
      if (!hasPermission("default_articles:manage")) {
        toast.error(t("common.noPermissionToDeleteArticles"));
        return;
      }
    } else {
      if (!hasPermission("article:delete")) {
        toast.error(t("common.noPermissionToDeleteArticles"));
        return;
      }
    }
    setArticleToDeleteId(id);
    setArticleToDeleteStoreId(storeId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteArticle = () => {
    if (articleToDeleteId) {
      if (isAdmin && articleToDeleteStoreId === "GLOBAL") {
        deleteGlobalArticle(articleToDeleteId);
        toast.success(t("common.globalArticleDeletedSuccess", { articleId: articleToDeleteId }));
      } else if (articleToDeleteStoreId) {
        deleteArticle(articleToDeleteId, articleToDeleteStoreId);
        toast.success(t("common.articleDeletedSuccess", { articleId: articleToDeleteId }));
      }
      setArticleToDeleteId(null);
      setArticleToDeleteStoreId(null);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 space-y-4 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToMainPage")}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
            {isAdmin ? t("common.globalArticleManagement") : t("common.articleManagement")}
          </h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            {!isAdmin && hasPermission("article:scan") && (
              <Link to="/skenovat-carkod" className="w-full sm:w-auto">
                <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
                  <Scan className="h-4 w-4 mr-2" /> {t("common.scanBarcode")}
                </Button>
              </Link>
            )}
            {!isAdmin && hasPermission("article:mass_add") && (
              <Link to="/mass-add-artikly" className="w-full sm:w-auto">
                <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
                  <Boxes className="h-4 w-4 mr-2" /> {t("common.massAdd")}
                </Button>
              </Link>
            )}
            {(isAdmin && hasPermission("default_articles:manage")) || (!isAdmin && hasPermission("article:create")) ? (
              <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full sm:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" /> {isAdmin ? t("common.addGlobalArticle") : t("common.addArticle")}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">{t("common.articleId")}</TableHead>
                <TableHead className="min-w-[150px]">{t("common.articleName")}</TableHead>
                {!isAdmin && <TableHead className="min-w-[80px]">{t("common.rackId")}</TableHead>}
                {!isAdmin && <TableHead className="min-w-[100px]">{t("common.shelfNumber")}</TableHead>}
                <TableHead className="min-w-[100px]">{t("common.status")}</TableHead>
                {!isAdmin && <TableHead className="min-w-[100px]">{t("common.storeId")}</TableHead>}
                <TableHead className="text-right min-w-[100px]">{t("common.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentArticles.map((article) => (
                <TableRow key={`${article.id}-${isAdmin ? "GLOBAL" : (article as Article).storeId}`}>
                  <TableCell className="font-medium">{article.id}</TableCell>
                  <TableCell>{article.name}</TableCell>
                  {!isAdmin && <TableCell>{(article as Article).rackId}</TableCell>}
                  {!isAdmin && <TableCell>{(article as Article).shelfNumber}</TableCell>}
                  <TableCell>{article.status}</TableCell>
                  {!isAdmin && <TableCell>{(article as Article).storeId}</TableCell>}
                  <TableCell className="text-right">
                    {((isAdmin && hasPermission("default_articles:manage")) || (!isAdmin && hasPermission("article:update"))) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        onClick={() => {
                          setEditingArticle(article);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {((isAdmin && hasPermission("default_articles:manage")) || (!isAdmin && hasPermission("article:delete"))) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteArticle(article.id, isAdmin ? "GLOBAL" : (article as Article).storeId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {currentArticles.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">{isAdmin ? t("common.noGlobalArticles") : t("common.noArticlesFound")}</p>
        )}
      </div>

      <ArticleFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddArticle}
        article={null}
        isGlobalAdminContext={isAdmin}
      />

      <ArticleFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingArticle(null);
        }}
        onSubmit={handleEditArticle}
        article={editingArticle}
        isGlobalAdminContext={isAdmin}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAdmin ? t("common.confirmDeleteGlobalArticleTitle") : t("common.confirmDeleteArticleTitle")}</AlertDialogTitle>
            <AlertDialogDescription
              dangerouslySetInnerHTML={{
                __html: isAdmin
                  ? t("common.confirmDeleteGlobalArticleDescription", { articleId: articleToDeleteId })
                  : t("common.confirmDeleteArticleDescription", { articleId: articleToDeleteId, storeId: articleToDeleteStoreId }),
              }}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteArticle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("common.continue")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageArticles;