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
import { ArrowLeft, PlusCircle, Edit, Trash2, Scan } from "lucide-react";
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

const ManageArticles = () => {
  const { articles, addArticle, updateArticle, deleteArticle } = useArticles();
  const { isAdmin } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDeleteId, setArticleToDeleteId] = useState<string | null>(null);

  const handleAddArticle = (newArticle: Article) => {
    if (articles.some(article => article.id === newArticle.id)) {
      toast.error(`Článek s ID ${newArticle.id} již existuje.`);
      return;
    }
    addArticle(newArticle);
    toast.success(`Článek ${newArticle.id} byl úspěšně přidán!`);
  };

  const handleEditArticle = (updatedArticle: Article) => {
    updateArticle(updatedArticle);
    toast.success(`Článek ${updatedArticle.id} byl úspěšně aktualizován!`);
  };

  const handleDeleteArticle = (id: string) => {
    setArticleToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteArticle = () => {
    if (articleToDeleteId) {
      deleteArticle(articleToDeleteId);
      toast.success(`Článek ${articleToDeleteId} byl úspěšně smazán!`);
      setArticleToDeleteId(null);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-6 space-y-4 sm:space-y-0">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> Zpět na hlavní stránku
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">Správa článků</h1>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Link to="/skenovat-carkod" className="w-full sm:w-auto">
              <Button variant="outline" className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full">
                <Scan className="h-4 w-4 mr-2" /> Skenovat
              </Button>
            </Link>
            <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center bg-jyskBlue-dark hover:bg-jyskBlue-light text-jyskBlue-foreground w-full sm:w-auto">
              <PlusCircle className="h-4 w-4 mr-2" /> Přidat článek
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto"> {/* Obalení tabulky pro horizontální posouvání */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">ID</TableHead>
                <TableHead className="min-w-[150px]">Název</TableHead>
                <TableHead className="min-w-[80px]">Regál</TableHead>
                <TableHead className="min-w-[100px]">Číslo regálu</TableHead>
                <TableHead className="min-w-[120px]">Umístění</TableHead>
                <TableHead className="min-w-[80px]">Patro</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                {isAdmin && <TableHead className="min-w-[100px]">ID Skladu</TableHead>}
                <TableHead className="text-right min-w-[100px]">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.id}</TableCell>
                  <TableCell>{article.name}</TableCell>
                  <TableCell>{article.shelf}</TableCell>
                  <TableCell>{article.shelfNumber}</TableCell>
                  <TableCell>{article.location}</TableCell>
                  <TableCell>{article.floor}</TableCell>
                  <TableCell>{article.status}</TableCell>
                  {isAdmin && <TableCell>{article.warehouseId}</TableCell>}
                  <TableCell className="text-right">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteArticle(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {articles.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">Žádné články nebyly nalezeny. Přidejte nový!</p>
        )}
      </div>

      <ArticleFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddArticle}
        article={null}
      />

      <ArticleFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingArticle(null);
        }}
        onSubmit={handleEditArticle}
        article={editingArticle}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jste si naprosto jisti?</AlertDialogTitle>
            <AlertDialogDescription>
              Tuto akci nelze vrátit zpět. Tímto trvale smažete článek{" "}
              <span className="font-semibold">{articleToDeleteId}</span> z vašeho inventáře.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušit</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteArticle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Pokračovat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageArticles;