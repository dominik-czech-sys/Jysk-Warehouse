import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Edit, Trash2, Scan, Boxes, ArrowLeft, QrCode, Filter, ArrowUpDown, X } from "lucide-react";
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
import { useGlobalArticles, GlobalArticle } from "@/data/globalArticles";
import { useArticles, Article } from "@/data/articles";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleBarcodeGenerator } from "@/components/ArticleBarcodeGenerator"; // <-- Opravený import

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
  const [articleToDeleteStoreId, setArticleToDeleteStoreId] = useState<string | null>(null);

  const [isBarcodeGeneratorOpen, setIsBarcodeGeneratorOpen] = useState(false);
  const [articleToGenerateBarcode, setArticleToGenerateBarcode] = useState<{ id: string; storeId: string } | null>(null);

  // Filter and Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [minQuantityFilter, setMinQuantityFilter] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState("id-asc"); // e.g., "id-asc", "name-desc", "quantity-asc"

  const allArticlesForDisplay = isAdmin ? globalArticles : articles;

  const filteredAndSortedArticles = useMemo(() => {
    let currentFilteredArticles = allArticlesForDisplay;

    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFilteredArticles = currentFilteredArticles.filter(
        (article) =>
          article.id.toLowerCase().includes(lowerCaseSearchTerm) ||
          article.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          article.status.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      currentFilteredArticles = currentFilteredArticles.filter(
        (article) => article.status === filterStatus
      );
    }

    // Apply min quantity filter
    if (minQuantityFilter !== '' && minQuantityFilter >= 0) {
      currentFilteredArticles = currentFilteredArticles.filter(
        (article) => (article.minQuantity || 0) >= minQuantityFilter
      );
    }

    // Apply sorting
    currentFilteredArticles.sort((a, b) => {
      switch (sortBy) {
        case "id-asc":
          return a.id.localeCompare(b.id);
        case "id-desc":
          return b.id.localeCompare(a.id);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "quantity-asc":
          return (a as Article).quantity - (b as Article).quantity;
        case "quantity-desc":
          return (b as Article).quantity - (a as Article).quantity;
        case "status-asc":
          return a.status.localeCompare(b.status);
        case "status-desc":
          return b.status.localeCompare(a.status);
        default:
          return 0;
      }
    });

    return currentFilteredArticles;
  }, [allArticlesForDisplay, searchTerm, filterStatus, minQuantityFilter, sortBy]);

  const handleAddArticle = (newArticle: Article | GlobalArticle) => {
    if (isAdmin) {
      if (!hasPermission("default_articles:manage")) {
        toast.error(t("common.noPermissionToAddArticles"));
        return;
      }
      if (globalArticles.some(article => article.id === newArticle.id)) {
        toast.error(t("common.globalArticleExists", { articleId: newArticle.id }));
        return;
      }
      addGlobalArticle(newArticle as GlobalArticle);
      toast.success(t("common.globalArticleAddedSuccess", { articleId: newArticle.id }));
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
      toast.success(t("common.globalArticleUpdatedSuccess", { articleId: updatedArticle.id }));
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

  const handleGenerateBarcode = (id: string, storeId: string) => {
    setArticleToGenerateBarcode({ id, storeId });
    setIsBarcodeGeneratorOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setMinQuantityFilter('');
    setSortBy("id-asc");
  };

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    allArticlesForDisplay.forEach(article => statuses.add(article.status));
    return ["all", ...Array.from(statuses).sort()];
  }, [allArticlesForDisplay]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 mt-4 sm:mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.backToMainPage")}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
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

        {/* Filter and Sort Section */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-jyskBlue-dark dark:text-jyskBlue-light flex items-center">
              <Filter className="h-5 w-5 mr-2" /> {t("common.articlesFilter")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-full md:col-span-2 lg:col-span-1">
              <Input
                placeholder={t("common.searchArticles")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select onValueChange={setFilterStatus} value={filterStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("common.filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === "all" ? t("common.all") : status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="number"
                placeholder={t("common.minQuantity")}
                value={minQuantityFilter}
                onChange={(e) => setMinQuantityFilter(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full"
                min="0"
              />
            </div>
            <div>
              <Select onValueChange={setSortBy} value={sortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("common.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id-asc">{t("common.sortByIdAsc")}</SelectItem>
                  <SelectItem value="id-desc">{t("common.sortByIdDesc")}</SelectItem>
                  <SelectItem value="name-asc">{t("common.sortByNameAsc")}</SelectItem>
                  <SelectItem value="name-desc">{t("common.sortByNameDesc")}</SelectItem>
                  {!isAdmin && (
                    <>
                      <SelectItem value="quantity-asc">{t("common.sortByQuantityAsc")}</SelectItem>
                      <SelectItem value="quantity-desc">{t("common.sortByQuantityDesc")}</SelectItem>
                    </>
                  )}
                  <SelectItem value="status-asc">{t("common.sortByStatusAsc")}</SelectItem>
                  <SelectItem value="status-desc">{t("common.sortByStatusDesc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-full flex justify-end">
              <Button onClick={handleResetFilters} variant="outline" className="flex items-center">
                <X className="h-4 w-4 mr-2" /> {t("common.resetFilters")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">{t("common.articleId")}</TableHead>
                <TableHead className="min-w-[150px]">{t("common.articleName")}</TableHead>
                {!isAdmin && <TableHead className="min-w-[80px]">{t("common.rackId")}</TableHead>}
                {!isAdmin && <TableHead className="min-w-[100px]">{t("common.shelfNumber")}</TableHead>}
                <TableHead className="min-w-[100px]">{t("common.status")}</TableHead>
                {!isAdmin && <TableHead className="min-w-[80px]">{t("common.quantity")}</TableHead>}
                <TableHead className="min-w-[100px]">{t("common.minQuantity")}</TableHead>
                {!isAdmin && <TableHead className="min-w-[100px]">{t("common.storeId")}</TableHead>}
                <TableHead className="text-right min-w-[100px]">{t("common.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedArticles.map((article) => (
                <TableRow key={`${article.id}-${isAdmin ? "GLOBAL" : (article as Article).storeId}`}>
                  <TableCell className="font-medium">{article.id}</TableCell>
                  <TableCell>{article.name}</TableCell>
                  {!isAdmin && <TableCell>{(article as Article).rackId}</TableCell>}
                  {!isAdmin && <TableCell>{(article as Article).shelfNumber}</TableCell>}
                  <TableCell>{article.status}</TableCell>
                  {!isAdmin && <TableCell>{(article as Article).quantity}</TableCell>}
                  <TableCell>{article.minQuantity || 0}</TableCell>
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
                        className="mr-2"
                        onClick={() => handleDeleteArticle(article.id, isAdmin ? "GLOBAL" : (article as Article).storeId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateBarcode(article.id, isAdmin ? "GLOBAL" : (article as Article).storeId)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedArticles.length === 0 && (
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

      {articleToGenerateBarcode && (
        <ArticleBarcodeGenerator
          isOpen={isBarcodeGeneratorOpen}
          onClose={() => setIsBarcodeGeneratorOpen(false)}
          articleId={articleToGenerateBarcode.id}
          storeId={articleToGenerateBarcode.storeId}
        />
      )}
    </div>
  );
};

export default ManageArticles;